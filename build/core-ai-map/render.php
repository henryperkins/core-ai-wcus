<?php
/**
 * Server-rendered markup for the Core AI Boundary Map block.
 *
 * The kiosk is drawn inside a fixed 1366x1024 stage. Every coordinate below is
 * in that space; `style.scss` scales the whole stage to fit the viewport, so
 * the geometry stays exact on the target iPad Pro 13" and degrades sanely
 * everywhere else.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Block instance.
 *
 * @package CoreAiMap
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Neutral (resting) top-left position of every card on the stage.
 *
 * This table is the single source of truth for placement: the wrapper reads it
 * for its own `--cai-x` / `--cai-y`, and the story placements below are turned
 * into transforms relative to it, both here and in `view.js`.
 */
$neutral = array(
	'plugin'     => array( 268, 160 ),
	'client'     => array( 556, 160 ),
	'connectors' => array( 912, 160 ),
	'mcp'        => array( 122, 400 ),
	'abilities'  => array( 556, 400 ),
	'bench'      => array( 556, 672 ),
	'assistant'  => array( 24, 176 ),
	'skills'     => array( 24, 176 ),
	'agent'      => array( 24, 300 ),
	'provider'   => array( 1150, 330 ),
);

/**
 * Horizontal slots on the "Also part of the ecosystem" shelf, in park order.
 */
$shelf_x = array( 256, 384, 512, 640, 768, 896 );

/**
 * Per-story composition.
 *
 * members  Block/actor id => step number in the workflow.
 * place    Where each member slides to.
 * park     Non-members, in shelf order.
 * shelfY   Shelf row for this story.
 * strips   Role-strip offset overrides (defaults to below the card).
 * edges    Connector paths while recomposed.
 * rest     Connector paths when recomposition is turned off (v1 behavior).
 * dur      Travel duration of the spark on each path.
 * crosses  Boundary rules this story genuinely crosses.
 */
$story_layout = array(
	'uses-ai' => array(
		'members' => array(
			'plugin'     => 1,
			'client'     => 2,
			'connectors' => 3,
			'provider'   => 4,
		),
		'place'   => array(
			'plugin'     => array( 268, 192 ),
			'client'     => array( 556, 192 ),
			'connectors' => array( 900, 192 ),
			'provider'   => array( 1180, 216 ),
		),
		'park'    => array( 'mcp', 'abilities', 'bench' ),
		'shelfY'  => 512,
		'edges'   => array( 'M504 266 L556 266', 'M792 266 L900 266', 'M1136 266 L1180 266' ),
		'rest'    => array( 'M504 234 L556 234', 'M792 234 L912 234', 'M1090 308 C1112 340 1122 364 1146 377' ),
		'dur'     => array( '1.5s', '1.9s', '1.7s' ),
		'crosses' => array( 'right' ),
	),
	'uses-wp' => array(
		'members' => array(
			'assistant' => 1,
			'mcp'       => 2,
			'abilities' => 3,
		),
		'place'   => array(
			'assistant' => array( 24, 156 ),
			'mcp'       => array( 122, 318 ),
			'abilities' => array( 556, 318 ),
		),
		'park'    => array( 'plugin', 'client', 'connectors', 'bench' ),
		'shelfY'  => 512,
		'strips'  => array(
			'mcp'       => array( 0, -58 ),
			'abilities' => array( 0, -58 ),
		),
		'edges'   => array( 'M114 262 L114 392 L118 392', 'M358 392 L556 392' ),
		'rest'    => array( 'M114 276 C114 342 162 372 230 395', 'M358 474 L556 474' ),
		'dur'     => array( '2.1s', '1.9s' ),
		'crosses' => array( 'left' ),
		'tokens'  => true,
	),
	'learns' => array(
		'members' => array(
			'skills' => 1,
			'agent'  => 2,
		),
		'place'   => array(
			'skills' => array( 24, 168 ),
			'agent'  => array( 24, 318 ),
		),
		'park'    => array( 'plugin', 'client', 'connectors', 'mcp', 'abilities', 'bench' ),
		'shelfY'  => 512,
		'edges'   => array( 'M114 272 L114 314' ),
		'rest'    => array( 'M114 278 L114 296' ),
		'dur'     => array( '1.4s' ),
		'crosses' => array(),
		'zone'    => 'outside',
	),
	'tests'  => array(
		'members' => array(
			'agent' => 1,
			'bench' => 2,
		),
		'place'   => array(
			'agent' => array( 24, 318 ),
			'bench' => array( 556, 596 ),
		),
		'park'    => array( 'plugin', 'client', 'connectors', 'mcp', 'abilities' ),
		'shelfY'  => 140,
		'edges'   => array( 'M114 422 L114 450 Q114 470 134 470 L460 470 Q480 470 480 490 L480 650 Q480 670 500 670 L546 670' ),
		'rest'    => array( 'M114 402 C114 630 176 748 336 748 L546 748' ),
		'dur'     => array( '2.8s' ),
		'crosses' => array( 'left', 'bottom' ),
	),
);

