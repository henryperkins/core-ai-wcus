import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = path.resolve( __dirname, '..', '..' );
const existingPreload = { href: 'https://example.test/site.js', as: 'script' };

const getPreloads = ( { singular = true, post = true, block = true } = {} ) => {
	const harness = `
define( 'ABSPATH', __DIR__ );
class WP_Post {}
function plugin_dir_path( $file ) { return dirname( $file ) . '/'; }
function plugin_dir_url( $file ) { return 'https://example.test/plugin/'; }
function add_action() {}
function add_filter( $name, $callback ) { $GLOBALS['filters'][ $name ] = $callback; }
function is_singular() { return ${ singular ? 'true' : 'false' }; }
function get_queried_object() { return ${ post ? 'new WP_Post()' : 'null' }; }
function has_block( $name, $post ) {
	return 'core-ai/core-ai-map' === $name && ${ block ? 'true' : 'false' };
}
require ${ JSON.stringify( path.join( root, 'core-ai-map.php' ) ) };
$callback = $GLOBALS['filters']['wp_preload_resources'];
echo json_encode( call_user_func( $callback, array(
	array( 'href' => 'https://example.test/site.js', 'as' => 'script' ),
) ) );
`;
	const result = spawnSync( 'php', [ '-r', harness ], { encoding: 'utf8' } );

	if ( result.status !== 0 ) {
		throw new Error(
			result.stderr || result.stdout || `PHP exited ${ result.status }.`
		);
	}

	return JSON.parse( result.stdout );
};

describe( 'kiosk font preloads', () => {
	it( 'adds reusable font requests matching the shipped variable fonts', () => {
		const preloads = getPreloads();
		const styles = readFileSync(
			path.join( root, 'build', 'core-ai-map', 'style-index.css' ),
			'utf8'
		);
		const fontUrls = [
			...styles.matchAll( /url\(([^)]*wght[^)]*\.woff2)\)/g ),
		].map(
			( match ) =>
				new URL(
					match[ 1 ],
					'https://example.test/plugin/build/core-ai-map/style-index.css'
				).href
		);

		expect( fontUrls ).toHaveLength( 2 );

		expect( preloads ).toEqual( [
			existingPreload,
			...fontUrls.map( ( href ) => ( {
				href,
				as: 'font',
				type: 'font/woff2',
				crossorigin: 'anonymous',
			} ) ),
		] );

		for ( const href of fontUrls ) {
			expect(
				existsSync(
					path.join( root, 'build', 'fonts', path.basename( href ) )
				)
			).toBe( true );
		}
	} );

	it.each( [ { singular: false }, { post: false }, { block: false } ] )(
		'keeps unrelated pages free of kiosk font hints: %p',
		( page ) => {
			expect( getPreloads( page ) ).toEqual( [ existingPreload ] );
		}
	);
} );
