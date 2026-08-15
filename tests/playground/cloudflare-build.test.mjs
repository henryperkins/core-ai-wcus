import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
	mkdtemp,
	mkdir,
	readFile,
	rm,
	stat,
	writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { createStaticSourceFixture } from './create-static-source-fixture.mjs';
import { createPluginZipFixture } from './plugin-zip-fixture.mjs';

import {
	buildCloudflarePlayground,
	pagesHeaders,
	patchKioskIndex,
	getRuntimeFiles,
	oversizedRuntimeAsset,
	requiredRuntimeDirectories,
	validatePagesAssetBudget,
} from '../../scripts/build-cloudflare-playground.mjs';

const projectDirectory = resolve(
	dirname( fileURLToPath( import.meta.url ) ),
	'../..'
);
const approvedLoadingMessage =
	'Building a real WordPress site in your browser. A cold start can take a minute or more.';
const execFileAsync = promisify( execFile );

const expectedStaticSourceFiles = [
	'assets-required-for-offline-mode.json',
	'assets/index-fixture.js',
	'assets/main-fixture.js',
	'assets/wordpress-fixture.js',
	'apple-touch-icon.png',
	'blueprint-schema.json',
	'favicon.ico',
	'index.html',
	'logo-192.png',
	'logo-256.png',
	'logo-384.png',
	'logo-512.png',
	'manifest.json',
	'maskable-icon-512.png',
	'ogimage.png',
	'remote.html',
	'sw.js',
].sort();

const listFixtureFiles = async ( directory, root = directory ) => {
	const { readdir } = await import( 'node:fs/promises' );
	const entries = await readdir( directory, { withFileTypes: true } );
	const files = [];

	for ( const entry of entries ) {
		const path = join( directory, entry.name );
		if ( entry.isDirectory() ) {
			files.push( ...( await listFixtureFiles( path, root ) ) );
		} else {
			files.push( path.slice( root.length + 1 ).replaceAll( '\\', '/' ) );
		}
	}

	return files.sort();
};

test( 'static Playground source fixture preserves the test runtime tree through its module and CLI', async ( t ) => {
	const temporaryDirectory = await mkdtemp(
		join( projectDirectory, '.tmp-static-playground-source-' )
	);
	t.after( () => rm( temporaryDirectory, { recursive: true, force: true } ) );
	const moduleDirectory = join( temporaryDirectory, 'module-source' );
	const cliDirectory = join( temporaryDirectory, 'cli-source' );
	await createStaticSourceFixture( moduleDirectory );
	assert.deepEqual(
		await listFixtureFiles( moduleDirectory ),
		expectedStaticSourceFiles
	);
	assert.ok(
		( await stat( join( moduleDirectory, 'wp-beta' ) ) ).isDirectory()
	);
	assert.match(
		await readFile( join( moduleDirectory, 'index.html' ), 'utf8' ),
		/<meta name="commit-id" content="playground-test-commit" \/>/
	);

	const { stdout } = await execFileAsync(
		process.execPath,
		[ 'tests/playground/create-static-source-fixture.mjs', cliDirectory ],
		{ cwd: projectDirectory }
	);
	assert.match( stdout, /Created static Playground source fixture/ );
	assert.deepEqual(
		await listFixtureFiles( cliDirectory ),
		expectedStaticSourceFiles
	);
	assert.ok(
		( await stat( join( cliDirectory, 'wp-beta' ) ) ).isDirectory()
	);
} );

