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

const LEGACY_SCALAR_DEFAULTS = {
	reviewedDate: [ 'Reviewed 12 Aug 2026' ],
	title: [ 'How do WordPress and AI work together?' ],
	intro: [
		'Choose a flow, follow the numbered path, then tap a highlighted component to understand its role.',
		'See WordPress call AI, let authorized agents call WordPress, and test what they build.',
	],
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
