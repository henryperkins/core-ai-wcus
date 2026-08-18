const LEGACY_DEFAULTS = {
	blocks: {
		plugin: { badge: 'Experimental plugin' },
		mcp: { badge: 'Open adapter' },
		bench: {
			name: 'WP Bench',
			tagline: 'Test how well agents perform WordPress work',
		},
	},
	stories: {
		'uses-ai': {
			copy: 'A plugin asks for a capability. The AI Client routes the request, and Connectors decides which provider the site is allowed to reach.',
		},
		learns: {
			copy: 'Agent Skills attaches current WordPress guidance to a coding assistant before it starts work. This happens outside the site — nothing inside WordPress runs.',
		},
		tests: {
			copy: 'WP Bench runs what the agent produced inside a sandboxed WordPress and grades it. Evidence, not a leaderboard.',
		},
	},
	panels: {
		abilities: {
			notes: [
				{
					heading: 'Under the hood',
					text: 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion.',
				},
			],
		},
		client: {
			lede: 'A plugin describes the capability and the kind of result it needs. WordPress routes the request to a suitable model from a provider the site owner has connected.',
			notes: [
				{
					heading: 'Under the hood',
					text: 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly.',
				},
			],
		},
		connectors: {
			lede: 'Where a site owner connects WordPress to outside services. Connectors handles discovery, credentials, connection status, and approvals — so the site decides what AI it can reach.',
			notes: [
				{
					heading: 'Providers',
					text: 'Provider plugins register themselves with the AI Client and appear under Settings → Connectors. The map stays vendor-neutral: no provider owns a position on the canvas.',
				},
				{
					heading: 'Under the hood',
					text: 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.',
				},
			],
		},
		plugin: {
			lede: 'Where the foundations become things people can use: alt text, summaries, titles, editorial notes, image generation. Every feature is opt-in and manually triggered.',
			notes: [
				{
					heading: 'Under the hood',
					text: 'Also a reference implementation: it shows plugin authors how Abilities, the AI Client, and Connectors fit together, including connector approvals, request logging, and key encryption.',
				},
			],
		},
		mcp: {
			badge: 'Open adapter',
			lede: 'Translation at the edge of the site. It exposes eligible abilities to authorized outside assistants as MCP tools, resources, and prompts — and translates their calls back into WordPress work.',
			notes: [
				{
					heading: 'Under the hood',
					text: 'HTTP and STDIO transports, configurable servers, validation, permission checks, error handling, and observability. It does not create the underlying action, and it is not the model — WordPress still owns execution.',
				},
			],
		},
		bench: {
			title: 'WP Bench',
			lede: 'A test bench, not part of any live request. It measures what an agent knows about WordPress and whether the code it writes actually runs.',
			notes: [
				{
					heading: 'Under the hood',
					text: 'Two dimensions: knowledge of WordPress concepts, APIs, security practices and standards; and execution — generated code run in a real WordPress environment and graded by static analysis and runtime assertions. Dataset size and version coverage are still limited.',
				},
			],
		},
		skills: {
			notes: [
				{
					heading: 'Under the hood',
					text: 'Covers blocks, themes, plugins, REST, the Interactivity API, Abilities, performance, and security. Installable for several coding assistants, or committed alongside an individual project.',
				},
			],
		},
	},
};

