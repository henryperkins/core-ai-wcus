import AdmZip from 'adm-zip';
import { readFileSync } from 'node:fs';

const pluginBootstrapPath = 'core-ai-map/core-ai-map.php';
const pluginBlockMetadataPath = 'core-ai-map/build/core-ai-map/block.json';
const pluginReadmePath = 'core-ai-map/readme.txt';
const pluginServiceWorkerPath = 'core-ai-map/assets/service-worker.js';
const expectedVersion = JSON.parse(
	readFileSync( new URL( '../package.json', import.meta.url ), 'utf8' )
).version;

const readUniqueEntry = ( entries, entryPath ) => {
	const matches = entries.filter(
		( entry ) => entry.entryName === entryPath
	);

	if ( matches.length !== 1 ) {
		throw new Error(
			`The plug-in ZIP must contain ${ entryPath } exactly once; found ${ matches.length }.`
		);
	}

	return matches[ 0 ].getData().toString( 'utf8' );
};

const requireVersionMatch = ( label, actualVersion, releaseVersion ) => {
	if ( ! actualVersion ) {
		throw new Error( `The plug-in ZIP ${ label } is missing a version.` );
	}

	if ( actualVersion !== releaseVersion ) {
		throw new Error(
			`The plug-in ZIP ${ label } ${ actualVersion } does not match expected ${ releaseVersion }.`
		);
	}
};

export const validatePluginArchiveIdentity = ( contents ) => {
	let entries;

	try {
		entries = new AdmZip( contents ).getEntries();
	} catch ( error ) {
		throw new Error(
			`The plug-in artifact is not a valid ZIP archive: ${ error.message }`,
			{ cause: error }
		);
	}

	const pluginContents = readUniqueEntry( entries, pluginBootstrapPath );
	const blockContents = readUniqueEntry( entries, pluginBlockMetadataPath );
	const readmeContents = readUniqueEntry( entries, pluginReadmePath );
	const serviceWorkerContents = readUniqueEntry(
		entries,
		pluginServiceWorkerPath
	);
	const headerVersion = pluginContents.match(
		/^[ \t]*\*[ \t]*Version:[ \t]*([^\s*]+)/m
	)?.[ 1 ];
	const constantVersion = pluginContents.match(
		/define\(\s*'CORE_AI_MAP_VERSION'\s*,\s*'([^']+)'\s*\);/
	)?.[ 1 ];
	const stableTag = readmeContents.match(
		/^Stable tag:\s*([^\s]+)/im
	)?.[ 1 ];
	const cacheVersion = serviceWorkerContents.match(
		/\bCACHE_NAME\s*=\s*`\$\{\s*CACHE_SCOPE_PREFIX\s*\}v(\d+\.\d+\.\d+)(?:-[^`]*)?`/
	)?.[ 1 ];
	let blockVersion;

	try {
		blockVersion = JSON.parse( blockContents ).version;
	} catch ( error ) {
		throw new Error(
			`The plug-in ZIP ${ pluginBlockMetadataPath } is not valid JSON: ${ error.message }`,
			{ cause: error }
		);
	}

	requireVersionMatch(
		'plug-in header version',
		headerVersion,
		expectedVersion
	);
	requireVersionMatch(
		'CORE_AI_MAP_VERSION',
		constantVersion,
		expectedVersion
	);
	requireVersionMatch(
		'built block metadata version',
		blockVersion,
		expectedVersion
	);
	requireVersionMatch( 'readme.txt Stable tag', stableTag, expectedVersion );
	requireVersionMatch(
		'assets/service-worker.js cache namespace version',
		cacheVersion,
		expectedVersion
	);

	return {
		headerVersion,
		constantVersion,
		blockVersion,
		stableTag,
		cacheVersion,
	};
};
