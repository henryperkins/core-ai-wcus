<?php
/**
 * Server-rendered markup for the Core AI Living Block Map.
 *
 * The kiosk is drawn inside a fixed 1366x1024 stage. Every coordinate below is
 * in that space; `style.scss` scales the whole stage to fit the viewport, so
 * the geometry stays exact on the target iPad Pro 13" and is uniformly
 * three-quarter size at the 1024x768 compatibility view.
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
	'mcp'        => array( 268, 400 ),
	'abilities'  => array( 556, 400 ),
	'bench'      => array( 556, 672 ),
	'assistant'  => array( 24, 112 ),
	'skills'     => array( 24, 244 ),
	'agent'      => array( 24, 376 ),
	'provider'   => array( 1150, 330 ),
	'task'       => array( 24, 508 ),
	'provider-plugin' => array( 912, 400 ),
);

/**
 * Horizontal slots on the "Also part of the ecosystem" shelf, in park order.
 */
$shelf_x = array( 250, 436, 622, 808, 994, 1170 );

/**
 * Per-story composition.
 *
 * members  Block/actor id => step number in the workflow.
 * sidecars Blocks shown beside, but not inside, the numbered runtime path.
 * providerPlugin Transient provider-specific WordPress plugin layer.
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
			'plugin'   => 1,
			'client'   => 2,
			'provider' => 0,
		),
		'sidecars' => array( 'connectors' ),
		'providerPlugin' => array(
			'step'         => 3,
			'position'     => array( 824, 214 ),
			'restPosition' => array( 824, 332 ),
		),
		'place'   => array(
			'plugin'     => array( 268, 192 ),
			'client'     => array( 556, 192 ),
			'connectors' => array( 836, 360 ),
			'provider'   => array( 1180, 206 ),
		),
		'park'    => array( 'mcp', 'abilities', 'bench' ),
		'shelfY'  => 512,
		'shelfStart' => 3,
		'edges'   => array( 'M504 266 L556 266', 'M792 266 L824 266', 'M1024 266 L1180 266' ),
		'rest'    => array( 'M504 234 L556 234', 'M792 234 C810 234 806 384 824 384', 'M1024 384 C1080 384 1094 390 1150 390' ),
		'sidecarEdges' => array( 'M924 360 L924 318' ),
		'sidecarRest' => array( 'M924 332 C954 318 1012 320 1030 308' ),
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
			'skills'    => array( 1150, 112 ),
			'agent'     => array( 1150, 462 ),
			'provider'  => array( 1150, 330 ),
			'task'      => array( 1150, 594 ),
		),
		'park'    => array( 'plugin', 'client', 'connectors', 'bench' ),
		'shelfY'  => 512,
		'strips'  => array(
			'mcp'       => array( 0, -57 ),
			'abilities' => array( 0, -82 ),
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
			'task'   => 3,
		),
		'place'   => array(
			'skills' => array( 24, 150 ),
			'agent'  => array( 24, 320 ),
			'task'   => array( 24, 490 ),
			'assistant' => array( 1150, 112 ),
			'provider'  => array( 1150, 330 ),
		),
		'park'    => array( 'plugin', 'client', 'connectors', 'mcp', 'abilities', 'bench' ),
		'shelfY'  => 512,
		// Actor cards are 120px tall in v3.1.1, leaving a 50px breathing gap
		// between each step of this outside-WordPress workflow.
		'edges'   => array( 'M114 276 L114 314', 'M114 446 L114 484' ),
		'rest'    => array( 'M114 278 L114 312', 'M114 448 L114 482' ),
		'dur'     => array( '1.4s', '1.4s' ),
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
			'bench' => array( 556, 678 ),
			'assistant' => array( 1150, 252 ),
			'skills'    => array( 1150, 384 ),
			'provider'  => array( 1150, 516 ),
			'task'      => array( 1150, 648 ),
		),
		'park'    => array( 'plugin', 'client', 'connectors', 'mcp', 'abilities' ),
		'noStrip' => array( 'bench' ),
		'shelfY'  => 140,
		'edges'   => array( 'M114 422 L114 450 Q114 470 134 470 L440 470 Q460 470 460 490 L460 732 Q460 752 480 752 L546 752' ),
		'rest'    => array( 'M114 402 C114 630 176 748 336 748 L546 748' ),
		'dur'     => array( '2.8s' ),
		'crosses' => array( 'left', 'bottom' ),
	),
);

$block_ids = array( 'plugin', 'client', 'connectors', 'mcp', 'abilities', 'bench' );
$actor_ids = array( 'assistant', 'skills', 'agent', 'task', 'provider' );
$card_dom_order = array( 'assistant', 'skills', 'agent', 'task', 'plugin', 'client', 'provider-plugin', 'provider', 'connectors', 'mcp', 'abilities', 'bench' );
/*
 * Every card a visitor can reach has a panel. The five ids after `skills` are
 * the actors and the transient provider layer: they carry a badge, a lede and
 * their per-story roles, but none of the reference apparatus (chain, notes, QR)
 * that the WordPress projects carry.
 */
$panel_ids = array(
	'abilities',
	'client',
	'connectors',
	'plugin',
	'mcp',
	'bench',
	'skills',
	'assistant',
	'agent',
	'provider',
	'task',
	'provider-plugin',
);

/**
 * Panels that describe an actor or the transient provider layer rather than a
 * WordPress project. They render the contextual sections and stop there.
 */
$context_only_panels = array( 'assistant', 'agent', 'provider', 'task', 'provider-plugin' );

/*
 * The unattended screen assembles one compact workflow at a time. These paths
 * stay literal in the SVG below; this data only supplies card geometry to the
 * client store and the server-rendered first frame.
 */
$attract_previews = array(
	array(
		'storyId' => 'uses-ai',
		'scale'   => 0.8,
		'ids'     => array( 'plugin', 'client', 'provider' ),
		'steps'   => array(
			'plugin'   => 1,
			'client'   => 2,
			'provider' => 0,
		),
		'sidecars' => array( 'connectors' ),
		'providerPlugin' => array(
			'step'     => 3,
			'position' => array( 716, 200 ),
			'scale'    => 0.8,
		),
		'at'      => array(
			'plugin'     => array( 260, 200 ),
			'client'     => array( 488, 200 ),
			'connectors' => array( 728, 340 ),
			'provider'   => array( 1060, 211 ),
		),
		'paths'   => array( 'M449 259 L488 259', 'M677 259 L716 259', 'M876 259 L1060 259' ),
		'sidecarPaths' => array( 'M798 340 L798 284' ),
	),
	array(
		'storyId' => 'uses-wp',
		'scale'   => 0.8,
		'ids'     => array( 'assistant', 'mcp', 'abilities' ),
		'at'      => array(
			'assistant' => array( 30, 214 ),
			'mcp'       => array( 222, 200 ),
			'abilities' => array( 520, 200 ),
		),
		'paths'   => array( 'M180 257 L216 257', 'M369 259 L514 259' ),
	),
	array(
		'storyId' => 'learns',
		'scale'   => 0.72,
		'ids'     => array( 'skills', 'agent', 'task' ),
		'at'      => array(
			'skills' => array( 36, 150 ),
			'agent'  => array( 36, 272 ),
			'task'   => array( 36, 394 ),
		),
		'paths'   => array( 'M108 242 L108 266', 'M108 364 L108 388' ),
	),
	array(
		'storyId' => 'tests',
		'scale'   => 0.8,
		'ids'     => array( 'agent', 'bench' ),
		'at'      => array(
			'agent' => array( 36, 196 ),
			'bench' => array( 430, 320 ),
		),
		'paths'   => array( 'M186 240 C280 244 300 320 424 372' ),
	),
);

$loose = array(
	'plugin'     => array( -38, 26, -1.4 ),
	'client'     => array( 20, -18, 1.1 ),
	'connectors' => array( 28, 34, -0.9 ),
	'mcp'        => array( 120, -36, 1.6 ),
	'abilities'  => array( -26, 28, -1.2 ),
	'bench'      => array( 32, -44, 0.9 ),
	'assistant'  => array( -6, -30, -1.3 ),
	'skills'     => array( 12, 96, 1.4 ),
	'agent'      => array( 16, 92, -1 ),
	'provider'   => array( -18, 90, 1.2 ),
	'task'       => array( 6, 54, -1.1 ),
);

$bench_paths = array(
	'M204 200 C420 132 940 128 1148 194',
	'M1240 286 C1240 348 1088 322 986 300',
	'M654 266 L626 266',
	'M330 358 C296 418 254 438 208 462',
);

/**
 * Keeps only known ids, in the order the design defines them.
 *
 * Missing saved items are restored from the registered block defaults. This
 * keeps old serialized four-actor blocks compatible with the v3.1.1 task actor.
 *
 * @param mixed $items    Raw attribute value.
 * @param mixed $defaults Registered default value.
 * @param array $allowed  Allowed ids, in render order.
 * @return array Items keyed by id.
 */
$by_id = static function ( $items, $defaults, $allowed ) {
	$keyed = array();

	foreach ( is_array( $defaults ) ? $defaults : array() as $item ) {
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

	foreach ( is_array( $items ) ? $items : array() as $item ) {
		if ( ! is_array( $item ) || empty( $item['id'] ) ) {
			continue;
		}

		$id = sanitize_key( $item['id'] );

		if ( ! in_array( $id, $allowed, true ) ) {
			continue;
		}

		$item['id']   = $id;
		$keyed[ $id ] = isset( $keyed[ $id ] ) ? array_replace( $keyed[ $id ], $item ) : $item;
	}

	$ordered = array();

	foreach ( $allowed as $id ) {
		if ( isset( $keyed[ $id ] ) ) {
			$ordered[ $id ] = $keyed[ $id ];
		}
	}

	return $ordered;
};

$default_attributes = array();

if ( isset( $block ) && is_object( $block ) && isset( $block->block_type->attributes ) && is_array( $block->block_type->attributes ) ) {
	foreach ( $block->block_type->attributes as $attribute_name => $schema ) {
		if ( is_array( $schema ) && array_key_exists( 'default', $schema ) ) {
			$default_attributes[ $attribute_name ] = $schema['default'];
		}
	}
}

/*
 * Published dynamic blocks may carry exact former scalar defaults in their
 * comment delimiter. Upgrade those known defaults while preserving anything a
 * site author changed deliberately.
 */
$legacy_scalar_defaults = array(
	'title'        => array( 'How do WordPress and AI work together?' ),
	'intro'        => array(
		'Choose a flow, follow the numbered path, then tap a highlighted component to understand its role.',
		'See WordPress call AI, let authorized agents call WordPress, and test what they build.',
	),
	'reviewedDate' => array( 'Reviewed 12 Aug 2026' ),
);

foreach ( $legacy_scalar_defaults as $attribute_name => $legacy_values ) {
	if (
		array_key_exists( $attribute_name, $attributes ) &&
		in_array( $attributes[ $attribute_name ], $legacy_values, true ) &&
		array_key_exists( $attribute_name, $default_attributes )
	) {
		$attributes[ $attribute_name ] = $default_attributes[ $attribute_name ];
	}
}

$blocks  = $by_id( $attributes['blocks'] ?? array(), $default_attributes['blocks'] ?? array(), $block_ids );
$actors  = $by_id( $attributes['actors'] ?? array(), $default_attributes['actors'] ?? array(), $actor_ids );
$panels  = $by_id( $attributes['panels'] ?? array(), $default_attributes['panels'] ?? array(), $panel_ids );
$stories = $by_id( $attributes['stories'] ?? array(), $default_attributes['stories'] ?? array(), array_keys( $story_layout ) );

/**
 * Upgrades only fields that still exactly match the former registered default.
 * Genuine editor changes remain untouched while untouched v0.2 blocks receive
 * the approved v3.1 visitor copy on their next render.
 *
 * @param array $items            Render items keyed by id.
 * @param array $current_defaults Current defaults keyed by id.
 * @param array $legacy_defaults  Legacy field values keyed by id and field.
 * @return array Migrated render items.
 */
$migrate_legacy_defaults = static function ( $items, $current_defaults, $legacy_defaults ) {
	foreach ( $legacy_defaults as $id => $fields ) {
		if ( ! isset( $items[ $id ], $current_defaults[ $id ] ) ) {
			continue;
		}

		foreach ( $fields as $field => $legacy_value ) {
			if (
				array_key_exists( $field, $items[ $id ] ) &&
				$items[ $id ][ $field ] === $legacy_value &&
				array_key_exists( $field, $current_defaults[ $id ] )
			) {
				$items[ $id ][ $field ] = $current_defaults[ $id ][ $field ];
			}
		}
	}

	return $items;
};

$block_defaults = $by_id( array(), $default_attributes['blocks'] ?? array(), $block_ids );
$actor_defaults = $by_id( array(), $default_attributes['actors'] ?? array(), $actor_ids );
$story_defaults = $by_id( array(), $default_attributes['stories'] ?? array(), array_keys( $story_layout ) );
$panel_defaults = $by_id( array(), $default_attributes['panels'] ?? array(), $panel_ids );

$blocks = $migrate_legacy_defaults(
	$blocks,
	$block_defaults,
	array(
		'plugin' => array( 'badge' => 'Experimental plugin' ),
		'mcp'    => array( 'badge' => 'Open adapter' ),
		'bench'  => array(
			'name'    => 'WP Bench',
			'tagline' => 'Test how well agents perform WordPress work',
		),
	)
);

$stories = $migrate_legacy_defaults(
	$stories,
	$story_defaults,
	array(
		'uses-ai' => array(
			'copy' => 'A plugin asks for a capability. The AI Client routes the request, and Connectors decides which provider the site is allowed to reach.',
		),
		'learns'  => array(
			'copy' => 'Agent Skills attaches current WordPress guidance to a coding assistant before it starts work. This happens outside the site — nothing inside WordPress runs.',
		),
		'tests'   => array(
			'copy' => 'WP Bench runs what the agent produced inside a sandboxed WordPress and grades it. Evidence, not a leaderboard.',
		),
	)
);

$panels = $migrate_legacy_defaults(
	$panels,
	$panel_defaults,
	array(
		'abilities'  => array(
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion.',
				),
			),
		),
		'client'     => array(
			'lede'  => 'A plugin describes the capability and the kind of result it needs. WordPress routes the request to a suitable model from a provider the site owner has connected.',
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly.',
				),
			),
		),
		'connectors' => array(
			'lede'  => 'Where a site owner connects WordPress to outside services. Connectors handles discovery, credentials, connection status, and approvals — so the site decides what AI it can reach.',
			'notes' => array(
				array(
					'heading' => 'Providers',
					'text'    => 'Provider plugins register themselves with the AI Client and appear under Settings → Connectors. The map stays vendor-neutral: no provider owns a position on the canvas.',
				),
				array(
					'heading' => 'Under the hood',
					'text'    => 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.',
				),
			),
		),
		'plugin'     => array(
			'lede'  => 'Where the foundations become things people can use: alt text, summaries, titles, editorial notes, image generation. Every feature is opt-in and manually triggered.',
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'Also a reference implementation: it shows plugin authors how Abilities, the AI Client, and Connectors fit together, including connector approvals, request logging, and key encryption.',
				),
			),
		),
		'mcp'        => array(
			'badge' => 'Open adapter',
			'lede'  => 'Translation at the edge of the site. It exposes eligible abilities to authorized outside assistants as MCP tools, resources, and prompts — and translates their calls back into WordPress work.',
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'HTTP and STDIO transports, configurable servers, validation, permission checks, error handling, and observability. It does not create the underlying action, and it is not the model — WordPress still owns execution.',
				),
			),
		),
		'bench'      => array(
			'title' => 'WP Bench',
			'lede'  => 'A test bench, not part of any live request. It measures what an agent knows about WordPress and whether the code it writes actually runs.',
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'Two dimensions: knowledge of WordPress concepts, APIs, security practices and standards; and execution — generated code run in a real WordPress environment and graded by static analysis and runtime assertions. Dataset size and version coverage are still limited.',
				),
			),
		),
		'skills'     => array(
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'Covers blocks, themes, plugins, REST, the Interactivity API, Abilities, performance, and security. Installable for several coding assistants, or committed alongside an individual project.',
				),
			),
		),
	)
);