test( 'verification workflow runs the complete non-deploying release-build contract', async () => {
	const packageManifest = JSON.parse(
		await readFile( join( projectDirectory, 'package.json' ), 'utf8' )
	);
	const workflow = await readFile(
		join( projectDirectory, '.github', 'workflows', 'verify.yml' ),
		'utf8'
	);

	assert.match( workflow, /^on:\s*[\s\S]*?\bpull_request:/m );
	assert.match( workflow, /^on:\s*[\s\S]*?\bworkflow_dispatch:/m );
	assert.match( workflow, /push:\s*\n\s+branches:\s*\[\s*main\s*\]/ );
	assert.match( workflow, /permissions:\s*\n\s+contents:\s*read/ );
	assert.match(
		workflow,
		/uses:\s*actions\/checkout@v6[\s\S]*?fetch-depth:\s*0/
	);
	assert.match(
		workflow,
		/uses:\s*actions\/setup-node@v6[\s\S]*?node-version:\s*['"]?22['"]?/
	);
	assert.match(
		workflow,
		/uses:\s*shivammathur\/setup-php@v2[\s\S]*?php-version:\s*['"]?8\.3['"]?/
	);

	const gates = [
		'npm ci',
		'npm run lint:js -- --no-fix',
		'npm run lint:css',
		'npm run test:unit -- --runInBand',
		'npm run test:playground',
		'npm run build',
		'npm run plugin-zip',
		'npm run create:playground-source-fixture',
		'npm run build:playground',
		'npm run verify:playground-artifact',
	];
	let previousGate = -1;
	for ( const gate of gates ) {
		const index = workflow.indexOf( gate );
		assert.ok(
			index > previousGate,
			`workflow must run ${ gate } in order`
		);
		previousGate = index;
	}

	assert.match(
		workflow,
		/npm run verify:playground-artifact\s+--\s+--directory\s+dist-playground\s+--source-commit\s+["']?\$\{\{\s*github\.sha\s*\}\}/
	);
	assert.doesNotMatch(
		workflow,
		/\b(?:deploy|publish|pages|credential|environment)\b|contents:\s*write/i
	);
	assert.match(
		packageManifest.scripts[ 'test:playground' ],
		/tests\/playground\/artifact-verification\.test\.mjs/
	);
	assert.match(
		packageManifest.scripts[ 'test:playground' ],
		/tests\/playground\/plugin-release-identity\.test\.mjs/
	);
} );

test( 'patches the official Playground shell into a local kiosk launcher', () => {
	const result = patchKioskIndex( `<!doctype html>
<html><head>
<title>WordPress Playground</title>
<meta name="description" content="Try WordPress in your browser." />
<meta property="og:title" content="WordPress Playground" />
<meta property="og:description" content="Try WordPress in your browser." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="WordPress Playground" />
<meta name="twitter:description" content="Try WordPress in your browser." />
<meta name="twitter:image" content="https://playground.wordpress.net/ogimage.png" />
<link rel="manifest" href="/dynamic-manifest.json.php?review=fixture&amp;blueprint-url=fixture" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-test"></script>
<script>window.dataLayer = window.dataLayer || [];</script>
</head><body><main id="root" aria-label="WordPress Playground"></main></body></html>` );

	assert.match( result, /<title>Core AI Living Block Map<\/title>/ );
	assert.match(
		result,
		/<meta name="description" content="An interactive Living Block Map of the building blocks connecting WordPress and AI\." \/>/
	);
	assert.match(
		result,
		/<meta property="og:title" content="Core AI Living Block Map" \/>/
	);
	assert.match(
		result,
		/<meta property="og:description" content="An interactive Living Block Map of the building blocks connecting WordPress and AI\." \/>/
	);
	assert.match(
		result,
		/<meta name="twitter:card" content="summary_large_image" \/>/
	);
	assert.match(
		result,
		/<meta name="twitter:title" content="Core AI Living Block Map" \/>/
	);
	assert.match(
		result,
		/<meta name="twitter:description" content="An interactive Living Block Map of the building blocks connecting WordPress and AI\." \/>/
	);
	assert.match(
		result,
		/<meta name="twitter:image" content="\/ogimage\.png" \/>/
	);
	assert.match( result, /<link rel="manifest" href="\/manifest\.json">/ );
	assert.doesNotMatch( result, /dynamic-manifest\.json\.php/ );
	assert.match( result, /kiosk-blueprint\/blueprint\.json/ );
	assert.match(
		result,
		new RegExp(
			`<h1 id="core-ai-map-playground-loader-heading">${ approvedLoadingMessage }<\\/h1>`
		)
	);
	assert.match(
		result,
		new RegExp(
			`<span class="core-ai-map-playground-loader__status" role="status" aria-live="polite" aria-atomic="true">${ approvedLoadingMessage }<\\/span>`
		)
	);
	assert.match(
		result,
		/<main id="root" aria-label="WordPress Playground" inert aria-hidden="true" aria-busy="true">/
	);
	assert.match( result, /querySelector\('\.core-ai-map\.is-ready'\)/ );
	assert.match( result, /root\.removeAttribute\('inert'\)/ );
	assert.doesNotMatch( result, /Preparing WordPress/ );
	assert.doesNotMatch( result, /about 45 seconds/ );
	assert.doesNotMatch( result, /Try WordPress in your browser/ );
	assert.doesNotMatch( result, /MutationObserver/ );
	assert.doesNotMatch( result, /fonts\.googleapis\.com/ );
	assert.doesNotMatch( result, /googletagmanager\.com/ );
} );

test( 'does not force cross-origin isolation onto Playground virtual pages', () => {
	assert.doesNotMatch(
		pagesHeaders,
		/Cross-Origin-(?:Opener|Embedder)-Policy/
	);
} );

test( 'build emits the Pages rewrite for the literal remote.html endpoint', async ( t ) => {
	const temporaryDirectory = await mkdtemp(
		join( projectDirectory, '.tmp-cloudflare-build-' )
	);
	t.after( () => rm( temporaryDirectory, { recursive: true, force: true } ) );
	const sourceDirectory = join( temporaryDirectory, 'source' );
	const outputDirectory = join( temporaryDirectory, 'output' );
	const pluginZipPath = join( temporaryDirectory, 'fixture-plugin.zip' );
	const pluginContents = createPluginZipFixture( {
		headerVersion: '3.2.2',
	} );
	await createStaticSourceFixture( sourceDirectory );
	await writeFile( pluginZipPath, pluginContents );

	await buildCloudflarePlayground( {
		sourceDirectory,
		outputDirectory,
		pluginZipPath,
		sourceCommit: 'source-commit-fixture',
		builtAt: '2026-08-13T12:34:56.000Z',
	} );
	await execFileAsync( process.execPath, [
		join( outputDirectory, 'assets', 'index-fixture.js' ),
	] );

	assert.equal(
		await readFile( join( outputDirectory, '_redirects' ), 'utf8' ),
		'/remote.html /remote 200\n'
	);
	const kioskIndex = await readFile(
		join( outputDirectory, 'index.html' ),
		'utf8'
	);
	assert.match( kioskIndex, /<link rel="manifest" href="\/manifest\.json">/ );
	assert.doesNotMatch( kioskIndex, /dynamic-manifest\.json\.php/ );
	assert.match(
		kioskIndex,
		new RegExp(
			`<h1 id="core-ai-map-playground-loader-heading">${ approvedLoadingMessage }<\\/h1>`
		)
	);
	assert.match(
		kioskIndex,
		/<main id="root" aria-label="WordPress Playground" inert aria-hidden="true" aria-busy="true">/
	);
	const remoteHtml = await readFile(
		join( outputDirectory, 'remote.html' ),
		'utf8'
	);
	const loaderAssetMatch = remoteHtml.match(
		/src="(\/assets\/wordpress-core-ai-([a-f0-9]{16})\.js)"/
	);
	assert.ok(
		loaderAssetMatch,
		'remote.html must load the fingerprinted kiosk loader runtime'
	);
	const loaderAssetUrl = loaderAssetMatch[ 1 ];
	const loaderAssetPath = join(
		outputDirectory,
		...loaderAssetUrl.replace( /^\//, '' ).split( '/' )
	);
	const loaderAsset = await readFile( loaderAssetPath, 'utf8' );
	assert.ok( loaderAsset.includes( approvedLoadingMessage ) );
	assert.doesNotMatch( loaderAsset, /Preparing WordPress/ );
	assert.doesNotMatch( loaderAsset, /about 45 seconds/ );
	assert.equal(
		loaderAssetMatch[ 2 ],
		createHash( 'sha256' )
			.update( loaderAsset )
			.digest( 'hex' )
			.slice( 0, 16 )
	);
	const offlineAssets = JSON.parse(
		await readFile(
			join( outputDirectory, 'assets-required-for-offline-mode.json' ),
			'utf8'
		)
	);
	assert.ok( offlineAssets.includes( '/assets/index-fixture.js' ) );
	assert.ok( offlineAssets.includes( '/assets/main-fixture.js' ) );
	assert.ok( offlineAssets.includes( loaderAssetUrl ) );
	assert.ok( ! offlineAssets.includes( '/assets/wordpress-fixture.js' ) );
	await assert.rejects(
		readFile(
			join( outputDirectory, 'assets', 'wordpress-fixture.js' ),
			'utf8'
		),
		{ code: 'ENOENT' }
	);
	assert.deepEqual(
		await readFile(
			join( outputDirectory, 'kiosk-blueprint', 'core-ai-map-3.2.2.zip' )
		),
		pluginContents
	);
	await assert.rejects(
		readFile(
			join( outputDirectory, 'kiosk-blueprint', 'core-ai-map.zip' )
		),
		{ code: 'ENOENT' }
	);

	const deploymentManifest = JSON.parse(
		await readFile(
			join( outputDirectory, 'deployment-manifest.json' ),
			'utf8'
		)
	);
	assert.deepEqual( deploymentManifest.pluginArtifact, {
		path: 'kiosk-blueprint/core-ai-map-3.2.2.zip',
		bytes: pluginContents.byteLength,
		sha256: createHash( 'sha256' ).update( pluginContents ).digest( 'hex' ),
	} );
	assert.equal( deploymentManifest.sourceCommit, 'source-commit-fixture' );
	assert.equal( deploymentManifest.pluginVersion, '3.2.2' );
	assert.equal( deploymentManifest.builtAt, '2026-08-13T12:34:56.000Z' );

	const webManifest = JSON.parse(
		await readFile( join( outputDirectory, 'manifest.json' ), 'utf8' )
	);
	assert.deepEqual(
		{
			name: webManifest.name,
			shortName: webManifest.short_name,
			startUrl: webManifest.start_url,
			scope: webManifest.scope,
			display: webManifest.display,
			orientation: webManifest.orientation,
		},
		{
			name: 'Core AI Living Block Map',
			shortName: 'Living Block Map',
			startUrl: '/',
			scope: '/',
			display: 'fullscreen',
			orientation: 'landscape',
		}
	);
	assert.match(
		await readFile( join( outputDirectory, '_headers' ), 'utf8' ),
		/\/manifest\.json\s+Content-Type: application\/manifest\+json; charset=UTF-8/
	);
} );

test( 'rejects a stale plug-in ZIP before replacing existing build output', async ( t ) => {
	const temporaryDirectory = await mkdtemp(
		join( projectDirectory, '.tmp-cloudflare-stale-zip-' )
	);
	t.after( () => rm( temporaryDirectory, { recursive: true, force: true } ) );
	const sourceDirectory = join( temporaryDirectory, 'source' );
	const outputDirectory = join( temporaryDirectory, 'output' );
	const pluginZipPath = join( temporaryDirectory, 'fixture-plugin.zip' );
	const sentinelPath = join( outputDirectory, 'existing-output.txt' );
	await createStaticSourceFixture( sourceDirectory );
	await mkdir( outputDirectory, { recursive: true } );
	await writeFile( sentinelPath, 'preserve-on-validation-failure', 'utf8' );
	await writeFile(
		pluginZipPath,
		createPluginZipFixture( { headerVersion: '3.1.2' } )
	);

	await assert.rejects(
		buildCloudflarePlayground( {
			sourceDirectory,
			outputDirectory,
			pluginZipPath,
			sourceCommit: 'source-commit-fixture',
			builtAt: '2026-08-13T12:34:56.000Z',
		} ),
		/plug-in header version 3\.1\.2 does not match expected 3\.2\.2/i
	);
	assert.equal(
		await readFile( sentinelPath, 'utf8' ),
		'preserve-on-validation-failure'
	);
} );

test( 'ships the pinned WordPress static fallback tree', () => {
	assert.deepEqual( requiredRuntimeDirectories, [ 'wp-beta' ] );
} );

test( 'drops the runtime archive that exceeds the Pages per-asset ceiling', async ( t ) => {
	const temporaryDirectory = await mkdtemp(
		join( projectDirectory, '.tmp-oversized-runtime-asset-' )
	);
	t.after( () => rm( temporaryDirectory, { recursive: true, force: true } ) );
	const source = join( temporaryDirectory, 'source' );
	await createStaticSourceFixture( source );

	const runtimeDirectory = join( source, requiredRuntimeDirectories[ 0 ] );
	await writeFile(
		join( runtimeDirectory, oversizedRuntimeAsset ),
		'over the ceiling'
	);
	await mkdir( join( runtimeDirectory, 'wp-includes' ), { recursive: true } );
	await writeFile(
		join( runtimeDirectory, 'wp-includes', 'kept.css' ),
		'kept'
	);

	const files = await getRuntimeFiles( source );

	assert.ok(
		! files.includes(
			`${ requiredRuntimeDirectories[ 0 ] }/${ oversizedRuntimeAsset }`
		),
		'the oversized archive must not reach the Pages artifact'
	);
	assert.ok(
		files.includes(
			`${ requiredRuntimeDirectories[ 0 ] }/wp-includes/kept.css`
		),
		'the rest of the fallback tree must still ship'
	);
} );

test( 'rejects a Pages artifact that exceeds the free-tier asset constraints', () => {
	assert.throws(
		() =>
			validatePagesAssetBudget( [
				{ relativePath: 'ok.js', size: 1 },
				{ relativePath: 'too-large.wasm', size: 25 * 1024 * 1024 + 1 },
			] ),
		/too-large\.wasm/
	);
	assert.throws(
		() =>
			validatePagesAssetBudget(
				Array.from( { length: 20001 }, ( _, index ) => ( {
					relativePath: `asset-${ index }.js`,
					size: 1,
				} ) )
			),
		/20,000/
	);
	assert.doesNotThrow( () =>
		validatePagesAssetBudget( [
			{ relativePath: 'runtime.wasm', size: 25 * 1024 * 1024 },
		] )
	);
} );
