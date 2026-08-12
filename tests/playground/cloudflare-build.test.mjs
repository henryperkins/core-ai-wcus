import assert from 'node:assert/strict';
import test from 'node:test';

import {
	pagesHeaders,
	patchKioskIndex,
	requiredRuntimeDirectories,
	validatePagesAssetBudget,
} from '../../scripts/build-cloudflare-playground.mjs';

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
	assert.doesNotMatch( result, /fonts\.googleapis\.com/ );
	assert.doesNotMatch( result, /googletagmanager\.com/ );
} );

test( 'does not force cross-origin isolation onto Playground virtual pages', () => {
	assert.doesNotMatch(
		pagesHeaders,
		/Cross-Origin-(?:Opener|Embedder)-Policy/
	);
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
