import AdmZip from 'adm-zip';

const pluginBootstrapPath = 'core-ai-map/core-ai-map.php';
const pluginBlockMetadataPath = 'core-ai-map/build/core-ai-map/block.json';

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

const requireVersionMatch = ( label, actualVersion, expectedVersion ) => {
	if ( ! actualVersion ) {
		throw new Error( `The plug-in ZIP ${ label } is missing a version.` );
	}

	if ( actualVersion !== expectedVersion ) {
		throw new Error(
			`The plug-in ZIP ${ label } ${ actualVersion } does not match expected ${ expectedVersion }.`
		);
	}
};

export const validatePluginArchiveIdentity = ( contents, expectedVersion ) => {
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
	const headerVersion = pluginContents.match(
		/^[ \t]*\*[ \t]*Version:[ \t]*([^\s*]+)/m
	)?.[ 1 ];
	const constantVersion = pluginContents.match(
		/define\(\s*'CORE_AI_MAP_VERSION'\s*,\s*'([^']+)'\s*\);/
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

	return { headerVersion, constantVersion, blockVersion };
};