$block_ids = array( 'plugin', 'client', 'connectors', 'abilities', 'mcp', 'bench' );
$actor_ids = array( 'assistant', 'skills', 'agent', 'provider' );
$panel_ids = array( 'abilities', 'client', 'connectors', 'plugin', 'mcp', 'bench', 'skills' );

/**
 * Keeps only known ids, in the order the design defines them.
 *
 * @param mixed $items    Raw attribute value.
 * @param array $allowed  Allowed ids, in render order.
 * @return array Items keyed by id.
 */
$by_id = static function ( $items, $allowed ) {
	$keyed = array();

	if ( ! is_array( $items ) ) {
		return $keyed;
	}

	foreach ( $items as $item ) {
		if ( ! is_array( $item ) || empty( $item['id'] ) ) {
			continue;
		}

		$id = sanitize_key( $item['id'] );

		if ( ! in_array( $id, $allowed, true ) || isset( $keyed[ $id ] ) ) {
			continue;
		}

		$item['id']   = $id;
		$keyed[ $id ] = $item;
	}

	$ordered = array();

	foreach ( $allowed as $id ) {
		if ( isset( $keyed[ $id ] ) ) {
			$ordered[ $id ] = $keyed[ $id ];
		}
	}

	return $ordered;
};

$blocks = $by_id( $attributes['blocks'] ?? array(), $block_ids );
$actors = $by_id( $attributes['actors'] ?? array(), $actor_ids );
$panels = $by_id( $attributes['panels'] ?? array(), $panel_ids );
$stories = $by_id( $attributes['stories'] ?? array(), array_keys( $story_layout ) );

// A story can only run if its layout is present and every member is rendered.
$rendered_ids = array_merge( array_keys( $blocks ), array_keys( $actors ) );

foreach ( array_keys( $stories ) as $story_id ) {
	$members = array_keys( $story_layout[ $story_id ]['members'] );

	if ( count( array_intersect( $members, $rendered_ids ) ) !== count( $members ) ) {
		unset( $stories[ $story_id ] );
	}
}

$story_layout = array_intersect_key( $story_layout, $stories );

$suggestions = array();

foreach ( $attributes['suggestions'] ?? array() as $suggestion ) {
	if ( ! is_array( $suggestion ) || empty( $suggestion['label'] ) ) {
		continue;
	}

	$suggestions[] = array(
		'label' => (string) $suggestion['label'],
		'text'  => (string) ( $suggestion['text'] ?? '' ),
	);
}

$eyebrow            = $attributes['eyebrow'] ?? __( 'WordPress Core AI', 'core-ai-map' );
$hint               = $attributes['hint'] ?? '';
$inactivity_timeout = isset( $attributes['inactivityTimeout'] ) ? absint( $attributes['inactivityTimeout'] ) : 90;
$inactivity_timeout = max( 30, min( 180, $inactivity_timeout ) );
$offline_enabled    = ! empty( $attributes['offlineEnabled'] );
$recompose          = ! isset( $attributes['recompose'] ) || ! empty( $attributes['recompose'] );
$shapes             = ! isset( $attributes['shapes'] ) || ! empty( $attributes['shapes'] );
$instance_id        = wp_unique_id( 'core-ai-map-' );
$initial_story      = ! empty( $stories ) ? array_key_first( $stories ) : '';
$initial_layout     = $initial_story ? $story_layout[ $initial_story ] : null;

// The stage is drawn attract-first, which already composes the opening story.
$initial_members = $initial_layout ? $initial_layout['members'] : array();
$initial_moved   = (bool) $initial_layout && $recompose;

/**
 * Transform that moves a card from its neutral spot into the opening story.
 *
 * Mirrors `blockTransform()` in `view.js` so the first paint matches hydration.
 *
 * @param string $id Card id.
 * @return string CSS transform value, or an empty string when it does not move.
 */
