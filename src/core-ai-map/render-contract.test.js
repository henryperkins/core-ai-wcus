const { readFileSync } = require( 'node:fs' );
const { join } = require( 'node:path' );
const { spawnSync } = require( 'node:child_process' );

const renderPath = join( __dirname, 'render.php' );
const metadataPath = join( __dirname, 'block.json' );

const renderDefaultContext = () => {
	const metadata = JSON.parse( readFileSync( metadataPath, 'utf8' ) );
	const attributes = Object.fromEntries(
		Object.entries( metadata.attributes ).flatMap( ( [ key, value ] ) =>
			Object.hasOwn( value, 'default' ) ? [ [ key, value.default ] ] : []
		)
	);
	const harness = `
define( 'ABSPATH', __DIR__ );
define( 'CORE_AI_MAP_URL', 'https://example.test/plugin/' );
function __( $text ) { return $text; }
function sanitize_key( $key ) { return strtolower( $key ); }
function absint( $number ) { return abs( (int) $number ); }
function wp_unique_id( $prefix = '' ) { return $prefix . 'test'; }
function add_query_arg( $key, $value, $url ) { return $url; }
function home_url( $path = '/' ) { return 'https://example.test' . $path; }
function wp_parse_url( $url, $component = -1 ) { return '/'; }
function wp_json_encode( $value ) { return json_encode( $value ); }
function get_block_wrapper_attributes( $attributes ) { return ''; }
function wp_interactivity_data_wp_context( $context ) { ob_end_clean(); echo json_encode( $context ); exit; }
$attributes = json_decode( base64_decode( getenv( 'CORE_AI_MAP_TEST_ATTRIBUTES' ) ), true );
ob_start();
require ${ JSON.stringify( renderPath ) };
`;
	const result = spawnSync( 'php', [ '-r', harness ], {
		encoding: 'utf8',
		env: {
			...process.env,
			CORE_AI_MAP_TEST_ATTRIBUTES: Buffer.from(
				JSON.stringify( attributes )
			).toString( 'base64' ),
		},
	} );

	if ( result.status !== 0 || result.stderr.trim() ) {
		throw new Error( result.stderr || 'Could not render the map context.' );
	}

	return JSON.parse( result.stdout );
};

