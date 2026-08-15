import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
	mkdtemp,
	mkdir,
	readFile,
	rm,
	symlink,
	writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { verifyPlaygroundArtifact } from '../../scripts/verify-playground-artifact.mjs';
import { createPluginZipFixture } from './plugin-zip-fixture.mjs';

const projectDirectory = resolve(
	dirname( fileURLToPath( import.meta.url ) ),
	'../..'
);
const packageManifest = JSON.parse(
	await readFile( join( projectDirectory, 'package.json' ), 'utf8' )
);
const expectedSourceCommit = 'source-commit-fixture';
const pluginArtifactPath = `kiosk-blueprint/core-ai-map-${ packageManifest.version }.zip`;
const pluginContents = createPluginZipFixture( {
	headerVersion: packageManifest.version,
} );

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

test( 'rejects an in-root artifact symlink that resolves outside the output directory', async ( t ) => {
	const directory = await createArtifactFixture( t );
	const externalArtifactDirectory = join(
		dirname( directory ),
		'external-artifact'
	);
	const externalArtifactPath = join(
		externalArtifactDirectory,
		'external-plugin.zip'
	);
	const linkedArtifactDirectory = join(
		directory,
		'kiosk-blueprint',
		'linked-artifact'
	);
	await mkdir( externalArtifactDirectory, { recursive: true } );
	await writeFile( externalArtifactPath, pluginContents );
	try {
		await symlink(
			externalArtifactDirectory,
			linkedArtifactDirectory,
			'junction'
		);
	} catch ( error ) {
		assert.fail(
			`Unable to create the required directory link: ${ error.message }`
		);
	}
	const manifestPath = join( directory, 'deployment-manifest.json' );
	const manifest = JSON.parse( await readFile( manifestPath, 'utf8' ) );
	manifest.pluginArtifact.path =
		'kiosk-blueprint/linked-artifact/external-plugin.zip';
	await writeFile(
		manifestPath,
		`${ JSON.stringify( manifest, null, 2 ) }\n`,
		'utf8'
	);

	await assert.rejects(
		verifyPlaygroundArtifact( {
			directory,
			sourceCommit: expectedSourceCommit,
		} ),
		/outside the output directory/i
	);
} );

test( 'rejects a hashed artifact whose internal plug-in identity is stale', async ( t ) => {
	const directory = await createArtifactFixture( t );
	const staleContents = createPluginZipFixture( {
		headerVersion: '3.1.2',
	} );
	const artifactPath = join( directory, ...pluginArtifactPath.split( '/' ) );
	await writeFile( artifactPath, staleContents );
	const manifestPath = join( directory, 'deployment-manifest.json' );
	const manifest = JSON.parse( await readFile( manifestPath, 'utf8' ) );
	manifest.pluginArtifact.bytes = staleContents.byteLength;
	manifest.pluginArtifact.sha256 = createHash( 'sha256' )
		.update( staleContents )
		.digest( 'hex' );
	await writeFile(
		manifestPath,
		`${ JSON.stringify( manifest, null, 2 ) }\n`,
		'utf8'
	);

	await assert.rejects(
		verifyPlaygroundArtifact( {
			directory,
			sourceCommit: expectedSourceCommit,
		} ),
		/plug-in header version 3\.1\.2 does not match expected 3\.2\.2/i
	);
} );

test( 'rejects an artifact that is not published under its versioned filename', async ( t ) => {
	const directory = await createArtifactFixture( t );
	const unversionedPath = 'kiosk-blueprint/core-ai-map.zip';
	await writeFile(
		join( directory, ...unversionedPath.split( '/' ) ),
		pluginContents
	);
	const manifestPath = join( directory, 'deployment-manifest.json' );
	const manifest = JSON.parse( await readFile( manifestPath, 'utf8' ) );
	manifest.pluginArtifact.path = unversionedPath;
	await writeFile(
		manifestPath,
		`${ JSON.stringify( manifest, null, 2 ) }\n`,
		'utf8'
	);

	await assert.rejects(
		verifyPlaygroundArtifact( {
			directory,
			sourceCommit: expectedSourceCommit,
		} ),
		/artifact path .* must be kiosk-blueprint\/core-ai-map-3\.2\.2\.zip/i
	);
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
