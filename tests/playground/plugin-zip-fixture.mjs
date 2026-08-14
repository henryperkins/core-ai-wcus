import AdmZip from 'adm-zip';

export const pluginBootstrapPath = 'core-ai-map/core-ai-map.php';
export const pluginBlockMetadataPath =
	'core-ai-map/build/core-ai-map/block.json';

export const createPluginZipFixture = ( {
	headerVersion,
	constantVersion = headerVersion,
	blockVersion = headerVersion,
	includeBootstrap = true,
	includeBlockMetadata = true,
} ) => {
	const zip = new AdmZip();

	if ( includeBootstrap ) {
		zip.addFile(
			pluginBootstrapPath,
			Buffer.from(
				`<?php\n/**\n * Plugin Name: Core AI Living Block Map Fixture\n * Version: ${ headerVersion }\n */\n\ndefine( 'CORE_AI_MAP_VERSION', '${ constantVersion }' );\n`
			)
		);
	}

	if ( includeBlockMetadata ) {
		zip.addFile(
			pluginBlockMetadataPath,
			Buffer.from(
				`${ JSON.stringify( { version: blockVersion }, null, 2 ) }\n`
			)
		);
	}

	return zip.toBuffer();
};