$initial_transform = static function ( $id ) use ( $neutral, $shelf_x, $initial_layout, $initial_moved, $block_ids ) {
	if ( ! $initial_moved || ! isset( $neutral[ $id ] ) ) {
		return '';
	}

	list( $nx, $ny ) = $neutral[ $id ];

	if ( isset( $initial_layout['place'][ $id ] ) ) {
		list( $px, $py ) = $initial_layout['place'][ $id ];

		return sprintf( 'translate(%dpx, %dpx)', $px - $nx, $py - $ny );
	}

	if ( ! in_array( $id, $block_ids, true ) ) {
		return '';
	}

	$slot = array_search( $id, $initial_layout['park'], true );
	$slot = false === $slot ? 0 : $slot;

	return sprintf(
		'translate(%dpx, %dpx) scale(0.5)',
		$shelf_x[ $slot ] - $nx,
		$initial_layout['shelfY'] - $ny
	);
};

/**
 * Inline style carrying a card's neutral position and its opening transform.
 *
 * Positions are data, not decoration, so they travel as custom properties the
 * stylesheet consumes; everything else about the card lives in `style.scss`.
 *
 * @param string $id Card id.
 * @return string Style attribute value.
 */
$card_style = static function ( $id ) use ( $neutral, $initial_transform ) {
	list( $x, $y ) = $neutral[ $id ];
	$style         = sprintf( '--cai-x: %dpx; --cai-y: %dpx;', $x, $y );
	$transform     = $initial_transform( $id );

	return $transform ? $style . ' transform: ' . $transform . ';' : $style;
};

$service_worker_url = add_query_arg( '_core_ai_map_sw', '1', home_url( '/' ) );
$service_scope      = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
$asset_urls         = array(
	CORE_AI_MAP_URL . 'build/core-ai-map/view.js',
	CORE_AI_MAP_URL . 'build/core-ai-map/style-index.css',
	CORE_AI_MAP_URL . 'assets/icon.svg',
	CORE_AI_MAP_URL . 'assets/icon-192.png',
	CORE_AI_MAP_URL . 'assets/icon-512.png',
);

if ( function_exists( 'wp_script_modules' ) && method_exists( wp_script_modules(), 'get_registered' ) ) {
	$seen_modules          = array();
	$collect_module_assets = static function ( $module_id ) use ( &$collect_module_assets, &$asset_urls, &$seen_modules ) {
		if ( isset( $seen_modules[ $module_id ] ) ) {
			return;
		}

		$seen_modules[ $module_id ] = true;
		$module                     = wp_script_modules()->get_registered( $module_id );

		if ( empty( $module ) ) {
			return;
		}

		if ( ! empty( $module['src'] ) ) {
			$asset_urls[] = $module['src'];
		}

		foreach ( $module['dependencies'] ?? array() as $dependency ) {
			if ( ! empty( $dependency['id'] ) ) {
				$collect_module_assets( $dependency['id'] );
			}
		}
	};

	$collect_module_assets( '@wordpress/interactivity' );
}

$asset_urls = array_values( array_unique( array_filter( $asset_urls ) ) );

$context = array(
	'screen'         => 'attract',
	'story'          => $initial_story,
	'inspect'        => '',
	'idleStoryIndex' => 0,
	'isOffline'      => false,
	'suggestion'     => 0,
	'announcement'   => __( 'Core AI boundary map ready. Tap to add the blocks to the canvas.', 'core-ai-map' ),
	'suggestions'    => $suggestions,
	'phases'         => array(
		__( 'Suggested', 'core-ai-map' ),
		__( 'Review', 'core-ai-map' ),
		__( 'Applied', 'core-ai-map' ),
	),
	'recompose'      => $recompose,
	'shapes'         => $shapes,
	'storyIds'       => array_keys( $stories ),
	'neutral'        => $neutral,
	'shelfX'         => $shelf_x,
	'layout'         => $story_layout,
);

/**
 * Renders a card icon.
 *
 * @param string $id Card id.
 */