/*
 * The pre-booth architecture pass corrects the provider request path and the
 * still-scheduled 7.1 wording. Upgrade only values that exactly match the
 * previously registered v3.1.1 defaults so genuine editor changes survive.
 */
$blocks = $migrate_legacy_defaults(
	$blocks,
	$block_defaults,
	array(
		'connectors' => array(
			'tagline' => 'Connect WordPress to providers and services',
		),
	)
);

$actors = $migrate_legacy_defaults(
	$actors,
	$actor_defaults,
	array(
		'provider' => array(
			'name'    => 'AI provider',
			'tagline' => 'The site owner’s choice',
		),
	)
);

$stories = $migrate_legacy_defaults(
	$stories,
	$story_defaults,
	array(
		'uses-ai' => array(
			'copy' => 'A plugin asks the AI Client for a capability. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.',
		),
	)
);

$panels = $migrate_legacy_defaults(
	$panels,
	$panel_defaults,
	array(
		'abilities'  => array(
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. One public flag for client exposure, filtering in wp_get_abilities(), and filters around execution are landing in WordPress 7.1, which ships 19 August 2026 — read the Anatomy panel as forward-looking until then.',
				),
			),
		),
		'client'     => array(
			'lede' => 'A plugin asks for a capability and the kind of result it needs. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.',
		),
		'connectors' => array(
			'lede'  => 'Where a site owner connects WordPress to outside services. Connectors handles provider discovery, configuration, credentials, installation status, and connection status.',
			'notes' => array(
				array(
					'heading' => 'Providers',
					'text'    => 'Provider plugins register themselves with the AI Client and appear under Settings → Connectors. A plugin can ask what a site actually has before offering a feature. The map stays vendor-neutral: no provider owns a position on the canvas.',
				),
				array(
					'heading' => 'Under the hood',
					'text'    => 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.',
				),
			),
		),
	)
);

/*
 * The teaching-model pass adds premises, predictive outcomes, and more direct
 * contextual answers. Replace only the exact v3.2.0 values so authored copy is
 * still authoritative.
 */
$stories = $migrate_legacy_defaults(
	$stories,
	$story_defaults,
	array(
		'uses-ai' => array(
			'takeaway' => 'A WordPress feature uses one common client to request an AI result. Provider setup supports the path, while the external AI service remains outside WordPress.',
		),
		'uses-wp' => array(
			'takeaway' => 'An outside assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions.',
		),
		'learns'  => array(
			'takeaway' => 'Agent Skills changes the guidance available to a coding agent. It does not run anything on the WordPress site.',
		),
		'tests'   => array(
			'takeaway' => 'Generated code runs in a disposable WordPress environment and is judged by WordPress tests, not by another AI model.',
		),
	)
);

$panels = $migrate_legacy_defaults(
	$panels,
	$panel_defaults,
	array(
		'abilities'  => array(
			'roles' => array(
				'uses-wp' => array(
					'receives' => 'The translated call, naming the action the assistant wants WordPress to perform.',
					'does'     => 'Checks whether the current user is allowed to perform it, then runs the registered callback.',
					'returns'  => 'A typed result, or a refusal.',
					'lesson'   => 'Connecting an assistant does not give it unlimited access. WordPress still decides what may run.',
				),
			),
		),
		'client'     => array(
			'roles' => array(
				'uses-ai' => array(
					'receives' => 'A capability request from a WordPress feature.',
					'does'     => 'Finds a compatible configured provider plugin and routes the request to it.',
					'returns'  => 'The provider’s response in a consistent WordPress format.',
					'lesson'   => 'WordPress features can request AI capabilities without integrating every external provider separately.',
				),
			),
		),
		'connectors' => array(
			'roles' => array(
				'uses-ai' => array(
					'receives' => 'Nothing in the request path — it sits beside it.',
					'does'     => 'Discovers provider plugins and holds the site owner’s configuration, credentials, and connection status.',
					'returns'  => 'The configuration the AI Client reads when it chooses a route.',
					'lesson'   => 'Setup is a separate concern from the request. Connectors supports the path; it never executes it.',
				),
			),
		),
		'mcp'        => array(
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'An official WordPress package installed as a plugin, not part of Core: HTTP and STDIO transports against the MCP specification the adapter currently targets (2025-11-25), configurable servers, validation, permission checks, error handling, and observability. Today it answers calls; it does not make them. It does not create the underlying action, and it is not the model — WordPress still owns execution.',
				),
			),
		),
		'bench'      => array(
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'One suite, one dimension: 185 execution tests, each a PHP snippet, run inside a real WordPress 7.0 — and WordPress itself runs the assertions that grade it. Passing is all-or-nothing: two of three assertions is a fail. Static analysis only diagnoses, unless the code trips a forbidden pattern. A separate audit throws trivial cheats at each test — an empty function, a bare return — and flags any test a cheat can satisfy.',
				),
			),
		),
		'provider'   => array(
			'roles' => array(
				'uses-ai' => array(
					'receives' => 'The request, once it has crossed out of WordPress.',
					'does'     => 'Runs the model on infrastructure WordPress does not control.',
					'returns'  => 'A result the provider plugin hands back to the AI Client.',
					'lesson'   => 'The model is never inside WordPress. Everything WordPress guarantees stops at this boundary.',
				),
			),
		),
	)
);

/*
 * The connector-accuracy pass corrects three claims a visitor could check
 * against a real admin screen — that Core's client is PHP only, that the
 * AI Client's modalities are text/image/JSON, and that Connectors is where
 * credentials are stored — and adds the ability-calling edge that joins the
 * two halves of the map. It also retires the wording that called 7.1 unshipped
 * and the booth a 7.0 site, now that the kiosk boots a 7.1 release candidate.
 * Replace only the exact v3.2.1 values so authored copy is still authoritative.
 */
$panels = $migrate_legacy_defaults(
	$panels,
	$panel_defaults,
	array(
		'abilities'       => array(
			'notes' => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. A public default for client exposure, filtering in wp_get_abilities(), and filters around execution are scheduled for WordPress 7.1 on August 19, 2026; this exhibit runs WordPress 7.0, so read the Anatomy panel as forward-looking.',
				),
			),
		),
		'client'          => array(
			'connect' => array(
				array( 'label' => 'Text, image or JSON request' ),
				array(
					'label'  => 'AI Client',
					'accent' => true,
				),
				array( 'label' => 'Normalized result' ),
			),
			'notes'   => array(
				array(
					'heading' => 'Under the hood',
					'text'    => 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly. Core’s client is PHP only: for editor JavaScript, register a REST endpoint per feature. Check support before showing any AI interface — the checks are free, and a 7.0 site may have no provider configured at all.',
				),
			),
		),
		'connectors'      => array(
			'lede'  => 'Where a site owner discovers and configures provider plugins, stores credentials, and sees connection status. It supports the request path; it is not the request executor.',
			'notes' => array(
				array(
					'heading' => 'Providers',
					'text'    => 'Provider plugins register with the AI Client. Connectors auto-discovers them and gives site owners installation, configuration, credential, and status controls. The map stays vendor-neutral: no provider owns a position on the canvas.',
				),
				array(
					'heading' => 'Under the hood',
					'text'    => 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.',
				),
			),
		),
		'provider-plugin' => array(
			'lede'  => 'A provider-specific integration installed as a WordPress plugin. It speaks one external service’s protocol using the credentials the site owner stored through Connectors.',
			'roles' => array(
				'uses-ai' => array(
					'receives' => 'The routed request from the AI Client.',
					'does'     => 'Speaks one external service’s protocol, using the stored credentials.',
					'returns'  => 'That service’s reply, handed back to the AI Client.',
					'lesson'   => 'The provider-specific part is a plugin. Swapping providers does not change the feature that asked.',
				),
			),
		),
	)
);

/*
 * Destinations are product-owned visitor data rather than editable kiosk copy.
 * Overwrite serialized values so already-inserted blocks migrate away from the
 * old generic links and QR placeholders on their next render.
 */
