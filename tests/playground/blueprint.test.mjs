import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join( dirname( fileURLToPath( import.meta.url ) ), '..', '..' );
const blueprintPath = join( root, 'playground', 'blueprint.json' );
const setupPath = join( root, 'playground', 'setup.php' );

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
	assert.equal( blueprint.wordpressVersion, '7.0' );
	assert.equal( blueprint.phpVersion, '8.3' );
	assert.deepEqual( blueprint.plugins, [
		{
			source: './core-ai-map.zip',
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
