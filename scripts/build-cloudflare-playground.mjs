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

	const bootstrap = `
		<style id="core-ai-map-kiosk-shell">
			nav[aria-label="Playground tools"] { display: none !important; }
		</style>
		<script>
			(() => {
				const url = new URL(window.location.href);
				url.searchParams.set('blueprint-url', new URL('/kiosk-blueprint/blueprint.json', url.origin));
				history.replaceState(null, '', url);
			})();
		</script>`;

	if ( ! patched.includes( '</head>' ) ) {
		throw new Error(
			'The upstream index.html does not contain a closing head tag.'
		);
	}

	return patched.replace( '</head>', `${ bootstrap }\n\t</head>` );
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

const writeHeaders = async ( outputDirectory ) => {
	await writeFile(
		join( outputDirectory, '_headers' ),
		pagesHeaders,
		'utf8'
	);
};

export const buildCloudflarePlayground = async ( {
	sourceDirectory,
	outputDirectory = defaultOutputDirectory,
} ) => {
	const source = resolve( sourceDirectory );
	const output = resolve( outputDirectory );

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

	const indexPath = join( output, 'index.html' );
	await writeFile(
		indexPath,
		patchKioskIndex( await readFile( indexPath, 'utf8' ) )
	);

	const blueprintDirectory = join( output, 'kiosk-blueprint' );
	await mkdir( blueprintDirectory, { recursive: true } );
	await cp(
		join( projectDirectory, 'playground', 'blueprint.json' ),
		join( blueprintDirectory, 'blueprint.json' )
	);
	await cp(
		join( projectDirectory, 'playground', 'setup.php' ),
		join( blueprintDirectory, 'setup.php' )
	);
	await cp(
		join( projectDirectory, 'core-ai-map.zip' ),
		join( blueprintDirectory, 'core-ai-map.zip' )
	);
	await writeHeaders( output );

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