const PRE_BOOTH_V311_DEFAULTS = {
	blocks: {
		connectors: {
			tagline: 'Connect WordPress to providers and services',
		},
	},
	actors: {
		provider: {
			name: 'AI provider',
			tagline: 'The site owner’s choice',
		},
	},
	stories: {
		'uses-ai': {
			copy: 'A plugin asks the AI Client for a capability. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.',
		},
	},
	panels: {
		abilities: {
			notes: [
				{
					heading: 'Under the hood',
					text: 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. One public flag for client exposure, filtering in wp_get_abilities(), and filters around execution are landing in WordPress 7.1, which ships 19 August 2026 — read the Anatomy panel as forward-looking until then.',
				},
			],
		},
		client: {
			lede: 'A plugin asks for a capability and the kind of result it needs. The AI Client chooses a compatible model from a provider the site owner configured through Connectors.',
		},
		connectors: {
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
	},
};

const PEDAGOGICAL_V320_DEFAULTS = {
	stories: {
		'uses-ai': {
			takeaway:
				'A WordPress feature uses one common client to request an AI result. Provider setup supports the path, while the external AI service remains outside WordPress.',
		},
		'uses-wp': {
			takeaway:
				'An outside assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions.',
		},
		learns: {
			takeaway:
				'Agent Skills changes the guidance available to a coding agent. It does not run anything on the WordPress site.',
		},
		tests: {
			takeaway:
				'Generated code runs in a disposable WordPress environment and is judged by WordPress tests, not by another AI model.',
		},
	},
	panels: {
		abilities: {
			roles: {
				'uses-wp': {
					receives:
						'The translated call, naming the action the assistant wants WordPress to perform.',
					does: 'Checks whether the current user is allowed to perform it, then runs the registered callback.',
					returns: 'A typed result, or a refusal.',
					lesson: 'Connecting an assistant does not give it unlimited access. WordPress still decides what may run.',
				},
			},
		},
		client: {
			roles: {
				'uses-ai': {
					receives: 'A capability request from a WordPress feature.',
					does: 'Finds a compatible configured provider plugin and routes the request to it.',
					returns:
						'The provider’s response in a consistent WordPress format.',
					lesson: 'WordPress features can request AI capabilities without integrating every external provider separately.',
				},
			},
		},
		connectors: {
			roles: {
				'uses-ai': {
					receives:
						'Nothing in the request path — it sits beside it.',
					does: 'Discovers provider plugins and holds the site owner’s configuration, credentials, and connection status.',
					returns:
						'The configuration the AI Client reads when it chooses a route.',
					lesson: 'Setup is a separate concern from the request. Connectors supports the path; it never executes it.',
				},
			},
		},
		mcp: {
			notes: [
				{
					heading: 'Under the hood',
					text: 'An official WordPress package installed as a plugin, not part of Core: HTTP and STDIO transports against the MCP specification the adapter currently targets (2025-11-25), configurable servers, validation, permission checks, error handling, and observability. Today it answers calls; it does not make them. It does not create the underlying action, and it is not the model — WordPress still owns execution.',
				},
			],
		},
		bench: {
			notes: [
				{
					heading: 'Under the hood',
					text: 'One suite, one dimension: 185 execution tests, each a PHP snippet, run inside a real WordPress 7.0 — and WordPress itself runs the assertions that grade it. Passing is all-or-nothing: two of three assertions is a fail. Static analysis only diagnoses, unless the code trips a forbidden pattern. A separate audit throws trivial cheats at each test — an empty function, a bare return — and flags any test a cheat can satisfy.',
				},
			],
		},
		provider: {
			roles: {
				'uses-ai': {
					receives:
						'The request, once it has crossed out of WordPress.',
					does: 'Runs the model on infrastructure WordPress does not control.',
					returns:
						'A result the provider plugin hands back to the AI Client.',
					lesson: 'The model is never inside WordPress. Everything WordPress guarantees stops at this boundary.',
				},
			},
		},
	},
};

// The kiosk Blueprint now boots a WordPress 7.1 release candidate, so the note
// that called 7.1 unshipped and the exhibit a 7.0 site no longer describes what
// a visitor is looking at.
const RUNTIME_V321_DEFAULTS = {
	panels: {
		abilities: {
			notes: [
				{
					heading: 'Under the hood',
					text: 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. A public default for client exposure, filtering in wp_get_abilities(), and filters around execution are scheduled for WordPress 7.1 on August 19, 2026; this exhibit runs WordPress 7.0, so read the Anatomy panel as forward-looking.',
				},
			],
		},
	},
};

// The v3.2 boundary pass renames the code an agent writes, tells the
// agent-learning flow what its guidance is actually about, and corrects the
// client, connector, and bench claims a visitor could check against an install.
const BOUNDARY_V322_DEFAULTS = {
	actors: {
		task: {
			name: 'A WordPress task',
			tagline: 'Plugin or theme work',
			badge: 'Not WordPress',
		},
	},
	stories: {
		learns: {
			copy: 'Agent Skills attaches current WordPress guidance to a coding agent, which then starts the task. All of this happens outside the site — nothing inside WordPress runs.',
			takeaway:
				'Agent Skills changes the information available to the coding agent. Nothing runs on the WordPress site during this flow.',
		},
	},
	panels: {
		client: {
			connect: [
				{ label: 'Text, image, speech or video request' },
				{ label: 'AI Client', accent: true },
				{ label: 'Normalized result' },
			],
			notes: [
				{
					heading: 'Under the hood',
					text: 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly. There is a JavaScript prompt API too, but it is administrator-gated and can send any prompt to any configured provider — so for editor features, register a REST endpoint scoped to that one feature. Check support before showing any AI interface — the checks are free, and a 7.0 site may have no provider configured at all.',
				},
				{
					heading: 'Calling back into WordPress',
					text: 'A request can name registered abilities the model is allowed to call. When it calls one, WordPress runs that ability — permission check and all — and folds the result back into the same request. This is where the two halves of the map meet: WordPress asking AI for something can end with WordPress doing the work itself.',
				},
			],
		},
		connectors: {
			notes: [
				{
					heading: 'Providers',
					text: 'Provider plugins register with the AI Client. Connectors auto-discovers them, and one button installs and activates the plugin before asking for its key. Keys are read from an environment variable first, then a wp-config constant, then the database — where they sit unencrypted by default. The map stays vendor-neutral: no provider owns a position on the canvas.',
				},
				{
					heading: 'Under the hood',
					text: 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services. AI providers are the first users of it, not the only intended ones — the framework is built for outside connections generally.',
				},
			],
		},
		plugin: {
			lede: 'Where the foundations become things people can use: alt text, summaries, titles, editorial notes, image generation. Nothing is on by default: you enable one experiment at a time.',
		},
		mcp: {
			lede: 'Translation at the edge of the site. It exposes the abilities their authors marked public to authorized outside assistants — as MCP resources and prompts automatically, and as individual tools on a custom server — and translates their calls back into WordPress work.',
		},
		bench: {
			connect: [
				{ label: 'Task' },
				{ label: 'Sandbox' },
				{ label: 'Lint and runtime checks' },
				{ label: 'Evidence', accent: true },
			],
			notes: [
				{
					heading: 'Under the hood',
					text: 'One suite, one dimension: code generation tasks graded by static checks and runtime assertions in a real WordPress environment. WordPress itself runs the assertions. Passing is all-or-nothing: a partially correct result still fails. Run --check-reference-solution first to prove the grader accepts the canonical solution, then --check-exploits to prove trivial stubs fail.',
				},
			],
		},
		skills: {
			roles: {
				learns: {
					receives:
						'A selection of WordPress guidance — checklists, references, procedures.',
					does: 'Supplies those instructions to the coding agent before it writes the requested code.',
					returns:
						'An agent that follows current WordPress practice.',
					lesson: 'The guidance affects the agent’s work outside the site; it does not execute on a live WordPress installation.',
				},
			},
		},
		assistant: {
			lede: 'A program outside WordPress — a chat assistant, an editor, an agent — that speaks MCP. It holds no privileges of its own — it acts as a WordPress user it was given credentials for, and never gets more reach than that user has.',
			roles: {
				'uses-wp': {
					receives: 'A person’s instruction, outside WordPress.',
					does: 'Decides a WordPress action is needed and issues an MCP tool call.',
					returns: 'Whatever WordPress allows back — nothing more.',
					lesson: 'The assistant is a client, not an authority. It asks; it does not decide.',
				},
			},
		},
		agent: {
			roles: {
				learns: {
					receives:
						'The attached guidance, plus the task it was asked to do.',
					does: 'Writes plugin or theme code, outside the site.',
					returns: 'Code a person still has to review and install.',
					lesson: 'Nothing here touches a running site. The agent produces text, not changes.',
				},
				tests: {
					receives:
						'One task and its requirements, as a single message.',
					does: 'Writes PHP. It gets no conversation, no retry, and no sight of the assertions.',
					returns:
						'Whatever it wrote, parsed out of the reply and passed on unrepaired.',
					lesson: 'Every model gets exactly the same task, so a difference in the result is a difference in the model.',
				},
			},
		},
		task: {
			badge: 'Not WordPress',
			title: 'A WordPress task',
			lede: 'The actual work someone wants done: a plugin, a theme, a fix. On this map it stands for the job itself, not for any code running on a site.',
			roles: {
				learns: {
					receives:
						'The agent’s attention, once the guidance is attached.',
					does: 'Stands for the real work — a plugin, a theme, a fix.',
					returns: 'Finished code, still outside WordPress.',
					lesson: 'The site is not involved until a person installs what the agent wrote.',
				},
			},
		},
		'provider-plugin': {
			lede: 'A provider-specific integration installed as a WordPress plugin. It speaks one external service’s protocol using the credentials Connectors resolved for it.',
			roles: {
				'uses-ai': {
					receives: 'The routed request from the AI Client.',
					does: 'Speaks one external service’s protocol, using the credentials Connectors resolved.',
					returns:
						'That service’s reply, handed back to the AI Client.',
					lesson: 'The provider-specific part is a plugin. Swapping providers does not change the feature that asked.',
				},
			},
		},
	},
};

// The focused inbound-request pass replaces an abstract allowed action with one
// illustrative booking transaction. These are only former registered defaults;
// any editor-authored story or role continues to win.
const FOCUSED_USES_WP_V324_DEFAULTS = {
	stories: {
		'uses-wp': {
			copy: 'An authorized assistant calls in through the MCP Adapter, which translates the call into a WordPress ability. Permission still belongs to WordPress.',
			situation:
				'An outside assistant asks WordPress to perform an allowed action.',
			takeaway:
				'The assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions.',
			outcome: 'An assistant requests a WordPress action',
		},
	},
	panels: {
		assistant: {
			roles: {
				'uses-wp': {
					receives: 'A person’s instruction, outside WordPress.',
					does: 'Signs in as the WordPress user it was given credentials for, then issues an MCP tool call.',
					returns:
						'Whatever that user is allowed to get back — nothing more.',
					lesson: 'The assistant is a client, not an authority. It asks; it does not decide.',
				},
			},
		},
		mcp: {
			roles: {
				'uses-wp': {
					receives:
						'An MCP tool call from an authorized outside assistant.',
					does: 'Translates the call into a WordPress ability and hands it to WordPress to run.',
					returns:
						'The ability’s typed result, translated back into MCP.',
					lesson: 'The adapter is a translator at the edge of the site. It does not create the action, and it does not grant the permission.',
				},
			},
		},
		abilities: {
			roles: {
				'uses-wp': {
					receives:
						'The translated request, naming the WordPress action and supplying its inputs.',
					does: 'Validates the inputs, checks whether the current user is allowed to perform the action, then runs its registered callback.',
					returns: 'A typed result, or a refusal.',
					lesson: 'Connecting an outside assistant does not give it unrestricted access. WordPress still controls execution.',
				},
			},
		},
	},
};

const LEGACY_SCALAR_DEFAULTS = {
	reviewedDate: [ 'Reviewed 12 Aug 2026' ],
	title: [
		'How do WordPress and AI work together?',
		'Four ways WordPress and AI meet',
	],
	intro: [
		'Choose a flow, follow the numbered path, then tap a highlighted component to understand its role.',
		'See WordPress call AI, let authorized agents call WordPress, and test what they build.',
		'WordPress Core AI is a set of open building blocks that let WordPress use AI services and work with outside assistants—without tying WordPress to one provider.\n\nExplore four flows to see what happens inside WordPress, what happens outside it, and how the projects connect.',
		'Core AI is a set of open building blocks: WordPress can call out to an AI service, and an outside assistant can call into WordPress. No single provider, no single assistant.\n\nEach flow traces one real request end to end, and shows who holds permission at every step. Pick one to begin, then tap any component for its role.',
	],
	prompt: [ 'Trace the first flow', 'Explore the first flow' ],
};

const valuesMatch = ( left, right ) =>
	JSON.stringify( left ) === JSON.stringify( right );

/**
 * Upgrade an exact former scalar default without replacing authored copy.
 *
 * @param {Object} metadata Block metadata.
 * @param {string} key      Attribute name.
 * @param {*}      value    Serialized attribute value.
 * @return {*} The current default or the authored value.
 */
export const withCurrentDefault = ( metadata, key, value ) => {
	const current = metadata.attributes[ key ]?.default;
	if ( typeof value === 'undefined' ) {
		return current;
	}

	return ( LEGACY_SCALAR_DEFAULTS[ key ] || [] ).some( ( legacy ) =>
		valuesMatch( value, legacy )
	)
		? current
		: value;
};

/**
 * Merge saved editor values with the current schema while selectively
 * upgrading fields that still match the former registered defaults.
 *
 * @param {Object} metadata Block metadata.
 * @param {string} key      Attribute collection name.
 * @param {Array}  items    Serialized items.
 * @return {Array} Normalized items in current design order.
 */
export const withCurrentDefaults = ( metadata, key, items ) => {
	const defaults = metadata.attributes[ key ]?.default || [];
	const saved = new Map(
		( items || [] ).map( ( item ) => [ item.id, item ] )
	);

	return defaults.map( ( item ) => {
		const savedItem = saved.get( item.id ) || {};
		const merged = { ...item, ...savedItem };
		[
			LEGACY_DEFAULTS,
			PRE_BOOTH_V311_DEFAULTS,
			PEDAGOGICAL_V320_DEFAULTS,
			RUNTIME_V321_DEFAULTS,
			BOUNDARY_V322_DEFAULTS,
			FOCUSED_USES_WP_V324_DEFAULTS,
		].forEach( ( defaultsSet ) => {
			const legacyFields = defaultsSet[ key ]?.[ item.id ] || {};

			Object.entries( legacyFields ).forEach(
				( [ field, legacyValue ] ) => {
					if (
						Object.hasOwn( savedItem, field ) &&
						valuesMatch( savedItem[ field ], legacyValue )
					) {
						merged[ field ] = item[ field ];
					}
				}
			);
		} );

		// These fields are factual release metadata, not visitor-authored copy.
		if ( key === 'panels' ) {
			merged.href = item.href;
			merged.qr = item.qr;
		}

		if ( item.id === 'mcp' && ( key === 'blocks' || key === 'panels' ) ) {
			merged.badge = item.badge;
		}

		return merged;
	} );
};
