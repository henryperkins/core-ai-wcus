<?php
/**
 * Plugin Name:       Core AI Living Block Map
 * Description:       An interactive map of the building blocks connecting WordPress and AI.
 * Version:           3.2.1
 * Requires at least: 7.0
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

define( 'CORE_AI_MAP_VERSION', '3.2.1' );
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
 * Marks only an anonymous kiosk response as eligible for page-level offline
 * caching. The service worker refuses HTML without this explicit signal.
 *
 * @param array $headers Response headers.
 * @return array Filtered response headers.
 */
function core_ai_map_mark_public_kiosk_response( $headers ) {
	if ( core_ai_map_is_kiosk_page() && ! is_user_logged_in() ) {
		$headers['X-Core-AI-Map-Public'] = '1';
	}

	return $headers;
}
add_filter( 'wp_headers', 'core_ai_map_mark_public_kiosk_response' );

/**
 * Returns a service-worker scope limited to one non-root kiosk permalink.
 *
 * A root scope would let this kiosk worker intercept unrelated WordPress
 * pages. Offline mode therefore stands down when the map is used as the site
 * homepage or when the URL cannot be proven to belong to this installation.
 *
 * @param string $url Candidate kiosk URL.
 * @return string Safe path scope, or an empty string when offline mode must be disabled.
 */
function core_ai_map_get_kiosk_scope( $url ) {
	$home_url  = home_url( '/' );
	$home_host = wp_parse_url( $home_url, PHP_URL_HOST );
	$url_host  = wp_parse_url( $url, PHP_URL_HOST );
	$path      = wp_parse_url( $url, PHP_URL_PATH );
	$home_path = wp_parse_url( $home_url, PHP_URL_PATH );
	$home_path = $home_path ? trailingslashit( $home_path ) : '/';

	$decoded_path = $path ? rawurldecode( $path ) : '';

	if (
		! $path ||
		$home_host !== $url_host ||
		'/' !== substr( $path, -1 ) ||
		preg_match( '#(?:^|/|\\\\)\.{1,2}(?:/|\\\\|$)#', $decoded_path )
	) {
		return '';
	}

	if ( 0 !== strpos( $path, $home_path ) || untrailingslashit( $path ) === untrailingslashit( $home_path ) ) {
		return '';
	}

	return trailingslashit( $path );
}

/**
 * Signs a generated kiosk scope so the public worker endpoint cannot be used
 * to widen its reach to arbitrary WordPress paths.
 *
 * @param string $scope Page-scoped service-worker path.
 * @return string Scope signature.
 */
function core_ai_map_sign_kiosk_scope( $scope ) {
	return hash_hmac( 'sha256', $scope, wp_salt( 'auth' ) );
}

/**
 * Reads an untrusted public query argument only when it is a scalar string.
 *
 * @param string $key Query argument name.
 * @return string Unslashed string value, or an empty string.
 */
