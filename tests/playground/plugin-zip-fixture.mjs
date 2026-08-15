import AdmZip from 'adm-zip';

export const pluginBootstrapPath = 'core-ai-map/core-ai-map.php';
export const pluginBlockMetadataPath =
	'core-ai-map/build/core-ai-map/block.json';
export const pluginReadmePath = 'core-ai-map/readme.txt';
export const pluginServiceWorkerPath = 'core-ai-map/assets/service-worker.js';

export const createPluginZipFixture = ( {
	headerVersion,
	constantVersion = headerVersion,
	blockVersion = headerVersion,
	stableTag = headerVersion,
	cacheVersion = headerVersion,
	includeBootstrap = true,
	includeBlockMetadata = true,
	includeReadme = true,
	includeServiceWorker = true,
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

	if ( includeReadme ) {
		zip.addFile(
			pluginReadmePath,
			Buffer.from(
				`=== Core AI Living Block Map Fixture ===\nStable tag: ${ stableTag }\n`
			)
		);
	}

	if ( includeServiceWorker ) {
		zip.addFile(
			pluginServiceWorkerPath,
			Buffer.from(
				`const CACHE_SCOPE_PREFIX = 'fixture-';\nconst CACHE_NAME = \`${ '${ CACHE_SCOPE_PREFIX }' }v${ cacheVersion }-review-1\`;\n`
			)
		);
	}

	return zip.toBuffer();
};