const renderLegacyMarkup = ( profile = 'legacy' ) => {
	const metadata = JSON.parse( readFileSync( metadataPath, 'utf8' ) );
	const legacyMetadata = JSON.parse(
		readFileSync( join( __dirname, 'fixtures', 'block-v0.2.json' ), 'utf8' )
	);
	const sourceMetadata = profile === 'prebooth' ? metadata : legacyMetadata;
	const attributes = JSON.parse(
		JSON.stringify(
			Object.fromEntries(
				Object.entries( sourceMetadata.attributes ).flatMap(
					( [ key, value ] ) =>
						Object.hasOwn( value, 'default' )
							? [ [ key, value.default ] ]
							: []
				)
			)
		)
	);
	if ( profile === 'prebooth' ) {
		Object.assign(
			attributes.blocks.find( ( item ) => item.id === 'connectors' ),
			{ tagline: 'Connect WordPress to providers and services' }
		);
		Object.assign(
			attributes.actors.find( ( item ) => item.id === 'provider' ),
			{
				name: 'AI provider',
				tagline: 'The site owner’s choice',
			}
		);
		attributes.stories.find( ( item ) => item.id === 'uses-ai' ).copy =
			'A plugin asks the AI Client for a capability. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.';
		attributes.panels.find( ( item ) => item.id === 'abilities' ).notes = [
			{
				heading: 'Under the hood',
				text: 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. One public flag for client exposure, filtering in wp_get_abilities(), and filters around execution are landing in WordPress 7.1, which ships 19 August 2026 — read the Anatomy panel as forward-looking until then.',
			},
		];
		attributes.panels.find( ( item ) => item.id === 'client' ).lede =
			'A plugin asks for a capability and the kind of result it needs. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.';
		Object.assign(
			attributes.panels.find( ( item ) => item.id === 'connectors' ),
			{
				lede: 'Where a site owner connects WordPress to outside services. Connectors handles provider discovery, configuration, credentials, installation status, and connection status.',
				notes: [
					{
						heading: 'Providers',
						text: 'Provider plugins register themselves with the AI Client and appear under Settings → Connectors. A plugin can ask what a site actually has before offering a feature. The map stays vendor-neutral: no provider owns a position on the canvas.',
					},
					{
						heading: 'Under the hood',
						text: 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.',
					},
				],
			}
		);
	}
	attributes.panels = attributes.panels.map( ( panel ) => ( {
		...panel,
		href: 'https://legacy.example/generic',
		qr: '',
	} ) );

	const harness = `
define( 'ABSPATH', __DIR__ );
define( 'CORE_AI_MAP_URL', 'https://example.test/plugin/' );
function __( $text ) { return $text; }
function sanitize_key( $key ) { return strtolower( $key ); }
function absint( $number ) { return abs( (int) $number ); }
function wp_unique_id( $prefix = '' ) { return $prefix . 'test'; }
function add_query_arg( $key, $value, $url ) { return $url; }
function home_url( $path = '/' ) { return 'https://example.test' . $path; }
function get_permalink() { return 'https://example.test/kiosk/'; }
function core_ai_map_get_kiosk_scope( $url ) { return '/kiosk/'; }
function core_ai_map_sign_kiosk_scope( $scope ) { return 'test-token'; }
function wp_json_encode( $value ) { return json_encode( $value ); }
function esc_attr( $value ) { return htmlspecialchars( (string) $value, ENT_QUOTES ); }
function esc_html( $value ) { return htmlspecialchars( (string) $value, ENT_QUOTES ); }
function esc_url( $value ) { return htmlspecialchars( (string) $value, ENT_QUOTES ); }
function esc_attr_e( $value ) { echo esc_attr( $value ); }
function esc_html_e( $value ) { echo esc_html( $value ); }
function get_block_wrapper_attributes( $attributes ) { return ''; }
function wp_interactivity_data_wp_context( $context ) { return 'data-test-context="' . esc_attr( json_encode( $context ) ) . '"'; }
class CoreAiMapTestModules { public function get_registered( $id ) { return null; } }
function wp_script_modules() { return new CoreAiMapTestModules(); }
$attributes = json_decode( base64_decode( getenv( 'CORE_AI_MAP_TEST_ATTRIBUTES' ) ), true );
$schemas = json_decode( base64_decode( getenv( 'CORE_AI_MAP_TEST_SCHEMAS' ) ), true );
$block = (object) array( 'block_type' => (object) array( 'attributes' => $schemas ) );
ob_start();
require ${ JSON.stringify( renderPath ) };
echo ob_get_clean();
`;
	const result = spawnSync( 'php', [ '-r', harness ], {
		encoding: 'utf8',
		env: {
			...process.env,
			CORE_AI_MAP_TEST_ATTRIBUTES: Buffer.from(
				JSON.stringify( attributes )
			).toString( 'base64' ),
			CORE_AI_MAP_TEST_SCHEMAS: Buffer.from(
				JSON.stringify( metadata.attributes )
			).toString( 'base64' ),
		},
	} );

	if ( result.status !== 0 || result.stderr.trim() ) {
		throw new Error(
			result.stderr || 'Could not render legacy map markup.'
		);
	}

	return result.stdout;
};

