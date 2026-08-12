<?php
// This file is generated. Do not modify it manually.
return array(
	'core-ai-map' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'core-ai/core-ai-map',
		'version' => '0.1.0',
		'title' => 'Core AI Living Map',
		'category' => 'design',
		'icon' => 'wordpress',
		'description' => 'An interactive Core AI project map for a landscape iPad kiosk.',
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
			'title' => array(
				'type' => 'string',
				'default' => 'How does WordPress become AI-ready?'
			),
			'intro' => array(
				'type' => 'string',
				'default' => 'Explore six open-source projects that help people and AI work with WordPress.'
			),
			'prompt' => array(
				'type' => 'string',
				'default' => 'Tap to explore the living block map'
			),
			'inactivityTimeout' => array(
				'type' => 'number',
				'default' => 60
			),
			'offlineEnabled' => array(
				'type' => 'boolean',
				'default' => true
			),
			'projects' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'abilities',
						'name' => 'Abilities API',
						'kicker' => 'Declare what WordPress can do',
						'description' => 'A shared way to register and discover WordPress capabilities in a human- and machine-readable format.',
						'technical' => 'Abilities define inputs, outputs, permissions, and callbacks so plugins, people, and agents can safely discover and invoke site functionality.',
						'status' => 'In WordPress Core',
						'href' => 'https://developer.wordpress.org/apis/abilities-api/'
					),
					array(
						'id' => 'skills',
						'name' => 'Agent Skills',
						'kicker' => 'Teach agents WordPress',
						'description' => 'Reusable expert guidance that helps AI coding assistants follow modern WordPress practices.',
						'technical' => 'Skills package focused instructions for blocks, themes, plugins, APIs, performance, and security so coding agents can use current WordPress conventions.',
						'status' => 'Open-source project',
						'href' => 'https://github.com/WordPress/agent-skills'
					),
					array(
						'id' => 'client',
						'name' => 'AI Client',
						'kicker' => 'Connect to AI providers',
						'description' => 'A standard, provider-independent way for WordPress code to request generative AI output.',
						'technical' => 'The AI Client gives plugins a uniform PHP API for models with different providers and capabilities, reducing provider-specific integration code.',
						'status' => 'In WordPress Core',
						'href' => 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/'
					),
					array(
						'id' => 'plugin',
						'name' => 'AI Plugin',
						'kicker' => 'Try AI features in WordPress',
						'description' => 'A modular home for user-facing AI features and experiments built with the Core AI foundations.',
						'technical' => 'The plugin demonstrates production-minded AI experiences while providing reference implementations that the ecosystem can inspect and extend.',
						'status' => 'Available to test',
						'href' => 'https://wordpress.org/plugins/ai/'
					),
					array(
						'id' => 'mcp',
						'name' => 'MCP Adapter',
						'kicker' => 'Bridge WordPress and AI clients',
						'description' => 'A bridge that exposes eligible WordPress abilities through the Model Context Protocol.',
						'technical' => 'The adapter lets authorized MCP clients discover and invoke registered abilities while WordPress remains responsible for permissions and execution.',
						'status' => 'Open-source plugin',
						'href' => 'https://github.com/WordPress/mcp-adapter'
					),
					array(
						'id' => 'bench',
						'name' => 'WP Bench',
						'kicker' => 'Benchmark WordPress coding',
						'description' => 'The official benchmark for evaluating how well AI agents complete real WordPress development tasks.',
						'technical' => 'WP Bench runs generated solutions in sandboxed WordPress environments and grades them with static analysis and runtime assertions, making model comparisons reproducible.',
						'status' => 'Open-source benchmark',
						'href' => 'https://github.com/WordPress/wp-bench'
					)
				)
			),
			'scenarios' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'create',
						'label' => 'Create with AI',
						'description' => 'See how an AI-powered feature can use a common model interface and WordPress capabilities.',
						'projects' => array(
							'plugin',
							'client',
							'abilities'
						)
					),
					array(
						'id' => 'connect',
						'label' => 'Let an assistant work with WordPress',
						'description' => 'Follow the path from agent know-how to a protocol bridge and an authorized site capability.',
						'projects' => array(
							'skills',
							'mcp',
							'abilities'
						)
					),
					array(
						'id' => 'build',
						'label' => 'Build the WordPress way',
						'description' => 'Combine current WordPress guidance, a provider-independent client, and a working reference plugin.',
						'projects' => array(
							'skills',
							'client',
							'plugin'
						)
					),
					array(
						'id' => 'evaluate',
						'label' => 'Test what agents can build',
						'description' => 'Use a shared execution benchmark to assess WordPress coding and improve reusable agent guidance.',
						'projects' => array(
							'bench',
							'skills'
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