$icon = static function ( $id ) {
	?>
	<svg class="core-ai-map__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
		<?php if ( 'plugin' === $id ) : ?>
			<rect x="4" y="6" width="24" height="20" rx="2"></rect>
			<path d="M9 13h9m-9 5h14"></path>
		<?php elseif ( 'client' === $id ) : ?>
			<path d="M5 6h22v15H15l-6 5v-5H5V6Z"></path>
			<path d="M10 12h12m-12 4h8"></path>
		<?php elseif ( 'connectors' === $id ) : ?>
			<path d="M13 4h6v7h5v6h-5v4a7 7 0 0 1-14 0v-4h8V4Z"></path>
			<path d="M8 17v-5m10-1V6"></path>
		<?php elseif ( 'abilities' === $id ) : ?>
			<rect x="4" y="5" width="10" height="9" rx="1.5"></rect>
			<rect x="18" y="18" width="10" height="9" rx="1.5"></rect>
			<path d="M14 9.5h5a4 4 0 0 1 4 4V18M18 22.5h-5a4 4 0 0 1-4-4V14"></path>
		<?php elseif ( 'mcp' === $id ) : ?>
			<path d="M11 5v7m10-7v7M8 12h16v3a8 8 0 0 1-8 8v4"></path>
			<path d="M12 17h8"></path>
		<?php else : ?>
			<path d="M5 27V14m7 13V8m7 19V17m7 10V4"></path>
			<path d="M3 27h26"></path>
		<?php endif; ?>
	</svg>
	<?php
};

/**
 * Renders the role strip a card grows when it joins a story or opens.
 *
 * @param string $id Card id.
 */
$role_strip = static function ( $id ) use ( $suggestions ) {
	switch ( $id ) {
		case 'plugin':
			?>
			<div
				class="core-ai-map__workbench"
				data-wp-class--is-review="state.isSuggestionReviewing"
				data-wp-class--is-applied="state.isSuggestionApplied"
			>
				<div class="core-ai-map__workbench-head">
					<span data-wp-text="state.suggestionLabel"><?php echo esc_html( $suggestions[0]['label'] ?? '' ); ?></span>
					<em class="core-ai-map__workbench-phase" data-wp-text="state.suggestionPhase"><?php esc_html_e( 'Suggested', 'core-ai-map' ); ?></em>
				</div>
				<p class="core-ai-map__workbench-text" data-wp-text="state.suggestionText"><?php echo esc_html( $suggestions[0]['text'] ?? '' ); ?></p>
				<div class="core-ai-map__workbench-actions">
					<span class="core-ai-map__workbench-review"><?php esc_html_e( 'Review', 'core-ai-map' ); ?></span>
					<span class="core-ai-map__workbench-apply"><?php esc_html_e( 'Apply', 'core-ai-map' ); ?></span>
				</div>
			</div>
			<?php
			break;

		case 'client':
			?>
			<div class="core-ai-map__router">
				<div class="core-ai-map__router-row">
					<span>text</span><span>image</span><span>json</span>
					<span class="core-ai-map__router-arrow" aria-hidden="true">&rarr;</span>
					<span class="core-ai-map__router-result"><?php esc_html_e( 'result', 'core-ai-map' ); ?></span>
				</div>
				<p>route &middot; select &middot; normalize</p>
			</div>
			<?php
			break;

		case 'connectors':
			?>
			<div class="core-ai-map__sockets">
				<div class="core-ai-map__sockets-row">
					<span class="core-ai-map__socket core-ai-map__socket--connected"><?php esc_html_e( 'Connected', 'core-ai-map' ); ?></span>
					<span class="core-ai-map__socket core-ai-map__socket--available"><?php esc_html_e( 'Available', 'core-ai-map' ); ?></span>
				</div>
				<span class="core-ai-map__socket core-ai-map__socket--credentials"><?php esc_html_e( 'Needs credentials', 'core-ai-map' ); ?></span>
			</div>
			<?php
			break;

		case 'abilities':
			?>
			<div class="core-ai-map__ports">
				<span><?php esc_html_e( 'Input', 'core-ai-map' ); ?></span>
				<span class="is-accent"><?php esc_html_e( 'Permission', 'core-ai-map' ); ?> &#10003;</span>
				<span><?php esc_html_e( 'Run', 'core-ai-map' ); ?></span>
				<span><?php esc_html_e( 'Output', 'core-ai-map' ); ?></span>
			</div>
			<?php
			break;

		case 'mcp':
			?>
			<div class="core-ai-map__bridge">
				<span class="core-ai-map__bridge-outside">tools &middot; resources</span>
				<span class="core-ai-map__bridge-inside">abilities</span>
			</div>
			<?php
			break;

		default:
			?>
			<div class="core-ai-map__meters">
				<div class="core-ai-map__meter">
					<span class="core-ai-map__meter-label">knowledge</span>
					<span class="core-ai-map__meter-track"><span style="width: 82%;"></span></span>
					<span class="core-ai-map__meter-value">82</span>
				</div>
				<div class="core-ai-map__meter">
					<span class="core-ai-map__meter-label">execution</span>
					<span class="core-ai-map__meter-track"><span style="width: 70%;"></span></span>
					<span class="core-ai-map__meter-value">7/10</span>
				</div>
			</div>
			<?php
	}
};

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		// The kiosk always opens on the attract screen; naming that here keeps
		// the first paint right before the Interactivity API hydrates.
		'class'                     => 'core-ai-map is-attract',
		'aria-label'                => __( 'WordPress Core AI boundary map', 'core-ai-map' ),
		'data-wp-interactive'       => 'core-ai/map',
		'data-wp-run'               => 'callbacks.useKiosk',
		'data-wp-class--is-attract' => 'state.isAttract',
		'data-wp-class--is-map'     => 'state.isMap',
		'data-wp-class--is-inspect' => 'state.isInspect',
		'data-wp-class--has-story'  => 'state.hasStory',
		'data-inactivity-timeout'   => (string) ( $inactivity_timeout * 1000 ),
		'data-offline-enabled'      => $offline_enabled ? 'true' : 'false',
		'data-service-worker-url'   => $service_worker_url,
		'data-service-worker-scope' => $service_scope ? $service_scope : '/',
		'data-asset-urls'           => wp_json_encode( $asset_urls ),
	)
);
?>

