import fs from 'node:fs';
import path from 'node:path';

const metadata = JSON.parse(
	fs.readFileSync( path.resolve( __dirname, 'block.json' ), 'utf8' )
);
const { attributes } = metadata;

describe( 'Living Block Map v3.2.5 metadata', () => {
	it( 'identifies the block as Living Block Map v3.2.5', () => {
		expect( metadata.title ).toBe( 'Core AI Living Block Map' );
		expect( metadata.version ).toBe( '3.2.5' );
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
			'WordPress Core AI is a set of open building blocks that let WordPress use AI services and let outside assistants work with WordPress—without tying either direction to one provider.\n\nBadges show what ships in WordPress Core, what is installed as a plugin or project, and what stays outside WordPress. Choose one flow, follow its numbered path, then open a highlighted component.'
		);
		expect( attributes.prompt.default ).toBe(
			'Start with WordPress uses AI'
		);
		expect( attributes.labels.default ).toMatchObject( {
			railEmptyLabel: 'Choose a flow',
			railActiveLabel: 'Choose another flow',
			browseDescription:
				'Start with AI Client. Compare what ships in Core, what is installed as a plugin or project, and what stays outside WordPress.',
			lessonHeading: 'Why that matters',
			definitionHeading: 'What it is',
			technicalHeading: 'Under the hood',
			exploreHeading: 'Keep exploring',
		} );
		expect( attributes.guidance.default.flow ).toBe(
			'Follow %1$s. Highlighted components take part in this flow. Tap one to learn what it contributes.'
		);
		expect( attributes.guidance.default ).toMatchObject( {
			browse: 'Open any component to learn what it is and where it belongs.',
			cardActionStep: 'Step %1$s: %2$s — view its role in “%3$s.”',
			cardInactive: '%1$s — not part of this flow.',
			// A quiet card stays pressable, so it never borrows the sentence
			// written for a card that cannot answer.
			cardQuiet: '%1$s — what “%2$s” is about. Open its details.',
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
			nextLabel: 'Now see AI use WordPress',
		} );
		expect( stories[ 'uses-wp' ] ).toMatchObject( {
			situation:
				'A person asks an outside assistant to check which booking times are available on this WordPress site.',
			copy: 'A person asks an outside assistant for available booking times. Acting as a specific WordPress user, the assistant sends an MCP call for the example bookings/get-availability ability. The MCP Adapter plugin translates that call; Core’s Abilities API validates the input, calls the ability’s permission check, and returns available times or a refusal.',
			outcome: 'An assistant checks booking availability in WordPress',
			takeaway:
				'The MCP Adapter is a plugin at the WordPress boundary, not part of Core, and only translates. Site or plugin code registers the example bookings/get-availability ability. Core’s Abilities API validates its input and permission before WordPress runs it and returns available times—or returns a refusal.',
		} );
		expect( stories.learns ).toMatchObject( {
			situation:
				'A coding agent receives WordPress-specific guidance before writing code.',
			outcome: 'A coding agent receives WordPress guidance',
			takeaway:
				'The guidance is about the Core AI surfaces themselves — abilities, the AI Client, the MCP Adapter. It changes what the agent writes, never what the site runs: the code only reaches WordPress when a person installs it.',
			nextLabel: 'See how that code is tested',
		} );
		expect( stories.tests ).toMatchObject( {
			situation:
				'Code written by an agent needs to be tested against real WordPress behavior.',
			outcome: 'WordPress evaluates generated code',
			takeaway:
				"The generated code runs in a disposable WordPress environment and is judged by WordPress tests, not by another model's opinion.",
		} );
	} );

	it( 'uses one booking transaction to distinguish the assistant, adapter, and Core API', () => {
		const panels = Object.fromEntries(
			attributes.panels.default.map( ( panel ) => [ panel.id, panel ] )
		);

		expect( panels.assistant.roles[ 'uses-wp' ] ).toEqual( {
			receives:
				'A person’s request to check available booking times, outside WordPress.',
			does: 'Acts as a specific WordPress user and sends an MCP call for the example bookings/get-availability ability.',
			returns:
				'The available times WordPress allows that user to receive, or a refusal.',
			lesson: 'The assistant is an outside client, not an authority. Its WordPress user sets the outer limit, and the ability still checks permission.',
		} );
		expect( panels.mcp.roles[ 'uses-wp' ] ).toEqual( {
			receives:
				'An MCP call asking for the example bookings/get-availability ability.',
			does: 'Translates the MCP request into a WordPress ability request and hands it to WordPress.',
			returns:
				'The available times or refusal from WordPress, translated back into MCP.',
			lesson: 'The MCP Adapter is a WordPress plugin, not part of Core. It translates at the boundary; it does not create the ability or grant permission.',
		} );
		expect( panels.abilities.roles[ 'uses-wp' ] ).toEqual( {
			receives:
				'The translated bookings/get-availability request and its date range.',
			does: 'Validates the input, calls the ability’s permission callback for the current WordPress user, then runs the registered callback when allowed.',
			returns: 'Available booking times, or a refusal.',
			lesson: 'The Abilities API is the Core execution contract. Site or plugin code registers this example action and decides who may run it.',
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
			name: 'Code for this site',
			tagline: 'A plugin, block, or ability registration',
			badge: 'Still outside',
		} );
	} );

	it( 'explains that Skills guide a coding agent before its task runs outside WordPress', () => {
		const learns = attributes.stories.default.find(
			( story ) => story.id === 'learns'
		);

		expect( learns.copy ).toBe(
			'Agent Skills attaches current WordPress guidance to a coding agent, which writes code for this site. All of this happens outside the site — nothing inside WordPress runs.'
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
			'code generation tasks, graded by runtime assertions in a real WordPress environment'
		);
		expect( panel.notes[ 0 ].text ).toContain(
			'Static checks sit alongside as a diagnostic'
		);
		expect( panel.notes[ 0 ].text ).toContain( 'check-reference-solution' );
		expect( panel.notes[ 0 ].text ).toContain( 'check-exploits' );
		expect( panel.notes[ 0 ].text ).not.toMatch( /\b185\b/ );
	} );
} );
