import fs from 'node:fs';
import path from 'node:path';

const metadata = JSON.parse(
	fs.readFileSync( path.resolve( __dirname, 'block.json' ), 'utf8' )
);
const { attributes } = metadata;

describe( 'Living Block Map v3.2.2 metadata', () => {
	it( 'identifies the block as Living Block Map v3.2.2', () => {
		expect( metadata.title ).toBe( 'Core AI Living Block Map' );
		expect( metadata.version ).toBe( '3.2.2' );
	} );

	it( 'sets the reviewed date used by the About panel', () => {
		expect( attributes.reviewedDate ).toEqual( {
			type: 'string',
			default: 'Reviewed 14 Aug 2026',
		} );
	} );

	it( 'opens with the approved orientation, instructions, and legend language', () => {
		expect( attributes.title.default ).toBe( 'What is WordPress Core AI?' );
		expect( attributes.intro.default ).toBe(
			'WordPress Core AI is a set of open building blocks that let WordPress use AI services and work with outside assistants—without tying WordPress to one provider.\n\nExplore four flows to see what happens inside WordPress, what happens outside it, and how the projects connect.'
		);
		expect( attributes.prompt.default ).toBe( 'Explore the first flow' );
		expect( attributes.labels.default ).toMatchObject( {
			railEmptyLabel: 'Choose a flow',
			railActiveLabel: 'Choose another flow',
			lessonHeading: 'Why that matters',
			definitionHeading: 'What it is',
			technicalHeading: 'Under the hood',
			exploreHeading: 'Keep exploring',
		} );
		expect( attributes.guidance.default.flow ).toBe(
			'Follow %1$s. Highlighted components take part in this flow. Tap one to learn what it contributes.'
		);
		expect( attributes.guidance.default ).toMatchObject( {
			cardActionStep: 'Step %1$s: %2$s — view its role in “%3$s.”',
			cardInactive: '%1$s — not part of this flow.',
		} );
	} );

	it( 'gives every flow a situation, conclusion, and predicted outcome', () => {
		const stories = Object.fromEntries(
			attributes.stories.default.map( ( story ) => [ story.id, story ] )
		);

		expect( stories[ 'uses-ai' ] ).toMatchObject( {
			situation:
				'A feature inside WordPress needs an AI-generated result.',
			outcome: 'WordPress requests an AI result',
			takeaway:
				'A WordPress feature uses a common AI interface instead of integrating directly with every provider. Provider configuration supports the request, while the AI service remains outside WordPress.',
		} );
		expect( stories[ 'uses-wp' ] ).toMatchObject( {
			situation:
				'An outside assistant asks WordPress to perform an allowed action.',
			outcome: 'An assistant requests a WordPress action',
			takeaway:
				'The assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions.',
		} );
		expect( stories.learns ).toMatchObject( {
			situation:
				'A coding agent receives WordPress-specific guidance before writing code.',
			outcome: 'A coding agent receives WordPress guidance',
			takeaway:
				'Agent Skills changes the information available to the coding agent. Nothing runs on the WordPress site during this flow.',
		} );
		expect( stories.tests ).toMatchObject( {
			situation:
				'Code written by an agent needs to be tested against real WordPress behavior.',
			outcome: 'WordPress evaluates generated code',
			takeaway:
				"The generated code runs in a disposable WordPress environment and is judged by WordPress tests, not by another model's opinion.",
		} );
	} );

	it( 'no longer carries the retired kiosk-header hint', () => {
		expect( attributes.hint ).toBeUndefined();
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

	it( 'dates WordPress 7.1 while telling visitors the exhibit already runs it', () => {
		const abilities = attributes.panels.default.find(
			( panel ) => panel.id === 'abilities'
		);
		const copy = abilities.notes.map( ( note ) => note.text ).join( ' ' );

		expect( copy ).toContain(
			'arrive in WordPress 7.1 on August 19, 2026'
		);
		expect( copy ).toContain( 'runs a 7.1 release candidate' );
		expect( copy ).not.toContain( 'ships 19 August' );
		expect( copy ).not.toContain( 'this exhibit runs WordPress 7.0' );
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
		expect( panel.notes[ 0 ].text ).toContain(
			'supports multiple MCP protocol versions'
		);
		expect( panel.notes[ 0 ].text ).toContain(
			'HTTP transport implements MCP 2025-11-25'
		);
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
		expect( panel.notes[ 0 ].text ).toContain(
			'code generation tasks graded by static checks and runtime assertions in a real WordPress environment'
		);
		expect( panel.notes[ 0 ].text ).toContain( 'check-reference-solution' );
		expect( panel.notes[ 0 ].text ).toContain( 'check-exploits' );
		expect( panel.notes[ 0 ].text ).not.toMatch( /\b185\b/ );
	} );
} );
