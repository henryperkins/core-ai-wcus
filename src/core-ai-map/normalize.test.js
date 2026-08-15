import currentMetadata from './block.json';
import legacyMetadata from './fixtures/block-v0.2.json';
import { withCurrentDefault, withCurrentDefaults } from './normalize';

describe( 'editor copy normalization', () => {
	it( 'upgrades only exact legacy welcome defaults', () => {
		expect(
			withCurrentDefault(
				currentMetadata,
				'title',
				'How do WordPress and AI work together?'
			)
		).toBe( 'What is WordPress Core AI?' );
		expect(
			withCurrentDefault(
				currentMetadata,
				'intro',
				'Choose a flow, follow the numbered path, then tap a highlighted component to understand its role.'
			)
		).toContain( 'set of open building blocks' );
		expect(
			withCurrentDefault(
				currentMetadata,
				'title',
				'A custom exhibit heading'
			)
		).toBe( 'A custom exhibit heading' );
		expect(
			withCurrentDefault(
				currentMetadata,
				'reviewedDate',
				'Reviewed 12 Aug 2026'
			)
		).toBe( 'Reviewed 14 Aug 2026' );
		expect(
			withCurrentDefault(
				currentMetadata,
				'reviewedDate',
				'Reviewed after a custom audit'
			)
		).toBe( 'Reviewed after a custom audit' );
	} );

	it( 'keeps the current MCP transport version when upgrading v3.2.0 copy', () => {
		const panels = withCurrentDefaults( currentMetadata, 'panels', [
			{
				...currentMetadata.attributes.panels.default.find(
					( item ) => item.id === 'mcp'
				),
				notes: [
					{
						heading: 'Under the hood',
						text: 'An official WordPress package installed as a plugin, not part of Core: HTTP and STDIO transports against the MCP specification the adapter currently targets (2025-11-25), configurable servers, validation, permission checks, error handling, and observability. Today it answers calls; it does not make them. It does not create the underlying action, and it is not the model — WordPress still owns execution.',
					},
				],
			},
		] );

		expect(
			panels.find( ( item ) => item.id === 'mcp' ).notes[ 0 ].text
		).toBe(
			currentMetadata.attributes.panels.default.find(
				( item ) => item.id === 'mcp'
			).notes[ 0 ].text
		);
	} );

	it( 'upgrades untouched v0.2 defaults to the v3.1.1 editor copy', () => {
		const blocks = withCurrentDefaults(
			currentMetadata,
			'blocks',
			legacyMetadata.attributes.blocks.default
		);
		const stories = withCurrentDefaults(
			currentMetadata,
			'stories',
			legacyMetadata.attributes.stories.default
		);
		const panels = withCurrentDefaults(
			currentMetadata,
			'panels',
			legacyMetadata.attributes.panels.default
		);

		expect( blocks.find( ( item ) => item.id === 'bench' ) ).toMatchObject(
			{
				name: 'WP-Bench',
				tagline: 'See whether the code an agent writes actually runs',
			}
		);
		expect( stories.find( ( item ) => item.id === 'learns' ).copy ).toBe(
			'Agent Skills attaches current WordPress guidance to a coding agent, which then starts the task. All of this happens outside the site — nothing inside WordPress runs.'
		);
		expect( panels.find( ( item ) => item.id === 'bench' ) ).toMatchObject(
			{
				title: 'WP-Bench',
				lede: 'A test bench, not part of any live request. It measures whether the code an agent writes for WordPress actually runs.',
			}
		);
	} );

	it( 'restores new items and canonical product-owned fields', () => {
		const actors = withCurrentDefaults(
			currentMetadata,
			'actors',
			legacyMetadata.attributes.actors.default
		);
		const panels = withCurrentDefaults(
			currentMetadata,
			'panels',
			legacyMetadata.attributes.panels.default.map( ( panel ) => ( {
				...panel,
				href: 'https://legacy.example/',
				qr: '',
			} ) )
		);

		expect( actors.find( ( item ) => item.id === 'task' ) ).toMatchObject( {
			name: 'A WordPress task',
			tagline: 'Plugin or theme work',
		} );
		expect( panels.find( ( item ) => item.id === 'mcp' ) ).toMatchObject( {
			badge: 'WordPress plugin · not in Core',
			href: 'https://github.com/WordPress/mcp-adapter',
			qr: 'qr/mcp.svg',
		} );
	} );

	it( 'preserves visitor-authored copy that differs from the old default', () => {
		const customStories = legacyMetadata.attributes.stories.default.map(
			( story ) =>
				story.id === 'tests'
					? { ...story, copy: 'A custom kiosk explanation.' }
					: story
		);
		const stories = withCurrentDefaults(
			currentMetadata,
			'stories',
			customStories
		);

		expect( stories.find( ( item ) => item.id === 'tests' ).copy ).toBe(
			'A custom kiosk explanation.'
		);
	} );

	it( 'upgrades untouched pre-booth v3.1.1 architecture and release copy', () => {
		const blocks = withCurrentDefaults( currentMetadata, 'blocks', [
			{
				...currentMetadata.attributes.blocks.default.find(
					( item ) => item.id === 'connectors'
				),
				tagline: 'Connect WordPress to providers and services',
			},
		] );
		const actors = withCurrentDefaults( currentMetadata, 'actors', [
			{
				id: 'provider',
				name: 'AI provider',
				tagline: 'The site owner’s choice',
				badge: 'Not WordPress',
			},
		] );
		const stories = withCurrentDefaults( currentMetadata, 'stories', [
			{
				...currentMetadata.attributes.stories.default.find(
					( item ) => item.id === 'uses-ai'
				),
				copy: 'A plugin asks the AI Client for a capability. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.',
			},
		] );
		const panels = withCurrentDefaults( currentMetadata, 'panels', [
			{
				...currentMetadata.attributes.panels.default.find(
					( item ) => item.id === 'abilities'
				),
				notes: [
					{
						heading: 'Under the hood',
						text: 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. One public flag for client exposure, filtering in wp_get_abilities(), and filters around execution are landing in WordPress 7.1, which ships 19 August 2026 — read the Anatomy panel as forward-looking until then.',
					},
				],
			},
			{
				...currentMetadata.attributes.panels.default.find(
					( item ) => item.id === 'client'
				),
				lede: 'A plugin asks for a capability and the kind of result it needs. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.',
			},
			{
				...currentMetadata.attributes.panels.default.find(
					( item ) => item.id === 'connectors'
				),
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
			},
		] );

		expect(
			blocks.find( ( item ) => item.id === 'connectors' ).tagline
		).toBe( 'Configure provider plugins and credentials' );
		expect(
			actors.find( ( item ) => item.id === 'provider' )
		).toMatchObject( {
			name: 'External AI service',
			tagline: 'Selected from site configuration',
		} );
		expect(
			stories.find( ( item ) => item.id === 'uses-ai' ).copy
		).toContain( 'provider plugin' );
		expect(
			panels.find( ( item ) => item.id === 'abilities' ).notes[ 0 ].text
		).toContain( 'arrive in WordPress 7.1 on August 19, 2026' );
		expect(
			panels.find( ( item ) => item.id === 'client' ).lede
		).toContain( 'installed provider plugin' );
		expect(
			panels.find( ( item ) => item.id === 'connectors' )
		).toMatchObject( {
			lede: expect.stringContaining( 'not the request executor' ),
			notes: [
				{
					heading: 'Providers',
					text: expect.stringContaining( 'auto-discovers them' ),
				},
				{
					heading: 'Under the hood',
					text: expect.any( String ),
				},
			],
		} );
	} );

	it( 'preserves custom pre-booth copy instead of replacing it', () => {
		const stories = withCurrentDefaults( currentMetadata, 'stories', [
			{
				id: 'uses-ai',
				title: 'WordPress uses AI',
				copy: 'A custom explanation of the provider path.',
			},
		] );

		expect( stories.find( ( item ) => item.id === 'uses-ai' ).copy ).toBe(
			'A custom explanation of the provider path.'
		);
	} );
} );
