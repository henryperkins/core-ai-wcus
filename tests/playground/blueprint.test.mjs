import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join( dirname( fileURLToPath( import.meta.url ) ), '..', '..' );
const blueprintPath = join( root, 'playground', 'blueprint.json' );
const setupPath = join( root, 'playground', 'setup.php' );
const packagePath = join( root, 'package.json' );
const blockPath = join( root, 'src', 'core-ai-map', 'block.json' );
const pluginPath = join( root, 'core-ai-map.php' );

test( 'defines a self-contained v2 Playground kiosk Blueprint', () => {
	const blueprint = JSON.parse( readFileSync( blueprintPath, 'utf8' ) );

	assert.equal( blueprint.version, 2 );
	assert.equal(
		blueprint.applicationOptions[ 'wordpress-playground' ].landingPage,
		'/living-block-map/'
	);
	assert.equal(
		blueprint.applicationOptions[ 'wordpress-playground' ].networkAccess,
		false
	);
	assert.equal( blueprint.wordpressVersion, 'beta' );
	assert.equal( blueprint.phpVersion, '8.3' );
	assert.equal( blueprint.blueprintMeta.version, '3.2.4' );
	assert.deepEqual( blueprint.plugins, [
		{
			source: './core-ai-map-3.2.4.zip',
			targetDirectoryName: 'core-ai-map',
			humanReadableName: 'Core AI Living Block Map',
		},
	] );
	assert.deepEqual( blueprint.additionalStepsAfterExecution, [
		{
			step: 'runPHP',
			code: './setup.php',
		},
	] );

	const setup = readFileSync( setupPath, 'utf8' );
	assert.match(
		setup,
		/<!-- wp:core-ai\/core-ai-map \{\"offlineEnabled\":false\} \/-->/
	);
} );

test( 'keeps package, plugin, block, and Blueprint release identity aligned', () => {
	const blueprint = JSON.parse( readFileSync( blueprintPath, 'utf8' ) );
	const packageMetadata = JSON.parse( readFileSync( packagePath, 'utf8' ) );
	const blockMetadata = JSON.parse( readFileSync( blockPath, 'utf8' ) );
	const plugin = readFileSync( pluginPath, 'utf8' );
	const version = packageMetadata.version;

	assert.equal( blockMetadata.version, version );
	assert.equal( blueprint.blueprintMeta.version, version );
	assert.equal(
		blueprint.plugins[ 0 ].source,
		`./core-ai-map-${ version }.zip`
	);
	assert.ok( plugin.includes( ` * Version:           ${ version }` ) );
	assert.ok(
		plugin.includes( `define( 'CORE_AI_MAP_VERSION', '${ version }' );` )
	);
} );
