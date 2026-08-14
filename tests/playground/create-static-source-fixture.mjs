#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const createStaticSourceFixture = async ( sourceDirectory ) => {
	await mkdir( join( sourceDirectory, 'assets' ), { recursive: true } );
	await mkdir( join( sourceDirectory, 'wp-7.0' ), { recursive: true } );
	await writeFile(
		join( sourceDirectory, 'index.html' ),
		`<!doctype html><html><head>
			<meta name="commit-id" content="playground-test-commit" />
			<meta name="description" content="Try WordPress in your browser." />
			<meta property="og:title" content="WordPress Playground" />
			<meta property="og:description" content="Try WordPress in your browser." />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content="WordPress Playground" />
			<meta name="twitter:description" content="Try WordPress in your browser." />
			<meta name="twitter:image" content="https://playground.wordpress.net/ogimage.png" />
			<title>WordPress Playground</title>
			<script type="module" src="/assets/index-fixture.js"></script>
		</head><body><main id="root" aria-label="WordPress Playground"></main></body></html>`
	);
	await writeFile(
		join( sourceDirectory, 'assets-required-for-offline-mode.json' ),
		JSON.stringify( [
			'/assets/index-fixture.js',
			'/assets/main-fixture.js',
			'/assets/wordpress-fixture.js',
		] )
	);
	await writeFile(
		join( sourceDirectory, 'assets', 'index-fixture.js' ),
		`const dependencies = [ "assets/main-fixture.js" ]; import( "./main-fixture.js" );`
	);
	await writeFile(
		join( sourceDirectory, 'assets', 'main-fixture.js' ),
		`const loader = { caption: i?.caption??"Preparing WordPress" };`
	);
	await writeFile(
		join( sourceDirectory, 'remote.html' ),
		`<!doctype html><html><head>
			<script type="module" crossorigin src="/assets/wordpress-fixture.js"></script>
		</head><body><iframe id="wp"></iframe></body></html>`
	);
	await writeFile(
		join( sourceDirectory, 'assets', 'wordpress-fixture.js' ),
		`const caption = 'Preparing WordPress';`
	);

	for ( const fileName of [
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

if (
	process.argv[ 1 ] &&
	import.meta.url === pathToFileURL( process.argv[ 1 ] ).href
) {
	const destination = process.argv[ 2 ];
	if ( ! destination ) {
		throw new Error(
			'Pass a destination directory for the static Playground fixture.'
		);
	}

	const sourceDirectory = resolve( destination );
	await createStaticSourceFixture( sourceDirectory );
	process.stdout.write(
		`Created static Playground source fixture at ${ sourceDirectory }.\n`
	);
}
