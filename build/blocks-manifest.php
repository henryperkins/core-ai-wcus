<?php
// This file is generated. Do not modify it manually.
return array(
	'core-ai-map' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'core-ai/core-ai-map',
		'version' => '3.2.1',
		'title' => 'Core AI Living Block Map',
		'category' => 'design',
		'icon' => 'wordpress',
		'description' => 'An interactive Living Block Map of the building blocks connecting WordPress and AI.',
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
			'reviewedDate' => array(
				'type' => 'string',
				'default' => 'Reviewed 14 Aug 2026'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'What is WordPress Core AI?'
			),
			'intro' => array(
				'type' => 'string',
				'default' => 'WordPress Core AI is a set of open building blocks that let WordPress use AI services and work with outside assistants—without tying WordPress to one provider.

Explore four flows to see what happens inside WordPress, what happens outside it, and how the projects connect.'
			),
			'prompt' => array(
				'type' => 'string',
				'default' => 'Explore the first flow'
			),
			'labels' => array(
				'type' => 'object',
				'default' => array(
					'railEmptyLabel' => 'Choose a flow',
					'railActiveLabel' => 'Choose another flow',
					'browseLabel' => 'Browse all components',
					'browseDescription' => 'Every component on one canvas, with no flow selected.',
					'takeawayHeading' => 'What this flow shows',
					'roleHeading' => 'Its role in this flow',
					'lessonHeading' => 'Why that matters',
					'definitionHeading' => 'What it is',
					'technicalHeading' => 'Under the hood',
					'exploreHeading' => 'Keep exploring',
					'tapCue' => 'Tap for its role',
					'receivesLabel' => 'Receives',
					'doesLabel' => 'Does',
					'returnsLabel' => 'Passes on'
				)
			),
			'guidance' => array(
				'type' => 'object',
				'default' => array(
					'attract' => 'Choose a flow to begin.',
					'flow' => 'Follow %1$s. Highlighted components take part in this flow. Tap one to learn what it contributes.',
					'inspect' => 'You are viewing this component’s role in “%1$s.”',
					'browse' => 'Tap any component to learn what it is and where it belongs.',
					'cardAction' => '%1$s — view its role in “%2$s.”',
					'cardActionBrowse' => '%1$s — open its details.'
				)
			),
			'inactivityTimeout' => array(
				'type' => 'number',
				'default' => 60
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
						'badge' => 'Experimental reference plugin'
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
						'tagline' => 'Configure provider plugins and credentials',
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
						'badge' => 'WordPress plugin · not in Core'
					),
					array(
						'id' => 'bench',
						'name' => 'WP-Bench',
						'tagline' => 'See whether the code an agent writes actually runs',
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
						'name' => 'External AI service',
						'tagline' => 'Selected from site configuration',
						'badge' => 'Not WordPress'
					),
					array(
						'id' => 'task',
						'name' => 'A WordPress task',
						'tagline' => 'Plugin or theme work',
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
						'copy' => 'A plugin asks the AI Client for a capability. The Client routes through a configured provider plugin to an external AI service; Connectors supplies discovery, configuration, and credentials beside the request path.',
						'situation' => 'A feature inside WordPress needs an AI-generated result.',
						'takeaway' => 'A WordPress feature uses a common AI interface instead of integrating directly with every provider. Provider configuration supports the request, while the AI service remains outside WordPress.',
						'outcome' => 'WordPress requests an AI result'
					),
					array(
						'id' => 'uses-wp',
						'title' => 'AI uses WordPress',
						'copy' => 'An authorized assistant calls in through the MCP Adapter, which translates the call into a WordPress ability. Permission still belongs to WordPress.',
						'situation' => 'An outside assistant asks WordPress to perform an allowed action.',
						'takeaway' => 'The assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions.',
						'outcome' => 'An assistant requests a WordPress action'
					),
					array(
						'id' => 'learns',
						'title' => 'An agent learns WordPress',
						'copy' => 'Agent Skills attaches current WordPress guidance to a coding agent, which then starts the task. All of this happens outside the site — nothing inside WordPress runs.',
						'situation' => 'A coding agent receives WordPress-specific guidance before writing code.',
						'takeaway' => 'Agent Skills changes the information available to the coding agent. Nothing runs on the WordPress site during this flow.',
						'outcome' => 'A coding agent receives WordPress guidance'
					),
					array(
						'id' => 'tests',
						'title' => 'WordPress tests the result',
						'copy' => 'WP-Bench runs what the agent produced inside a sandboxed WordPress, and WordPress itself decides whether it passed. Evidence, not vibes.',
						'situation' => 'Code written by an agent needs to be tested against real WordPress behavior.',
						'takeaway' => 'The generated code runs in a disposable WordPress environment and is judged by WordPress tests, not by another model\'s opinion.',
						'outcome' => 'WordPress evaluates generated code'
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
						'roles' => array(
							'uses-wp' => array(
								'receives' => 'The translated request, naming the WordPress action and supplying its inputs.',
								'does' => 'Validates the inputs, checks whether the current user is allowed to perform the action, then runs its registered callback.',
								'returns' => 'A typed result, or a refusal.',
								'lesson' => 'Connecting an outside assistant does not give it unrestricted access. WordPress still controls execution.'
							)
						),
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
								'text' => 'The PHP API landed in WordPress 6.9. WordPress 7.0 added a client-side counterpart for editor actions such as navigation and block insertion. A public default for client exposure, filtering in wp_get_abilities(), and filters around execution are scheduled for WordPress 7.1 on August 19, 2026; this exhibit runs WordPress 7.0, so read the Anatomy panel as forward-looking.'
							)
						),
						'href' => 'https://developer.wordpress.org/apis/abilities-api/',
						'linkLabel' => 'developer.wordpress.org/apis/abilities-api',
						'qr' => 'qr/abilities.svg'
					),
					array(
						'id' => 'client',
						'badge' => 'Core API · 7.0',
						'title' => 'AI Client',
						'lede' => 'A plugin asks for a capability and the kind of result it needs. The AI Client routes through an installed provider plugin to a compatible external service; Connectors supplies that plugin’s configuration and credentials.',
						'roles' => array(
							'uses-ai' => array(
								'receives' => 'A capability request from a WordPress feature.',
								'does' => 'Sends the request through a compatible configured provider plugin.',
								'returns' => 'The provider’s response in a consistent WordPress format.',
								'lesson' => 'WordPress features can request AI capabilities without integrating every external provider separately.'
							)
						),
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
								'text' => 'A WordPress wrapper around the provider-agnostic PHP AI Client, which handles provider communication, model selection, and normalized results. Consuming plugins never integrate a provider directly. Core’s client is PHP only: for editor JavaScript, register a REST endpoint per feature. Check support before showing any AI interface — the checks are free, and a 7.0 site may have no provider configured at all.'
							)
						),
						'href' => 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/',
						'linkLabel' => 'developer.wordpress.org/reference/functions/wp_ai_client_prompt',
						'qr' => 'qr/client.svg'
					),
					array(
						'id' => 'connectors',
						'badge' => 'Core API · 7.0',
						'title' => 'Connectors',
						'lede' => 'Where a site owner discovers and configures provider plugins, stores credentials, and sees connection status. It supports the request path; it is not the request executor.',
						'roles' => array(
							'uses-ai' => array(
								'receives' => 'Nothing in the request path — it sits beside it.',
								'does' => 'Provides provider-plugin installation, credentials, configuration, and connection status beside the active request path.',
								'returns' => 'The provider configuration the AI Client uses when it chooses a route.',
								'lesson' => 'Provider setup is centralized instead of being rebuilt inside every AI-powered feature. Connectors supports the path; it does not execute the request.'
							)
						),
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
								'text' => 'Provider plugins register with the AI Client. Connectors auto-discovers them and gives site owners installation, configuration, credential, and status controls. The map stays vendor-neutral: no provider owns a position on the canvas.'
							),
							array(
								'heading' => 'Under the hood',
								'text' => 'Introduced in WordPress 7.0 as a standardized framework for registering and managing connections to external services, starting with AI providers.'
							)
						),
						'href' => 'https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/',
						'linkLabel' => 'make.wordpress.org/core → Connectors API in 7.0',
						'qr' => 'qr/connectors.svg'
					),
					array(
						'id' => 'plugin',
						'badge' => 'Experimental reference plugin',
						'title' => 'AI Plugin',
						'lede' => 'Where the foundations become things people can use: alt text, summaries, titles, editorial notes, image generation. Nothing is on by default: you enable one experiment at a time.',
						'roles' => array(
							'uses-ai' => array(
								'receives' => 'A person’s request in the editor — alt text, a summary, a title.',
								'does' => 'Turns it into a capability request and hands that to the AI Client.',
								'returns' => 'A suggestion the person reviews before anything is applied.',
								'lesson' => 'The feature decides what to ask for. A person still decides what to keep.'
							)
						),
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
								'text' => 'Also a reference implementation: it shows plugin authors how Abilities, the AI Client, and Connectors fit together. Requires WordPress 7.0. Connector approvals, request logging, and encrypting provider keys at rest are experimental governance features of this plugin, not of Connectors itself.'
							)
						),
						'href' => 'https://wordpress.org/plugins/ai/',
						'linkLabel' => 'wordpress.org/plugins/ai',
						'qr' => 'qr/plugin.svg'
					),
					array(
						'id' => 'mcp',
						'badge' => 'WordPress plugin · not in Core',
						'title' => 'MCP Adapter',
						'lede' => 'Translation at the edge of the site. It exposes the abilities their authors marked public to authorized outside assistants as MCP tools, resources, and prompts — and translates their calls back into WordPress work.',
						'roles' => array(
							'uses-wp' => array(
								'receives' => 'An MCP tool call from an authorized outside assistant.',
								'does' => 'Translates the call into a WordPress ability and hands it to WordPress to run.',
								'returns' => 'The ability’s typed result, translated back into MCP.',
								'lesson' => 'The adapter is a translator at the edge of the site. It does not create the action, and it does not grant the permission.'
							)
						),
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
								'text' => 'An official WordPress package installed as a plugin, not part of Core: HTTP and STDIO transports, configurable servers, validation, permission checks, error handling, and observability. The default server supports multiple MCP protocol versions; its HTTP transport implements MCP 2025-06-18. Today it answers calls; it does not make them. It does not create the underlying action, and it is not the model — WordPress still owns execution.'
							)
						),
						'href' => 'https://github.com/WordPress/mcp-adapter',
						'linkLabel' => 'github.com/WordPress/mcp-adapter',
						'qr' => 'qr/mcp.svg'
					),
					array(
						'id' => 'bench',
						'badge' => 'Early benchmark',
						'title' => 'WP-Bench',
						'lede' => 'A test bench, not part of any live request. It measures whether the code an agent writes for WordPress actually runs.',
						'roles' => array(
							'tests' => array(
								'receives' => 'The code the agent produced.',
								'does' => 'Runs it inside a real WordPress created for this one test, then throws that install away.',
								'returns' => 'Pass or fail, decided by WordPress assertions rather than by another model.',
								'lesson' => 'Generated code is judged by WordPress tests, not by another AI model.'
							)
						),
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
								'text' => 'One suite, one dimension: code generation tasks graded by static checks and runtime assertions in a real WordPress environment. WordPress itself runs the assertions. Passing is all-or-nothing: a partially correct result still fails. Run --check-reference-solution first to prove the grader accepts the canonical solution, then --check-exploits to prove trivial stubs fail.'
							)
						),
						'href' => 'https://github.com/WordPress/wp-bench',
						'linkLabel' => 'github.com/WordPress/wp-bench',
						'qr' => 'qr/bench.svg'
					),
					array(
						'id' => 'skills',
						'badge' => 'Contributor guidance',
						'title' => 'Agent Skills',
						'lede' => 'Portable instruction bundles — guidance, checklists, references — that help a coding assistant follow current WordPress practice. Nothing here runs on a live site.',
						'roles' => array(
							'learns' => array(
								'receives' => 'A selection of WordPress guidance — checklists, references, procedures.',
								'does' => 'Supplies those instructions to the coding agent before it writes the requested code.',
								'returns' => 'An agent that follows current WordPress practice.',
								'lesson' => 'The guidance affects the agent’s work outside the site; it does not execute on a live WordPress installation.'
							)
						),
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
								'text' => 'Covers blocks, themes, plugins, REST, the Interactivity API, Abilities, performance, and security. Three of the skills are about Abilities alone: how to register one, how to audit an existing REST surface for candidates, and how to verify a registration against what it claims. Installable for several coding assistants, or committed alongside an individual project.'
							)
						),
						'href' => 'https://github.com/WordPress/agent-skills',
						'linkLabel' => 'github.com/WordPress/agent-skills',
						'qr' => 'qr/skills.svg'
					),
					array(
						'id' => 'assistant',
						'badge' => 'Not WordPress',
						'title' => 'AI assistant',
						'lede' => 'A program outside WordPress — a chat assistant, an editor, an agent — that speaks MCP. It holds no WordPress privileges of its own, and every request it makes is checked by WordPress before anything runs.',
						'roles' => array(
							'uses-wp' => array(
								'receives' => 'A person’s instruction, outside WordPress.',
								'does' => 'Decides a WordPress action is needed and issues an MCP tool call.',
								'returns' => 'Whatever WordPress allows back — nothing more.',
								'lesson' => 'The assistant is a client, not an authority. It asks; it does not decide.'
							)
						)
					),
					array(
						'id' => 'agent',
						'badge' => 'Not WordPress',
						'title' => 'Coding agent',
						'lede' => 'A coding assistant that writes plugin and theme code. It works outside the site — on a developer’s machine or in a hosted environment — and never runs against a live install.',
						'roles' => array(
							'learns' => array(
								'receives' => 'The attached guidance, plus the task it was asked to do.',
								'does' => 'Writes plugin or theme code, outside the site.',
								'returns' => 'Code a person still has to review and install.',
								'lesson' => 'Nothing here touches a running site. The agent produces text, not changes.'
							),
							'tests' => array(
								'receives' => 'One task and its requirements, as a single message.',
								'does' => 'Writes PHP. It gets no conversation, no retry, and no sight of the assertions.',
								'returns' => 'Whatever it wrote, parsed out of the reply and passed on unrepaired.',
								'lesson' => 'Every model gets exactly the same task, so a difference in the result is a difference in the model.'
							)
						)
					),
					array(
						'id' => 'provider',
						'badge' => 'Not WordPress',
						'title' => 'External AI service',
						'lede' => 'The model provider a site owner configured: an API run by someone else, on someone else’s infrastructure. WordPress sends it a request and receives a result.',
						'roles' => array(
							'uses-ai' => array(
								'receives' => 'The request, once it has crossed out of WordPress.',
								'does' => 'Runs the model on infrastructure WordPress does not control.',
								'returns' => 'A result the provider plugin hands back to the AI Client.',
								'lesson' => 'The model and AI service remain outside WordPress; WordPress owns the integration and request path around them.'
							)
						)
					),
					array(
						'id' => 'task',
						'badge' => 'Not WordPress',
						'title' => 'A WordPress task',
						'lede' => 'The actual work someone wants done: a plugin, a theme, a fix. On this map it stands for the job itself, not for any code running on a site.',
						'roles' => array(
							'learns' => array(
								'receives' => 'The agent’s attention, once the guidance is attached.',
								'does' => 'Stands for the real work — a plugin, a theme, a fix.',
								'returns' => 'Finished code, still outside WordPress.',
								'lesson' => 'The site is not involved until a person installs what the agent wrote.'
							)
						)
					),
					array(
						'id' => 'provider-plugin',
						'badge' => 'WordPress plugin',
						'title' => 'AI provider plugin',
						'lede' => 'A provider-specific integration installed as a WordPress plugin. It speaks one external service’s protocol using the credentials the site owner stored through Connectors.',
						'roles' => array(
							'uses-ai' => array(
								'receives' => 'The routed request from the AI Client.',
								'does' => 'Speaks one external service’s protocol, using the stored credentials.',
								'returns' => 'That service’s reply, handed back to the AI Client.',
								'lesson' => 'The provider-specific part is a plugin. Swapping providers does not change the feature that asked.'
							)
						)
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