describe( 'Core AI map render contract', () => {
	it( 'renders SVG without Interactivity directives or PHP stderr', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();

		const directives = Array.from( container.querySelectorAll( 'svg' ) )
			.flatMap( ( svg ) => [ svg, ...svg.querySelectorAll( '*' ) ] )
			.flatMap( ( element ) =>
				Array.from( element.attributes )
					.map( ( attribute ) => attribute.name )
					.filter( ( name ) => name.startsWith( 'data-wp-' ) )
			);

		expect( directives ).toEqual( [] );
	} );

	it( 'keeps the neutral composition clear of every card intersection', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();
		const cards = [
			...Array.from(
				container.querySelectorAll( '.core-ai-map__actor' )
			).map( ( actor ) => ( {
				id: actor.className.match(
					/core-ai-map__actor--([a-z-]+)/
				)[ 1 ],
				x: Number.parseFloat(
					actor.style.getPropertyValue( '--cai-x' )
				),
				y: Number.parseFloat(
					actor.style.getPropertyValue( '--cai-y' )
				),
				width: 180,
				height: 120,
			} ) ),
			...Array.from(
				container.querySelectorAll( '.core-ai-map__block' )
			).map( ( block ) => ( {
				id: block.className.match(
					/core-ai-map__block--([a-z-]+)/
				)[ 1 ],
				x: Number.parseFloat(
					block.style.getPropertyValue( '--cai-x' )
				),
				y: Number.parseFloat(
					block.style.getPropertyValue( '--cai-y' )
				),
				width: 236,
				height: 148,
			} ) ),
		];
		const overlaps = [];

		for ( let first = 0; first < cards.length; first += 1 ) {
			for ( let second = first + 1; second < cards.length; second += 1 ) {
				const one = cards[ first ];
				const two = cards[ second ];
				if (
					one.x < two.x + two.width &&
					one.x + one.width > two.x &&
					one.y < two.y + two.height &&
					one.y + one.height > two.y
				) {
					overlaps.push( `${ one.id }/${ two.id }` );
				}
			}
		}

		expect( cards ).toHaveLength( 11 );
		expect( overlaps ).toEqual( [] );
	} );

	it( 'keeps Connectors beside the provider request path, not inside it', () => {
		const context = renderDefaultContext();

		expect( context.layout[ 'uses-ai' ].members ).toEqual( {
			plugin: 1,
			client: 2,
			provider: 0,
		} );
		expect( context.layout[ 'uses-ai' ].sidecars ).toEqual( [
			'connectors',
		] );
		expect( context.layout[ 'uses-ai' ].providerPlugin ).toMatchObject( {
			step: 3,
			position: [ 824, 214 ],
			restPosition: [ 824, 332 ],
		} );
		expect( context.layout[ 'uses-ai' ].edges ).toEqual( [
			'M504 266 L556 266',
			'M792 266 L824 266',
			'M1024 266 L1180 266',
		] );
		expect( context.layout[ 'uses-ai' ].sidecarEdges ).toEqual( [
			'M924 360 L924 318',
		] );
		expect( context.layout[ 'uses-ai' ].sidecarRest ).toEqual( [
			'M924 332 C954 318 1012 320 1030 308',
		] );
		expect( context.layout[ 'uses-ai' ].rest ).toEqual( [
			'M504 234 L556 234',
			'M792 234 C810 234 806 384 824 384',
			'M1024 384 C1080 384 1094 390 1150 390',
		] );

		const [ connectorsX, connectorsY ] = context.neutral.connectors;
		const [ providerPluginX, providerPluginY ] =
			context.layout[ 'uses-ai' ].providerPlugin.restPosition;
		const connectorsRect = {
			left: connectorsX,
			right: connectorsX + 236,
			top: connectorsY,
			bottom: connectorsY + 148,
		};
		const providerPluginRect = {
			left: providerPluginX,
			right: providerPluginX + 200,
			top: providerPluginY,
			bottom: providerPluginY + 104,
		};
		expect(
			providerPluginRect.right <= connectorsRect.left ||
				providerPluginRect.left >= connectorsRect.right ||
				providerPluginRect.bottom <= connectorsRect.top ||
				providerPluginRect.top >= connectorsRect.bottom
		).toBe( true );

		expect( context.previews[ 0 ] ).toMatchObject( {
			ids: [ 'plugin', 'client', 'provider' ],
			steps: { plugin: 1, client: 2, provider: 0 },
			sidecars: [ 'connectors' ],
			providerPlugin: { step: 3, position: [ 716, 200 ], scale: 0.8 },
			at: { provider: [ 1060, 211 ] },
			paths: [
				'M449 259 L488 259',
				'M677 259 L716 259',
				'M876 259 L1060 259',
			],
			sidecarPaths: [ 'M798 340 L798 284' ],
		} );
	} );

	it( 'serializes task as the third actor in the agent-learning workflow', () => {
		const context = renderDefaultContext();

		expect( context.layout.learns.members ).toEqual( {
			skills: 1,
			agent: 2,
			task: 3,
		} );
		expect( context.layout.learns.place.agent ).toEqual( [ 24, 320 ] );
		expect( context.layout.learns.place.task ).toEqual( [ 24, 490 ] );
		expect( context.neutral.agent ).toEqual( [ 24, 376 ] );
		expect( context.neutral.task ).toEqual( [ 24, 508 ] );
		expect( context.layout.learns.edges ).toEqual( [
			'M114 276 L114 314',
			'M114 446 L114 484',
		] );
		expect( context.previews[ 2 ].at ).toMatchObject( {
			skills: [ 36, 150 ],
			agent: [ 36, 272 ],
			task: [ 36, 394 ],
		} );
		expect( context.previews[ 2 ].paths ).toEqual( [
			'M108 242 L108 266',
			'M108 364 L108 388',
		] );
	} );

	it( 'migrates legacy visitor destinations, QR assets, and MCP labels', () => {
		const markup = renderLegacyMarkup();
		const destinations = {
			abilities: 'https://developer.wordpress.org/apis/abilities-api/',
			client: 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/',
			connectors:
				'https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/',
			plugin: 'https://wordpress.org/plugins/ai/',
			mcp: 'https://github.com/WordPress/mcp-adapter',
			bench: 'https://github.com/WordPress/wp-bench',
			skills: 'https://github.com/WordPress/agent-skills',
		};

		for ( const [ id, href ] of Object.entries( destinations ) ) {
			expect( markup ).toContain( `data-qr-url="${ href }"` );
			expect( markup ).toContain(
				`src="https://example.test/plugin/assets/qr/${ id }.svg"`
			);
		}

		expect( markup ).toContain( 'core-ai-map__actor--task' );
		expect( markup ).not.toContain( 'https://legacy.example/generic' );
		expect( markup ).not.toContain( 'Open adapter' );
		expect(
			markup.match( /WordPress plugin · not in Core/g )
		).toHaveLength( 2 );
		expect( markup ).toContain( 'WP-Bench' );
		expect( markup ).toContain( 'Evidence, not vibes.' );
		expect( markup ).toContain(
			'Nothing is on by default: you enable one experiment at a time.'
		);
		expect( markup ).not.toContain( 'Evidence, not a leaderboard.' );
		expect( markup ).not.toContain( 'Every feature is opt-in' );
		expect( markup ).not.toContain( 'ships 19 August' );
		expect( markup ).not.toContain( 'One flag, every client' );
	} );

	it( 'migrates untouched pre-booth v3.1.1 copy on the server', () => {
		const markup = renderLegacyMarkup( 'prebooth' );

		expect( markup ).toContain(
			'Configure provider plugins and credentials'
		);
		expect( markup ).toContain( 'External AI service' );
		expect( markup ).toContain( 'Selected from site configuration' );
		expect( markup ).toContain( 'provider plugin' );
		expect( markup ).toContain( 'installed provider plugin' );
		expect( markup ).toContain( 'not the request executor' );
		expect( markup ).toContain( 'auto-discovers them' );
		expect( markup ).toContain(
			'scheduled for WordPress 7.1 on August 19, 2026'
		);
		expect( markup ).not.toContain( 'ships 19 August' );
	} );

	it( 'keeps the WP-Bench process cues and complete evidence rationale', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();

		const stageSteps = ( stage ) =>
			Array.from(
				container.querySelectorAll(
					`[data-core-ai-stage="${ stage }"] .core-ai-map__bench-stage-flow-step`
				)
			).map( ( step ) => step.textContent.trim() );

		expect( stageSteps( 'sandbox' ) ).toEqual( [
			'setup',
			'the model’s code',
			'assertions',
			'teardown',
		] );
		expect( stageSteps( 'checks' ) ).toEqual( [
			'every assertion',
			'pass',
		] );

		const evidence = container.querySelector(
			'[id$="-bench-panel-evidence"]'
		);
		expect(
			evidence.querySelector( '.core-ai-map__bench-copy aside' )
				.textContent
		).toBe(
			'A broken grader still reports a number. If the sandbox never started, every test scores zero and the run still exits clean — which looks exactly like a model that failed everything.'
		);
		expect(
			Array.from(
				evidence.querySelectorAll( '.core-ai-map__bench-facts p' )
			).map( ( row ) => row.textContent.trim() )
		).toEqual( [
			'--check-reference-solutionProves the grader works. The canonical solution goes in, no model is called. Run it first: if this fails, no other number means anything.',
			'a normal runProves the model works. What the model actually wrote goes in — the only number worth reporting, and only once the other two hold.',
			'--check-exploitsProves the test is specified. An empty function goes in, then a bare return. Every one must fail — a test a stub can pass was checking a fixture, not WordPress.',
		] );
	} );

	it( 'renders an accessible OpenAI Codex transparency dialog', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();

		const trigger = container.querySelector(
			'.core-ai-map__about-trigger'
		);
		const dialog = container.querySelector( '.core-ai-map__about' );
		const content = dialog.querySelector( '.core-ai-map__about-content' );
		const close = dialog.querySelector( '.core-ai-map__about-close' );

		expect( trigger.getAttribute( 'aria-controls' ) ).toMatch(
			/core-ai-map-test-about/
		);
		expect( trigger.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		expect( dialog.getAttribute( 'role' ) ).toBe( 'dialog' );
		expect( dialog.getAttribute( 'aria-modal' ) ).toBe( 'true' );
		expect( content.firstElementChild ).toBe( close );
		expect( dialog.querySelector( 'dt' ).textContent ).toBe(
			'AI assistance:'
		);
		expect( dialog.querySelector( 'dd' ).textContent ).toBe( 'Yes' );
		expect( dialog.textContent ).toContain( 'Tool:' );
		expect( dialog.textContent ).toContain( 'OpenAI Codex' );
		expect( dialog.textContent ).toContain( 'Used for:' );
		expect( dialog.textContent ).toContain(
			'implementation, tests, and deployment preparation.'
		);
		expect( dialog.textContent ).toContain(
			'Final work was human-reviewed and tested; the human contributor remains responsible for it.'
		);
		expect(
			dialog.querySelector( '.core-ai-map__about-reviewed' ).textContent
		).toBe( 'Reviewed 12 Aug 2026' );
	} );

	it( 'keeps the About trigger in the colophon rather than the top bar', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();

		const trigger = container.querySelector(
			'.core-ai-map__about-trigger'
		);

		expect( trigger.closest( '.core-ai-map__colophon' ) ).not.toBeNull();
		expect( trigger.closest( '.core-ai-map__topbar' ) ).toBeNull();
		expect( container.querySelector( '.core-ai-map__hint' ) ).toBeNull();
		expect(
			container.querySelector( '.core-ai-map__brand small' )
		).toBeNull();
	} );
} );
