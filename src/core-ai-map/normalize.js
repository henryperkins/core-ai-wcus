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

const valuesMatch = ( left, right ) =>
	JSON.stringify( left ) === JSON.stringify( right );

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
		[ LEGACY_DEFAULTS, PRE_BOOTH_V311_DEFAULTS ].forEach(
			( defaultsSet ) => {
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
			}
		);

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