$canonical_panel_destinations = array(
	'abilities'  => array( 'https://developer.wordpress.org/apis/abilities-api/', 'qr/abilities.svg' ),
	'client'     => array( 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/', 'qr/client.svg' ),
	'connectors' => array( 'https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/', 'qr/connectors.svg' ),
	'plugin'     => array( 'https://wordpress.org/plugins/ai/', 'qr/plugin.svg' ),
	'mcp'        => array( 'https://github.com/WordPress/mcp-adapter', 'qr/mcp.svg' ),
	'bench'      => array( 'https://github.com/WordPress/wp-bench', 'qr/bench.svg' ),
	'skills'     => array( 'https://github.com/WordPress/agent-skills', 'qr/skills.svg' ),
);

foreach ( $canonical_panel_destinations as $panel_id => $destination ) {
	if ( isset( $panels[ $panel_id ] ) ) {
		$panels[ $panel_id ]['href'] = $destination[0];
		$panels[ $panel_id ]['qr']   = $destination[1];
	}
}

$mcp_badge = __( 'WordPress plugin · not in Core', 'core-ai-map' );

if ( isset( $blocks['mcp'] ) ) {
	$blocks['mcp']['badge'] = $mcp_badge;
}

if ( isset( $panels['mcp'] ) ) {
	$panels['mcp']['badge'] = $mcp_badge;
}

// A story can only run if its layout is present and every member is rendered.
$rendered_ids = array_merge( array_keys( $blocks ), array_keys( $actors ) );

foreach ( array_keys( $stories ) as $story_id ) {
	$members = array_keys( $story_layout[ $story_id ]['members'] );

	if ( count( array_intersect( $members, $rendered_ids ) ) !== count( $members ) ) {
		unset( $stories[ $story_id ] );
	}
}

$story_layout = array_intersect_key( $story_layout, $stories );

/*
 * Who takes part in each flow, and the numbered run a visitor is asked to
 * follow. Members, sidecars and the transient provider layer are all
 * participants: each one is highlighted, tappable, and carries a role. Parked
 * cards are none of those things while a flow is selected.
 */
$story_participants = array();
$story_steps        = array();

foreach ( $story_layout as $story_id => $layout ) {
	$participants = array_keys( $layout['members'] ?? array() );
	$participants = array_merge( $participants, $layout['sidecars'] ?? array() );

	$steps = array_filter(
		$layout['members'] ?? array(),
		static function ( $step ) {
			return (int) $step > 0;
		}
	);

	if ( isset( $layout['providerPlugin'] ) ) {
		$participants[]                 = 'provider-plugin';
		$steps['provider-plugin'] = (int) ( $layout['providerPlugin']['step'] ?? 0 );
	}

	$story_participants[ $story_id ] = array_values( array_unique( $participants ) );

	$numbers = array_values( array_unique( array_filter( array_map( 'intval', $steps ) ) ) );
	sort( $numbers );

	$story_steps[ $story_id ] = implode( ' → ', array_map( 'strval', $numbers ) );
}

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
$reviewed_date      = $attributes['reviewedDate'] ?? __( 'Reviewed 14 Aug 2026', 'core-ai-map' );

$label_defaults = array(
	'railEmptyLabel'    => __( 'Choose a flow', 'core-ai-map' ),
	'railActiveLabel'   => __( 'Choose another flow', 'core-ai-map' ),
	'browseLabel'       => __( 'Browse all components', 'core-ai-map' ),
	'browseDescription' => __( 'Every component on one canvas, with no flow selected.', 'core-ai-map' ),
	'takeawayHeading'   => __( 'What this flow shows', 'core-ai-map' ),
	'roleHeading'       => __( 'Its role in this flow', 'core-ai-map' ),
	'lessonHeading'     => __( 'Why that matters', 'core-ai-map' ),
	'definitionHeading' => __( 'What it is', 'core-ai-map' ),
	'technicalHeading'  => __( 'Under the hood', 'core-ai-map' ),
	'exploreHeading'    => __( 'Keep exploring', 'core-ai-map' ),
	'tapCue'            => __( 'Tap for its role', 'core-ai-map' ),
	'receivesLabel'     => __( 'Receives', 'core-ai-map' ),
	'doesLabel'         => __( 'Does', 'core-ai-map' ),
	'returnsLabel'      => __( 'Passes on', 'core-ai-map' ),
);

$guidance_defaults = array(
	'attract' => __( 'Choose a flow to begin.', 'core-ai-map' ),
	/* translators: %1$s: the numbered run of steps in the selected flow, such as "1 → 2 → 3". */
	'flow'    => __( 'Follow %1$s. Highlighted components take part in this flow. Tap one to learn what it contributes.', 'core-ai-map' ),
	/* translators: %1$s: the title of the selected flow. */
	'inspect' => __( 'You are viewing this component’s role in “%1$s.”', 'core-ai-map' ),
	'browse'  => __( 'Tap any component to learn what it is and where it belongs.', 'core-ai-map' ),
	/* translators: 1: component name. 2: the title of the selected flow. */
	'cardAction'       => __( '%1$s — view its role in “%2$s.”', 'core-ai-map' ),
	/* translators: 1: step number. 2: component name. 3: the title of the selected flow. */
	'cardActionStep'   => __( 'Step %1$s: %2$s — view its role in “%3$s.”', 'core-ai-map' ),
	/* translators: %1$s: component name. */
	'cardInactive'     => __( '%1$s — not part of this flow.', 'core-ai-map' ),
	/* translators: %1$s: component name. */
	'cardActionBrowse' => __( '%1$s — open its details.', 'core-ai-map' ),
);

$announcement_defaults = array(
	/* translators: %1$s: flow title. */
	'flowSelected'  => __( '%1$s.', 'core-ai-map' ),
	/* translators: %1$s: flow title. */
	'flowReplayed'  => __( '%1$s replayed.', 'core-ai-map' ),
	/* translators: 1: takeaway heading. 2: takeaway text. */
	'takeaway'      => __( '%1$s: %2$s', 'core-ai-map' ),
	'browse'        => __( 'Every component is on the canvas with no flow selected. Tap any component to learn what it is and where it belongs.', 'core-ai-map' ),
	'nextSuggestion' => __( 'The AI Plugin shows the next suggestion.', 'core-ai-map' ),
	/* translators: 1: component name. 2: flow title. */
	'detailsInFlow' => __( '%1$s details open in %2$s.', 'core-ai-map' ),
	/* translators: %1$s: component name. */
	'detailsBrowse' => __( '%1$s details open.', 'core-ai-map' ),
);

$authored_labels = is_array( $attributes['labels'] ?? null ) ? array_filter( $attributes['labels'], 'is_string' ) : array();

if ( isset( $authored_labels['railLabel'] ) && ! isset( $authored_labels['railActiveLabel'] ) ) {
	$authored_labels['railActiveLabel'] = $authored_labels['railLabel'];
}

$legacy_label_defaults = array(
	'lessonHeading'     => 'What this tells you',
	'definitionHeading' => 'What this component is',
	'technicalHeading'  => 'Technical detail',
);

foreach ( $legacy_label_defaults as $label_name => $legacy_value ) {
	if ( ( $authored_labels[ $label_name ] ?? null ) === $legacy_value ) {
		$authored_labels[ $label_name ] = $label_defaults[ $label_name ];
	}
}

$authored_guidance = is_array( $attributes['guidance'] ?? null ) ? array_filter( $attributes['guidance'], 'is_string' ) : array();

if ( ( $authored_guidance['flow'] ?? null ) === 'Follow %1$s. Tap a highlighted component to see what it contributes to this flow.' ) {
	$authored_guidance['flow'] = $guidance_defaults['flow'];
}

$labels   = array_merge( $label_defaults, $authored_labels );
$guidance = array_merge( $guidance_defaults, $authored_guidance );
$inactivity_timeout = isset( $attributes['inactivityTimeout'] ) ? absint( $attributes['inactivityTimeout'] ) : 60;
$inactivity_timeout = max( 30, min( 180, $inactivity_timeout ) );
$offline_enabled    = ! empty( $attributes['offlineEnabled'] );
$cache_page         = function_exists( 'is_user_logged_in' ) && ! is_user_logged_in();
$cache_page_url     = $cache_page && function_exists( 'get_permalink' ) ? get_permalink() : '';
$recompose          = ! isset( $attributes['recompose'] ) || ! empty( $attributes['recompose'] );
$shapes             = ! isset( $attributes['shapes'] ) || ! empty( $attributes['shapes'] );
$instance_id        = wp_unique_id( 'core-ai-map-' );
$queried_object_id  = function_exists( 'get_queried_object_id' ) ? absint( get_queried_object_id() ) : 0;
$kiosk_key          = $queried_object_id ? 'post-' . $queried_object_id : '';
$initial_preview         = $attract_previews[0];
$initial_members         = $initial_preview['steps'] ?? array_combine( $initial_preview['ids'], range( 1, count( $initial_preview['ids'] ) ) );
$initial_preview_members = array_fill_keys( $initial_preview['ids'], true );
$initial_sidecars        = array_fill_keys( $initial_preview['sidecars'] ?? array(), true );

/**
 * Transform that assembles the first attract preview without selecting a story.
 *
 * Mirrors `blockTransform()` in `view.js` so the first paint matches hydration.
 *
 * @param string $id Card id.
 * @return string CSS transform value, or an empty string when it does not move.
 */
$initial_transform = static function ( $id ) use ( $neutral, $loose, $initial_preview ) {
	if ( ! isset( $neutral[ $id ] ) ) {
		return '';
	}

	list( $nx, $ny ) = $neutral[ $id ];

	if ( 'provider-plugin' === $id && isset( $initial_preview['providerPlugin']['position'] ) ) {
		list( $px, $py ) = $initial_preview['providerPlugin']['position'];
		$scale          = $initial_preview['providerPlugin']['scale'] ?? 1;

		return sprintf( 'translate(%dpx, %dpx) scale(%s)', $px - $nx, $py - $ny, (string) $scale );
	}

	if ( isset( $initial_preview['at'][ $id ] ) ) {
		list( $px, $py ) = $initial_preview['at'][ $id ];

		return sprintf( 'translate(%dpx, %dpx) scale(%s)', $px - $nx, $py - $ny, (string) $initial_preview['scale'] );
	}

	if ( ! isset( $loose[ $id ] ) ) {
		return '';
	}

	list( $x, $y, $rotation ) = $loose[ $id ];

	return sprintf( 'translate(%dpx, %dpx) rotate(%sdeg)', $x, $y, (string) $rotation );
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
$service_scope      = function_exists( 'core_ai_map_get_kiosk_scope' ) && function_exists( 'get_permalink' )
	? core_ai_map_get_kiosk_scope( get_permalink() )
	: '';

if ( $service_scope ) {
	$service_worker_url = add_query_arg( '_core_ai_map_scope', $service_scope, $service_worker_url );
	$service_worker_url = add_query_arg( '_core_ai_map_token', core_ai_map_sign_kiosk_scope( $service_scope ), $service_worker_url );
} else {
	$offline_enabled = false;
}

$asset_urls         = array(
	CORE_AI_MAP_URL . 'build/core-ai-map/view.js',
	CORE_AI_MAP_URL . 'build/core-ai-map/style-index.css',
	CORE_AI_MAP_URL . 'assets/icon.svg',
	CORE_AI_MAP_URL . 'assets/icon-192.png',
	CORE_AI_MAP_URL . 'assets/icon-512.png',
);

// Webpack fingerprints the locally bundled fonts. Include the emitted names
// in the page-scoped offline cache rather than guessing their build hashes.
if ( defined( 'CORE_AI_MAP_PATH' ) ) {
	$font_assets = glob( CORE_AI_MAP_PATH . 'build/fonts/*.woff2' );

	foreach ( is_array( $font_assets ) ? $font_assets : array() as $font_asset ) {
		$asset_urls[] = CORE_AI_MAP_URL . 'build/fonts/' . rawurlencode( basename( $font_asset ) );
	}
}

foreach ( $panels as $panel ) {
	$qr_path = ltrim( (string) ( $panel['qr'] ?? '' ), '/\\' );

	if ( preg_match( '#\Aqr/[a-z0-9-]+\.svg\z#', $qr_path ) ) {
		$asset_urls[] = CORE_AI_MAP_URL . 'assets/' . $qr_path;
	}
}

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

/*
 * Display names for every tappable card, including the transient provider
 * layer, so the accessible name can carry the action as well as the name.
 */
$card_titles = array();

foreach ( $blocks as $block_id => $card ) {
	$card_titles[ $block_id ] = (string) ( $card['name'] ?? '' );
}

foreach ( $actors as $actor_id => $actor ) {
	$card_titles[ $actor_id ] = (string) ( $actor['name'] ?? '' );
}

$card_titles['provider-plugin'] = (string) ( $panels['provider-plugin']['title'] ?? __( 'AI provider plugin', 'core-ai-map' ) );

/**
 * The flow the primary call to action opens. The exhibit is flow-first: a
 * visitor lands inside an assembled example rather than on a neutral canvas.
 */
$opening_story = (string) ( array_key_first( $stories ) ?? '' );
$intro_paragraphs = preg_split( '/\R{2,}/', trim( (string) ( $attributes['intro'] ?? '' ) ) );
$intro_paragraphs = array_values( array_filter( $intro_paragraphs, 'strlen' ) );

$context = array(
	'screen'         => 'attract',
	'story'          => '',
	'openingStory'   => $opening_story,
	'storyTitles'    => array_map(
		static function ( $story ) {
			return (string) ( $story['title'] ?? '' );
		},
		$stories
	),
	'storyTakeaways' => array_map(
		static function ( $story ) {
			return (string) ( $story['takeaway'] ?? '' );
		},
		$stories
	),
	'storySituations' => array_map(
		static function ( $story ) {
			return (string) ( $story['situation'] ?? '' );
		},
		$stories
	),
	'storyOutcomes'   => array_map(
		static function ( $story ) {
			return (string) ( $story['outcome'] ?? '' );
		},
		$stories
	),
	'storySteps'     => $story_steps,
	'participants'   => $story_participants,
	'cardTitles'     => $card_titles,
	'guidance'       => $guidance,
	'announcements'  => $announcement_defaults,
	'labels'         => $labels,
	'inspect'        => '',
	'previewIndex'   => 0,
	'previewPhase'   => 'assembling',
	'attractPhase'   => 'assembling',
	'flowPhase'      => 'settled',
	'storyMotionPhase' => 'settled',
	'pendingTakeawayStory' => '',
	'abilitiesTab'   => 'overview',
	'benchStage'     => 'sandbox',
	'benchPathsLive' => false,
	'aboutReturnScreen' => '',
	'applied'        => false,
	'idleStoryIndex' => 0,
	'isOffline'      => false,
	'suggestion'     => 0,
	'announcement'   => __( 'Core AI Living Block Map ready. Choose a flow to begin, or open the first flow.', 'core-ai-map' ),
	'suggestions'    => $suggestions,
	'phases'         => array(
		__( 'Needs review', 'core-ai-map' ),
		__( 'Applied', 'core-ai-map' ),
	),
	'storyCopy'      => array_map(
		static function ( $story ) {
			return (string) ( $story['copy'] ?? '' );
		},
		$stories
	),
	'benchTitles'    => array(
		'task'     => __( 'One task, one message', 'core-ai-map' ),
		'model'    => __( 'Whatever the model wrote', 'core-ai-map' ),
		'sandbox'  => __( 'A real WordPress, thrown away after', 'core-ai-map' ),
		'checks'   => __( 'WordPress is the grader', 'core-ai-map' ),
		'evidence' => __( 'Pass or fail. Never a percentage', 'core-ai-map' ),
	),
	'recompose'      => $recompose,
	'shapes'         => $shapes,
	'storyIds'       => array_keys( $stories ),
	'previews'       => $attract_previews,
	'neutral'        => $neutral,
	'loose'          => $loose,
	'shelfX'         => $shelf_x,
	'layout'         => $story_layout,
	'benchPaths'     => $bench_paths,
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
				data-wp-class--is-applied="state.isSuggestionApplied"
			>
				<div class="core-ai-map__workbench-head">
					<span data-wp-text="state.suggestionLabel"><?php echo esc_html( $suggestions[0]['label'] ?? '' ); ?></span>
					<em class="core-ai-map__workbench-phase" data-wp-text="state.suggestionPhase"><?php esc_html_e( 'Needs review', 'core-ai-map' ); ?></em>
				</div>
				<p class="core-ai-map__workbench-text" data-wp-text="state.suggestionText"><?php echo esc_html( $suggestions[0]['text'] ?? '' ); ?></p>
				<div class="core-ai-map__workbench-actions">
					<span class="core-ai-map__workbench-review"><?php esc_html_e( 'A person reviews', 'core-ai-map' ); ?></span>
					<button class="core-ai-map__workbench-apply" type="button" data-wp-on--click="actions.applySuggestion"><?php esc_html_e( 'Apply', 'core-ai-map' ); ?></button>
				</div>
				<p class="core-ai-map__workbench-note" data-wp-bind--hidden="state.isSuggestionNotApplied" hidden><?php esc_html_e( 'A person chose Apply. Nothing is applied without that tap.', 'core-ai-map' ); ?></p>
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
					<span class="core-ai-map__meter-label">suite</span>
					<span class="core-ai-map__meter-value">wp-core-v1</span>
				</div>
				<div class="core-ai-map__meter">
					<span class="core-ai-map__meter-label">tests</span>
					<span class="core-ai-map__meter-value">185</span>
				</div>
				<div class="core-ai-map__meter">
					<span class="core-ai-map__meter-label">pass</span>
					<span class="core-ai-map__meter-value">boolean</span>
				</div>
				<div class="core-ai-map__meter">
					<span class="core-ai-map__meter-label">grader</span>
					<span class="core-ai-map__meter-value">WordPress</span>
				</div>
			</div>
			<?php
	}
};

/**
 * Render the same visible interaction key on the welcome and map surfaces.
 * The samples are decorative; the adjacent text carries the meaning.
 *
 * @param string $variant Legend placement variant.
 */
$render_legend = static function ( $variant ) {
	?>
	<div class="core-ai-map__legend core-ai-map__legend--<?php echo esc_attr( $variant ); ?>" aria-label="<?php esc_attr_e( 'How to read the map', 'core-ai-map' ); ?>">
		<ul role="list">
			<li class="core-ai-map__legend-item">
				<span class="core-ai-map__legend-sample core-ai-map__legend-sample--solid" aria-hidden="true"></span>
				<span><strong><?php esc_html_e( 'Solid arrow:', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'active request or work', 'core-ai-map' ); ?></span>
			</li>
			<li class="core-ai-map__legend-item">
				<span class="core-ai-map__legend-sample core-ai-map__legend-sample--dashed" aria-hidden="true"></span>
				<span><strong><?php esc_html_e( 'Dashed line:', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'configuration or supporting information', 'core-ai-map' ); ?></span>
			</li>
			<li class="core-ai-map__legend-item">
				<span class="core-ai-map__legend-sample core-ai-map__legend-sample--dimmed" aria-hidden="true"></span>
				<span><strong><?php esc_html_e( 'Dimmed component:', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'not part of this flow', 'core-ai-map' ); ?></span>
			</li>
		</ul>
	</div>
	<?php
};

/**
 * Renders a locally hosted, labelled QR destination.
 *
 * @param string $panel_id Panel identifier.
 * @param array  $panel    Panel content.
 */
$render_qr = static function ( $panel_id, $panel ) use ( $labels ) {
	$href    = (string) ( $panel['href'] ?? '' );
	$qr_path = ltrim( (string) ( $panel['qr'] ?? '' ), '/\\' );

	if ( '' === $href || ! preg_match( '#\Aqr/[a-z0-9-]+\.svg\z#', $qr_path ) ) {
		return;
	}

	$title  = (string) ( $panel['title'] ?? $panel_id );
	$source = CORE_AI_MAP_URL . 'assets/' . $qr_path;
	/* translators: 1: panel title, 2: full destination URL. */
	$alt = sprintf( __( 'QR code for %1$s: %2$s', 'core-ai-map' ), $title, $href );
	?>
	<h3 class="core-ai-map__details-heading"><?php echo esc_html( $labels['exploreHeading'] ); ?></h3>
	<div
		class="core-ai-map__qr"
		data-core-ai-qr="<?php echo esc_attr( $panel_id ); ?>"
		data-core-ai-qr-id="<?php echo esc_attr( $panel_id ); ?>"
		data-qr-url="<?php echo esc_attr( $href ); ?>"
	>
		<img
			class="core-ai-map__qr-image"
			src="<?php echo esc_url( $source ); ?>"
			alt="<?php echo esc_attr( $alt ); ?>"
			width="112"
			height="112"
		>
		<span>
			<small><?php esc_html_e( 'Open the canonical project page', 'core-ai-map' ); ?></small>
			<strong class="core-ai-map__qr-url"><?php echo esc_html( $href ); ?></strong>
			<em><?php esc_html_e( 'Keep exploring on your own device.', 'core-ai-map' ); ?></em>
		</span>
	</div>
	<?php
};

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		// The kiosk always opens on the attract screen; naming that here keeps
		// the first paint right before the Interactivity API hydrates.
		'class'                     => 'core-ai-map is-attract',
		'aria-label'                => __( 'WordPress Core AI Living Block Map', 'core-ai-map' ),
		'data-wp-interactive'       => 'core-ai/map',
		'data-wp-run'               => 'callbacks.useKiosk',
		'data-wp-class--is-attract' => 'state.isAttract',
		'data-wp-class--is-map'     => 'state.isMap',
		'data-wp-class--is-inspect' => 'state.isInspect',
		'data-wp-class--is-bench'   => 'state.isBench',
		'data-wp-class--is-about'   => 'state.isAbout',
		'data-wp-class--has-story'  => 'state.hasStory',
		'data-screen-label'          => __( 'Core AI Living Block Map', 'core-ai-map' ),
		'data-inactivity-timeout'   => (string) ( $inactivity_timeout * 1000 ),
		'data-offline-enabled'      => $offline_enabled ? 'true' : 'false',
		'data-cache-page'           => $cache_page ? 'true' : 'false',
		'data-cache-page-url'       => $cache_page_url,
		'data-kiosk-key'            => $kiosk_key,
		'data-service-worker-url'   => $service_worker_url,
		'data-service-worker-scope' => $service_scope,
		'data-asset-urls'           => wp_json_encode( $asset_urls ),
	)
);
?>

