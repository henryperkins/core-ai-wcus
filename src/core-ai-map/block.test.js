import fs from 'node:fs';
import path from 'node:path';

const metadata = JSON.parse(
	fs.readFileSync( path.resolve( __dirname, 'block.json' ), 'utf8' )
);
const { attributes } = metadata;

describe( 'Living Block Map v3.1.3 metadata', () => {
	it( 'identifies the block as Living Block Map v3.1.3', () => {
		expect( metadata.title ).toBe( 'Core AI Living Block Map' );
		expect( metadata.version ).toBe( '3.1.3' );
	} );

	it( 'sets the reviewed date used by the kiosk header', () => {
		expect( attributes.reviewedDate ).toEqual( {
			type: 'string',
			default: 'Reviewed 12 Aug 2026',
		} );
	} );

	it( 'includes the WordPress task as the fifth outside actor', () => {
		const actors = attributes.actors.default;

		expect( actors ).toHaveLength( 5 );
		expect( actors ).toContainEqual( {
			id: 'task',
			name: 'A WordPress task',
			tagline: 'Plugin or theme work',
			badge: 'Not WordPress',
		} );
	} );

	it( 'explains that Skills guide a coding agent before its task runs outside WordPress', () => {
		const learns = attributes.stories.default.find(
			( story ) => story.id === 'learns'
		);

		expect( learns.copy ).toBe(
			'Agent Skills attaches current WordPress guidance to a coding agent, which then starts the task. All of this happens outside the site — nothing inside WordPress runs.'
		);
	} );

	it( 'separates the AI request path from Connectors configuration', () => {
		const connectors = attributes.blocks.default.find(
			( block ) => block.id === 'connectors'
		);
		const provider = attributes.actors.default.find(
			( actor ) => actor.id === 'provider'
		);
		const story = attributes.stories.default.find(
			( candidate ) => candidate.id === 'uses-ai'
		);
		const clientPanel = attributes.panels.default.find(
			( panel ) => panel.id === 'client'
		);
		const connectorsPanel = attributes.panels.default.find(
			( panel ) => panel.id === 'connectors'
		);

		expect( connectors.tagline ).toBe(
			'Configure provider plugins and credentials'
		);
		expect( provider ).toMatchObject( {
			name: 'External AI service',
			tagline: 'Selected from site configuration',
		} );
		expect( story.copy ).toBe(
			'A plugin asks the AI Client for a capability. The Client routes through a configured provider plugin to an external AI service; Connectors supplies discovery, configuration, and credentials beside the request path.'
		);
		expect( clientPanel.lede ).toContain(
			'routes through an installed provider plugin'
		);
		expect( connectorsPanel.lede ).toContain(
			'It supports the request path; it is not the request executor.'
		);
	} );

	it( 'describes WordPress 7.1 work as scheduled while the exhibit runs 7.0', () => {
		const abilities = attributes.panels.default.find(
			( panel ) => panel.id === 'abilities'
		);
		const copy = abilities.notes.map( ( note ) => note.text ).join( ' ' );

		expect( copy ).toContain(
			'scheduled for WordPress 7.1 on August 19, 2026'
		);
		expect( copy ).toContain( 'this exhibit runs WordPress 7.0' );
		expect( copy ).not.toContain( 'ships 19 August' );
	} );

	it( 'uses the seven canonical panel destinations', () => {
		const hrefs = Object.fromEntries(
			attributes.panels.default.map( ( panel ) => [
				panel.id,
				panel.href,
			] )
		);

		expect( hrefs ).toEqual( {
			abilities: 'https://developer.wordpress.org/apis/abilities-api/',
			client: 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/',
			connectors:
				'https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/',
			plugin: 'https://wordpress.org/plugins/ai/',
			mcp: 'https://github.com/WordPress/mcp-adapter',
			bench: 'https://github.com/WordPress/wp-bench',
			skills: 'https://github.com/WordPress/agent-skills',
		} );
	} );

	it( 'assigns each panel a stable local QR asset filename', () => {
		const qrAssets = Object.fromEntries(
			attributes.panels.default.map( ( panel ) => [ panel.id, panel.qr ] )
		);

		expect( qrAssets ).toEqual( {
			abilities: 'qr/abilities.svg',
			client: 'qr/client.svg',
			connectors: 'qr/connectors.svg',
			plugin: 'qr/plugin.svg',
			mcp: 'qr/mcp.svg',
			bench: 'qr/bench.svg',
			skills: 'qr/skills.svg',
		} );
	} );

	it( 'labels the MCP Adapter as a plugin outside Core', () => {
		const card = attributes.blocks.default.find(
			( block ) => block.id === 'mcp'
		);
		const panel = attributes.panels.default.find(
			( candidate ) => candidate.id === 'mcp'
		);

		expect( card.badge ).toBe( 'WordPress plugin · not in Core' );
		expect( panel.badge ).toBe( 'WordPress plugin · not in Core' );
	} );

	it( 'uses the v3.1 execution-only framing for WP-Bench', () => {
		const card = attributes.blocks.default.find(
			( block ) => block.id === 'bench'
		);
		const story = attributes.stories.default.find(
			( candidate ) => candidate.id === 'tests'
		);
		const panel = attributes.panels.default.find(
			( candidate ) => candidate.id === 'bench'
		);

		expect( card.name ).toBe( 'WP-Bench' );
		expect( card.tagline ).toBe(
			'See whether the code an agent writes actually runs'
		);
		expect( story.copy ).toBe(
			'WP-Bench runs what the agent produced inside a sandboxed WordPress, and WordPress itself decides whether it passed. Evidence, not vibes.'
		);
		expect( panel.title ).toBe( 'WP-Bench' );
		expect( panel.lede ).toBe(
			'A test bench, not part of any live request. It measures whether the code an agent writes for WordPress actually runs.'
		);
		expect( panel.notes ).toEqual( [
			{
				heading: 'Under the hood',
				text: 'One suite, one dimension: 185 execution tests, each a PHP snippet, run inside a real WordPress 7.0 — and WordPress itself runs the assertions that grade it. Passing is all-or-nothing: two of three assertions is a fail. Static analysis only diagnoses, unless the code trips a forbidden pattern. A separate audit throws trivial cheats at each test — an empty function, a bare return — and flags any test a cheat can satisfy.',
			},
		] );
	} );
} );
