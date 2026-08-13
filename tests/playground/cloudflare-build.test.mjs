import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
	buildCloudflarePlayground,
	pagesHeaders,
	patchKioskIndex,
	requiredRuntimeDirectories,
	validatePagesAssetBudget,
} from '../../scripts/build-cloudflare-playground.mjs';

const projectDirectory = resolve(
	dirname( fileURLToPath( import.meta.url ) ),
	'../..'
);

const createMinimalPlaygroundSource = async ( sourceDirectory ) => {
	await mkdir( join( sourceDirectory, 'assets' ), { recursive: true } );
	await mkdir( join( sourceDirectory, 'wp-7.0' ), { recursive: true } );
	await writeFile(
		join( sourceDirectory, 'index.html' ),
		`<!doctype html><html><head>
			<meta name="commit-id" content="playground-test-commit" />
			<title>WordPress Playground</title>
		</head><body></body></html>`
	);
	await writeFile(
		join( sourceDirectory, 'assets-required-for-offline-mode.json' ),
		'[]'
	);

	for ( const fileName of [
		'remote.html',
		'sw.js',
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
		await writeFile( join( sourceDirectory, fileName ), fileName );
	}
};

test( 'patches the official Playground shell into a local kiosk launcher', () => {
	const result = patchKioskIndex( `<!doctype html>
<html><head>
<title>WordPress Playground</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-test"></script>
<script>window.dataLayer = window.dataLayer || [];</script>
</head><body></body></html>` );

	assert.match( result, /<title>Core AI Living Block Map<\/title>/ );
	assert.match( result, /kiosk-blueprint\/blueprint\.json/ );
	assert.match(
		result,
		/Building a real WordPress 7\.0 site in your browser — no server, about 45 seconds\./
	);
	assert.match( result, /Preparing WordPress/ );
	assert.match( result, /MutationObserver/ );
	assert.match( result, /closest\('script, style, noscript'\)/ );
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
	await createMinimalPlaygroundSource( sourceDirectory );
	await writeFile( pluginZipPath, 'fixture-plugin-zip' );

	await buildCloudflarePlayground( {
		sourceDirectory,
		outputDirectory,
		pluginZipPath,
	} );

	assert.equal(
		await readFile( join( outputDirectory, '_redirects' ), 'utf8' ),
		'/remote.html /remote 200\n'
	);
	assert.equal(
		await readFile(
			join( outputDirectory, 'kiosk-blueprint', 'core-ai-map-3.1.2.zip' ),
			'utf8'
		),
		'fixture-plugin-zip'
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
		path: 'kiosk-blueprint/core-ai-map-3.1.2.zip',
		bytes: Buffer.byteLength( 'fixture-plugin-zip' ),
		sha256: createHash( 'sha256' )
			.update( 'fixture-plugin-zip' )
			.digest( 'hex' ),
	} );
} );

test( 'ships the pinned WordPress static fallback tree', () => {
	assert.deepEqual( requiredRuntimeDirectories, [ 'wp-7.0' ] );
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
