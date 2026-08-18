const { readFileSync } = require( 'node:fs' );
const { join } = require( 'node:path' );
const { spawnSync } = require( 'node:child_process' );

const renderPath = join( __dirname, 'render.php' );
const metadataPath = join( __dirname, 'block.json' );
const styleSource = readFileSync( join( __dirname, 'style.scss' ), 'utf8' );

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
	const sourceMetadata = profile === 'legacy' ? legacyMetadata : metadata;
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
	if ( profile === 'blank-title' ) {
		attributes.title = '';
	}
	if ( profile === 'protocol-v320' ) {
		attributes.panels.find( ( item ) => item.id === 'mcp' ).notes = [
			{
				heading: 'Under the hood',
				text: 'An official WordPress package installed as a plugin, not part of Core: HTTP and STDIO transports against the MCP specification the adapter currently targets (2025-11-25), configurable servers, validation, permission checks, error handling, and observability. Today it answers calls; it does not make them. It does not create the underlying action, and it is not the model — WordPress still owns execution.',
			},
		];
	}
	if ( profile === 'connector-accuracy' ) {
		attributes.panels.find( ( item ) => item.id === 'abilities' ).notes = [
			{
				heading: 'Under the hood',
				text: 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. A public default for client exposure, filtering in wp_get_abilities(), and filters around execution are scheduled for WordPress 7.1 on August 19, 2026; this exhibit runs WordPress 7.0, so read the Anatomy panel as forward-looking.',
			},
		];
		Object.assign(
			attributes.panels.find( ( item ) => item.id === 'client' ),
			{
				connect: [
					{ label: 'Text, image or JSON request' },
					{ label: 'AI Client', accent: true },
					{ label: 'Normalized result' },
				],
				notes: [
					{
						heading: 'Under the hood',
						text: 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly. Core’s client is PHP only: for editor JavaScript, register a REST endpoint per feature. Check support before showing any AI interface — the checks are free, and a 7.0 site may have no provider configured at all.',
					},
				],
			}
		);
		Object.assign(
			attributes.panels.find( ( item ) => item.id === 'connectors' ),
			{
				lede: 'Where a site owner discovers and configures provider plugins, stores credentials, and sees connection status. It supports the request path; it is not the request executor.',
				notes: [
					{
						heading: 'Providers',
						text: 'Provider plugins register with the AI Client. Connectors auto-discovers them and gives site owners installation, configuration, credential, and status controls. The map stays vendor-neutral: no provider owns a position on the canvas.',
					},
					{
						heading: 'Under the hood',
						text: 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.',
					},
				],
			}
		);
		Object.assign(
			attributes.panels.find( ( item ) => item.id === 'provider-plugin' ),
			{
				lede: 'A provider-specific integration installed as a WordPress plugin. It speaks one external service’s protocol using the credentials the site owner stored through Connectors.',
				roles: {
					'uses-ai': {
						receives: 'The routed request from the AI Client.',
						does: 'Speaks one external service’s protocol, using the stored credentials.',
						returns:
							'That service’s reply, handed back to the AI Client.',
						lesson: 'The provider-specific part is a plugin. Swapping providers does not change the feature that asked.',
					},
				},
			}
		);
	}
	if ( profile === 'uses-wp-v324' ) {
		Object.assign(
			attributes.stories.find( ( item ) => item.id === 'uses-wp' ),
			{
				copy: 'An authorized assistant calls in through the MCP Adapter, which translates the call into a WordPress ability. Permission still belongs to WordPress.',
				situation:
					'An outside assistant asks WordPress to perform an allowed action.',
				takeaway:
					'The assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions.',
				outcome: 'An assistant requests a WordPress action',
			}
		);
		attributes.panels.find( ( item ) => item.id === 'assistant' ).roles = {
			'uses-wp': {
				receives: 'A person’s instruction, outside WordPress.',
				does: 'Signs in as the WordPress user it was given credentials for, then issues an MCP tool call.',
				returns:
					'Whatever that user is allowed to get back — nothing more.',
				lesson: 'The assistant is a client, not an authority. It asks; it does not decide.',
			},
		};
		attributes.panels.find( ( item ) => item.id === 'mcp' ).roles = {
			'uses-wp': {
				receives:
					'An MCP tool call from an authorized outside assistant.',
				does: 'Translates the call into a WordPress ability and hands it to WordPress to run.',
				returns:
					'The ability’s typed result, translated back into MCP.',
				lesson: 'The adapter is a translator at the edge of the site. It does not create the action, and it does not grant the permission.',
			},
		};
		attributes.panels.find( ( item ) => item.id === 'abilities' ).roles = {
			'uses-wp': {
				receives:
					'The translated request, naming the WordPress action and supplying its inputs.',
				does: 'Validates the inputs, checks whether the current user is allowed to perform the action, then runs its registered callback.',
				returns: 'A typed result, or a refusal.',
				lesson: 'Connecting an outside assistant does not give it unrestricted access. WordPress still controls execution.',
			},
		};
	}
	if ( profile === 'uses-wp-custom' ) {
		Object.assign(
			attributes.stories.find( ( item ) => item.id === 'uses-wp' ),
			{
				copy: 'Custom inbound story.',
				situation: 'Custom inbound situation.',
				takeaway: 'Custom inbound takeaway.',
				outcome: 'Custom inbound outcome',
			}
		);
		attributes.panels.find( ( item ) => item.id === 'assistant' ).roles = {
			'uses-wp': {
				receives: 'Custom assistant input.',
				does: 'Custom assistant work.',
				returns: 'Custom assistant result.',
				lesson: 'Custom assistant lesson.',
			},
		};
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
			...Array.from(
				container.querySelectorAll( '.core-ai-map__provider-plugin' )
			).map( ( providerPlugin ) => ( {
				id: 'provider-plugin',
				x: Number.parseFloat(
					providerPlugin.style.getPropertyValue( '--cai-x' )
				),
				y: Number.parseFloat(
					providerPlugin.style.getPropertyValue( '--cai-y' )
				),
				width: 180,
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

		expect( cards ).toHaveLength( 12 );
		expect( overlaps ).toEqual( [] );
	} );

	it( 'keeps Connectors beside the provider request path, not inside it', () => {
		const context = renderDefaultContext();

		expect( context.layout[ 'uses-ai' ].members ).toEqual( {
			plugin: 1,
			client: 2,
			provider: 4,
		} );
		expect( context.layout[ 'uses-ai' ].sidecars ).toEqual( [
			'connectors',
		] );
		expect( context.layout[ 'uses-ai' ].providerPlugin ).toMatchObject( {
			step: 3,
			position: [ 844, 192 ],
			restPosition: [ 844, 332 ],
		} );
		expect( context.layout[ 'uses-ai' ].edges ).toEqual( [
			'M504 266 L556 266',
			'M792 266 L840 266',
			'M1024 266 L1146 266',
		] );
		// Connectors reaches the request path on a dashed support line, and
		// its state strip reads above the card so it stays inside the band.
		expect( context.layout[ 'uses-ai' ].support ).toEqual( [
			'M908 434 L908 346',
		] );
		expect( context.layout[ 'uses-ai' ].place.connectors ).toEqual( [
			790, 440,
		] );
		expect( context.layout[ 'uses-ai' ].strips.connectors ).toEqual( [
			0, -70,
		] );
		expect( context.layout[ 'uses-ai' ].shelfY ).toBe( 640 );
		expect( context.shelfX ).toEqual( [ 236, 414, 592, 770, 948, 1126 ] );
		expect( context.layout[ 'uses-ai' ].rest ).toEqual( [
			'M504 234 L556 234',
			'M792 234 C818 234 818 406 840 406',
			'M1024 406 C1080 406 1094 390 1146 390',
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
			right: providerPluginX + 180,
			top: providerPluginY,
			bottom: providerPluginY + 148,
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
		expect( context.layout.learns.place.agent ).toEqual( [ 24, 300 ] );
		expect( context.layout.learns.place.task ).toEqual( [ 24, 462 ] );
		expect( context.neutral.agent ).toEqual( [ 24, 360 ] );
		expect( context.neutral.task ).toEqual( [ 24, 480 ] );
		// The third step ends against the boundary rather than crossing it.
		expect( context.layout.learns.edges ).toEqual( [
			'M114 262 L114 296',
			'M114 424 L114 458',
			'M204 522 L228 522',
		] );
		expect( context.layout.learns.gate ).toBe( true );
		expect( context.layout.learns.next ).toBe( 'tests' );
		// The components the guidance is about stay on the canvas, quiet.
		expect( context.layout.learns.quiet ).toEqual( [
			'abilities',
			'client',
			'mcp',
		] );
		expect( context.layout.learns.park ).toEqual( [
			'plugin',
			'connectors',
			'bench',
		] );
		expect( context.layout.learns.support ).toHaveLength( 3 );
		expect( context.layout.tests.shelfXs ).toEqual( [
			236, 394, 552, 710, 868,
		] );
		expect( context.layout.tests.shelfK ).toBe( 0.64 );
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
		).toHaveLength( 3 );
		expect( markup ).toContain( 'WP-Bench' );
		expect( markup ).toContain( 'Evidence, not vibes.' );
		expect( markup ).toContain(
			'a site owner switches AI on, then enables one experiment at a time.'
		);
		expect( markup ).not.toContain( 'Evidence, not a leaderboard.' );
		expect( markup ).not.toContain( 'Every feature is opt-in' );
		expect( markup ).not.toContain( 'ships 19 August' );
		expect( markup ).toContain( 'One flag, every client. New in 7.1.' );
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
			'arrive in WordPress 7.1 on August 19, 2026'
		);
		expect( markup ).not.toContain( 'ships 19 August' );
	} );

	it( 'migrates v3.2.0 MCP copy to the registered protocol wording', () => {
		const markup = renderLegacyMarkup( 'protocol-v320' );

		expect( markup ).toContain(
			'HTTP transport implements MCP 2025-11-25'
		);
		expect( markup ).not.toContain(
			'against the MCP specification the adapter currently targets'
		);
	} );

	it( 'migrates v3.2.1 AI Client and Connectors copy to the verified wording', () => {
		const markup = renderLegacyMarkup( 'connector-accuracy' );

		// The JavaScript prompt API exists on 7.0; it is gated, not absent.
		expect( markup ).toContain( 'administrator-only' );
		expect( markup ).not.toContain( 'administrator-gated' );

		// The chain names the route, not a list of modalities.
		expect( markup ).toContain( 'Capability request' );
		expect( markup ).toContain( 'Model resolution' );
		expect( markup ).not.toContain(
			'Text, image, speech or video request'
		);
		expect( markup ).not.toContain( 'Text, image or JSON request' );

		// Keys resolve env → constant → database, unencrypted by default.
		expect( markup ).toContain( 'an environment variable is read first' );
		expect( markup ).toContain( 'unencrypted by default' );
		expect( markup ).toContain( 'credentials Connectors resolved' );
		expect( markup ).not.toContain( 'using the stored credentials' );
		expect( markup ).not.toContain(
			'credentials the site owner stored through Connectors'
		);

		// Connectors is general connection infrastructure, not an AI-only screen.
		expect( markup ).toContain( 'one setup shared by every plugin' );
		expect( markup ).toContain( 'not the only intended ones' );
		expect( markup ).not.toContain(
			'external services, starting with AI providers'
		);

		// The ability-calling edge joins the two halves of the map.
		expect( markup ).toContain( 'Calling back into WordPress' );
		expect( markup ).toContain( 'Reached from both directions' );

		// The kiosk boots a 7.1 release candidate, so 7.1 is no longer pending
		// and the exhibit is no longer a 7.0 site.
		expect( markup ).toContain( 'runs a 7.1 release candidate' );
		expect( markup ).not.toContain( 'this exhibit runs WordPress 7.0' );
		expect( markup ).not.toContain(
			'scheduled for WordPress 7.1 on August 19, 2026'
		);
	} );

	it( 'migrates only the exact former AI uses WordPress defaults', () => {
		const migrated = renderLegacyMarkup( 'uses-wp-v324' );

		expect( migrated ).toContain(
			'A person asks an outside assistant to check which booking times are available on this WordPress site.'
		);
		expect( migrated ).toContain( 'bookings/get-availability' );
		expect( migrated ).toContain(
			'The MCP Adapter is a WordPress plugin, not part of Core.'
		);
		expect( migrated ).toContain(
			'The Abilities API is the Core execution contract.'
		);
		expect( migrated ).not.toContain(
			'An assistant requests a WordPress action'
		);

		const custom = renderLegacyMarkup( 'uses-wp-custom' );
		expect( custom ).toContain( 'Custom inbound story.' );
		expect( custom ).toContain( 'Custom inbound situation.' );
		expect( custom ).toContain( 'Custom inbound takeaway.' );
		expect( custom ).toContain( 'Custom inbound outcome' );
		expect( custom ).toContain( 'Custom assistant lesson.' );
	} );

	it( 'keeps the WP-Bench process cues and complete evidence rationale', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();
		const bench = container.querySelector( '.core-ai-map__bench' );

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
		expect( bench.hasAttribute( 'data-core-ai-initial-stage' ) ).toBe(
			false
		);
		expect(
			bench
				.querySelector( '[data-core-ai-stage="task"]' )
				.getAttribute( 'aria-pressed' )
		).toBe( 'true' );
		expect(
			bench.querySelector( '[id$="-bench-panel-task"]' ).hidden
		).toBe( false );
		expect(
			bench.querySelector( '.core-ai-map__bench-previous' ).textContent
		).toContain( 'Previous' );
		expect(
			bench.querySelector( '.core-ai-map__bench-next' ).textContent
		).toContain( 'Next' );
		expect(
			bench
				.querySelector( '.core-ai-map__bench-previous' )
				.getAttribute( 'data-wp-on--click' )
		).toBe( 'actions.selectPreviousBenchStage' );
		expect(
			bench
				.querySelector( '.core-ai-map__bench-next' )
				.getAttribute( 'data-wp-on--click' )
		).toBe( 'actions.selectNextBenchStage' );

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
		expect( dialog.textContent ).toContain(
			'official WordPress Core AI artifact'
		);
		expect( dialog.textContent ).toContain(
			'dynamic, server-rendered WordPress block'
		);
		const feedback = dialog.querySelector( '.core-ai-map__feedback' );
		expect( feedback ).not.toBeNull();
		expect( feedback.querySelector( 'img' ).src ).toContain(
			'assets/qr/feedback.svg'
		);
		expect(
			feedback.querySelector( '.core-ai-map__feedback-url' ).textContent
		).toContain( 'https://docs.google.com/forms/' );
		expect(
			container.querySelector(
				'.core-ai-map__attract + .core-ai-map__feedback'
			)
		).toBeNull();
		expect(
			dialog.querySelector( '.core-ai-map__about-reviewed' ).textContent
		).toBe( 'Reviewed 14 Aug 2026' );
	} );

	it( 'keeps component details location-aware without overpromising depth', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup();
		const details = container.querySelector( '.core-ai-map__details' );
		const abilities = container.querySelector( '[id$="-panel-abilities"]' );
		const assistant = container.querySelector( '[id$="-panel-assistant"]' );

		expect( details.getAttribute( 'aria-label' ) ).toBe(
			'Component details'
		);
		expect(
			abilities.querySelector( '.core-ai-map__details-continuation' )
				.textContent
		).toContain( 'More details below' );
		expect(
			assistant.querySelector( '.core-ai-map__details-continuation' )
		).toBeNull();
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

	it( 'gates enhancement controls and renders recovery before hydration', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );
		for ( const selector of [
			'.core-ai-map__prompt',
			'.core-ai-map__attract-browse',
			'.core-ai-map__about-trigger',
		] ) {
			const control = container.querySelector( selector );
			expect( control.disabled ).toBe( true );
			expect( control.getAttribute( 'data-wp-bind--disabled' ) ).toBe(
				'state.isNotReady'
			);
		}

		const readiness = container.querySelector( '.core-ai-map__readiness' );
		expect( readiness.getAttribute( 'data-wp-bind--hidden' ) ).toBe(
			'state.isReady'
		);
		expect( readiness.textContent ).toContain( 'Starting interactive map' );
		expect( readiness.querySelector( 'a' ).textContent ).toBe(
			'Reload this page'
		);
		expect( readiness.querySelector( 'a' ).href ).toBe(
			'https://example.test/kiosk/'
		);
	} );

	it( 'exposes operational status without adding another persistent float', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );
		const about = container.querySelector( '.core-ai-map__about' );
		const warning = container.querySelector(
			'.core-ai-map__reset-warning'
		);

		expect(
			container.querySelector( '.core-ai-map__offline' ).textContent
		).toContain( 'Offline · exhibit still works' );
		expect( about.textContent ).toContain( 'Offline cache:' );
		expect( about.textContent ).toContain( 'Screen wake lock:' );
		expect(
			about.querySelector( '[data-wp-text="state.offlineCacheStatus"]' )
		).not.toBeNull();
		expect( warning.hidden ).toBe( true );
		expect( warning.getAttribute( 'role' ) ).toBe( 'status' );
		expect( warning.textContent ).toContain(
			'Returning to welcome in 10 seconds'
		);
		expect(
			warning
				.querySelector( 'button' )
				.getAttribute( 'data-wp-on--click' )
		).toBe( 'actions.keepExploring' );
		expect(
			container.querySelectorAll( '.core-ai-map__feedback' )
		).toHaveLength( 1 );
	} );

	it( 'seeds every hydrated action and operational label from PHP', () => {
		const context = renderDefaultContext();

		expect( context.labels ).toMatchObject( {
			applyLabel: 'Apply',
			appliedLabel: 'Applied',
			benchProgress: 'Stage %1$s of %2$s',
			offlinePreparing: 'Preparing',
			offlineNotEnabled: 'Not enabled',
			offlineReady: 'Ready',
			offlineUnavailable: 'Unavailable',
			wakeLockChecking: 'Checking',
			wakeLockNotSupported: 'Not supported',
			wakeLockPaused: 'Paused',
			wakeLockActive: 'Active',
			wakeLockUnavailable: 'Unavailable',
		} );
	} );

	it( 'gives every participant in every flow a role to explain', () => {
		const context = renderDefaultContext();
		const metadata = JSON.parse( readFileSync( metadataPath, 'utf8' ) );
		const roles = Object.fromEntries(
			metadata.attributes.panels.default.map( ( panel ) => [
				panel.id,
				panel.roles || {},
			] )
		);

		const missing = [];
		for ( const [ storyId, participants ] of Object.entries(
			context.participants
		) ) {
			for ( const cardId of participants ) {
				if ( ! roles[ cardId ]?.[ storyId ] ) {
					missing.push( `${ storyId }/${ cardId }` );
				}
			}
		}

		expect( missing ).toEqual( [] );

		// Every role states what it receives, does, passes on, and teaches.
		for ( const panelRoles of Object.values( roles ) ) {
			for ( const role of Object.values( panelRoles ) ) {
				for ( const key of [
					'receives',
					'does',
					'returns',
					'lesson',
				] ) {
					expect( typeof role[ key ] ).toBe( 'string' );
					expect( role[ key ].length ).toBeGreaterThan( 0 );
				}
			}
		}
	} );

	it( 'gives every flow a situation, takeaway, outcome, and numbered run', () => {
		const context = renderDefaultContext();

		expect( context.openingStory ).toBe( 'uses-ai' );
		expect( Object.keys( context.storyTakeaways ) ).toEqual( [
			'uses-ai',
			'uses-wp',
			'learns',
			'tests',
		] );
		for ( const takeaway of Object.values( context.storyTakeaways ) ) {
			expect( takeaway.length ).toBeGreaterThan( 0 );
		}
		expect( Object.keys( context.storySituations ) ).toEqual( [
			'uses-ai',
			'uses-wp',
			'learns',
			'tests',
		] );
		expect( Object.values( context.storySituations ) ).toEqual(
			expect.arrayContaining( [
				'A feature inside WordPress needs an AI-generated result.',
				'A person asks an outside assistant to check which booking times are available on this WordPress site.',
			] )
		);
		expect( context.storyOutcomes ).toEqual( {
			'uses-ai': 'WordPress requests an AI result',
			'uses-wp': 'An assistant checks booking availability in WordPress',
			learns: 'A coding agent receives WordPress guidance',
			tests: 'WordPress evaluates generated code',
		} );

		expect( context.storySteps ).toEqual( {
			'uses-ai': '1 → 2 → 3 → 4',
			'uses-wp': '1 → 2 → 3',
			learns: '1 → 2 → 3',
			tests: '1 → 2',
		} );
	} );

	it( 'presents every card through the same interaction pattern', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );

		// No card is a passive div wearing a card's clothes.
		expect(
			container.querySelectorAll( 'div.core-ai-map__actor-body' )
		).toHaveLength( 0 );

		const controls = [
			...container.querySelectorAll(
				'.core-ai-map__actor-body, .core-ai-map__block-body, .core-ai-map__provider-plugin-body'
			),
		];
		expect( controls ).toHaveLength( 12 );

		for ( const control of controls ) {
			expect( control.tagName ).toBe( 'BUTTON' );
			expect( control.getAttribute( 'data-wp-on--click' ) ).toBe(
				'actions.inspectCard'
			);
			expect( control.getAttribute( 'data-wp-bind--aria-label' ) ).toBe(
				'state.cardActionLabel'
			);
			expect( control.getAttribute( 'data-wp-bind--disabled' ) ).toBe(
				'state.isCardNotTappable'
			);
			expect(
				control.querySelector( '.core-ai-map__tap-cue' )
			).not.toBeNull();

			// Each control names a panel that actually exists.
			const panelId = control.getAttribute( 'aria-controls' );
			expect( container.querySelector( `#${ panelId }` ) ).not.toBeNull();
		}
	} );

	it( 'orders native card controls along every numbered flow', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );
		const controls = [
			...container.querySelectorAll(
				'.core-ai-map__actor-body, .core-ai-map__block-body, .core-ai-map__provider-plugin-body'
			),
		];
		const controlId = ( control ) => {
			const card = control.closest(
				'.core-ai-map__actor, .core-ai-map__block, .core-ai-map__provider-plugin'
			);
			if ( card.classList.contains( 'core-ai-map__provider-plugin' ) ) {
				return 'provider-plugin';
			}
			return card.className.match(
				/core-ai-map__(?:actor|block)--([a-z-]+)/
			)[ 1 ];
		};
		const order = controls.map( controlId );
		const flows = {
			'uses-ai': [
				'plugin',
				'client',
				'provider-plugin',
				'provider',
				'connectors',
			],
			'uses-wp': [ 'assistant', 'mcp', 'abilities' ],
			learns: [ 'skills', 'agent', 'task' ],
			tests: [ 'agent', 'bench' ],
		};

		for ( const expected of Object.values( flows ) ) {
			expect( order.filter( ( id ) => expected.includes( id ) ) ).toEqual(
				expected
			);
		}

		const allButtons = [ ...container.querySelectorAll( 'button' ) ];
		const applyIndex = allButtons.indexOf(
			container.querySelector( '.core-ai-map__workbench-apply' )
		);
		expect( applyIndex ).toBeGreaterThan(
			Math.max(
				...controls.map( ( control ) => allButtons.indexOf( control ) )
			)
		);
	} );

	it( 'opens each panel with the flow it was reached from', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );

		const client = container.querySelector(
			'#core-ai-map-test-panel-client'
		);
		const contextBlock = client.querySelector(
			'.core-ai-map__details-context'
		);

		expect(
			contextBlock.querySelector( '.core-ai-map__breadcrumb' ).textContent
		).toContain( 'WordPress uses AI' );
		expect( contextBlock.getAttribute( 'data-wp-bind--hidden' ) ).toBe(
			'state.isStoryNotSelected'
		);
		expect(
			contextBlock.querySelectorAll( '.core-ai-map__role dd' )
		).toHaveLength( 3 );
		expect(
			contextBlock.querySelector( '.core-ai-map__details-lesson' )
				.textContent
		).toContain( 'without integrating every external provider separately' );
		const titleId = 'core-ai-map-test-panel-client-title';
		expect( client.getAttribute( 'aria-labelledby' ) ).toBe( titleId );
		expect( client.querySelector( `#${ titleId }` ).tagName ).toBe( 'H2' );
		expect(
			client.querySelector( `#${ titleId }` ).textContent.trim()
		).toBe( 'AI Client' );
		expect(
			Array.from( client.querySelectorAll( 'h3' ) ).map( ( heading ) =>
				heading.textContent.trim()
			)
		).toEqual( [
			'Its role in this flow',
			'Why that matters',
			'What it is',
			'Under the hood',
			'Keep exploring',
		] );
		expect(
			Array.from( client.querySelectorAll( ':scope > h3' ) ).map(
				( heading ) => heading.textContent.trim()
			)
		).toEqual( [ 'What it is', 'Under the hood', 'Keep exploring' ] );

		const abilities = container.querySelector(
			'#core-ai-map-test-panel-abilities'
		);
		expect(
			Array.from( abilities.querySelectorAll( 'h3' ) )
				.map( ( heading ) => heading.textContent.trim() )
				.filter( ( heading ) => heading === 'Under the hood' )
		).toHaveLength( 1 );

		// The coding agent takes part in two flows and explains both.
		expect(
			container
				.querySelector( '#core-ai-map-test-panel-agent' )
				.querySelectorAll( '.core-ai-map__details-context' )
		).toHaveLength( 2 );
	} );

	it( 'keeps exactly one level-one heading, named, in every screen state', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );
		const headings = Array.from( container.querySelectorAll( 'h1' ) );

		expect( headings ).toHaveLength( 2 );
		const [ persistent, welcome ] = headings;

		// The welcome card owns the visible heading while the kiosk is on the
		// attract screen; the persistent one takes over for every state after.
		expect( welcome.closest( '.core-ai-map__attract' ) ).not.toBeNull();
		expect( persistent.className ).toBe( 'core-ai-map__sr-only' );

		// Both carry the name, so heading navigation never lands on a blank h1.
		expect( persistent.textContent.trim() ).toBe(
			'What is WordPress Core AI?'
		);
		expect( welcome.textContent.trim() ).toBe(
			persistent.textContent.trim()
		);

		/*
		 * The pair has to be mutually exclusive before hydration as well as
		 * after. Both bindings read client-only derived getters, which the
		 * server resolves to null, and `data-wp-bind` removes whatever it
		 * evaluates falsy. A plain `state.isAttract` here would therefore have
		 * its authored `hidden` stripped server-side and expose two level-one
		 * headings; the negation resolves null to true and keeps it hidden.
		 */
		expect( persistent.getAttribute( 'data-wp-bind--hidden' ) ).toBe(
			'!state.isNotAttract'
		);
		expect( persistent.hasAttribute( 'hidden' ) ).toBe( true );
		expect(
			welcome
				.closest( '.core-ai-map__attract' )
				.getAttribute( 'data-wp-bind--hidden' )
		).toBe( 'state.isNotAttract' );
	} );

	it( 'names both headings from the block default when the title is cleared', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'blank-title' );

		expect(
			Array.from( container.querySelectorAll( 'h1' ) ).map( ( heading ) =>
				heading.textContent.trim()
			)
		).toEqual( [
			'What is WordPress Core AI?',
			'What is WordPress Core AI?',
		] );
	} );

	it( 'teaches the interaction grammar on the welcome screen', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );
		const welcome = container.querySelector( '.core-ai-map__attract' );

		expect( welcome.querySelector( 'h1' ).textContent.trim() ).toBe(
			'What is WordPress Core AI?'
		);
		expect(
			welcome.querySelector( '.core-ai-map__intro' ).textContent
		).toContain( 'open building blocks' );
		expect(
			Array.from(
				welcome.querySelectorAll( '.core-ai-map__welcome-steps li' )
			).map( ( item ) => ( {
				number: item.querySelector( 'span' ).textContent,
				instruction: item.querySelector( 'strong' ).textContent,
			} ) )
		).toEqual( [
			{ number: '1', instruction: 'Start with one flow' },
			{ number: '2', instruction: 'Follow its numbered path' },
			{ number: '3', instruction: 'Open a highlighted component' },
		] );
		expect(
			Array.from(
				welcome.querySelectorAll( '.core-ai-map__legend-item' )
			).map( ( item ) => item.textContent.replace( /\s+/g, ' ' ).trim() )
		).toEqual( [
			'Solid arrow: active request or work',
			'Dashed line: configuration or reference',
			'Dimmed component: not part of this flow',
		] );
		expect(
			welcome.querySelector( '.core-ai-map__prompt' ).textContent
		).toContain( 'Start with WordPress uses AI' );
		expect(
			welcome
				.querySelector( '.core-ai-map__attract-browse' )
				.textContent.trim()
		).toBe( 'Browse all components' );
		const reducedMotionFlows = welcome.querySelector(
			'.core-ai-map__reduced-motion-flows'
		);
		expect( reducedMotionFlows ).not.toBeNull();
		expect(
			Array.from( reducedMotionFlows.querySelectorAll( 'li' ) ).map(
				( item ) => item.textContent.trim()
			)
		).toEqual( [
			'WordPress uses AI',
			'AI uses WordPress',
			'An agent learns WordPress',
			'WordPress tests the result',
		] );
		expect( styleSource ).toMatch(
			/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.core-ai-map__reduced-motion-flows\s*\{[\s\S]*?display:\s*flex/
		);
	} );

	it( 'makes the neutral map teach one location and status taxonomy', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );
		const canvas = container.querySelector( '.core-ai-map__canvas' );
		const cards = Array.from(
			canvas.querySelectorAll(
				':scope > .core-ai-map__actor, :scope > .core-ai-map__block, :scope > .core-ai-map__provider-plugin'
			)
		).map( ( card ) => JSON.parse( card.dataset.testContext ).cardId );

		expect( canvas.textContent ).toContain( 'Outside WordPress' );
		expect( canvas.textContent ).toContain( 'WordPress boundary' );
		expect( canvas.textContent ).toContain(
			'Evaluation · separate from live requests'
		);
		expect( cards ).toEqual( [
			'assistant',
			'skills',
			'agent',
			'task',
			'mcp',
			'plugin',
			'client',
			'provider-plugin',
			'provider',
			'connectors',
			'abilities',
			'bench',
		] );

		const expected = {
			abilities: [ 'Inside WordPress', 'WordPress Core API · since 6.9' ],
			client: [ 'Inside WordPress', 'WordPress Core API · since 7.0' ],
			connectors: [
				'Inside WordPress',
				'WordPress Core API · since 7.0',
			],
			plugin: [ 'Inside WordPress', 'Experimental plugin · not in Core' ],
			mcp: [ 'WordPress boundary', 'WordPress plugin · not in Core' ],
			bench: [
				'Evaluation · separate from live requests',
				'Core AI project · not in Core',
			],
			skills: [ 'Outside WordPress', 'Core AI project · not in Core' ],
			assistant: [
				'Outside WordPress',
				'External assistant · not WordPress',
			],
			agent: [
				'Outside WordPress',
				'External coding agent · not WordPress',
			],
			provider: [
				'Outside WordPress',
				'External AI service · not WordPress',
			],
			task: [ 'Outside WordPress', 'Code artifact · not installed' ],
			'provider-plugin': [
				'Inside WordPress',
				'Provider plugin · not in Core',
			],
		};
		for ( const [ id, values ] of Object.entries( expected ) ) {
			const rows = Array.from(
				container.querySelectorAll(
					`[id$="-panel-${ id }"] .core-ai-map__details-meta dd`
				)
			).map( ( row ) => row.textContent.trim() );
			expect( rows ).toEqual( values );
		}
	} );

	it( 'labels the flow controls and premises in the open', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );

		const rail = container.querySelector( '.core-ai-map__rail' );
		const railLabel = rail.querySelector( '.core-ai-map__rail-label' );

		expect( railLabel.textContent.trim() ).toBe( 'Choose a flow' );
		expect( railLabel.getAttribute( 'data-wp-text' ) ).toBe(
			'state.railLabel'
		);
		expect( rail.getAttribute( 'aria-labelledby' ) ).toBe(
			railLabel.getAttribute( 'id' )
		);
		expect(
			container.querySelector( '.core-ai-map__browse' ).textContent.trim()
		).toBe( 'Browse all components' );

		const guidance = container.querySelector( '.core-ai-map__guidance' );
		expect( guidance.closest( '.core-ai-map__topbar' ) ).not.toBeNull();
		expect( guidance.hidden ).toBe( true );

		expect(
			Array.from(
				rail.querySelectorAll( '.core-ai-map__rail-outcome' )
			).map( ( outcome ) => outcome.textContent.trim() )
		).toEqual( [
			'WordPress requests an AI result',
			'An assistant checks booking availability in WordPress',
			'A coding agent receives WordPress guidance',
			'WordPress evaluates generated code',
		] );

		const situations = [
			...container.querySelectorAll( '.core-ai-map__situation' ),
		];
		expect( situations ).toHaveLength( 4 );
		expect( situations[ 0 ].textContent ).toContain(
			'A feature inside WordPress needs an AI-generated result.'
		);

		const takeaways = [
			...container.querySelectorAll( '.core-ai-map__takeaway' ),
		];
		expect( takeaways ).toHaveLength( 4 );
		for ( const takeaway of takeaways ) {
			expect( takeaway.querySelector( 'strong' ).textContent ).toBe(
				'What this flow shows'
			);
			expect( takeaway.getAttribute( 'data-wp-bind--hidden' ) ).toBe(
				'state.isTakeawayHidden'
			);
		}
	} );

	it( 'shows the complete AI uses WordPress transaction and optional walkthrough', () => {
		const container = document.createElement( 'div' );
		container.innerHTML = renderLegacyMarkup( 'current' );

		expect(
			Array.from(
				container.querySelectorAll( '.core-ai-map__token' )
			).map( ( token ) => token.textContent.trim() )
		).toEqual( [
			'MCP call',
			'Get availability',
			'Available times or refusal',
		] );

		const expected = {
			assistant: {
				progress: 'Step 1 of 3',
				action: 'Next: how the MCP Adapter translates it',
				nextCardId: 'mcp',
			},
			mcp: {
				progress: 'Step 2 of 3',
				action: 'Next: where WordPress checks permission',
				nextCardId: 'abilities',
			},
			abilities: {
				progress: 'Step 3 of 3',
				action: 'Return to AI uses WordPress',
				nextCardId: undefined,
			},
		};

		for ( const [ panelId, contract ] of Object.entries( expected ) ) {
			const panel = container.querySelector(
				`#core-ai-map-test-panel-${ panelId }`
			);
			const flowContext = Array.from(
				panel.querySelectorAll( '.core-ai-map__details-context' )
			).find(
				( item ) =>
					JSON.parse( item.dataset.testContext ).storyId === 'uses-wp'
			);
			const action = flowContext.querySelector(
				'.core-ai-map__details-next'
			);
			const localContext = JSON.parse( flowContext.dataset.testContext );

			expect(
				flowContext
					.querySelector( '.core-ai-map__details-progress' )
					.textContent.trim()
			).toBe( contract.progress );
			expect( action.textContent.trim() ).toBe( contract.action );
			expect( localContext.nextCardId ).toBe( contract.nextCardId );
			expect( action.getAttribute( 'data-wp-on--click' ) ).toBe(
				panelId === 'abilities'
					? 'actions.closeInspect'
					: 'actions.inspectNextCard'
			);
		}

		const firstStoryHandoff = Array.from(
			container.querySelectorAll( '.core-ai-map__story-flow' )
		).find(
			( flow ) =>
				JSON.parse( flow.dataset.testContext ).storyId === 'uses-ai'
		);
		expect(
			firstStoryHandoff.querySelector( '.core-ai-map__story-next' )
				.textContent
		).toContain( 'Now see AI use WordPress' );
	} );

	it( 'keeps the transaction result and walkthrough controls legible with or without motion', () => {
		expect( styleSource ).toContain(
			'animation: core-ai-map-token-result 2.8s'
		);
		expect( styleSource ).toContain(
			'@keyframes core-ai-map-token-result'
		);
		expect( styleSource ).toMatch(
			/&__token[\s\S]*&--result\s*\{[\s\S]*Available times or refusal|&__token[\s\S]*&--result\s*\{/
		);
		expect( styleSource ).toContain( '&__details-next {' );

		const reducedMotion = styleSource.slice(
			styleSource.indexOf( '@media (prefers-reduced-motion: reduce)' )
		);
		expect( reducedMotion ).toMatch(
			/\.core-ai-map__token--call[\s\S]*opacity:\s*1/
		);
		expect( reducedMotion ).toMatch(
			/\.core-ai-map__token--ability[\s\S]*opacity:\s*1/
		);
		expect( reducedMotion ).toMatch(
			/\.core-ai-map__token--result[\s\S]*opacity:\s*1/
		);
	} );
} );
