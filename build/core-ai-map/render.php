<?php
/**
 * Server-rendered markup for the Core AI Living Map block.
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

$projects           = isset( $attributes['projects'] ) && is_array( $attributes['projects'] ) ? $attributes['projects'] : array();
$scenarios          = isset( $attributes['scenarios'] ) && is_array( $attributes['scenarios'] ) ? $attributes['scenarios'] : array();
$inactivity_timeout = isset( $attributes['inactivityTimeout'] ) ? absint( $attributes['inactivityTimeout'] ) : 60;
$inactivity_timeout = max( 20, min( 180, $inactivity_timeout ) );
$offline_enabled    = ! empty( $attributes['offlineEnabled'] );
$instance_id        = wp_unique_id( 'core-ai-map-' );
$allowed_ids        = array( 'abilities', 'skills', 'client', 'plugin', 'mcp', 'bench' );
$project_ids        = array();

$projects = array_values(
	array_filter(
		$projects,
		static function ( $project ) use ( $allowed_ids, &$project_ids ) {
			if ( ! is_array( $project ) || empty( $project['id'] ) ) {
				return false;
			}

			$project_id = sanitize_key( $project['id'] );

			if ( ! in_array( $project_id, $allowed_ids, true ) || in_array( $project_id, $project_ids, true ) ) {
				return false;
			}

			$project_ids[] = $project_id;
			return true;
		}
	)
);

$scenario_paths = array();
$scenarios      = array_values(
	array_filter(
		$scenarios,
		static function ( &$scenario ) use ( $project_ids, &$scenario_paths ) {
			if ( ! is_array( $scenario ) || empty( $scenario['id'] ) || empty( $scenario['projects'] ) || ! is_array( $scenario['projects'] ) ) {
				return false;
			}

			$scenario_id          = sanitize_key( $scenario['id'] );
			$scenario['id']       = $scenario_id;
			$scenario['projects'] = array_values(
				array_filter(
					array_map( 'sanitize_key', $scenario['projects'] ),
					static function ( $project_id ) use ( $project_ids ) {
						return in_array( $project_id, $project_ids, true );
					}
				)
			);

			if ( empty( $scenario['projects'] ) ) {
				return false;
			}

			$scenario_paths[ $scenario_id ] = $scenario['projects'];
			return true;
		}
	)
);

$initial_scenario = ! empty( $scenarios ) ? $scenarios[0]['id'] : '';
$context          = array(
	'screen'             => 'attract',
	'selectedProject'    => '',
	'activeScenario'     => $initial_scenario,
	'scenarioPaths'      => $scenario_paths,
	'announcement'       => __( 'Core AI Living Map ready. Tap to begin exploring.', 'core-ai-map' ),
	'toast'              => '',
	'isOffline'          => false,
	'idleScenarioIndex'  => 0,
);

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
	$seen_modules  = array();
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

$icon = static function ( $project_id ) {
	?>
	<svg class="core-ai-map__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
		<?php if ( 'abilities' === $project_id ) : ?>
			<rect x="4" y="5" width="10" height="9" rx="1.5"></rect>
			<rect x="18" y="18" width="10" height="9" rx="1.5"></rect>
			<path d="M14 9.5h5a4 4 0 0 1 4 4V18M18 22.5h-5a4 4 0 0 1-4-4V14"></path>
		<?php elseif ( 'skills' === $project_id ) : ?>
			<path d="m16 3 2.2 6.1L24 12l-5.8 2.9L16 21l-2.2-6.1L8 12l5.8-2.9L16 3Z"></path>
			<path d="m7 20 1.1 3.1L11 24.5l-2.9 1.4L7 29l-1.1-3.1L3 24.5l2.9-1.4L7 20Zm18-2 1.1 3.1 2.9 1.4-2.9 1.4L25 27l-1.1-3.1-2.9-1.4 2.9-1.4L25 18Z"></path>
		<?php elseif ( 'client' === $project_id ) : ?>
			<path d="M5 6h22v15H15l-6 5v-5H5V6Z"></path>
			<path d="M10 12h12m-12 4h8"></path>
		<?php elseif ( 'plugin' === $project_id ) : ?>
			<path d="M13 4h6v7h5v6h-5v4a7 7 0 0 1-14 0v-4h8V4Z"></path>
			<path d="M8 17v-5m10-1V6"></path>
		<?php elseif ( 'mcp' === $project_id ) : ?>
			<path d="M11 5v7m10-7v7M8 12h16v3a8 8 0 0 1-8 8v4"></path>
			<path d="M12 17h8"></path>
		<?php else : ?>
			<path d="M5 27V14m7 13V8m7 19V17m7 10V4"></path>
			<path d="M3 27h26"></path>
		<?php endif; ?>
	</svg>
	<?php
};

$edges = array(
	array( 'skills', 'abilities', 'M180 145 C285 80 380 78 500 98' ),
	array( 'abilities', 'client', 'M500 98 C620 78 715 80 820 145' ),
	array( 'client', 'plugin', 'M820 145 C900 220 910 315 842 400' ),
	array( 'plugin', 'mcp', 'M842 400 C735 480 625 492 500 458' ),
	array( 'mcp', 'bench', 'M500 458 C365 492 250 480 150 400' ),
	array( 'bench', 'skills', 'M150 400 C78 315 88 220 180 145' ),
	array( 'skills', 'client', 'M180 145 C350 190 650 190 820 145' ),
	array( 'skills', 'mcp', 'M180 145 C290 270 350 380 500 458' ),
	array( 'mcp', 'abilities', 'M500 458 C470 350 470 205 500 98' ),
);

$spokes = array(
	'M180 145 L500 280',
	'M500 98 L500 280',
	'M820 145 L500 280',
	'M842 400 L500 280',
	'M500 458 L500 280',
	'M150 400 L500 280',
);

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                   => 'core-ai-map',
		'aria-label'              => __( 'WordPress Core AI project map', 'core-ai-map' ),
		'data-wp-interactive'     => 'core-ai/map',
		'data-wp-run'             => 'callbacks.mount',
		'data-wp-class--is-attract' => 'state.isAttract',
		'data-wp-class--is-map'   => 'state.isMap',
		'data-wp-class--is-detail' => 'state.isDetail',
		'data-inactivity-timeout' => (string) ( $inactivity_timeout * 1000 ),
		'data-offline-enabled'    => $offline_enabled ? 'true' : 'false',
		'data-service-worker-url' => $service_worker_url,
		'data-service-worker-scope' => $service_scope ? $service_scope : '/',
		'data-asset-urls'         => wp_json_encode( $asset_urls ),
	)
);
?>

<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo wp_interactivity_data_wp_context( $context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="core-ai-map__grid" aria-hidden="true"></div>
	<div class="core-ai-map__wash core-ai-map__wash--one" aria-hidden="true"></div>
	<div class="core-ai-map__wash core-ai-map__wash--two" aria-hidden="true"></div>

	<header class="core-ai-map__topbar">
		<div class="core-ai-map__brand">
			<span class="core-ai-map__wp-mark" aria-hidden="true">W</span>
			<span><?php echo esc_html( $attributes['eyebrow'] ?? __( 'WordPress Core AI', 'core-ai-map' ) ); ?></span>
		</div>
		<div class="core-ai-map__connection" data-wp-class--is-offline="state.isOffline">
			<span aria-hidden="true"></span>
			<strong data-wp-bind--hidden="state.isOffline"><?php esc_html_e( 'Ready', 'core-ai-map' ); ?></strong>
			<strong data-wp-bind--hidden="state.isOnline"><?php esc_html_e( 'Offline-ready', 'core-ai-map' ); ?></strong>
		</div>
		<button class="core-ai-map__reset" type="button" data-wp-on--click="actions.reset">
			<?php esc_html_e( 'Start over', 'core-ai-map' ); ?>
		</button>
	</header>

	<div class="core-ai-map__attract">
		<p class="core-ai-map__eyebrow"><?php echo esc_html( $attributes['eyebrow'] ?? __( 'WordPress Core AI', 'core-ai-map' ) ); ?></p>
		<h1><?php echo esc_html( $attributes['title'] ?? __( 'How does WordPress become AI-ready?', 'core-ai-map' ) ); ?></h1>
		<p class="core-ai-map__intro"><?php echo esc_html( $attributes['intro'] ?? '' ); ?></p>
		<button class="core-ai-map__prompt" type="button" data-wp-on--click="actions.start">
			<span class="core-ai-map__prompt-icon" aria-hidden="true">⌘</span>
			<span><?php echo esc_html( $attributes['prompt'] ?? __( 'Tap to explore the living block map', 'core-ai-map' ) ); ?></span>
			<span class="core-ai-map__prompt-arrow" aria-hidden="true">→</span>
		</button>
		<div class="core-ai-map__attract-story" aria-live="polite">
			<?php foreach ( $scenarios as $scenario ) : ?>
				<p
					<?php echo wp_interactivity_data_wp_context( array( 'scenarioId' => $scenario['id'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isScenarioNotSelected"
				>
					<span><?php echo esc_html( $scenario['label'] ?? '' ); ?></span>
					<?php echo esc_html( $scenario['description'] ?? '' ); ?>
				</p>
			<?php endforeach; ?>
		</div>
	</div>

	<div
		class="core-ai-map__experience"
		data-wp-bind--inert="state.isAttract"
		data-wp-bind--aria-hidden="state.isAttract"
	>
		<div class="core-ai-map__map-heading">
			<p><?php esc_html_e( 'The Core AI ecosystem', 'core-ai-map' ); ?></p>
			<h2><?php esc_html_e( 'Choose a block or follow a story.', 'core-ai-map' ); ?></h2>
		</div>

		<div class="core-ai-map__canvas">
			<svg class="core-ai-map__connections" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" focusable="false">
				<defs>
					<marker id="<?php echo esc_attr( $instance_id ); ?>-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z"></path>
					</marker>
				</defs>
				<g class="core-ai-map__spokes">
					<?php foreach ( $spokes as $path ) : ?>
						<path d="<?php echo esc_attr( $path ); ?>"></path>
					<?php endforeach; ?>
				</g>
				<g class="core-ai-map__paths">
					<?php foreach ( $edges as $edge ) : ?>
						<path
							d="<?php echo esc_attr( $edge[2] ); ?>"
							pathLength="1"
							marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-arrow)"
							<?php echo wp_interactivity_data_wp_context( array( 'fromProject' => $edge[0], 'toProject' => $edge[1] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							data-wp-class--is-active="state.isPathActive"
						></path>
					<?php endforeach; ?>
				</g>
			</svg>

			<div class="core-ai-map__hub" aria-hidden="true">
				<span class="core-ai-map__hub-mark">W</span>
				<strong>WordPress</strong>
				<small><?php esc_html_e( 'Open foundation', 'core-ai-map' ); ?></small>
			</div>

			<?php foreach ( $projects as $index => $project ) : ?>
				<?php
				$project_id = sanitize_key( $project['id'] );
				$detail_id  = $instance_id . '-detail-' . $project_id;
				?>
				<div
					class="core-ai-map__node core-ai-map__node--<?php echo esc_attr( $project_id ); ?>"
					data-project-id="<?php echo esc_attr( $project_id ); ?>"
					<?php echo wp_interactivity_data_wp_context( array( 'projectId' => $project_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-class--is-active="state.isProjectActive"
					data-wp-class--is-dimmed="state.isProjectDimmed"
				>
					<button
						type="button"
						aria-controls="<?php echo esc_attr( $detail_id ); ?>"
						data-wp-bind--aria-expanded="state.isProjectSelected"
						data-wp-on--click="actions.selectProject"
					>
						<span class="core-ai-map__node-number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
						<?php $icon( $project_id ); ?>
						<strong><?php echo esc_html( $project['name'] ?? '' ); ?></strong>
						<small><?php echo esc_html( $project['kicker'] ?? '' ); ?></small>
					</button>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="core-ai-map__scenario-copy">
			<p data-wp-bind--hidden="state.hasScenario">
				<?php esc_html_e( 'Pick a story to see how the projects connect.', 'core-ai-map' ); ?>
			</p>
			<?php foreach ( $scenarios as $scenario ) : ?>
				<p
					<?php echo wp_interactivity_data_wp_context( array( 'scenarioId' => $scenario['id'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isScenarioNotSelected"
				>
					<strong><?php echo esc_html( $scenario['label'] ?? '' ); ?>:</strong>
					<?php echo esc_html( $scenario['description'] ?? '' ); ?>
				</p>
			<?php endforeach; ?>
		</div>

		<nav class="core-ai-map__scenarios" aria-label="<?php esc_attr_e( 'Explore a scenario', 'core-ai-map' ); ?>">
			<?php foreach ( $scenarios as $index => $scenario ) : ?>
				<button
					type="button"
					<?php echo wp_interactivity_data_wp_context( array( 'scenarioId' => $scenario['id'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--aria-pressed="state.isScenarioSelected"
					data-wp-class--is-active="state.isScenarioSelected"
					data-wp-on--click="actions.selectScenario"
				>
					<span aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
					<?php echo esc_html( $scenario['label'] ?? '' ); ?>
				</button>
			<?php endforeach; ?>
		</nav>
	</div>

	<aside
		class="core-ai-map__details"
		role="region"
		aria-label="<?php esc_attr_e( 'Project details', 'core-ai-map' ); ?>"
		data-wp-bind--hidden="state.isNotDetail"
	>
		<button class="core-ai-map__details-close" type="button" data-wp-on--click="actions.closeDetails">
			<span aria-hidden="true">←</span>
			<?php esc_html_e( 'Back to the map', 'core-ai-map' ); ?>
		</button>
		<?php foreach ( $projects as $index => $project ) : ?>
			<?php
			$project_id = sanitize_key( $project['id'] );
			$detail_id  = $instance_id . '-detail-' . $project_id;
			$link_text  = preg_replace( '#^https?://#', '', untrailingslashit( $project['href'] ?? '' ) );
			?>
			<article
				id="<?php echo esc_attr( $detail_id ); ?>"
				<?php echo wp_interactivity_data_wp_context( array( 'projectId' => $project_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				data-wp-bind--hidden="state.isProjectNotSelected"
			>
				<div class="core-ai-map__details-icon">
					<?php $icon( $project_id ); ?>
					<span><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
				</div>
				<p class="core-ai-map__details-status"><?php echo esc_html( $project['status'] ?? '' ); ?></p>
				<h2><?php echo esc_html( $project['name'] ?? '' ); ?></h2>
				<p class="core-ai-map__details-kicker"><?php echo esc_html( $project['kicker'] ?? '' ); ?></p>
				<p class="core-ai-map__details-description"><?php echo esc_html( $project['description'] ?? '' ); ?></p>
				<details>
					<summary><?php esc_html_e( 'Under the hood', 'core-ai-map' ); ?></summary>
					<p><?php echo esc_html( $project['technical'] ?? '' ); ?></p>
				</details>
				<?php if ( ! empty( $project['href'] ) ) : ?>
					<a href="<?php echo esc_url( $project['href'] ); ?>" data-wp-on--click="actions.keepInKiosk">
						<span>
							<small><?php esc_html_e( 'Official project link', 'core-ai-map' ); ?></small>
							<strong><?php echo esc_html( $link_text ); ?></strong>
						</span>
						<span aria-hidden="true">↗</span>
					</a>
				<?php endif; ?>
			</article>
		<?php endforeach; ?>
	</aside>

	<div class="core-ai-map__toast" role="status" data-wp-bind--hidden="state.hasNoToast">
		<span data-wp-text="state.toast"></span>
	</div>
	<p class="core-ai-map__sr-only" aria-live="polite" data-wp-text="state.announcement"></p>
	<div class="core-ai-map__home-indicator" aria-hidden="true"></div>
</section>
