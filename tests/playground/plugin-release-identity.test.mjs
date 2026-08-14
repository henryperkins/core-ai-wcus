import assert from 'node:assert/strict';
import test from 'node:test';

import { validatePluginArchiveIdentity } from '../../scripts/plugin-release-identity.mjs';
import { createPluginZipFixture } from './plugin-zip-fixture.mjs';

const currentVersion = '3.2.0';

test( 'accepts a plug-in archive whose three internal versions agree', () => {
	assert.deepEqual(
		validatePluginArchiveIdentity(
			createPluginZipFixture( { headerVersion: currentVersion } ),
			currentVersion
		),
		{
			headerVersion: currentVersion,
			constantVersion: currentVersion,
			blockVersion: currentVersion,
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
		/plug-in header version 3\.1\.2 does not match expected 3\.2\.0/i,
	],
	[
		'CORE_AI_MAP_VERSION constant',
		{
			headerVersion: currentVersion,
			constantVersion: '3.1.2',
			blockVersion: currentVersion,
		},
		/CORE_AI_MAP_VERSION 3\.1\.2 does not match expected 3\.2\.0/i,
	],
	[
		'built block metadata',
		{
			headerVersion: currentVersion,
			constantVersion: currentVersion,
			blockVersion: '3.1.2',
		},
		/built block metadata version 3\.1\.2 does not match expected 3\.2\.0/i,
	],
] ) {
	test( `rejects a stale ${ label }`, () => {
		assert.throws(
			() =>
				validatePluginArchiveIdentity(
					createPluginZipFixture( overrides ),
					currentVersion
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
				} ),
				currentVersion
			),
		/must contain core-ai-map\/core-ai-map\.php exactly once; found 0/i
	);
} );

test( 'rejects bytes that are not a valid ZIP archive', () => {
	assert.throws(
		() =>
			validatePluginArchiveIdentity(
				Buffer.from( 'fixture-plugin-zip' ),
				currentVersion
			),
		/not a valid ZIP archive/i
	);
} );