<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo wp_interactivity_data_wp_context( $context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="core-ai-map__stage">
		<div class="core-ai-map__grid" aria-hidden="true"></div>

		<header class="core-ai-map__topbar">
			<div class="core-ai-map__brand">
				<img
					class="core-ai-map__mark"
					src="<?php echo esc_url( CORE_AI_MAP_URL . 'assets/icon.svg' ); ?>"
					alt=""
					width="30"
					height="30"
				>
				<span><?php echo esc_html( $eyebrow ); ?></span>
			</div>

			<?php if ( $hint ) : ?>
				<p class="core-ai-map__hint">
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<rect x="3.5" y="3.5" width="7" height="7" rx="1"></rect>
						<rect x="13.5" y="3.5" width="7" height="7" rx="1"></rect>
						<rect x="3.5" y="13.5" width="7" height="7" rx="1"></rect>
						<rect x="13.5" y="13.5" width="7" height="7" rx="1"></rect>
					</svg>
					<?php echo esc_html( $hint ); ?>
				</p>
			<?php endif; ?>

			<p class="core-ai-map__offline" data-wp-bind--hidden="state.isOnline">
				<span aria-hidden="true"></span><?php esc_html_e( 'Offline mode', 'core-ai-map' ); ?>
			</p>

			<button class="core-ai-map__reset" type="button" data-wp-on--click="actions.reset">
				<?php esc_html_e( 'Start over', 'core-ai-map' ); ?>
			</button>
		</header>

		<div class="core-ai-map__canvas">
			<div class="core-ai-map__plate" aria-hidden="true"></div>

			<p class="core-ai-map__zone core-ai-map__zone--outside" data-wp-class--is-lit="state.isOutsideZoneLit">
				<?php esc_html_e( 'Outside · assistants', 'core-ai-map' ); ?>
			</p>
			<p class="core-ai-map__zone core-ai-map__zone--inside"><?php esc_html_e( 'Inside WordPress', 'core-ai-map' ); ?></p>
			<p class="core-ai-map__zone core-ai-map__zone--providers"><?php esc_html_e( 'Outside · AI providers', 'core-ai-map' ); ?></p>
			<p class="core-ai-map__zone core-ai-map__zone--runtime"><?php esc_html_e( 'Below the runtime · evaluation', 'core-ai-map' ); ?></p>

			<p
				class="core-ai-map__shelf-label"
				data-wp-bind--hidden="state.isShelfHidden"
				data-wp-style--top="state.shelfTop"
			>
				<?php esc_html_e( 'Also part of the ecosystem', 'core-ai-map' ); ?>
			</p>

			<svg class="core-ai-map__wires" viewBox="0 0 1366 1024" aria-hidden="true" focusable="false">
				<defs>
					<marker id="<?php echo esc_attr( $instance_id ); ?>-tip" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse">
						<path d="M0 0 L10 5 L0 10 z"></path>
					</marker>
					<pattern id="<?php echo esc_attr( $instance_id ); ?>-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<line x1="0" y1="0" x2="0" y2="4" stroke="#dcdcde" stroke-width="2"></line>
					</pattern>
				</defs>

				<g class="core-ai-map__rules">
					<?php
					$rules = array(
						'left'   => 'M240 112 L240 600',
						'right'  => 'M1030 112 L1030 600',
						'bottom' => 'M240 628 L1030 628',
					);
					?>
					<?php foreach ( $rules as $side => $path ) : ?>
						<path
							class="core-ai-map__rule core-ai-map__rule--<?php echo esc_attr( $side ); ?>"
							d="<?php echo esc_attr( $path ); ?>"
							<?php echo wp_interactivity_data_wp_context( array( 'side' => $side ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							data-wp-class--is-lit="state.isRuleLit"
						></path>
					<?php endforeach; ?>
				</g>

				<g class="core-ai-map__hairlines" data-wp-class--is-hidden="state.areHairlinesHidden">
					<path d="M504 234 L556 234"></path>
					<path d="M792 234 L912 234"></path>
					<path d="M674 308 L674 400"></path>
					<path d="M358 474 L556 474"></path>
				</g>

				<?php
				/*
				 * Every story's connector paths are drawn up front with a static
				 * `d`, and only their visibility is toggled. Swapping `d` at
				 * runtime would mean writing to SVGPathElement.d, which is not
				 * settable the way an HTML attribute is.
				 *
				 * `edges` are the recomposed paths; `rest` are the v1 paths used
				 * when recomposition is turned off.
				 */
				$spark_delays = array( '0s', '0.55s', '1s' );
				?>
				<g class="core-ai-map__flow">
					<?php foreach ( $story_layout as $story_id => $story_paths ) : ?>
						<?php foreach ( array( 'edges', 'rest' ) as $variant ) : ?>
							<?php foreach ( $story_paths[ $variant ] as $edge => $path ) : ?>
								<path
									d="<?php echo esc_attr( $path ); ?>"
									<?php
									echo wp_interactivity_data_wp_context( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
										array(
											'storyId' => $story_id,
											'variant' => $variant,
										)
									);
									?>
									data-wp-class--is-live="state.isEdgeLive"
									marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"
								></path>
							<?php endforeach; ?>
						<?php endforeach; ?>
					<?php endforeach; ?>
				</g>
			</svg>

			<div class="core-ai-map__sparks" aria-hidden="true">
				<?php foreach ( $story_layout as $story_id => $story_paths ) : ?>
					<?php foreach ( array( 'edges', 'rest' ) as $variant ) : ?>
						<?php foreach ( $story_paths[ $variant ] as $edge => $path ) : ?>
							<span
								class="core-ai-map__spark"
								style="
									offset-path: path('<?php echo esc_attr( $path ); ?>');
									animation-duration: <?php echo esc_attr( $story_paths['dur'][ $edge ] ?? '2s' ); ?>;
									animation-delay: <?php echo esc_attr( $spark_delays[ $edge ] ?? '0s' ); ?>;
								"
								<?php
								echo wp_interactivity_data_wp_context( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									array(
										'storyId' => $story_id,
										'variant' => $variant,
									)
								);
								?>
								data-wp-class--is-live="state.isSparkLive"
							></span>
						<?php endforeach; ?>
					<?php endforeach; ?>
				<?php endforeach; ?>
			</div>

			<div class="core-ai-map__tokens" aria-hidden="true" data-wp-class--is-live="state.areTokensLive">
				<span class="core-ai-map__token core-ai-map__token--call">tools/call</span>
				<span class="core-ai-map__token core-ai-map__token--ability">ability</span>
			</div>

			<?php foreach ( $actors as $actor_id => $actor ) : ?>
				<?php $is_skills = 'skills' === $actor_id; ?>
				<div
					class="core-ai-map__actor core-ai-map__actor--<?php echo esc_attr( $actor_id ); ?>"
					style="<?php echo esc_attr( $card_style( $actor_id ) ); ?>"
					<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $actor_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isCardOffstage"
					data-wp-style--transform="state.cardTransform"
					<?php echo isset( $initial_members[ $actor_id ] ) ? '' : 'hidden'; ?>
				>
					<div class="core-ai-map__actor-float">
						<?php if ( $is_skills ) : ?>
							<span class="core-ai-map__actor-ghost core-ai-map__actor-ghost--far" aria-hidden="true"></span>
							<span class="core-ai-map__actor-ghost core-ai-map__actor-ghost--near" aria-hidden="true"></span>
							<button
								class="core-ai-map__actor-body"
								type="button"
								data-wp-on--click="actions.inspectCard"
							>
						<?php else : ?>
							<div class="core-ai-map__actor-body">
						<?php endif; ?>
								<span class="core-ai-map__step" data-wp-text="state.cardStep" aria-hidden="true"><?php echo esc_html( (string) ( $initial_members[ $actor_id ] ?? '' ) ); ?></span>
								<span class="core-ai-map__actor-badge"><?php echo esc_html( $actor['badge'] ?? '' ); ?></span>
								<strong><?php echo esc_html( $actor['name'] ?? '' ); ?></strong>
								<small><?php echo esc_html( $actor['tagline'] ?? '' ); ?></small>
						<?php if ( $is_skills ) : ?>
							</button>
						<?php else : ?>
							</div>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>

			<?php foreach ( $blocks as $block_id => $card ) : ?>
				<?php
				$detail_id     = $instance_id . '-panel-' . $block_id;
				$is_member     = isset( $initial_members[ $block_id ] );
				$initial_class = '';

				if ( $is_member ) {
					$initial_class = ' is-active';
				} elseif ( $initial_moved ) {
					$initial_class = ' is-parked';
				} elseif ( $initial_layout ) {
					$initial_class = ' is-dimmed';
				}
				?>
				<div
					class="core-ai-map__block core-ai-map__block--<?php echo esc_attr( $block_id ); ?><?php echo esc_attr( $initial_class ); ?>"
					style="<?php echo esc_attr( $card_style( $block_id ) ); ?>"
					<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $block_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-style--transform="state.cardTransform"
					data-wp-class--is-active="state.isCardActive"
					data-wp-class--is-parked="state.isCardParked"
					data-wp-class--is-dimmed="state.isCardDimmed"
				>
					<div class="core-ai-map__block-float">
						<button
							class="core-ai-map__block-body"
							type="button"
							aria-controls="<?php echo esc_attr( $detail_id ); ?>"
							data-wp-bind--aria-expanded="state.isCardInspected"
							data-wp-on--click="actions.inspectCard"
						>
							<span class="core-ai-map__step" data-wp-text="state.cardStep" aria-hidden="true"><?php echo esc_html( (string) ( $initial_members[ $block_id ] ?? '' ) ); ?></span>
							<span class="core-ai-map__block-head">
								<?php $icon( $block_id ); ?>
								<span class="core-ai-map__block-badge"><?php echo esc_html( $card['badge'] ?? '' ); ?></span>
							</span>
							<span class="core-ai-map__block-name">
								<strong><?php echo esc_html( $card['name'] ?? '' ); ?></strong>
								<small><?php echo esc_html( $card['tagline'] ?? '' ); ?></small>
							</span>
						</button>
					</div>

					<div
						class="core-ai-map__strip core-ai-map__strip--<?php echo esc_attr( $block_id ); ?>"
						aria-hidden="true"
						data-wp-class--is-live="state.isStripLive"
						data-wp-style--top="state.stripTop"
					>
						<?php $role_strip( $block_id ); ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="core-ai-map__story-copy" data-wp-bind--hidden="state.isStoryCopyHidden" hidden>
			<?php foreach ( $stories as $story_id => $story ) : ?>
				<p
					<?php echo wp_interactivity_data_wp_context( array( 'storyId' => $story_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isStoryNotSelected"
					<?php echo $story_id === $initial_story ? '' : 'hidden'; ?>
				>
					<strong><?php echo esc_html( $story['title'] ?? '' ); ?></strong>
					<span><?php echo esc_html( $story['copy'] ?? '' ); ?></span>
				</p>
			<?php endforeach; ?>
		</div>

		<nav class="core-ai-map__rail" aria-label="<?php esc_attr_e( 'Follow a story', 'core-ai-map' ); ?>">
			<?php $step = 0; ?>
			<?php foreach ( $stories as $story_id => $story ) : ?>
				<?php ++$step; ?>
				<button
					type="button"
					<?php echo wp_interactivity_data_wp_context( array( 'storyId' => $story_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--aria-pressed="state.isStorySelected"
					data-wp-class--is-active="state.isStorySelected"
					data-wp-on--click="actions.selectStory"
				>
					<span aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $step ) ); ?></span>
					<?php echo esc_html( $story['title'] ?? '' ); ?>
				</button>
			<?php endforeach; ?>
		</nav>

		<div class="core-ai-map__attract">
			<p class="core-ai-map__eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
			<h1><?php echo esc_html( $attributes['title'] ?? '' ); ?></h1>
			<p class="core-ai-map__intro"><?php echo esc_html( $attributes['intro'] ?? '' ); ?></p>
			<button class="core-ai-map__prompt" type="button" data-wp-on--click="actions.start">
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M12 5v14M5 12h14"></path>
				</svg>
				<?php echo esc_html( $attributes['prompt'] ?? '' ); ?>
			</button>
			<div class="core-ai-map__attract-story" aria-live="polite">
				<?php foreach ( $stories as $story_id => $story ) : ?>
					<p
						<?php echo wp_interactivity_data_wp_context( array( 'storyId' => $story_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-bind--hidden="state.isStoryNotSelected"
						<?php echo $story_id === $initial_story ? '' : 'hidden'; ?>
					>
						<span><?php echo esc_html( $story['title'] ?? '' ); ?></span>
						<em><?php echo esc_html( $story['copy'] ?? '' ); ?></em>
					</p>
				<?php endforeach; ?>
			</div>
		</div>

		<aside
			class="core-ai-map__details"
			role="region"
			aria-label="<?php esc_attr_e( 'Block details', 'core-ai-map' ); ?>"
			data-wp-bind--hidden="state.isNotInspect"
			hidden
		>
			<button class="core-ai-map__details-close" type="button" data-wp-on--click="actions.closeInspect">
				<span aria-hidden="true">&larr;</span>
				<?php esc_html_e( 'Back to the map', 'core-ai-map' ); ?>
			</button>

			<?php foreach ( $panels as $panel_id => $panel ) : ?>
				<article
					id="<?php echo esc_attr( $instance_id . '-panel-' . $panel_id ); ?>"
					<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $panel_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isCardNotInspected"
					hidden
				>
					<p class="core-ai-map__details-badge"><?php echo esc_html( $panel['badge'] ?? '' ); ?></p>
					<h2><?php echo esc_html( $panel['title'] ?? '' ); ?></h2>
					<p class="core-ai-map__details-lede"><?php echo esc_html( $panel['lede'] ?? '' ); ?></p>

					<?php if ( ! empty( $panel['connect'] ) && is_array( $panel['connect'] ) ) : ?>
						<?php $is_grid = 'grid' === ( $panel['connectLayout'] ?? 'chain' ); ?>
						<p class="core-ai-map__details-heading"><?php echo esc_html( $panel['connectHeading'] ?? '' ); ?></p>
						<div class="core-ai-map__chain <?php echo $is_grid ? 'core-ai-map__chain--grid' : ''; ?>">
							<?php foreach ( $panel['connect'] as $index => $link ) : ?>
								<?php if ( ! $is_grid && $index > 0 ) : ?>
									<span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<?php endif; ?>
								<span
									class="core-ai-map__chain-step
									<?php
									echo ! empty( $link['accent'] ) ? ' is-accent' : '';
									echo 'warning' === ( $link['tone'] ?? '' ) ? ' is-warning' : '';
									?>
									"
								><?php echo esc_html( $link['label'] ?? '' ); ?></span>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>

					<?php foreach ( $panel['notes'] ?? array() as $note ) : ?>
						<p class="core-ai-map__details-heading"><?php echo esc_html( $note['heading'] ?? '' ); ?></p>
						<p class="core-ai-map__details-note"><?php echo esc_html( $note['text'] ?? '' ); ?></p>
					<?php endforeach; ?>

					<?php if ( ! empty( $panel['href'] ) ) : ?>
						<div class="core-ai-map__qr">
							<?php if ( ! empty( $panel['qr'] ) ) : ?>
								<img
									class="core-ai-map__qr-image"
									src="<?php echo esc_url( $panel['qr'] ); ?>"
									alt=""
									width="84"
									height="84"
								>
							<?php else : ?>
								<svg class="core-ai-map__qr-image" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
									<rect width="40" height="40" fill="url(#<?php echo esc_attr( $instance_id ); ?>-hatch)"></rect>
								</svg>
							<?php endif; ?>
							<span>
								<?php if ( empty( $panel['qr'] ) ) : ?>
									<small><?php esc_html_e( 'QR code goes here', 'core-ai-map' ); ?></small>
								<?php else : ?>
									<small><?php esc_html_e( 'Scan to keep exploring', 'core-ai-map' ); ?></small>
								<?php endif; ?>
								<strong><?php echo esc_html( $panel['linkLabel'] ?? $panel['href'] ); ?></strong>
								<em><?php esc_html_e( 'Keep exploring on your own device.', 'core-ai-map' ); ?></em>
							</span>
						</div>
					<?php endif; ?>
				</article>
			<?php endforeach; ?>
		</aside>

		<div class="core-ai-map__home-indicator" aria-hidden="true"></div>
	</div>

	<p class="core-ai-map__sr-only" aria-live="polite" data-wp-text="state.announcement"></p>
</section>
