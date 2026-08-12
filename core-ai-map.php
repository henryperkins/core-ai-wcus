<?php
/**
 * Plugin Name:       Core AI Living Map
 * Description:       An interactive Core AI project map for a landscape iPad kiosk.
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       core-ai-map
 *
 * @package CoreAiMap
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CORE_AI_MAP_VERSION', '0.1.0' );
define( 'CORE_AI_MAP_PATH', plugin_dir_path( __FILE__ ) );
define( 'CORE_AI_MAP_URL', plugin_dir_url( __FILE__ ) );

/**
 * Registers the block and its generated assets.
 */
function core_ai_map_block_init() {
	wp_register_block_types_from_metadata_collection(
		__DIR__ . '/build',
		__DIR__ . '/build/blocks-manifest.php'
	);
}
add_action( 'init', 'core_ai_map_block_init' );

/**
 * Checks whether the current singular page contains the kiosk block.
 *
 * @return bool Whether the current page contains the block.
 */
function core_ai_map_is_kiosk_page() {
	if ( ! is_singular() ) {
		return false;
	}

	$post = get_queried_object();

	return $post instanceof WP_Post && has_block( 'core-ai/core-ai-map', $post );
}

/**
 * Prints installable web-app metadata only on the kiosk page.
 */
function core_ai_map_print_web_app_metadata() {
	if ( ! core_ai_map_is_kiosk_page() ) {
		return;
	}

	$start_url    = get_permalink();
	$manifest_url = add_query_arg(
		array(
			'_core_ai_map_manifest' => '1',
			'start'                 => $start_url,
		),
		home_url( '/' )
	);
	?>
	<link rel="manifest" href="<?php echo esc_url( $manifest_url ); ?>">
	<link rel="icon" href="<?php echo esc_url( CORE_AI_MAP_URL . 'assets/icon.svg' ); ?>" type="image/svg+xml">
	<link rel="apple-touch-icon" href="<?php echo esc_url( CORE_AI_MAP_URL . 'assets/icon-192.png' ); ?>">
	<meta name="theme-color" content="#3858e9">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="apple-mobile-web-app-title" content="<?php esc_attr_e( 'Core AI Map', 'core-ai-map' ); ?>">
	<?php
}
add_action( 'wp_head', 'core_ai_map_print_web_app_metadata', 1 );

/**
 * Serves the same-origin service worker and web-app manifest.
 */
function core_ai_map_serve_web_app_asset() {
	$serve_worker   = filter_input( INPUT_GET, '_core_ai_map_sw', FILTER_VALIDATE_INT );
	$serve_manifest = filter_input( INPUT_GET, '_core_ai_map_manifest', FILTER_VALIDATE_INT );

	if ( 1 === $serve_worker ) {
		$service_worker = CORE_AI_MAP_PATH . 'assets/service-worker.js';

		if ( ! is_readable( $service_worker ) ) {
			status_header( 404 );
			exit;
		}

		$scope = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		header( 'Content-Type: application/javascript; charset=UTF-8' );
		header( 'Cache-Control: no-cache, must-revalidate' );
		header( 'Service-Worker-Allowed: ' . ( $scope ? $scope : '/' ) );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		readfile( $service_worker );
		exit;
	}

	if ( 1 !== $serve_manifest ) {
		return;
	}

	$home_url  = home_url( '/' );
	$start_url = isset( $_GET['start'] ) ? esc_url_raw( wp_unslash( $_GET['start'] ) ) : $home_url;
	$home_host = wp_parse_url( $home_url, PHP_URL_HOST );

	if ( ! $start_url || $home_host !== wp_parse_url( $start_url, PHP_URL_HOST ) ) {
		$start_url = $home_url;
	}

	$scope = wp_parse_url( $home_url, PHP_URL_PATH );

	$manifest = array(
		'name'             => __( 'WordPress Core AI Living Map', 'core-ai-map' ),
		'short_name'       => __( 'Core AI Map', 'core-ai-map' ),
		'description'      => __( 'Explore the open-source projects making WordPress AI-ready.', 'core-ai-map' ),
		'start_url'        => $start_url,
		'scope'            => $scope ? $scope : '/',
		'display'          => 'fullscreen',
		'orientation'      => 'landscape',
		'background_color' => '#f6f7f7',
		'theme_color'      => '#3858e9',
		'icons'            => array(
			array(
				'src'     => CORE_AI_MAP_URL . 'assets/icon-192.png',
				'sizes'   => '192x192',
				'type'    => 'image/png',
				'purpose' => 'any maskable',
			),
			array(
				'src'     => CORE_AI_MAP_URL . 'assets/icon-512.png',
				'sizes'   => '512x512',
				'type'    => 'image/png',
				'purpose' => 'any maskable',
			),
		),
	);

	nocache_headers();
	header( 'Content-Type: application/manifest+json; charset=UTF-8' );
	echo wp_json_encode( $manifest, JSON_UNESCAPED_SLASHES );
	exit;
}
add_action( 'template_redirect', 'core_ai_map_serve_web_app_asset', 0 );
