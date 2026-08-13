#!/usr/bin/env node

import {
	cp,
	mkdir,
	readFile,
	readdir,
	rm,
	stat,
	writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PAGES_MAX_FILES = 20_000;
const PAGES_MAX_ASSET_BYTES = 25 * 1024 * 1024;
const scriptDirectory = dirname( fileURLToPath( import.meta.url ) );
const projectDirectory = resolve( scriptDirectory, '..' );
const defaultOutputDirectory = join( projectDirectory, 'dist-playground' );

// The virtual-site service worker falls back to this unpacked tree when a
// WordPress core, theme, or plugin asset is not available from the PHP
// filesystem. It must match the Blueprint's exact WordPress version.
export const requiredRuntimeDirectories = [ 'wp-7.0' ];
export const playgroundLoadingMessage = 'Preparing WordPress';
export const kioskLoadingMessage =
	'Building a real WordPress 7.0 site in your browser — no server, about 45 seconds.';

const normalizeRelativePath = ( filePath ) =>
	filePath.replaceAll( sep, '/' ).replace( /^\/+/, '' );

const isInside = ( parent, child ) => {
	const relativePath = relative( parent, child );

	return (
		relativePath &&
		! relativePath.startsWith( '..' ) &&
		! relativePath.includes( `..${ sep }` )
	);
};

const walkFiles = async ( directory, root = directory ) => {
	const entries = await readdir( directory, { withFileTypes: true } );
	const files = [];

	for ( const entry of entries ) {
		const absolutePath = join( directory, entry.name );
		if ( entry.isDirectory() ) {
			files.push( ...( await walkFiles( absolutePath, root ) ) );
		} else if ( entry.isFile() ) {
			files.push( {
				absolutePath,
				relativePath: normalizeRelativePath(
					relative( root, absolutePath )
				),
				size: ( await stat( absolutePath ) ).size,
			} );
		}
	}

	return files;
};

export const validatePagesAssetBudget = ( files ) => {
	if ( files.length > PAGES_MAX_FILES ) {
		throw new Error(
			`Cloudflare Pages Free supports at most ${ PAGES_MAX_FILES.toLocaleString() } files; received ${ files.length.toLocaleString() }.`
		);
	}

	const oversized = files.find(
		( file ) => file.size > PAGES_MAX_ASSET_BYTES
	);

	if ( oversized ) {
		throw new Error(
			`Cloudflare Pages limits a single asset to 25 MiB; ${ oversized.relativePath } is ${ oversized.size } bytes.`
		);
	}
};

/**
 * Makes the upstream static shell a dedicated, local-only kiosk launcher.
 *
 * The Playground application still owns the WordPress runtime. This only
 * removes upstream analytics/fonts and injects the local Blueprint before the
 * module application starts.
 *
 * @param {string} html The upstream index.html.
 * @return {string} The kiosk-specific static shell.
 */
export const patchKioskIndex = ( html ) => {
	let patched = html.replace(
		'<title>WordPress Playground</title>',
		'<title>Core AI Living Block Map</title>'
	);

	if ( patched === html ) {
		throw new Error(
			'The upstream index.html does not contain the expected Playground title.'
		);
	}

	patched = patched
		.replace(
			/\s*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"\s*\/?>/gi,
			''
		)
		.replace(
			/\s*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"[^>]*>/gi,
			''
		)
		.replace(
			/\s*<link\s+href="https:\/\/fonts\.googleapis\.com[^>]*>/gi,
			''
		)
		.replace(
			/\s*<script\s+async\s+src="https:\/\/www\.googletagmanager\.com[^>]*><\/script>\s*<script>[\s\S]*?<\/script>/gi,
			''
		)
		.replace(
			'https://playground.wordpress.net/ogimage.png',
			'/ogimage.png'
		)
		.replace( 'https://playground.wordpress.net/', '/' );

	const loaderMarkup = `
		<div id="core-ai-map-playground-loader" data-core-ai-loader aria-labelledby="core-ai-map-playground-loader-heading">
			<div class="core-ai-map-playground-loader__card">
				<span class="core-ai-map-playground-loader__mark" aria-hidden="true"></span>
				<h1 id="core-ai-map-playground-loader-heading">${ kioskLoadingMessage }</h1>
				<p>WordPress and the exhibit are loading locally in this browser.</p>
				<span class="core-ai-map-playground-loader__status" role="status" aria-live="polite" aria-atomic="true">${ kioskLoadingMessage }</span>
			</div>
		</div>`;
	const bootstrap = `
		<style id="core-ai-map-kiosk-shell">
			nav[aria-label="Playground tools"] { display: none !important; }
			#core-ai-map-playground-loader {
				position: fixed;
				inset: 0;
				z-index: 2147483647;
				display: grid;
				place-items: center;
				box-sizing: border-box;
				padding: 24px;
				background: #f6f7f7;
				color: #1e1e1e;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
				text-align: center;
			}
			#core-ai-map-playground-loader[hidden],
			#wkwebview-notice.is-visible ~ #core-ai-map-playground-loader {
				display: none !important;
			}
			.core-ai-map-playground-loader__card {
				width: min(560px, 100%);
			}
			.core-ai-map-playground-loader__mark {
				display: block;
				width: 48px;
				height: 48px;
				margin: 0 auto 24px;
				border: 5px solid #c3c4c7;
				border-top-color: #3858e9;
				border-radius: 50%;
				animation: core-ai-map-playground-spin 1s linear infinite;
			}
			.core-ai-map-playground-loader__card h1 {
				margin: 0;
				font-size: clamp(24px, 4vw, 36px);
				line-height: 1.2;
			}
			.core-ai-map-playground-loader__card p {
				margin: 16px 0 0;
				color: #50575e;
				font-size: 16px;
				line-height: 1.5;
			}
			.core-ai-map-playground-loader__status {
				position: absolute;
				width: 1px;
				height: 1px;
				padding: 0;
				margin: -1px;
				overflow: hidden;
				clip: rect(0, 0, 0, 0);
				white-space: nowrap;
				border: 0;
			}
			@keyframes core-ai-map-playground-spin {
				to { transform: rotate(360deg); }
			}
			@media (prefers-reduced-motion: reduce) {
				.core-ai-map-playground-loader__mark { animation: none; }
			}
		</style>
		<script>
			(() => {
				const url = new URL(window.location.href);
				url.searchParams.set('blueprint-url', new URL('/kiosk-blueprint/blueprint.json', url.origin));
				history.replaceState(null, '', url);

				const startKioskLoader = () => {
					const loader = document.getElementById('core-ai-map-playground-loader');
					const root = document.getElementById('root');
					if (!loader || !root) return;

					const revealPlayground = () => {
						loader.hidden = true;
						loader.setAttribute('aria-hidden', 'true');
						root.removeAttribute('inert');
						root.removeAttribute('aria-hidden');
						root.removeAttribute('aria-busy');
					};
					if (window.__isWKWebView) {
						revealPlayground();
						return;
					}

					const hasReadyMap = (documentToCheck, depth = 0) => {
						if (documentToCheck.querySelector('.core-ai-map.is-ready')) return true;
						if (depth >= 3) return false;
						for (const frame of documentToCheck.querySelectorAll('iframe')) {
							try {
								if (frame.contentDocument && hasReadyMap(frame.contentDocument, depth + 1)) return true;
							} catch {}
						}
						return false;
					};

					const startedAt = Date.now();
					const timer = window.setInterval(() => {
						if (hasReadyMap(document) || Date.now() - startedAt >= 120000) {
							window.clearInterval(timer);
							revealPlayground();
						}
					}, 100);
				};

				if (document.readyState === 'loading') {
					document.addEventListener('DOMContentLoaded', startKioskLoader, { once: true });
				} else {
					startKioskLoader();
				}
			})();
		</script>`;

	if ( ! patched.includes( '</head>' ) ) {
		throw new Error(
			'The upstream index.html does not contain a closing head tag.'
		);
	}

	patched = patched.replace( '</head>', `${ bootstrap }\n\t</head>` );

	const rootMarkup = '<main id="root" aria-label="WordPress Playground">';
	const rootOccurrences = patched.split( rootMarkup ).length - 1;

	if ( rootOccurrences !== 1 ) {
		throw new Error(
			`Expected the upstream index.html to contain exactly one Playground root; found ${ rootOccurrences }.`
		);
	}

	return patched.replace(
		rootMarkup,
		`${ loaderMarkup }\n\n\t\t<main id="root" aria-label="WordPress Playground" inert aria-hidden="true" aria-busy="true">`
	);
};

export const patchPlaygroundLoaderModule = ( moduleSource ) => {
	const occurrences =
		moduleSource.split( playgroundLoadingMessage ).length - 1;

	if ( occurrences !== 1 ) {
		throw new Error(
			`Expected the Playground loader module to contain exactly one ${ playgroundLoadingMessage } caption; found ${ occurrences }.`
		);
	}

	return moduleSource.replace(
		playgroundLoadingMessage,
		kioskLoadingMessage
	);
};

const assetFingerprint = ( contents ) =>
	createHash( 'sha256' ).update( contents ).digest( 'hex' ).slice( 0, 16 );

const patchPlaygroundLoaderRuntime = async ( outputDirectory ) => {
	const remotePath = join( outputDirectory, 'remote.html' );
	const remoteHtml = await readFile( remotePath, 'utf8' );
	const moduleMatches = [
		...remoteHtml.matchAll(
			/<script\b[^>]*\bsrc=(["'])(\/assets\/wordpress-[^"']+\.js)\1[^>]*><\/script>/g
		),
	];

	if ( moduleMatches.length !== 1 ) {
		throw new Error(
			`Expected remote.html to reference exactly one Playground wordpress runtime module; found ${ moduleMatches.length }.`
		);
	}

	const originalAssetUrl = moduleMatches[ 0 ][ 2 ];
	const originalAssetPath = join(
		outputDirectory,
		...originalAssetUrl.replace( /^\//, '' ).split( '/' )
	);
	const patchedModule = patchPlaygroundLoaderModule(
		await readFile( originalAssetPath, 'utf8' )
	);
	const fingerprint = assetFingerprint( patchedModule );
	const patchedAssetUrl = `/assets/wordpress-core-ai-${ fingerprint }.js`;
	const patchedAssetPath = join(
		outputDirectory,
		...patchedAssetUrl.replace( /^\//, '' ).split( '/' )
	);

	await writeFile( patchedAssetPath, patchedModule, 'utf8' );
	await writeFile(
		remotePath,
		remoteHtml.replace( originalAssetUrl, patchedAssetUrl ),
		'utf8'
	);

	const offlineManifestPath = join(
		outputDirectory,
		'assets-required-for-offline-mode.json'
	);
	const offlineAssets = JSON.parse(
		await readFile( offlineManifestPath, 'utf8' )
	);
	const manifestOccurrences = offlineAssets.filter(
		( assetUrl ) => assetUrl === originalAssetUrl
	).length;

	if ( manifestOccurrences !== 1 ) {
		throw new Error(
			`Expected the offline asset manifest to reference ${ originalAssetUrl } exactly once; found ${ manifestOccurrences }.`
		);
	}

	await writeFile(
		offlineManifestPath,
		JSON.stringify(
			offlineAssets.map( ( assetUrl ) =>
				assetUrl === originalAssetUrl ? patchedAssetUrl : assetUrl
			)
		),
		'utf8'
	);
	await rm( originalAssetPath );
};

const getRuntimeFiles = async ( sourceDirectory ) => {
	const manifestPath = join(
		sourceDirectory,
		'assets-required-for-offline-mode.json'
	);

	if ( ! existsSync( manifestPath ) ) {
		throw new Error(
			`Expected the official Playground static build at ${ sourceDirectory }; assets-required-for-offline-mode.json is missing.`
		);
	}

	const required = JSON.parse( await readFile( manifestPath, 'utf8' ) );
	const selected = new Set(
		required.map( ( filePath ) => normalizeRelativePath( filePath ) )
	);

	// These are selected dynamically by the version-pinned Blueprint rather
	// than by the upstream offline cache manifest.
	for ( const requiredRootFile of [
		'index.html',
		'remote.html',
		'sw.js',
		'assets-required-for-offline-mode.json',
		'blueprint-schema.json',
		'favicon.ico',
		'manifest.json',
		'apple-touch-icon.png',
		'ogimage.png',
		'logo-192.png',
		'logo-256.png',
		'logo-384.png',
		'logo-512.png',
		'maskable-icon-512.png',
	] ) {
		selected.add( requiredRootFile );
	}

	const assetsDirectory = join( sourceDirectory, 'assets' );
	for ( const file of await walkFiles( assetsDirectory, sourceDirectory ) ) {
		const path = file.relativePath;

		if (
			path.endsWith( '.map' ) ||
			path.startsWith( 'assets/extensions/' ) ||
			( path.startsWith( 'assets/php_' ) &&
				! path.startsWith( 'assets/php_8_3-' ) ) ||
			( path.startsWith( 'assets/wp-' ) &&
				! path.startsWith( 'assets/wp-7.0.' ) )
		) {
			continue;
		}

		selected.add( path );
	}

	for ( const directory of requiredRuntimeDirectories ) {
		for ( const file of await walkFiles(
			join( sourceDirectory, directory ),
			sourceDirectory
		) ) {
			selected.add( file.relativePath );
		}
	}

	return [ ...selected ].sort();
};

const copyRuntimeFile = async (
	sourceDirectory,
	outputDirectory,
	relativePath
) => {
	const sourcePath = join( sourceDirectory, ...relativePath.split( '/' ) );
	const outputPath = join( outputDirectory, ...relativePath.split( '/' ) );

	if ( ! existsSync( sourcePath ) ) {
		throw new Error(
			`The upstream Playground runtime is missing ${ relativePath }.`
		);
	}

	await mkdir( dirname( outputPath ), { recursive: true } );
	await cp( sourcePath, outputPath );
};

export const pagesHeaders = `/*
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/kiosk-blueprint/*
  Cache-Control: public, max-age=0, must-revalidate
`;

export const pagesRedirects = `/remote.html /remote 200
`;

const writeHeaders = async ( outputDirectory ) => {
	await writeFile(
		join( outputDirectory, '_headers' ),
		pagesHeaders,
		'utf8'
	);
};

const writeRedirects = async ( outputDirectory ) => {
	await writeFile(
		join( outputDirectory, '_redirects' ),
		pagesRedirects,
		'utf8'
	);
};

export const buildCloudflarePlayground = async ( {
	sourceDirectory,
	outputDirectory = defaultOutputDirectory,
	pluginZipPath = join( projectDirectory, 'core-ai-map.zip' ),
} ) => {
	const source = resolve( sourceDirectory );
	const output = resolve( outputDirectory );
	const blueprintPath = join(
		projectDirectory,
		'playground',
		'blueprint.json'
	);
	const blueprintContents = await readFile( blueprintPath, 'utf8' );
	const blueprint = JSON.parse( blueprintContents );
	const pluginSource = blueprint.plugins?.[ 0 ]?.source;
	const pluginSourceMatch =
		typeof pluginSource === 'string'
			? pluginSource.match( /^\.\/(core-ai-map-\d+\.\d+\.\d+\.zip)$/ )
			: null;

	if ( blueprint.plugins?.length !== 1 || ! pluginSourceMatch ) {
		throw new Error(
			'The kiosk Blueprint must reference exactly one fingerprinted core-ai-map plugin ZIP.'
		);
	}

	const pluginFileName = pluginSourceMatch[ 1 ];
	const pluginArtifactPath = `kiosk-blueprint/${ pluginFileName }`;
	const pluginContents = await readFile( pluginZipPath );

	if ( ! isInside( projectDirectory, output ) ) {
		throw new Error(
			'The deployment output must stay inside this repository.'
		);
	}

	const runtimeFiles = await getRuntimeFiles( source );
	await rm( output, { force: true, recursive: true } );
	await mkdir( output, { recursive: true } );

	for ( const runtimeFile of runtimeFiles ) {
		await copyRuntimeFile( source, output, runtimeFile );
	}

	await patchPlaygroundLoaderRuntime( output );

	const indexPath = join( output, 'index.html' );
	await writeFile(
		indexPath,
		patchKioskIndex( await readFile( indexPath, 'utf8' ) )
	);

	const blueprintDirectory = join( output, 'kiosk-blueprint' );
	await mkdir( blueprintDirectory, { recursive: true } );
	await writeFile(
		join( blueprintDirectory, 'blueprint.json' ),
		blueprintContents,
		'utf8'
	);
	await cp(
		join( projectDirectory, 'playground', 'setup.php' ),
		join( blueprintDirectory, 'setup.php' )
	);
	await writeFile(
		join( blueprintDirectory, pluginFileName ),
		pluginContents
	);
	await writeHeaders( output );
	await writeRedirects( output );

	const filesBeforeManifest = await walkFiles( output );
	validatePagesAssetBudget( filesBeforeManifest );

	const upstreamIndex = await readFile(
		join( source, 'index.html' ),
		'utf8'
	);
	const commit =
		upstreamIndex.match(
			/<meta name="commit-id" content="([^"]+)"/
		)?.[ 1 ] ?? 'unknown';
	await writeFile(
		join( output, 'deployment-manifest.json' ),
		`${ JSON.stringify(
			{
				playgroundCommit: commit,
				wordpressVersion: '7.0',
				phpVersion: '8.3',
				pluginArtifact: {
					path: pluginArtifactPath,
					bytes: pluginContents.byteLength,
					sha256: createHash( 'sha256' )
						.update( pluginContents )
						.digest( 'hex' ),
				},
				fileCount: filesBeforeManifest.length + 1,
			},
			null,
			2
		) }\n`,
		'utf8'
	);

	const files = await walkFiles( output );
	validatePagesAssetBudget( files );

	return {
		fileCount: files.length,
		outputDirectory: output,
		playgroundCommit: commit,
	};
};

const parseArguments = ( argumentsList ) => {
	const options = {};
	for ( let index = 0; index < argumentsList.length; index += 1 ) {
		const argument = argumentsList[ index ];
		if ( argument === '--source' ) {
			options.sourceDirectory = argumentsList[ index + 1 ];
			index += 1;
		} else if ( argument === '--output' ) {
			options.outputDirectory = argumentsList[ index + 1 ];
			index += 1;
		}
	}
	return options;
};

if (
	process.argv[ 1 ] &&
	import.meta.url === pathToFileURL( process.argv[ 1 ] ).href
) {
	const options = parseArguments( process.argv.slice( 2 ) );
	const sourceDirectory =
		options.sourceDirectory ?? process.env.PLAYGROUND_SOURCE_DIR;

	if ( ! sourceDirectory ) {
		throw new Error(
			'Pass --source <official Playground static directory> or set PLAYGROUND_SOURCE_DIR.'
		);
	}

	const result = await buildCloudflarePlayground( {
		sourceDirectory,
		outputDirectory: options.outputDirectory,
	} );
	process.stdout.write(
		`Built ${ result.fileCount } Cloudflare Pages files from Playground ${ result.playgroundCommit } at ${ result.outputDirectory }.\n`
	);
}
