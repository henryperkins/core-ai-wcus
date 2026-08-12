<?php
// This file is generated. Do not modify it manually.
return array(
	'core-ai-map' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'core-ai/core-ai-map',
		'version' => '0.2.0',
		'title' => 'Core AI Boundary Map',
		'category' => 'design',
		'icon' => 'wordpress',
		'description' => 'An interactive Core AI boundary map for a landscape iPad kiosk.',
		'keywords' => array(
			'AI',
			'kiosk',
			'WordCamp'
		),
		'attributes' => array(
			'eyebrow' => array(
				'type' => 'string',
				'default' => 'WordPress Core AI'
			),
			'hint' => array(
				'type' => 'string',
				'default' => 'Explore how WordPress’s AI building blocks connect'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'How do WordPress and AI work together?'
			),
			'intro' => array(
				'type' => 'string',
				'default' => 'See WordPress call AI, let authorized agents call WordPress, and test what they build.'
			),
			'prompt' => array(
				'type' => 'string',
				'default' => 'Add the blocks to the canvas'
			),
			'inactivityTimeout' => array(
				'type' => 'number',
				'default' => 90
			),
			'offlineEnabled' => array(
				'type' => 'boolean',
				'default' => true
			),
			'recompose' => array(
				'type' => 'boolean',
				'default' => true
			),
			'shapes' => array(
				'type' => 'boolean',
				'default' => true
			),
			'blocks' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'plugin',
						'name' => 'AI Plugin',
						'tagline' => 'Turn the foundations into useful features',
						'badge' => 'Experimental plugin'
					),
					array(
						'id' => 'client',
						'name' => 'AI Client',
						'tagline' => 'Request AI through one common interface',
						'badge' => 'Core API · 7.0'
					),
					array(
						'id' => 'connectors',
						'name' => 'Connectors',
						'tagline' => 'Connect WordPress to providers and services',
						'badge' => 'Core API · 7.0'
					),
					array(
						'id' => 'abilities',
						'name' => 'Abilities API',
						'tagline' => 'Describe what WordPress can do',
						'badge' => 'Core API · 6.9'
					),
					array(
						'id' => 'mcp',
						'name' => 'MCP Adapter',
						'tagline' => 'Let authorized assistants work with WordPress',
						'badge' => 'Open adapter'
					),
					array(
						'id' => 'bench',
						'name' => 'WP Bench',
						'tagline' => 'Test how well agents perform WordPress work',
						'badge' => 'Early benchmark'
					)
				)
			),
			'actors' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'assistant',
						'name' => 'AI assistant',
						'tagline' => 'Speaks MCP',
						'badge' => 'Not WordPress'
					),
					array(
						'id' => 'skills',
						'name' => 'Agent Skills',
						'tagline' => 'Instruction bundles',
						'badge' => 'Guidance'
					),
					array(
						'id' => 'agent',
						'name' => 'Coding agent',
						'tagline' => 'Writes the code',
						'badge' => 'Not WordPress'
					),
					array(
						'id' => 'provider',
						'name' => 'AI provider',
						'tagline' => 'The site owner’s choice',
						'badge' => 'Not WordPress'
					)
				)
			),
			'suggestions' => array(
				'type' => 'array',
				'default' => array(
					array(
						'label' => 'Alt text',
						'text' => 'Two people reviewing a site on a laptop'
					),
					array(
						'label' => 'Post title',
						'text' => 'A quieter way to explain WordPress and AI'
					),
					array(
						'label' => 'Summary',
						'text' => 'Three sentences, plain language, no jargon'
					),
					array(
						'label' => 'Editorial note',
						'text' => 'Tighten the opening paragraph'
					)
				)
			),
			'stories' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'uses-ai',
						'title' => 'WordPress uses AI',
						'copy' => 'A plugin asks for a capability. The AI Client routes the request, and Connectors decides which provider the site is allowed to reach.'
					),
					array(
						'id' => 'uses-wp',
						'title' => 'AI uses WordPress',
						'copy' => 'An authorized assistant calls in through the MCP Adapter, which translates the call into a WordPress ability. Permission still belongs to WordPress.'
					),
					array(
						'id' => 'learns',
						'title' => 'An agent learns WordPress',
						'copy' => 'Agent Skills attaches current WordPress guidance to a coding assistant before it starts work. This happens outside the site — nothing inside WordPress runs.'
					),
					array(
						'id' => 'tests',
						'title' => 'WordPress tests the result',
						'copy' => 'WP Bench runs what the agent produced inside a sandboxed WordPress and grades it. Evidence, not a leaderboard.'
					)
				)
			),
			'panels' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'abilities',
						'badge' => 'Core API · 6.9',
						'title' => 'Abilities API',
						'lede' => 'Abilities are the list of things this site can do. Each one declares its inputs, its outputs, who is allowed to run it, and what happens when it runs.',
						'connectHeading' => 'How it connects',
						'connectLayout' => 'chain',
						'connect' => array(
							array(
								'label' => 'Input'
							),
							array(
								'label' => 'Permission'
							),
							array(
								'label' => 'Run'
							),
							array(
								'label' => 'Typed output',
								'accent' => true
							)
						),
						'notes' => array(
							array(
								'heading' => 'Under the hood',
								'text' => 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion.'
							)
						),
						'href' => 'https://developer.wordpress.org/apis/abilities-api/',
						'linkLabel' => 'developer.wordpress.org/apis/abilities-api',
						'qr' => ''
					),
					array(
						'id' => 'client',
						'badge' => 'Core API · 7.0',
						'title' => 'AI Client',
						'lede' => 'A plugin describes the capability and the kind of result it needs. WordPress routes the request to a suitable model from a provider the site owner has connected.',
						'connectHeading' => 'How it connects',
						'connectLayout' => 'chain',
						'connect' => array(
							array(
								'label' => 'Text, image or JSON request'
							),
							array(
								'label' => 'AI Client',
								'accent' => true
							),
							array(
								'label' => 'Normalized result'
							)
						),
						'notes' => array(
							array(
								'heading' => 'Under the hood',
								'text' => 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly.'
							)
						),
						'href' => 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/',
						'linkLabel' => 'developer.wordpress.org/reference/functions/wp_ai_client_prompt',
						'qr' => ''
					),
					array(
						'id' => 'connectors',
						'badge' => 'Core API · 7.0',
						'title' => 'Connectors',
						'lede' => 'Where a site owner connects WordPress to outside services. Connectors handles discovery, credentials, connection status, and approvals — so the site decides what AI it can reach.',
						'connectHeading' => 'Connection states',
						'connectLayout' => 'grid',
						'connect' => array(
							array(
								'label' => 'Available'
							),
							array(
								'label' => 'Needs plugin'
							),
							array(
								'label' => 'Needs credentials',
								'tone' => 'warning'
							),
							array(
								'label' => 'Connected',
								'accent' => true
							)
						),
						'notes' => array(
							array(
								'heading' => 'Providers',
								'text' => 'Provider plugins register themselves with the AI Client and appear under Settings → Connectors. The map stays vendor-neutral: no provider owns a position on the canvas.'
							),
							array(
								'heading' => 'Under the hood',
								'text' => 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.'
							)
						),
						'href' => 'https://make.wordpress.org/core/',
						'linkLabel' => 'make.wordpress.org/core → Connectors API in 7.0',
						'qr' => ''
					),
					array(
						'id' => 'plugin',
						'badge' => 'Experimental reference plugin',
						'title' => 'AI Plugin',
						'lede' => 'Where the foundations become things people can use: alt text, summaries, titles, editorial notes, image generation. Every feature is opt-in and manually triggered.',
						'connectHeading' => 'How it connects',
						'connectLayout' => 'chain',
						'connect' => array(
							array(
								'label' => 'Request'
							),
							array(
								'label' => 'Preview'
							),
							array(
								'label' => 'A person reviews',
								'accent' => true
							),
							array(
								'label' => 'Apply'
							)
						),
						'notes' => array(
							array(
								'heading' => 'Under the hood',
								'text' => 'Also a reference implementation: it shows plugin authors how Abilities, the AI Client, and Connectors fit together, including connector approvals, request logging, and key encryption.'
							)
						),
						'href' => 'https://wordpress.org/plugins/ai/',
						'linkLabel' => 'wordpress.org/plugins/ai',
						'qr' => ''
					),
					array(
						'id' => 'mcp',
						'badge' => 'Open adapter',
						'title' => 'MCP Adapter',
						'lede' => 'Translation at the edge of the site. It exposes eligible abilities to authorized outside assistants as MCP tools, resources, and prompts — and translates their calls back into WordPress work.',
						'connectHeading' => 'How it connects',
						'connectLayout' => 'chain',
						'connect' => array(
							array(
								'label' => 'MCP tool call'
							),
							array(
								'label' => 'MCP Adapter',
								'accent' => true
							),
							array(
								'label' => 'Ability'
							),
							array(
								'label' => 'Permission check'
							)
						),
						'notes' => array(
							array(
								'heading' => 'Under the hood',
								'text' => 'HTTP and STDIO transports, configurable servers, validation, permission checks, error handling, and observability. It does not create the underlying action, and it is not the model — WordPress still owns execution.'
							)
						),
						'href' => 'https://github.com/WordPress/mcp-adapter',
						'linkLabel' => 'github.com/WordPress/mcp-adapter',
						'qr' => ''
					),
					array(
						'id' => 'bench',
						'badge' => 'Early benchmark',
						'title' => 'WP Bench',
						'lede' => 'A test bench, not part of any live request. It measures what an agent knows about WordPress and whether the code it writes actually runs.',
						'connectHeading' => 'How it connects',
						'connectLayout' => 'chain',
						'connect' => array(
							array(
								'label' => 'Task'
							),
							array(
								'label' => 'Sandbox'
							),
							array(
								'label' => 'Lint and runtime checks'
							),
							array(
								'label' => 'Evidence',
								'accent' => true
							)
						),
						'notes' => array(
							array(
								'heading' => 'Under the hood',
								'text' => 'Two dimensions: knowledge of WordPress concepts, APIs, security practices and standards; and execution — generated code run in a real WordPress environment and graded by static analysis and runtime assertions. Dataset size and version coverage are still limited.'
							)
						),
						'href' => 'https://github.com/WordPress/wp-bench',
						'linkLabel' => 'github.com/WordPress/wp-bench',
						'qr' => ''
					),
					array(
						'id' => 'skills',
						'badge' => 'Contributor guidance',
						'title' => 'Agent Skills',
						'lede' => 'Portable instruction bundles — guidance, checklists, references — that help a coding assistant follow current WordPress practice. Nothing here runs on a live site.',
						'connectHeading' => 'How it connects',
						'connectLayout' => 'chain',
						'connect' => array(
							array(
								'label' => 'Select guidance'
							),
							array(
								'label' => 'Attach to the agent',
								'accent' => true
							),
							array(
								'label' => 'Follow the procedure'
							)
						),
						'notes' => array(
							array(
								'heading' => 'Under the hood',
								'text' => 'Covers blocks, themes, plugins, REST, the Interactivity API, Abilities, performance, and security. Installable for several coding assistants, or committed alongside an individual project.'
							)
						),
						'href' => 'https://github.com/WordPress/agent-skills',
						'linkLabel' => 'github.com/WordPress/agent-skills',
						'qr' => ''
					)
				)
			)
		),
		'supports' => array(
			'align' => array(
				'full'
			),
			'anchor' => true,
			'html' => false,
			'interactivity' => true,
			'multiple' => false
		),
		'textdomain' => 'core-ai-map',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScriptModule' => 'file:./view.js'
	)
);