function core_ai_map_get_query_string( $key ) {
	if ( ! isset( $_GET[ $key ] ) || ! is_string( $_GET[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return '';
	}

	return wp_unslash( $_GET[ $key ] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

/**
 * Validates a signed worker scope without rewriting percent-encoded path data.
 *
 * @param string $scope Candidate scope exactly as signed by the renderer.
 * @param string $token HMAC signature.
 * @return bool Whether the public worker request is valid.
 */
function core_ai_map_is_valid_kiosk_scope_request( $scope, $token ) {
	$decoded_scope = rawurldecode( $scope );
	$home_path     = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
	$home_path     = $home_path ? trailingslashit( $home_path ) : '/';

	return ! (
		! $scope ||
		'/' !== substr( $scope, 0, 1 ) ||
		'/' !== substr( $scope, -1 ) ||
		preg_match( '/[\x00-\x1f\x7f]/', $decoded_scope ) ||
		preg_match( '#(?:^|/|\\\\)\.{1,2}(?:/|\\\\|$)#', $decoded_scope ) ||
		! preg_match( '/\A[a-f0-9]{64}\z/D', $token ) ||
		! hash_equals( core_ai_map_sign_kiosk_scope( $scope ), $token ) ||
		0 !== strpos( $scope, $home_path ) ||
		untrailingslashit( $scope ) === untrailingslashit( $home_path )
	);
}

/**
 * Prints installable web-app metadata only on the kiosk page.
 */
function core_ai_map_print_web_app_metadata() {
	if ( ! core_ai_map_is_kiosk_page() ) {
		return;
	}

	$start_url    = get_permalink();
	$scope        = core_ai_map_get_kiosk_scope( $start_url );
	$manifest_url = add_query_arg(
		array(
			'_core_ai_map_manifest' => '1',
			'start'                 => $start_url,
			'_core_ai_map_scope'    => $scope,
			'_core_ai_map_token'    => $scope ? core_ai_map_sign_kiosk_scope( $scope ) : '',
		),
		home_url( '/' )
	);
	?>
	<link rel="manifest" href="<?php echo esc_url( $manifest_url ); ?>">
	<link rel="icon" href="<?php echo esc_url( CORE_AI_MAP_URL . 'assets/icon.svg' ); ?>" type="image/svg+xml">
	<link rel="apple-touch-icon" href="<?php echo esc_url( CORE_AI_MAP_URL . 'assets/icon-192.png' ); ?>">
	<meta name="theme-color" content="#3858e9">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="apple-mobile-web-app-title" content="<?php esc_attr_e( 'Living Block Map', 'core-ai-map' ); ?>">
	<?php
}
add_action( 'wp_head', 'core_ai_map_print_web_app_metadata', 1 );

/**
 * Skips an unavailable Twenty Twenty-Five inline-style optimization on kiosks.
 *
 * The pinned static Playground can serve this stylesheet over HTTP while the
 * corresponding file is absent from PHP's virtual filesystem. Clearing only
 * the optional path metadata preserves the queued stylesheet URL and prevents
 * WordPress 7.0 from reporting the unreadable optimization path.
 */
function core_ai_map_skip_unreadable_kiosk_theme_inline_path() {
	if ( ! core_ai_map_is_kiosk_page() ) {
		return;
	}

	global $wp_styles;

	if ( ! $wp_styles instanceof WP_Styles ) {
		return;
	}

	$theme_path = '/wp-content/themes/twentytwentyfive/';
	$style_path = '/assets/css/style.min.css';

	foreach ( $wp_styles->queue as $handle ) {
		$path = $wp_styles->get_data( $handle, 'path' );

		if ( ! is_string( $path ) || '' === $path ) {
			continue;
		}

		$path = wp_normalize_path( $path );

		if (
			false === strpos( $path, $theme_path ) ||
			$style_path !== substr( $path, -strlen( $style_path ) ) ||
			is_readable( $path )
		) {
			continue;
		}

		$wp_styles->add_data( $handle, 'path', false );
	}
}
add_action( 'wp_enqueue_scripts', 'core_ai_map_skip_unreadable_kiosk_theme_inline_path', PHP_INT_MAX );

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

		$scope = core_ai_map_get_query_string( '_core_ai_map_scope' );
		$token = core_ai_map_get_query_string( '_core_ai_map_token' );

		if ( ! core_ai_map_is_valid_kiosk_scope_request( $scope, $token ) ) {
			status_header( 403 );
			exit;
		}

		header( 'Content-Type: application/javascript; charset=UTF-8' );
		header( 'Cache-Control: no-cache, must-revalidate' );
		header( 'Service-Worker-Allowed: ' . $scope );
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		readfile( $service_worker );
		exit;
	}

	if ( 1 !== $serve_manifest ) {
		return;
	}

	$home_url  = home_url( '/' );
	$start_url = esc_url_raw( core_ai_map_get_query_string( 'start' ) );
	$start_url = $start_url ? $start_url : $home_url;
	$home_host = wp_parse_url( $home_url, PHP_URL_HOST );

	if ( ! $start_url || $home_host !== wp_parse_url( $start_url, PHP_URL_HOST ) ) {
		$start_url = $home_url;
	}

	$scope = core_ai_map_get_kiosk_scope( $start_url );

	if ( ! $scope ) {
		$scope = wp_parse_url( $home_url, PHP_URL_PATH );
		$scope = $scope ? trailingslashit( $scope ) : '/';
	}

	$manifest = array(
		'name'             => __( 'WordPress Core AI Living Block Map', 'core-ai-map' ),
		'short_name'       => __( 'Living Block Map', 'core-ai-map' ),
		'description'      => __( 'Explore how the building blocks connecting WordPress and AI work together.', 'core-ai-map' ),
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
