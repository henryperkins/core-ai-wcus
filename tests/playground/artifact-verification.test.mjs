import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { verifyPlaygroundArtifact } from '../../scripts/verify-playground-artifact.mjs';

const projectDirectory = resolve(
	dirname( fileURLToPath( import.meta.url ) ),
	'../..'
);
const packageManifest = JSON.parse(
	await readFile( join( projectDirectory, 'package.json' ), 'utf8' )
);
const expectedSourceCommit = 'source-commit-fixture';
const pluginArtifactPath = `kiosk-blueprint/core-ai-map-${ packageManifest.version }.zip`;
const pluginContents = Buffer.from( 'fixture-plugin-zip' );

const createArtifactFixture = async ( t, overrides = {} ) => {
	const temporaryDirectory = await mkdtemp(
		join( projectDirectory, '.tmp-playground-artifact-' )
	);
	t.after( () => rm( temporaryDirectory, { recursive: true, force: true } ) );
	const outputDirectory = join( temporaryDirectory, 'output' );
	const artifactPath = join(
		outputDirectory,
		...pluginArtifactPath.split( '/' )
	);
	await mkdir( dirname( artifactPath ), { recursive: true } );
	await writeFile( artifactPath, pluginContents );
	const manifest = {
		sourceCommit: expectedSourceCommit,
		pluginVersion: packageManifest.version,
		builtAt: '2026-08-13T12:34:56.000Z',
		pluginArtifact: {
			path: pluginArtifactPath,
			bytes: pluginContents.byteLength,
			sha256: createHash( 'sha256' )
				.update( pluginContents )
				.digest( 'hex' ),
		},
		...overrides,
	};
	await writeFile(
		join( outputDirectory, 'deployment-manifest.json' ),
		`${ JSON.stringify( manifest, null, 2 ) }\n`,
		'utf8'
	);

	return outputDirectory;
};

test( 'independently verifies a fresh Playground artifact manifest', async ( t ) => {
	const directory = await createArtifactFixture( t );
	const result = await verifyPlaygroundArtifact( {
		directory,
		sourceCommit: expectedSourceCommit,
	} );

	assert.equal( result.sourceCommit, expectedSourceCommit );
	assert.equal( result.pluginVersion, packageManifest.version );
} );

for ( const [ label, overrides, expectedError ] of [
	[
		'byte count',
		{
			pluginArtifact: {
				path: pluginArtifactPath,
				bytes: 1,
				sha256: createHash( 'sha256' )
					.update( pluginContents )
					.digest( 'hex' ),
			},
		},
		/byte count/i,
	],
	[
		'SHA-256',
		{
			pluginArtifact: {
				path: pluginArtifactPath,
				bytes: pluginContents.byteLength,
				sha256: '0'.repeat( 64 ),
			},
		},
		/SHA-256/i,
	],
	[ 'version', { pluginVersion: '0.0.0' }, /plugin version/i ],
	[
		'source commit',
		{ sourceCommit: 'wrong-source-commit' },
		/source commit/i,
	],
	[
		'path traversal',
		{
			pluginArtifact: {
				path: '../fixture-plugin.zip',
				bytes: pluginContents.byteLength,
				sha256: createHash( 'sha256' )
					.update( pluginContents )
					.digest( 'hex' ),
			},
		},
		/outside the output directory/i,
	],
	[ 'timestamp', { builtAt: 'not-a-timestamp' }, /timestamp/i ],
] ) {
	test( `rejects a ${ label } mismatch`, async ( t ) => {
		const directory = await createArtifactFixture( t, overrides );
		await assert.rejects(
			verifyPlaygroundArtifact( {
				directory,
				sourceCommit: expectedSourceCommit,
			} ),
			expectedError
		);
	} );
}
