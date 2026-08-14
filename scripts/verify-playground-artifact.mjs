#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, dirname, join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { validatePluginArchiveIdentity } from './plugin-release-identity.mjs';

const scriptDirectory = dirname( fileURLToPath( import.meta.url ) );
const projectDirectory = resolve( scriptDirectory, '..' );
const defaultOutputDirectory = join( projectDirectory, 'dist-playground' );
const execFileAsync = promisify( execFile );

const getRepositoryHead = async () => {
	const { stdout } = await execFileAsync( 'git', [ 'rev-parse', 'HEAD' ], {
		cwd: projectDirectory,
	} );
	const sourceCommit = stdout.trim();

	if ( ! sourceCommit ) {
		throw new Error( 'Unable to determine the expected source commit.' );
	}

	return sourceCommit;
};

const isInside = ( parent, child ) => {
	const relativePath = relative( parent, child );

	return (
		relativePath &&
		! isAbsolute( relativePath ) &&
		! relativePath.startsWith( '..' )
	);
};

const readReleaseIdentity = async () => {
	const [ packageContents, blueprintContents, pluginContents ] =
		await Promise.all( [
			readFile( join( projectDirectory, 'package.json' ), 'utf8' ),
			readFile(
				join( projectDirectory, 'playground', 'blueprint.json' ),
				'utf8'
			),
			readFile( join( projectDirectory, 'core-ai-map.php' ), 'utf8' ),
		] );
	const packageManifest = JSON.parse( packageContents );
	const blueprint = JSON.parse( blueprintContents );
	const blueprintPluginSource = blueprint.plugins?.[ 0 ]?.source;
	const blueprintPluginVersion =
		typeof blueprintPluginSource === 'string'
			? blueprintPluginSource.match(
					/^\.\/core-ai-map-(\d+\.\d+\.\d+)\.zip$/
			  )?.[ 1 ]
			: undefined;
	const pluginVersion = pluginContents.match(
		/^ \* Version:\s*([^\s]+)/m
	)?.[ 1 ];

	if (
		! packageManifest.version ||
		packageManifest.version !== blueprint.blueprintMeta?.version ||
		packageManifest.version !== blueprintPluginVersion ||
		packageManifest.version !== pluginVersion
	) {
		throw new Error(
			'Package, Blueprint, and plugin versions must agree before verifying the artifact.'
		);
	}

	return { pluginVersion: packageManifest.version };
};

export const verifyPlaygroundArtifact = async ( {
	directory = defaultOutputDirectory,
	sourceCommit: suppliedSourceCommit,
} = {} ) => {
	const outputDirectory = await realpath( resolve( directory ) );
	const sourceCommit = suppliedSourceCommit ?? ( await getRepositoryHead() );
	const manifest = JSON.parse(
		await readFile(
			join( outputDirectory, 'deployment-manifest.json' ),
			'utf8'
		)
	);
	const releaseIdentity = await readReleaseIdentity();

	if ( manifest.pluginVersion !== releaseIdentity.pluginVersion ) {
		throw new Error(
			`Manifest plugin version ${ manifest.pluginVersion } does not match ${ releaseIdentity.pluginVersion }.`
		);
	}
	if ( manifest.sourceCommit !== sourceCommit ) {
		throw new Error(
			`Manifest source commit ${ manifest.sourceCommit } does not match expected ${ sourceCommit }.`
		);
	}
	if (
		typeof manifest.builtAt !== 'string' ||
		Number.isNaN( Date.parse( manifest.builtAt ) )
	) {
		throw new Error( 'Manifest builtAt timestamp is not parseable.' );
	}

	const artifact = manifest.pluginArtifact;
	if (
		! artifact ||
		typeof artifact.path !== 'string' ||
		typeof artifact.bytes !== 'number' ||
		typeof artifact.sha256 !== 'string'
	) {
		throw new Error( 'Manifest plugin artifact metadata is incomplete.' );
	}
	const artifactPath = resolve( outputDirectory, artifact.path );
	if ( ! isInside( outputDirectory, artifactPath ) ) {
		throw new Error(
			'Manifest plugin artifact path is outside the output directory.'
		);
	}
	const canonicalArtifactPath = await realpath( artifactPath );
	if ( ! isInside( outputDirectory, canonicalArtifactPath ) ) {
		throw new Error(
			'Manifest plugin artifact path is outside the output directory.'
		);
	}
	const expectedArtifactPath = `kiosk-blueprint/core-ai-map-${ releaseIdentity.pluginVersion }.zip`;
	if ( artifact.path !== expectedArtifactPath ) {
		throw new Error(
			`Plugin artifact path ${ artifact.path } must be ${ expectedArtifactPath }.`
		);
	}

	const contents = await readFile( canonicalArtifactPath );
	if ( contents.byteLength !== artifact.bytes ) {
		throw new Error(
			`Plugin artifact byte count ${ contents.byteLength } does not match ${ artifact.bytes }.`
		);
	}
	const sha256 = createHash( 'sha256' ).update( contents ).digest( 'hex' );
	if ( sha256 !== artifact.sha256 ) {
		throw new Error(
			'Plugin artifact SHA-256 does not match the manifest.'
		);
	}
	validatePluginArchiveIdentity( contents, releaseIdentity.pluginVersion );

	return {
		directory: outputDirectory,
		pluginVersion: releaseIdentity.pluginVersion,
		sourceCommit,
		builtAt: manifest.builtAt,
		pluginArtifact: artifact,
	};
};

const parseArguments = ( argumentsList ) => {
	const options = {};

	for ( let index = 0; index < argumentsList.length; index += 1 ) {
		const argument = argumentsList[ index ];
		if ( argument === '--directory' ) {
			options.directory = argumentsList[ index + 1 ];
			index += 1;
		} else if ( argument === '--source-commit' ) {
			options.sourceCommit = argumentsList[ index + 1 ];
			index += 1;
		}
	}

	return options;
};

if (
	process.argv[ 1 ] &&
	import.meta.url === pathToFileURL( process.argv[ 1 ] ).href
) {
	const result = await verifyPlaygroundArtifact(
		parseArguments( process.argv.slice( 2 ) )
	);
	process.stdout.write(
		`Verified ${ result.pluginArtifact.path } from ${ result.sourceCommit } at ${ result.directory }.\n`
	);
}
