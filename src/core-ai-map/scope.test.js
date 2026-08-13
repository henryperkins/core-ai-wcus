import path from 'node:path';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const pluginPath = path.resolve( __dirname, '..', '..', 'core-ai-map.php' );

const runPhp = ( body, env = {} ) => {
	const harness = `
define( 'ABSPATH', __DIR__ );
function plugin_dir_path( $file ) { return dirname( $file ) . '/'; }
function plugin_dir_url( $file ) { return 'https://example.test/plugin/'; }
function add_action() {}
function add_filter() {}
function home_url( $path = '/' ) { return 'https://example.test' . $path; }
function wp_parse_url( $url, $component = -1 ) { return parse_url( $url, $component ); }
function trailingslashit( $path ) { return rtrim( $path, '/' ) . '/'; }
function untrailingslashit( $path ) { return rtrim( $path, '/' ); }
function wp_unslash( $value ) { return $value; }
function sanitize_text_field( $value ) { return trim( $value ); }
function wp_salt() { return 'test-salt'; }
require ${ JSON.stringify( pluginPath ) };
${ body }
`;
	const result = spawnSync( 'php', [ '-r', harness ], {
		encoding: 'utf8',
		env: { ...process.env, ...env },
	} );

	if ( result.status !== 0 ) {
		throw new Error(
			result.stderr || result.stdout || `PHP exited ${ result.status }.`
		);
	}

	return result;
};

const scopeFor = ( url ) =>
	runPhp(
		"echo core_ai_map_get_kiosk_scope( getenv( 'CORE_AI_MAP_TEST_URL' ) );",
		{ CORE_AI_MAP_TEST_URL: url }
	).stdout;

describe( 'kiosk service-worker scope', () => {
	it( 'keeps a directory-style permalink inside its scope', () => {
		expect( scopeFor( 'https://example.test/living-map/' ) ).toBe(
			'/living-map/'
		);
		expect( scopeFor( 'https://example.test/living-map' ) ).toBe( '' );
		expect( scopeFor( 'https://example.test/living-map-v3.1/' ) ).toBe(
			'/living-map-v3.1/'
		);
	} );

	it( 'disables offline mode for suffix permalinks that cannot have a safe directory scope', () => {
		expect( scopeFor( 'https://example.test/living-map.html' ) ).toBe( '' );
	} );

	it( 'rejects an encoded dot-segment worker scope', () => {
		const plugin = readFileSync( pluginPath, 'utf8' );
		expect( plugin ).toContain( 'rawurldecode( $scope )' );
		expect( plugin ).toContain( "'/' !== substr( $scope, -1 )" );
		expect( plugin ).toMatch( /preg_match[\s\S]*?\$decoded_scope/ );
	} );

	it( 'accepts a valid signed percent-encoded non-Latin kiosk scope unchanged', () => {
		const result = runPhp( `
$scope = '/caf%C3%A9/';
$token = core_ai_map_sign_kiosk_scope( $scope );
echo core_ai_map_is_valid_kiosk_scope_request( $scope, $token ) ? 'valid' : 'invalid';
` );

		expect( result.stdout ).toBe( 'valid' );
	} );

	it( 'rejects array-shaped public query parameters without a PHP error', () => {
		const result = runPhp( `
$_GET['_core_ai_map_scope'] = array( '/kiosk/' );
$_GET['_core_ai_map_token'] = array( 'token' );
$_GET['start'] = array( 'https://example.test/kiosk/' );
echo json_encode( array(
	core_ai_map_get_query_string( '_core_ai_map_scope' ),
	core_ai_map_get_query_string( '_core_ai_map_token' ),
	core_ai_map_get_query_string( 'start' ),
) );
` );

		expect( JSON.parse( result.stdout ) ).toEqual( [ '', '', '' ] );
	} );
} );