<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> <?php echo wp_interactivity_data_wp_context( $context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php
	/*
	 * The visible h1 lives on the welcome card, which goes away the moment a
	 * visitor picks a flow — leaving the exhibit with no level-one heading for
	 * the rest of the session. This one carries the name in every other state.
	 * It is bound to the inverse of the welcome card's own binding, so exactly
	 * one h1 is exposed at a time rather than two competing ones.
	 */
	?>
	<h1
		class="core-ai-map__sr-only"
		data-wp-bind--hidden="state.isAttract"
		hidden
	><?php echo esc_html( $attributes['title'] ?? '' ); ?></h1>

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
				<span class="core-ai-map__brand-separator" aria-hidden="true"></span>
				<strong><?php esc_html_e( 'Living Block Map', 'core-ai-map' ); ?></strong>
			</div>

			<?php
			/*
			 * One instruction, and only ever one. It names what to do in the
			 * state the visitor is actually in, so the exhibit never describes
			 * every possible interaction at once. The panel carries its own
			 * guidance, so this line stands down while a panel is open.
			 */
			?>
			<p
				class="core-ai-map__guidance"
				data-wp-text="state.guidance"
				data-wp-bind--hidden="state.isGuidanceHidden"
				hidden
			><?php echo esc_html( $guidance['attract'] ); ?></p>

			<div class="core-ai-map__topbar-actions">
				<p class="core-ai-map__offline" data-wp-bind--hidden="state.isOnline" hidden>
					<span aria-hidden="true"></span><?php esc_html_e( 'Offline mode', 'core-ai-map' ); ?>
				</p>
				<button class="core-ai-map__browse" type="button" data-wp-bind--hidden="state.isBrowseControlHidden" data-wp-on--click="actions.browseAll" hidden>
					<?php echo esc_html( $labels['browseLabel'] ); ?>
				</button>
				<button class="core-ai-map__reset" type="button" data-wp-bind--hidden="state.isResetHidden" data-wp-on--click="actions.reset" hidden>
					<?php esc_html_e( 'Start over', 'core-ai-map' ); ?>
				</button>
			</div>
		</header>

		<div
			class="core-ai-map__canvas"
			data-core-ai-surface="canvas"
			data-screen-label="<?php esc_attr_e( 'Living Block Map canvas', 'core-ai-map' ); ?>"
			aria-hidden="true"
			inert
			data-wp-bind--aria-hidden="state.isCanvasHidden"
			data-wp-bind--inert="state.isCanvasInert"
		>
			<div class="core-ai-map__plate" aria-hidden="true"></div>

			<p class="core-ai-map__zone core-ai-map__zone--outside" data-wp-class--is-lit="state.isOutsideZoneLit">
				<?php esc_html_e( 'Outside · assistants', 'core-ai-map' ); ?>
			</p>
			<p class="core-ai-map__zone core-ai-map__zone--inside"><?php esc_html_e( 'Inside WordPress', 'core-ai-map' ); ?></p>
			<p class="core-ai-map__zone core-ai-map__zone--providers"><?php esc_html_e( 'Outside · AI providers', 'core-ai-map' ); ?></p>
			<?php $render_legend( 'map' ); ?>
			<p class="core-ai-map__zone core-ai-map__zone--runtime"><?php esc_html_e( 'Below the runtime · evaluation', 'core-ai-map' ); ?></p>

			<p
				class="core-ai-map__shelf-label"
				data-wp-bind--hidden="state.isShelfHidden"
				data-wp-style--left="state.shelfLeft"
				data-wp-style--top="state.shelfTop"
			>
				<?php esc_html_e( 'Also part of the ecosystem', 'core-ai-map' ); ?>
			</p>

			<svg class="core-ai-map__wires" viewBox="0 0 1366 1024" aria-hidden="true" focusable="false">
				<defs>
					<marker id="<?php echo esc_attr( $instance_id ); ?>-tip" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse">
						<path d="M0 0 L10 5 L0 10 z"></path>
					</marker>
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
							data-core-ai-rule="<?php echo esc_attr( $side ); ?>"
						></path>
					<?php endforeach; ?>
				</g>

				<g class="core-ai-map__hairlines is-hidden">
					<path d="M504 234 L556 234"></path>
					<path d="M792 234 L912 234"></path>
					<path d="M674 308 L674 400"></path>
					<path d="M358 474 L556 474"></path>
				</g>

				<!-- Attract previews keep literal paths so hydration never writes SVG d. -->
				<g
					class="core-ai-map__preview-flow"
					data-core-ai-preview="0"
				>
					<path d="M449 259 L488 259" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<path d="M677 259 L716 259" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<path d="M876 259 L1060 259" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<path class="core-ai-map__config-path core-ai-map__preview-config" d="M798 340 L798 284"></path>
					<circle class="core-ai-map__preview-signal" r="5.5" cx="0" cy="0"></circle>
				</g>
				<g
					class="core-ai-map__preview-flow"
					data-core-ai-preview="1"
					hidden
				>
					<path d="M180 257 L216 257" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<path d="M369 259 L514 259" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<circle class="core-ai-map__preview-signal" r="5.5" cx="0" cy="0"></circle>
				</g>
				<g
					class="core-ai-map__preview-flow"
					data-core-ai-preview="2"
					hidden
				>
					<path d="M108 242 L108 266" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<path d="M108 364 L108 388" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<circle class="core-ai-map__preview-signal" r="5.5" cx="0" cy="0"></circle>
				</g>
				<g
					class="core-ai-map__preview-flow"
					data-core-ai-preview="3"
					hidden
				>
					<path d="M186 240 C280 244 300 320 424 372" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"></path>
					<circle class="core-ai-map__preview-signal" r="5.5" cx="0" cy="0"></circle>
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
									data-core-ai-story="<?php echo esc_attr( $story_id ); ?>"
									data-core-ai-variant="<?php echo esc_attr( $variant ); ?>"
									marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-tip)"
								></path>
							<?php endforeach; ?>
						<?php endforeach; ?>
					<?php endforeach; ?>
				</g>

				<?php foreach ( $story_layout as $story_id => $story_paths ) : ?>
					<?php foreach ( array( 'edges' => 'sidecarEdges', 'rest' => 'sidecarRest' ) as $variant => $sidecar_key ) : ?>
						<?php foreach ( $story_paths[ $sidecar_key ] ?? array() as $path ) : ?>
							<path
								class="core-ai-map__config-path"
								d="<?php echo esc_attr( $path ); ?>"
								data-core-ai-story="<?php echo esc_attr( $story_id ); ?>"
								data-core-ai-variant="<?php echo esc_attr( $variant ); ?>"
								hidden
							></path>
						<?php endforeach; ?>
					<?php endforeach; ?>
				<?php endforeach; ?>
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

			<div class="core-ai-map__tokens" aria-hidden="true" data-wp-class--is-live="state.areTokensLive" data-wp-class--is-visible="state.areTokensVisible">
				<span class="core-ai-map__token core-ai-map__token--call">tools/call</span>
				<span class="core-ai-map__token core-ai-map__token--ability">ability</span>
			</div>

			<div
				class="core-ai-map__learns-explanation"
				<?php echo wp_interactivity_data_wp_context( array( 'storyId' => 'learns' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				data-wp-bind--hidden="state.isStoryNotSelected"
				hidden
			>
				<span class="core-ai-map__learns-label core-ai-map__learns-label--skills"><?php esc_html_e( 'attaches guidance', 'core-ai-map' ); ?></span>
				<span class="core-ai-map__learns-label core-ai-map__learns-label--task"><?php esc_html_e( 'starts the work', 'core-ai-map' ); ?></span>
				<div class="core-ai-map__learns-site">
					<small><?php esc_html_e( 'Inside WordPress', 'core-ai-map' ); ?></small>
					<strong><?php esc_html_e( 'Nothing here runs', 'core-ai-map' ); ?></strong>
					<p><?php esc_html_e( 'The guidance travels with the agent. The site is not involved until a person installs what the agent wrote.', 'core-ai-map' ); ?></p>
				</div>
			</div>

			<?php foreach ( $card_dom_order as $card_id ) : ?>
				<?php if ( isset( $actors[ $card_id ] ) ) : ?>
					<?php
					$actor               = $actors[ $card_id ];
					$is_skills           = 'skills' === $card_id;
					$is_preview_member   = isset( $initial_preview_members[ $card_id ] );
					$actor_initial_class = $is_preview_member ? ' is-preview-member' : '';
					?>
					<div
						class="core-ai-map__actor core-ai-map__actor--<?php echo esc_attr( $card_id ); ?><?php echo esc_attr( $actor_initial_class ); ?>"
						style="<?php echo esc_attr( $card_style( $card_id ) . ( $is_preview_member ? '' : ' opacity: 0.2;' ) ); ?>"
						<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $card_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-style--opacity="state.cardOpacity"
						data-wp-style--transform="state.cardTransform"
						data-wp-class--is-active="state.isCardActive"
						data-wp-class--is-dimmed="state.isCardDimmed"
						data-wp-class--is-preview-member="state.isPreviewMember"
					>
						<div class="core-ai-map__actor-float">
							<?php if ( $is_skills ) : ?>
								<span class="core-ai-map__actor-ghost core-ai-map__actor-ghost--far" aria-hidden="true"></span>
								<span class="core-ai-map__actor-ghost core-ai-map__actor-ghost--near" aria-hidden="true"></span>
							<?php endif; ?>
							<button
								class="core-ai-map__actor-body"
								type="button"
								aria-controls="<?php echo esc_attr( $instance_id . '-panel-' . $card_id ); ?>"
								aria-expanded="false"
								data-wp-bind--aria-expanded="state.isCardInspected"
								data-wp-bind--aria-label="state.cardActionLabel"
								data-wp-bind--disabled="state.isCardNotTappable"
								data-wp-on--click="actions.inspectCard"
							>
								<span class="core-ai-map__step" data-wp-text="state.cardStep" aria-hidden="true"><?php echo esc_html( (int) ( $initial_members[ $card_id ] ?? 0 ) > 0 ? (string) $initial_members[ $card_id ] : '' ); ?></span>
								<span class="core-ai-map__actor-badge"><?php echo esc_html( $actor['badge'] ?? '' ); ?></span>
								<strong><?php echo esc_html( $actor['name'] ?? '' ); ?></strong>
								<small><?php echo esc_html( $actor['tagline'] ?? '' ); ?></small>
								<span class="core-ai-map__tap-cue" data-wp-bind--hidden="state.isTapCueHidden" aria-hidden="true" hidden><?php echo esc_html( $labels['tapCue'] ); ?></span>
							</button>
						</div>
					</div>
				<?php elseif ( 'provider-plugin' === $card_id ) : ?>
					<div
						class="core-ai-map__provider-plugin is-active"
						style="<?php echo esc_attr( $card_style( $card_id ) ); ?>"
						<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $card_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-bind--hidden="state.isProviderPluginHidden"
						data-wp-style--opacity="state.cardOpacity"
						data-wp-style--transform="state.providerPluginTransform"
						data-wp-class--is-active="state.isCardActive"
						data-wp-class--is-dimmed="state.isCardDimmed"
					>
						<button
							class="core-ai-map__provider-plugin-body"
							type="button"
							aria-controls="<?php echo esc_attr( $instance_id . '-panel-provider-plugin' ); ?>"
							aria-expanded="false"
							data-wp-bind--aria-expanded="state.isCardInspected"
							data-wp-bind--aria-label="state.cardActionLabel"
							data-wp-bind--disabled="state.isCardNotTappable"
							data-wp-on--click="actions.inspectCard"
						>
							<span class="core-ai-map__step" data-wp-text="state.cardStep" aria-hidden="true"><?php echo esc_html( (string) ( $initial_preview['providerPlugin']['step'] ?? '' ) ); ?></span>
							<span class="core-ai-map__provider-plugin-badge"><?php esc_html_e( 'WordPress plugin', 'core-ai-map' ); ?></span>
							<strong><?php esc_html_e( 'AI provider plugin', 'core-ai-map' ); ?></strong>
							<small><?php esc_html_e( 'Provider-specific integration', 'core-ai-map' ); ?></small>
							<span class="core-ai-map__tap-cue" data-wp-bind--hidden="state.isTapCueHidden" aria-hidden="true" hidden><?php echo esc_html( $labels['tapCue'] ); ?></span>
						</button>
					</div>
				<?php elseif ( isset( $blocks[ $card_id ] ) ) : ?>
					<?php
					$card          = $blocks[ $card_id ];
					$detail_id     = $instance_id . '-panel-' . $card_id;
					$is_member     = isset( $initial_preview_members[ $card_id ] );
					$is_sidecar    = isset( $initial_sidecars[ $card_id ] );
					$initial_class = $is_member ? ' is-preview-member' : '';
					$initial_class .= $is_sidecar ? ' is-sidecar is-preview-sidecar' : '';
					?>
					<div
						class="core-ai-map__block core-ai-map__block--<?php echo esc_attr( $card_id ); ?><?php echo esc_attr( $initial_class ); ?>"
						style="<?php echo esc_attr( $card_style( $card_id ) ); ?>"
						<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $card_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-style--transform="state.cardTransform"
						data-wp-class--is-active="state.isCardActive"
						data-wp-class--is-parked="state.isCardParked"
						data-wp-class--is-sidecar="state.isCardSidecar"
						data-wp-class--is-preview-member="state.isPreviewMember"
						data-wp-class--is-preview-sidecar="state.isPreviewSidecar"
						data-wp-class--is-dimmed="state.isCardDimmed"
					>
						<div class="core-ai-map__block-float">
							<button
								class="core-ai-map__block-body"
								type="button"
								style="opacity: <?php echo $is_member ? '1' : ( $is_sidecar ? '0.86' : '0.2' ); ?>;"
								data-wp-style--opacity="state.cardOpacity"
								aria-controls="<?php echo esc_attr( $detail_id ); ?>"
								aria-expanded="false"
								data-wp-bind--aria-expanded="state.isCardInspected"
								data-wp-bind--aria-label="state.cardActionLabel"
								data-wp-bind--disabled="state.isCardNotTappable"
								data-wp-on--click="actions.inspectCard"
							>
								<span class="core-ai-map__step" data-wp-text="state.cardStep" aria-hidden="true"><?php echo esc_html( (int) ( $initial_members[ $card_id ] ?? 0 ) > 0 ? (string) $initial_members[ $card_id ] : '' ); ?></span>
								<span class="core-ai-map__block-head">
									<?php $icon( $card_id ); ?>
									<span class="core-ai-map__block-badge"><?php echo esc_html( $card['badge'] ?? '' ); ?></span>
								</span>
								<span class="core-ai-map__block-name">
									<strong><?php echo esc_html( $card['name'] ?? '' ); ?></strong>
									<small><?php echo esc_html( $card['tagline'] ?? '' ); ?></small>
								</span>
								<span class="core-ai-map__tap-cue" data-wp-bind--hidden="state.isTapCueHidden" aria-hidden="true" hidden><?php echo esc_html( $labels['tapCue'] ); ?></span>
							</button>
							<?php if ( 'connectors' === $card_id ) : ?>
								<span class="core-ai-map__sidecar-label"><?php esc_html_e( 'Setup · discovery · credentials', 'core-ai-map' ); ?></span>
							<?php endif; ?>
						</div>
					</div>
				<?php endif; ?>
			<?php endforeach; ?>

			<?php foreach ( $block_ids as $strip_id ) : ?>
				<div
					class="core-ai-map__strip-anchor core-ai-map__strip-anchor--<?php echo esc_attr( $strip_id ); ?>"
					style="<?php echo esc_attr( $card_style( $strip_id ) ); ?>"
					<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $strip_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-style--transform="state.cardTransform"
				>
					<div
						class="core-ai-map__strip core-ai-map__strip--<?php echo esc_attr( $strip_id ); ?>"
						<?php if ( 'plugin' !== $strip_id ) : ?>aria-hidden="true"<?php endif; ?>
						data-wp-bind--hidden="state.isStripHidden"
						data-wp-class--is-live="state.isStripLive"
						data-wp-style--top="state.stripTop"
						hidden
					>
						<?php $role_strip( $strip_id ); ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<?php
		/*
		 * The band under the map states the lesson in words. A flow shows its
		 * takeaway; the component explorer says what it is instead. The
		 * statement sits beside the diagram, never inside a dialog, so a
		 * visitor can look between the sentence and the path it describes.
		 */
		?>
		<div class="core-ai-map__story-copy" data-wp-bind--hidden="state.isStoryBandHidden" hidden>
			<div class="core-ai-map__browse-note" data-wp-bind--hidden="state.isBrowseNoteHidden" hidden>
				<p>
					<strong><?php echo esc_html( $labels['browseLabel'] ); ?></strong>
					<span><?php echo esc_html( $labels['browseDescription'] ); ?></span>
				</p>
			</div>
			<?php foreach ( $stories as $story_id => $story ) : ?>
				<div
					class="core-ai-map__story-flow"
					<?php echo wp_interactivity_data_wp_context( array( 'storyId' => $story_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isStoryNotSelected"
					hidden
				>
					<div class="core-ai-map__story-lessons">
						<?php if ( '' !== (string) ( $story['situation'] ?? '' ) ) : ?>
							<p class="core-ai-map__situation">
								<strong><?php esc_html_e( 'Situation', 'core-ai-map' ); ?></strong>
								<span><?php echo esc_html( $story['situation'] ); ?></span>
							</p>
						<?php endif; ?>
						<?php if ( '' !== (string) ( $story['takeaway'] ?? '' ) ) : ?>
							<p class="core-ai-map__takeaway" data-wp-bind--hidden="state.isTakeawayHidden" hidden>
								<strong><?php echo esc_html( $labels['takeawayHeading'] ); ?></strong>
								<span><?php echo esc_html( $story['takeaway'] ); ?></span>
							</p>
						<?php endif; ?>
					</div>
					<div class="core-ai-map__story-actions">
						<?php if ( 'tests' === $story_id ) : ?>
							<button class="core-ai-map__run-loop-link" type="button" data-wp-on--click="actions.openBench">
								<?php esc_html_e( 'See the run loop', 'core-ai-map' ); ?><span aria-hidden="true">&rarr;</span>
							</button>
						<?php endif; ?>
						<button class="core-ai-map__replay" type="button" data-wp-on--click="actions.replayStory">
							<span aria-hidden="true">&#8635;</span><?php esc_html_e( 'Replay', 'core-ai-map' ); ?>
						</button>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<?php
		/*
		 * The flow controls are the starting point, not another row of content
		 * cards, so they carry a visible label rather than only an accessible
		 * one. The label leads the row: naming the choice costs no vertical
		 * space in a bottom band that is already fully allocated.
		 */
		?>
		<nav class="core-ai-map__rail" aria-labelledby="<?php echo esc_attr( $instance_id . '-rail-label' ); ?>" data-wp-bind--hidden="state.isRailHidden" hidden>
			<p class="core-ai-map__rail-label" id="<?php echo esc_attr( $instance_id . '-rail-label' ); ?>" data-wp-text="state.railLabel"><?php echo esc_html( $labels['railEmptyLabel'] ); ?></p>
			<?php $step = 0; ?>
			<?php foreach ( $stories as $story_id => $story ) : ?>
				<?php ++$step; ?>
				<button
					type="button"
					<?php echo wp_interactivity_data_wp_context( array( 'storyId' => $story_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					aria-pressed="false"
					data-wp-bind--aria-pressed="state.isStorySelected"
					data-wp-class--is-active="state.isStorySelected"
					data-wp-on--click="actions.selectStory"
				>
					<span class="core-ai-map__rail-number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $step ) ); ?></span>
					<span class="core-ai-map__rail-copy">
						<strong><?php echo esc_html( $story['title'] ?? '' ); ?></strong>
						<?php if ( '' !== (string) ( $story['outcome'] ?? '' ) ) : ?>
							<small class="core-ai-map__rail-outcome"><?php echo esc_html( $story['outcome'] ); ?></small>
						<?php endif; ?>
					</span>
				</button>
			<?php endforeach; ?>
		</nav>

		<footer class="core-ai-map__colophon">
			<button
				class="core-ai-map__about-trigger"
				type="button"
				aria-controls="<?php echo esc_attr( $instance_id . '-about' ); ?>"
				aria-expanded="false"
				data-wp-bind--hidden="state.isAboutControlHidden"
				data-wp-bind--aria-expanded="state.isAbout"
				data-wp-on--click="actions.openAbout"
			>
				<?php esc_html_e( 'About this exhibit', 'core-ai-map' ); ?>
			</button>
		</footer>

		<div class="core-ai-map__attract" data-screen-label="<?php esc_attr_e( 'Living Block Map welcome', 'core-ai-map' ); ?>" data-wp-bind--hidden="state.isNotAttract">
			<p class="core-ai-map__eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
			<h1><?php echo esc_html( $attributes['title'] ?? '' ); ?></h1>
			<div class="core-ai-map__orientation">
				<?php foreach ( $intro_paragraphs as $intro_paragraph ) : ?>
					<p class="core-ai-map__intro"><?php echo esc_html( $intro_paragraph ); ?></p>
				<?php endforeach; ?>
			</div>
			<ol class="core-ai-map__welcome-steps" role="list">
				<li><span>1</span><strong><?php esc_html_e( 'Choose a flow', 'core-ai-map' ); ?></strong></li>
				<li><span>2</span><strong><?php esc_html_e( 'Follow the numbered path', 'core-ai-map' ); ?></strong></li>
				<li><span>3</span><strong><?php esc_html_e( 'Tap a highlighted component to see its role', 'core-ai-map' ); ?></strong></li>
			</ol>
			<?php $render_legend( 'welcome' ); ?>
			<div class="core-ai-map__attract-actions">
				<button class="core-ai-map__prompt" type="button" data-wp-on--click="actions.start">
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M12 5v14M5 12h14"></path>
					</svg>
					<?php echo esc_html( $attributes['prompt'] ?? '' ); ?>
				</button>
				<button class="core-ai-map__attract-browse" type="button" data-wp-on--click="actions.browseAll">
					<?php echo esc_html( $labels['browseLabel'] ); ?>
				</button>
			</div>
			<div class="core-ai-map__attract-story">
				<?php foreach ( $attract_previews as $preview_index => $preview ) : ?>
					<?php $story = $stories[ $preview['storyId'] ] ?? array(); ?>
					<p
						<?php echo wp_interactivity_data_wp_context( array( 'previewId' => $preview_index ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-bind--hidden="state.isPreviewHidden"
						data-wp-class--is-visible="state.isPreviewTextVisible"
						<?php echo 0 === $preview_index ? '' : 'hidden'; ?>
					>
						<span><?php echo esc_html( $story['title'] ?? '' ); ?></span>
						<em><?php echo esc_html( $story['copy'] ?? '' ); ?></em>
					</p>
				<?php endforeach; ?>
			</div>
		</div>

		<aside
			id="<?php echo esc_attr( $instance_id . '-about' ); ?>"
			class="core-ai-map__about"
			role="dialog"
			aria-modal="true"
			aria-labelledby="<?php echo esc_attr( $instance_id . '-about-title' ); ?>"
			data-wp-bind--hidden="state.isNotAbout"
			hidden
		>
			<div class="core-ai-map__about-content">
				<button class="core-ai-map__about-close" type="button" data-wp-on--click="actions.closeAbout">
					<span aria-hidden="true">&larr;</span>
					<?php esc_html_e( 'Back to the exhibit', 'core-ai-map' ); ?>
				</button>
				<p class="core-ai-map__details-badge"><?php esc_html_e( 'Transparency', 'core-ai-map' ); ?></p>
				<h2 id="<?php echo esc_attr( $instance_id . '-about-title' ); ?>"><?php esc_html_e( 'About this exhibit', 'core-ai-map' ); ?></h2>
				<dl class="core-ai-map__about-disclosure">
					<div><dt><?php esc_html_e( 'AI assistance:', 'core-ai-map' ); ?></dt><dd><?php esc_html_e( 'Yes', 'core-ai-map' ); ?></dd></div>
					<div><dt><?php esc_html_e( 'Tool:', 'core-ai-map' ); ?></dt><dd><?php esc_html_e( 'OpenAI Codex', 'core-ai-map' ); ?></dd></div>
					<div><dt><?php esc_html_e( 'Used for:', 'core-ai-map' ); ?></dt><dd><?php esc_html_e( 'implementation, tests, and deployment preparation.', 'core-ai-map' ); ?></dd></div>
				</dl>
				<p><?php esc_html_e( 'Final work was human-reviewed and tested; the human contributor remains responsible for it.', 'core-ai-map' ); ?></p>
				<p class="core-ai-map__about-reviewed"><?php echo esc_html( $reviewed_date ); ?></p>
			</div>
		</aside>

		<aside
			class="core-ai-map__details"
			role="region"
			aria-label="<?php esc_attr_e( 'Block details', 'core-ai-map' ); ?>"
			data-screen-label="<?php esc_attr_e( 'Block details', 'core-ai-map' ); ?>"
			data-wp-bind--hidden="state.isNotInspect"
			hidden
		>
			<button class="core-ai-map__details-close" type="button" data-wp-on--click="actions.closeInspect">
				<span aria-hidden="true">&larr;</span>
				<span data-wp-text="state.detailsBackLabel"><?php esc_html_e( 'Back to the map', 'core-ai-map' ); ?></span>
			</button>

			<?php
			/*
			 * The panel says which flow the visitor came from, so opening a
			 * component never costs them the thread they were following.
			 */
			?>
			<p
				class="core-ai-map__details-guidance"
				data-wp-text="state.inspectGuidance"
				data-wp-bind--hidden="state.isFlowContextHidden"
				hidden
			></p>
			<p class="core-ai-map__details-continuation" aria-hidden="true">
				<span><?php esc_html_e( 'Scroll or swipe for Under the hood and Keep exploring', 'core-ai-map' ); ?></span>
				<span aria-hidden="true">&darr;</span>
			</p>

			<?php foreach ( $panels as $panel_id => $panel ) : ?>
				<?php
				$is_context_only = in_array( $panel_id, $context_only_panels, true );
				$panel_roles     = is_array( $panel['roles'] ?? null ) ? $panel['roles'] : array();
				?>
				<article
					id="<?php echo esc_attr( $instance_id . '-panel-' . $panel_id ); ?>"
					aria-labelledby="<?php echo esc_attr( $instance_id . '-panel-' . $panel_id . '-title' ); ?>"
					<?php echo wp_interactivity_data_wp_context( array( 'cardId' => $panel_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-wp-bind--hidden="state.isCardNotInspected"
					hidden
				>
					<h2 id="<?php echo esc_attr( $instance_id . '-panel-' . $panel_id . '-title' ); ?>" class="core-ai-map__sr-only"><?php echo esc_html( $panel['title'] ?? '' ); ?></h2>
					<?php
					/*
					 * Why the visitor tapped comes first. Each flow this
					 * component takes part in carries its own breadcrumb, role
					 * and lesson; only the selected flow's block is shown. The
					 * reusable definition follows underneath, so the panel
					 * answers "what did this just do?" before "what is it?".
					 */
					?>
					<?php foreach ( array_intersect_key( $panel_roles, $stories ) as $role_story_id => $role ) : ?>
						<div
							class="core-ai-map__details-context"
							<?php echo wp_interactivity_data_wp_context( array( 'storyId' => $role_story_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							data-wp-bind--hidden="state.isStoryNotSelected"
							hidden
						>
							<p class="core-ai-map__breadcrumb">
								<span><?php echo esc_html( $stories[ $role_story_id ]['title'] ?? '' ); ?></span>
								<span class="core-ai-map__breadcrumb-arrow" aria-hidden="true">&rarr;</span>
								<span><?php echo esc_html( $panel['title'] ?? '' ); ?></span>
							</p>
							<h3 class="core-ai-map__details-heading"><?php echo esc_html( $labels['roleHeading'] ); ?></h3>
							<dl class="core-ai-map__role">
								<div>
									<dt><?php echo esc_html( $labels['receivesLabel'] ); ?></dt>
									<dd><?php echo esc_html( $role['receives'] ?? '' ); ?></dd>
								</div>
								<div>
									<dt><?php echo esc_html( $labels['doesLabel'] ); ?></dt>
									<dd><?php echo esc_html( $role['does'] ?? '' ); ?></dd>
								</div>
								<div>
									<dt><?php echo esc_html( $labels['returnsLabel'] ); ?></dt>
									<dd><?php echo esc_html( $role['returns'] ?? '' ); ?></dd>
								</div>
							</dl>
							<h3 class="core-ai-map__details-heading"><?php echo esc_html( $labels['lessonHeading'] ); ?></h3>
							<p class="core-ai-map__details-lesson"><?php echo esc_html( $role['lesson'] ?? '' ); ?></p>
						</div>
					<?php endforeach; ?>

					<p class="core-ai-map__details-badge"><?php echo esc_html( $panel['badge'] ?? '' ); ?></p>
					<p class="core-ai-map__details-title" aria-hidden="true"><?php echo esc_html( $panel['title'] ?? '' ); ?></p>
					<h3 class="core-ai-map__details-heading"><?php echo esc_html( $labels['definitionHeading'] ); ?></h3>
					<p class="core-ai-map__details-lede"><?php echo esc_html( $panel['lede'] ?? '' ); ?></p>
					<?php if ( ! $is_context_only ) : ?>
						<h3 class="core-ai-map__details-heading core-ai-map__details-section"><?php echo esc_html( $labels['technicalHeading'] ); ?></h3>
					<?php endif; ?>

					<?php if ( 'bench' === $panel_id ) : ?>
						<button class="core-ai-map__run-loop-link" type="button" data-wp-on--click="actions.openBench">
							<?php esc_html_e( 'Open the run loop', 'core-ai-map' ); ?><span aria-hidden="true">&rarr;</span>
						</button>
					<?php endif; ?>

					<?php if ( 'abilities' === $panel_id ) : ?>
						<div class="core-ai-map__ability-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Abilities API detail', 'core-ai-map' ); ?>">
							<?php
							$ability_tabs = array(
								'overview'    => __( 'Overview', 'core-ai-map' ),
								'anatomy'     => __( 'Anatomy', 'core-ai-map' ),
								'permissions' => __( 'Who is allowed', 'core-ai-map' ),
							);
							?>
							<button type="button" role="tab" tabindex="0" id="<?php echo esc_attr( $instance_id . '-abilities-tab-overview' ); ?>" aria-controls="<?php echo esc_attr( $instance_id . '-abilities-panel-overview' ); ?>" aria-selected="true" data-core-ai-abilities-tab="overview" <?php echo wp_interactivity_data_wp_context( array( 'tabId' => 'overview' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-wp-bind--aria-selected="state.isAbilityTabSelected" data-wp-bind--tabindex="state.abilityTabIndex" data-wp-class--is-active="state.isAbilityTabSelected" data-wp-on--click="actions.selectAbilityTab"><?php echo esc_html( $ability_tabs['overview'] ); ?></button>
							<button type="button" role="tab" tabindex="-1" id="<?php echo esc_attr( $instance_id . '-abilities-tab-anatomy' ); ?>" aria-controls="<?php echo esc_attr( $instance_id . '-abilities-panel-anatomy' ); ?>" aria-selected="false" data-core-ai-abilities-tab="anatomy" <?php echo wp_interactivity_data_wp_context( array( 'tabId' => 'anatomy' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-wp-bind--aria-selected="state.isAbilityTabSelected" data-wp-bind--tabindex="state.abilityTabIndex" data-wp-class--is-active="state.isAbilityTabSelected" data-wp-on--click="actions.selectAbilityTab"><?php echo esc_html( $ability_tabs['anatomy'] ); ?></button>
							<button type="button" role="tab" tabindex="-1" id="<?php echo esc_attr( $instance_id . '-abilities-tab-permissions' ); ?>" aria-controls="<?php echo esc_attr( $instance_id . '-abilities-panel-permissions' ); ?>" aria-selected="false" data-core-ai-abilities-tab="permissions" <?php echo wp_interactivity_data_wp_context( array( 'tabId' => 'permissions' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-wp-bind--aria-selected="state.isAbilityTabSelected" data-wp-bind--tabindex="state.abilityTabIndex" data-wp-class--is-active="state.isAbilityTabSelected" data-wp-on--click="actions.selectAbilityTab"><?php echo esc_html( $ability_tabs['permissions'] ); ?></button>
						</div>

						<div
							id="<?php echo esc_attr( $instance_id . '-abilities-panel-overview' ); ?>"
							role="tabpanel"
							aria-labelledby="<?php echo esc_attr( $instance_id . '-abilities-tab-overview' ); ?>"
							<?php echo wp_interactivity_data_wp_context( array( 'tabId' => 'overview' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							data-wp-bind--hidden="state.isAbilityTabNotSelected"
						>
							<h4 class="core-ai-map__details-heading"><?php esc_html_e( 'How it connects', 'core-ai-map' ); ?></h4>
							<div class="core-ai-map__chain">
								<span class="core-ai-map__chain-step"><?php esc_html_e( 'Input', 'core-ai-map' ); ?></span><span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<span class="core-ai-map__chain-step"><?php esc_html_e( 'Permission', 'core-ai-map' ); ?></span><span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<span class="core-ai-map__chain-step"><?php esc_html_e( 'Run', 'core-ai-map' ); ?></span><span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<span class="core-ai-map__chain-step is-accent"><?php esc_html_e( 'Typed output', 'core-ai-map' ); ?></span>
							</div>
							<p class="core-ai-map__details-note"><?php esc_html_e( 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. A public default for client exposure, filtering in wp_get_abilities(), and filters around execution arrive in WordPress 7.1 on August 19, 2026. This exhibit runs a 7.1 release candidate, so the Anatomy panel describes the version you are looking at.', 'core-ai-map' ); ?></p>
							<p class="core-ai-map__details-note"><strong><?php esc_html_e( 'Reached from both directions.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'An outside assistant is not the only caller. A request made by the AI Client inside WordPress can name registered abilities a model is allowed to call, and every one of those calls still passes the same permission check.', 'core-ai-map' ); ?></p>
							<?php $render_qr( $panel_id, $panel ); ?>
						</div>

						<div
							id="<?php echo esc_attr( $instance_id . '-abilities-panel-anatomy' ); ?>"
							role="tabpanel"
							aria-labelledby="<?php echo esc_attr( $instance_id . '-abilities-tab-anatomy' ); ?>"
							<?php echo wp_interactivity_data_wp_context( array( 'tabId' => 'anatomy' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							data-wp-bind--hidden="state.isAbilityTabNotSelected"
							hidden
						>
							<h4 class="core-ai-map__details-heading"><?php esc_html_e( 'One registration, annotated', 'core-ai-map' ); ?></h4>
							<div class="core-ai-map__ability-code">
								<p><b>A</b><code>wp_register_ability( 'bookings/get-availability', [</code></p>
								<p><b>B</b><code>  'label'               =&gt; 'Get availability',</code></p>
								<p><i aria-hidden="true"></i><code>  'description'         =&gt; 'Open slots in a range.',</code></p>
								<p><i aria-hidden="true"></i><code>  'category'            =&gt; 'bookings',</code></p>
								<p><i aria-hidden="true"></i><code>  'input_schema'        =&gt; $schema,</code></p>
								<p><b>C</b><code>  'permission_callback' =&gt; $can_book,</code></p>
								<p><i aria-hidden="true"></i><code>  'execute_callback'    =&gt; $handler,</code></p>
								<p><i aria-hidden="true"></i><code>  'meta'                =&gt; [</code></p>
								<p><b>D</b><code>    'public'      =&gt; true,</code></p>
								<p><b>E</b><code>    'annotations' =&gt; [ 'readonly' =&gt; true ],</code></p>
								<p><i aria-hidden="true"></i><code>  ],</code></p>
								<p><i aria-hidden="true"></i><code>] );</code></p>
							</div>
							<ul class="core-ai-map__ability-notes">
								<li><b>A</b><span><strong><?php esc_html_e( 'Two segments, lowercase.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'The name is public API. Renaming it later breaks every caller.', 'core-ai-map' ); ?></span></li>
								<li><b>B</b><span><strong><?php esc_html_e( 'This is the part an agent reads.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'It picks the ability from these two lines alone. If the description needs an “and”, it is two abilities.', 'core-ai-map' ); ?></span></li>
								<li><b>C</b><span><strong><?php esc_html_e( 'Checked on every call.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'An editor button, a REST client and an outside assistant all pass through the same gate.', 'core-ai-map' ); ?></span></li>
								<li><b>D</b><span><strong><?php esc_html_e( 'One public default, per-channel control. New in 7.1.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'Public seeds outside channels such as REST, MCP adapters, and agents; each channel can still be turned off independently.', 'core-ai-map' ); ?></span></li>
								<li><b>E</b><span><strong><?php esc_html_e( 'Hints to clients about behavior — and the verb core requires.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'Read-only tells a client this ability changes nothing; over REST it also makes GET the only way to call it. What it never does is decide who may call it.', 'core-ai-map' ); ?></span></li>
							</ul>
							<p class="core-ai-map__details-warning"><strong><?php esc_html_e( 'Validation is not sanitization.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'The schema checks types and required fields. It does not clean input, and it does not fill in the defaults you wrote. Whatever arrives is raw.', 'core-ai-map' ); ?></p>
						</div>

						<div
							id="<?php echo esc_attr( $instance_id . '-abilities-panel-permissions' ); ?>"
							role="tabpanel"
							aria-labelledby="<?php echo esc_attr( $instance_id . '-abilities-tab-permissions' ); ?>"
							<?php echo wp_interactivity_data_wp_context( array( 'tabId' => 'permissions' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							data-wp-bind--hidden="state.isAbilityTabNotSelected"
							hidden
						>
							<h4 class="core-ai-map__details-heading"><?php esc_html_e( 'Three gates, one call', 'core-ai-map' ); ?></h4>
							<div class="core-ai-map__chain">
								<span class="core-ai-map__chain-step"><?php esc_html_e( 'Assistant', 'core-ai-map' ); ?></span><span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<span class="core-ai-map__chain-step"><?php esc_html_e( 'Transport', 'core-ai-map' ); ?></span><span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<span class="core-ai-map__chain-step"><?php esc_html_e( 'Meta-tool', 'core-ai-map' ); ?></span><span class="core-ai-map__chain-arrow" aria-hidden="true">&rarr;</span>
								<span class="core-ai-map__chain-step is-accent"><?php esc_html_e( 'Your callback', 'core-ai-map' ); ?></span>
							</div>
							<ol class="core-ai-map__permission-gates">
								<li><strong><?php esc_html_e( 'The endpoint lets you in', 'core-ai-map' ); ?></strong><span><?php esc_html_e( 'The adapter’s default transport check is only whether someone is logged in. On a stock install a subscriber clears this gate.', 'core-ai-map' ); ?></span></li>
								<li><strong><?php esc_html_e( 'The tool lets you ask', 'core-ai-map' ); ?></strong><span><?php esc_html_e( 'On the default server abilities are not listed one by one. Three adapter tools stand in front of them — discover, inspect, execute — and each carries its own capability.', 'core-ai-map' ); ?></span></li>
								<li><strong><?php esc_html_e( 'The ability decides', 'core-ai-map' ); ?></strong><span><?php esc_html_e( 'Only the last gate sees what is actually being asked — which booking, which date, on whose behalf. This is the one you write.', 'core-ai-map' ); ?></span></li>
							</ol>
							<p class="core-ai-map__details-warning"><strong><?php esc_html_e( 'All three must pass.', 'core-ai-map' ); ?></strong> <?php esc_html_e( 'The first two default to little more than “someone is logged in”. A permission check only ever tried as an administrator has not been tested.', 'core-ai-map' ); ?></p>
							<p class="core-ai-map__details-note"><?php esc_html_e( 'An assistant acts as a real logged-in user. An ability that is too generous hands an outside service that user’s reach. Exposure is not authorization: public decides what a client may see, never what it may run.', 'core-ai-map' ); ?></p>
						</div>
					<?php else : ?>

					<?php if ( ! empty( $panel['connect'] ) && is_array( $panel['connect'] ) ) : ?>
						<?php $is_grid = 'grid' === ( $panel['connectLayout'] ?? 'chain' ); ?>
						<h4 class="core-ai-map__details-heading"><?php echo esc_html( $panel['connectHeading'] ?? '' ); ?></h4>
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
						<?php if ( (string) ( $note['heading'] ?? '' ) !== (string) $labels['technicalHeading'] ) : ?>
							<h4 class="core-ai-map__details-heading"><?php echo esc_html( $note['heading'] ?? '' ); ?></h4>
						<?php endif; ?>
						<p class="core-ai-map__details-note"><?php echo esc_html( $note['text'] ?? '' ); ?></p>
					<?php endforeach; ?>

					<?php $render_qr( $panel_id, $panel ); ?>
					<?php endif; ?>
				</article>
			<?php endforeach; ?>
		</aside>

		<?php
		$bench_stages = array(
			'task' => array(
				'number'  => '01',
				'badge'   => __( 'The harness', 'core-ai-map' ),
				'label'   => __( 'The task', 'core-ai-map' ),
				'summary' => __( 'One prompt, one set of requirements', 'core-ai-map' ),
				'kicker'  => __( 'Stage 01 · outside the site', 'core-ai-map' ),
				'title'   => __( 'One task, one message', 'core-ai-map' ),
				'body'    => __( 'A prompt and its requirements, handed to the model as a single message. Every model gets exactly the same text, so a difference in the result is a difference in the model.', 'core-ai-map' ),
				'rows'    => array(
					array( __( 'prompt', 'core-ai-map' ), __( 'Write the code that does this. One task, one message.', 'core-ai-map' ) ),
					array( __( 'requirements', 'core-ai-map' ), __( 'Named functions and hooks, and the shape of what they return.', 'core-ai-map' ) ),
					array( __( 'never sent', 'core-ai-map' ), __( 'No conversation, no follow-up, no hint about the assertions.', 'core-ai-map' ) ),
				),
			),
			'model' => array(
				'number'  => '02',
				'badge'   => __( 'Not WordPress', 'core-ai-map' ),
				'label'   => __( 'The model answers', 'core-ai-map' ),
				'summary' => __( 'PHP, parsed out of the reply', 'core-ai-map' ),
				'kicker'  => __( 'Stage 02 · outside the site', 'core-ai-map' ),
				'title'   => __( 'Whatever the model wrote', 'core-ai-map' ),
				'body'    => __( 'The harness takes the reply and parses the PHP out of it. If the answer does not parse, that is the answer — nothing is repaired on the way in.', 'core-ai-map' ),
				'rows'    => array(
					array( __( 'reply', 'core-ai-map' ), __( 'Whatever the model wrote, in full.', 'core-ai-map' ) ),
					array( __( 'parsed out', 'core-ai-map' ), __( 'The PHP the harness could find in it.', 'core-ai-map' ) ),
					array( __( 'not repaired', 'core-ai-map' ), __( 'Nothing is patched and nothing is retried before it runs.', 'core-ai-map' ) ),
				),
			),
			'sandbox' => array(
				'number'  => '03',
				'badge'   => __( 'Inside WordPress', 'core-ai-map' ),
				'label'   => __( 'WordPress runs it', 'core-ai-map' ),
				'summary' => __( 'A real 7.0, thrown away after', 'core-ai-map' ),
				'flow'    => array(
					array( 'label' => __( 'setup', 'core-ai-map' ) ),
					array(
						'label'  => __( 'the model’s code', 'core-ai-map' ),
						'accent' => true,
					),
					array( 'label' => __( 'assertions', 'core-ai-map' ) ),
					array( 'label' => __( 'teardown', 'core-ai-map' ) ),
				),
				'kicker'  => __( 'Stage 03 · inside WordPress', 'core-ai-map' ),
				'title'   => __( 'A real WordPress, thrown away after', 'core-ai-map' ),
				'body'    => __( 'The code runs inside a WordPress that exists only for this one test. That makes the result a fact about WordPress rather than a fact about a fixture.', 'core-ai-map' ),
				'rows'    => array(
					array( __( 'the install', 'core-ai-map' ), __( 'A real WordPress 7.0, created for this one test.', 'core-ai-map' ) ),
					array( __( 'the run', 'core-ai-map' ), __( 'Setup, then the model’s code, then the assertions, then teardown.', 'core-ai-map' ) ),
					array( __( 'afterwards', 'core-ai-map' ), __( 'The install is thrown away. No live site is ever involved.', 'core-ai-map' ) ),
				),
			),
			'checks' => array(
				'number'  => '04',
				'badge'   => __( 'Inside WordPress', 'core-ai-map' ),
				'label'   => __( 'WordPress checks it', 'core-ai-map' ),
				'summary' => __( 'WordPress code inspects WordPress state', 'core-ai-map' ),
				'flow'    => array(
					array(
						'label'  => __( 'every assertion', 'core-ai-map' ),
						'accent' => true,
					),
					array( 'label' => __( 'pass', 'core-ai-map' ) ),
				),
				'kicker'  => __( 'Stage 04 · inside WordPress', 'core-ai-map' ),
				'title'   => __( 'WordPress is the grader', 'core-ai-map' ),
				'body'    => __( 'The assertions are WordPress code inspecting WordPress state — not a model judging another model’s answer. Passing is all or nothing.', 'core-ai-map' ),
				'note'    => __( 'Two of three assertions is a fail. A number between 0 and 1 is a bug in the harness, not partial credit.', 'core-ai-map' ),
				'rows'    => array(
					array( __( '3 of 3', 'core-ai-map' ), __( 'Pass.', 'core-ai-map' ) ),
					array( __( '2 of 3', 'core-ai-map' ), __( 'Fail. There is no partial credit.', 'core-ai-map' ) ),
					array( __( 'static analysis', 'core-ai-map' ), __( 'A diagnostic only — unless the code trips a forbidden pattern, which fails the test outright.', 'core-ai-map' ) ),
				),
			),
			'evidence' => array(
				'number'  => '05',
				'badge'   => __( 'Back to the harness', 'core-ai-map' ),
				'label'   => __( 'The verdict', 'core-ai-map' ),
				'summary' => __( 'Pass or fail. Never a percentage', 'core-ai-map' ),
				'kicker'  => __( 'Stage 05 · back in the harness', 'core-ai-map' ),
				'title'   => __( 'Pass or fail. Never a percentage', 'core-ai-map' ),
				'body'    => __( 'Three inputs go through the same verifier, and each one proves a different thing. Run them in this order.', 'core-ai-map' ),
				'note'    => __( 'A broken grader still reports a number. If the sandbox never started, every test scores zero and the run still exits clean — which looks exactly like a model that failed everything.', 'core-ai-map' ),
				'rows'    => array(
					array( '--check-reference-solution', __( 'Proves the grader works. The canonical solution goes in, no model is called. Run it first: if this fails, no other number means anything.', 'core-ai-map' ) ),
					array( __( 'a normal run', 'core-ai-map' ), __( 'Proves the model works. What the model actually wrote goes in — the only number worth reporting, and only once the other two hold.', 'core-ai-map' ) ),
					array( '--check-exploits', __( 'Proves the test is specified. An empty function goes in, then a bare return. Every one must fail — a test a stub can pass was checking a fixture, not WordPress.', 'core-ai-map' ) ),
				),
			),
		);
		?>
		<section
			class="core-ai-map__bench"
			data-core-ai-screen="bench"
			data-screen-label="<?php esc_attr_e( 'WP-Bench run loop', 'core-ai-map' ); ?>"
			aria-label="<?php esc_attr_e( 'WP-Bench run loop', 'core-ai-map' ); ?>"
			data-wp-bind--hidden="state.isNotBench"
			hidden
		>
			<header class="core-ai-map__bench-heading">
				<div>
					<h2><?php esc_html_e( 'The run loop', 'core-ai-map' ); ?></h2>
					<p><?php esc_html_e( 'Five stages, in the same three bands as the map. Tap a stage for the detail. Nothing here touches a live site.', 'core-ai-map' ); ?></p>
				</div>
				<button type="button" data-wp-on--click="actions.closeBench"><span aria-hidden="true">&larr;</span><?php esc_html_e( 'Back to map', 'core-ai-map' ); ?></button>
			</header>

			<p class="core-ai-map__bench-zone core-ai-map__bench-zone--harness"><?php esc_html_e( 'Outside · the harness', 'core-ai-map' ); ?></p>
			<p class="core-ai-map__bench-zone core-ai-map__bench-zone--sandbox"><?php esc_html_e( 'Inside WordPress · sandboxed', 'core-ai-map' ); ?></p>
			<p class="core-ai-map__bench-zone core-ai-map__bench-zone--model"><?php esc_html_e( 'Outside · the model', 'core-ai-map' ); ?></p>

			<svg class="core-ai-map__bench-wires" viewBox="0 0 1366 1024" aria-hidden="true" focusable="false">
				<defs>
					<marker id="<?php echo esc_attr( $instance_id ); ?>-bench-tip" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
				</defs>
				<path class="core-ai-map__bench-boundary" d="M240 148 L240 512"></path>
				<path class="core-ai-map__bench-boundary" d="M1030 148 L1030 512"></path>
				<path class="core-ai-map__bench-divider" d="M24 552 L1342 552"></path>
				<g class="core-ai-map__bench-flow" data-core-ai-bench-flow>
					<path d="M204 200 C420 132 940 128 1148 194" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-bench-tip)"></path>
					<path d="M1240 286 C1240 348 1088 322 986 300" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-bench-tip)"></path>
					<path d="M654 266 L626 266" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-bench-tip)"></path>
					<path d="M330 358 C296 418 254 438 208 462" marker-end="url(#<?php echo esc_attr( $instance_id ); ?>-bench-tip)"></path>
				</g>
			</svg>

			<nav class="core-ai-map__bench-stages" aria-label="<?php esc_attr_e( 'WP-Bench stages', 'core-ai-map' ); ?>">
				<?php foreach ( $bench_stages as $stage_id => $stage ) : ?>
					<button
						class="core-ai-map__bench-stage core-ai-map__bench-stage--<?php echo esc_attr( $stage_id ); ?>"
						type="button"
						<?php if ( 'task' === $stage_id ) : ?>data-core-ai-stage="task"<?php elseif ( 'model' === $stage_id ) : ?>data-core-ai-stage="model"<?php elseif ( 'sandbox' === $stage_id ) : ?>data-core-ai-stage="sandbox"<?php elseif ( 'checks' === $stage_id ) : ?>data-core-ai-stage="checks"<?php else : ?>data-core-ai-stage="evidence"<?php endif; ?>
						aria-controls="<?php echo esc_attr( $instance_id . '-bench-panel-' . $stage_id ); ?>"
						aria-pressed="<?php echo 'sandbox' === $stage_id ? 'true' : 'false'; ?>"
						<?php echo wp_interactivity_data_wp_context( array( 'stageId' => $stage_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-bind--aria-pressed="state.isBenchStageSelected"
						data-wp-class--is-active="state.isBenchStageSelected"
						data-wp-on--click="actions.selectBenchStage"
					>
						<span class="core-ai-map__bench-stage-number" aria-hidden="true"><?php echo esc_html( $stage['number'] ); ?></span>
						<small><?php echo esc_html( $stage['badge'] ); ?></small>
						<strong><?php echo esc_html( $stage['label'] ); ?></strong>
						<em><?php echo esc_html( $stage['summary'] ); ?></em>
						<?php if ( ! empty( $stage['flow'] ) ) : ?>
							<span class="core-ai-map__bench-stage-flow">
								<?php foreach ( $stage['flow'] as $flow_index => $flow_step ) : ?>
									<?php if ( 0 < $flow_index ) : ?><span class="core-ai-map__bench-stage-flow-arrow" aria-hidden="true">&rarr;</span><?php endif; ?>
									<span class="core-ai-map__bench-stage-flow-step<?php echo ! empty( $flow_step['accent'] ) ? ' is-accent' : ''; ?>"><?php echo esc_html( $flow_step['label'] ); ?></span>
								<?php endforeach; ?>
							</span>
						<?php endif; ?>
					</button>
				<?php endforeach; ?>
			</nav>

			<div class="core-ai-map__bench-details">
				<?php foreach ( $bench_stages as $stage_id => $stage ) : ?>
					<article
						id="<?php echo esc_attr( $instance_id . '-bench-panel-' . $stage_id ); ?>"
						<?php echo wp_interactivity_data_wp_context( array( 'stageId' => $stage_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-wp-bind--hidden="state.isBenchStageNotSelected"
						<?php echo 'sandbox' === $stage_id ? '' : 'hidden'; ?>
					>
						<div class="core-ai-map__bench-copy">
							<p><?php echo esc_html( $stage['kicker'] ); ?></p>
							<h3><?php echo esc_html( $stage['title'] ); ?></h3>
							<p><?php echo esc_html( $stage['body'] ); ?></p>
							<?php if ( ! empty( $stage['note'] ) ) : ?><aside><?php echo esc_html( $stage['note'] ); ?></aside><?php endif; ?>
						</div>
						<div class="core-ai-map__bench-facts">
							<?php foreach ( $stage['rows'] as $row ) : ?>
								<p><code><?php echo esc_html( $row[0] ); ?></code><span><?php echo esc_html( $row[1] ); ?></span></p>
							<?php endforeach; ?>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		</section>

		<div class="core-ai-map__home-indicator" aria-hidden="true"></div>
	</div>

	<p class="core-ai-map__sr-only" aria-live="polite" data-wp-text="state.announcement"></p>
</section>
