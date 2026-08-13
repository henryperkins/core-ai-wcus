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

	if ( result.status !== 0 ) {
		throw new Error( result.stderr || 'Could not render the map context.' );
	}

	return JSON.parse( result.stdout );
};

const renderLegacyMarkup = () => {
	const metadata = JSON.parse( readFileSync( metadataPath, 'utf8' ) );
	const legacyMetadata = JSON.parse(
		readFileSync( join( __dirname, 'fixtures', 'block-v0.2.json' ), 'utf8' )
	);
	const attributes = Object.fromEntries(
		Object.entries( legacyMetadata.attributes ).flatMap(
			( [ key, value ] ) =>
				Object.hasOwn( value, 'default' )
					? [ [ key, value.default ] ]
					: []
		)
	);
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

	if ( result.status !== 0 ) {
		throw new Error(
			result.stderr || 'Could not render legacy map markup.'
		);
	}

	return result.stdout;
};

describe( 'Core AI map render contract', () => {
	it( 'serializes task as the third actor in the agent-learning workflow', () => {
		const context = renderDefaultContext();

		expect( context.layout.learns.members ).toEqual( {
			skills: 1,
			agent: 2,
			task: 3,
		} );
		expect( context.layout.learns.place.agent ).toEqual( [ 24, 320 ] );
		expect( context.layout.learns.place.task ).toEqual( [ 24, 490 ] );
		expect( context.neutral.agent ).toEqual( [ 24, 320 ] );
		expect( context.neutral.task ).toEqual( [ 24, 490 ] );
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

		expect( trigger.getAttribute( 'aria-controls' ) ).toMatch(
			/core-ai-map-test-about/
		);
		expect( trigger.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		expect( dialog.getAttribute( 'role' ) ).toBe( 'dialog' );
		expect( dialog.getAttribute( 'aria-modal' ) ).toBe( 'true' );
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
	} );
} );
