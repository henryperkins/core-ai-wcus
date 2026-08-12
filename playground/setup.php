<?php
/**
 * Creates the public landing page after the Living Block Map plugin activates.
 *
 * This file runs only inside the disposable WordPress Playground filesystem.
 */

require '/wordpress/wp-load.php';

$page = get_page_by_path( 'living-block-map', OBJECT, 'page' );

if ( ! $page ) {
	wp_insert_post(
		array(
			'post_title'   => 'Core AI Living Block Map',
			'post_name'    => 'living-block-map',
			'post_status'  => 'publish',
			'post_type'    => 'page',
			// Playground already owns the browser-local service worker and storage.
			'post_content' => '<!-- wp:core-ai/core-ai-map {"offlineEnabled":false} /-->',
		)
	);
}

flush_rewrite_rules();
