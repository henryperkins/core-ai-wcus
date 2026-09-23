import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { validatePluginArchiveIdentity } from '../../scripts/plugin-release-identity.mjs';
import { createPluginZipFixture } from './plugin-zip-fixture.mjs';

const currentVersion = JSON.parse(
	readFileSync( new URL( '../../package.json', import.meta.url ), 'utf8' )
).version;

test( 'accepts a plug-in archive whose internal versions match package.json', () => {
	assert.deepEqual(
		validatePluginArchiveIdentity(
			createPluginZipFixture( { headerVersion: currentVersion } )
		),
		{
			headerVersion: currentVersion,
			constantVersion: currentVersion,
			blockVersion: currentVersion,
			stableTag: currentVersion,
			cacheVersion: currentVersion,
			renderVersionMarker: 'CORE_AI_MAP_VERSION',
		}
	);
} );

for ( const [ label, overrides, expectedError ] of [
	[
		'plug-in header',
		{
			headerVersion: '3.1.2',
			constantVersion: currentVersion,
			blockVersion: currentVersion,
		},
		/plug-in header version 3\.1\.2 does not match expected 3\.2\.6/i,
	],
	[
		'CORE_AI_MAP_VERSION constant',
		{
			headerVersion: currentVersion,
			constantVersion: '3.1.2',
			blockVersion: currentVersion,
		},
		/CORE_AI_MAP_VERSION 3\.1\.2 does not match expected 3\.2\.6/i,
	],
	[
		'built block metadata',
		{
			headerVersion: currentVersion,
			constantVersion: currentVersion,
			blockVersion: '3.1.2',
		},
		/built block metadata version 3\.1\.2 does not match expected 3\.2\.6/i,
	],
	[
		'readme.txt Stable tag',
		{
			headerVersion: currentVersion,
			stableTag: '3.1.2',
		},
		/readme\.txt Stable tag 3\.1\.2 does not match expected 3\.2\.6/i,
	],
	[
		'assets/service-worker.js cache namespace',
		{
			headerVersion: currentVersion,
			cacheVersion: '3.1.2',
		},
		/assets\/service-worker\.js cache namespace version 3\.1\.2 does not match expected 3\.2\.6/i,
	],
] ) {
	test( `rejects a stale ${ label }`, () => {
		assert.throws(
			() =>
				validatePluginArchiveIdentity(
					createPluginZipFixture( overrides )
				),
			expectedError
		);
	} );
}

test( 'rejects an archive with a missing bootstrap identity entry', () => {
	assert.throws(
		() =>
			validatePluginArchiveIdentity(
				createPluginZipFixture( {
					headerVersion: currentVersion,
					includeBootstrap: false,
				} )
			),
		/must contain core-ai-map\/core-ai-map\.php exactly once; found 0/i
	);
} );

test( 'rejects an archive without a visitor-visible version marker', () => {
	assert.throws(
		() =>
			validatePluginArchiveIdentity(
				createPluginZipFixture( {
					headerVersion: currentVersion,
					includeRender: false,
				} )
			),
		/must contain core-ai-map\/build\/core-ai-map\/render\.php exactly once; found 0/i
	);
} );

test( 'rejects a visitor version marker that can drift from the plug-in constant', () => {
	assert.throws(
		() =>
			validatePluginArchiveIdentity(
				createPluginZipFixture( {
					headerVersion: currentVersion,
					renderVersionSource: "'3.1.2'",
				} )
			),
		/visitor version marker must derive from CORE_AI_MAP_VERSION/i
	);
} );

test( 'rejects bytes that are not a valid ZIP archive', () => {
	assert.throws(
		() =>
			validatePluginArchiveIdentity(
				Buffer.from( 'fixture-plugin-zip' )
			),
		/not a valid ZIP archive/i
	);
} );
