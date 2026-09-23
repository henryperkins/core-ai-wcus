import {
	getContext,
	getElement,
	store,
	useEffect,
} from '@wordpress/interactivity';

import './view';

jest.mock(
	'@wordpress/interactivity',
	() => ( {
		getContext: jest.fn(),
		getElement: jest.fn(),
		store: jest.fn(),
		useEffect: jest.fn(),
	} ),
	{ virtual: true }
);

const mapStore = store.mock.calls.find(
	( [ namespace ] ) => namespace === 'core-ai/map'
)[ 1 ];

const LAYOUT = {
	'uses-ai': {
		members: { plugin: 1, client: 2, provider: 4 },
		sidecars: [ 'connectors' ],
		providerPlugin: {
			step: 3,
			position: [ 844, 192 ],
			restPosition: [ 844, 332 ],
		},
		place: {
			plugin: [ 268, 192 ],
			client: [ 556, 192 ],
			connectors: [ 790, 440 ],
			provider: [ 1150, 206 ],
		},
		park: [ 'mcp', 'abilities', 'bench' ],
		shelfY: 640,
		shelfStart: 0,
		strips: { connectors: [ 0, -70 ] },
		edges: [
			'M504 266 L556 266',
			'M792 266 L840 266',
			'M1024 266 L1146 266',
		],
		support: [ 'M908 434 L908 346' ],
		supportRest: [ 'M1030 312 C1030 334 966 318 934 328' ],
		rest: [
			'M504 234 L556 234',
			'M792 234 C810 234 806 384 824 384',
			'M1024 384 C1080 384 1094 390 1150 390',
		],
		dur: [ '1.5s', '1.9s', '1.7s' ],
		crosses: [ 'right' ],
	},
	'uses-wp': {
		members: { assistant: 1, mcp: 2, abilities: 3 },
		place: {
			assistant: [ 24, 120 ],
			mcp: [ 122, 318 ],
			abilities: [ 556, 318 ],
		},
		park: [ 'plugin', 'client', 'connectors', 'bench' ],
		shelfY: 640,
		strips: { mcp: [ 0, -58 ], abilities: [ 0, -58 ] },
		edges: [ 'M114 262 L114 392 L118 392', 'M358 392 L556 392' ],
		rest: [ 'M114 276 L230 395', 'M358 474 L556 474' ],
		dur: [ '2.1s', '1.9s' ],
		crosses: [ 'left' ],
		tokens: true,
	},
	learns: {
		members: { skills: 1, agent: 2, task: 3 },
		quiet: [ 'abilities', 'client', 'mcp' ],
		place: {
			skills: [ 24, 140 ],
			agent: [ 24, 300 ],
			task: [ 24, 462 ],
			abilities: [ 292, 150 ],
			client: [ 292, 262 ],
			mcp: [ 292, 374 ],
		},
		park: [ 'plugin', 'connectors', 'bench' ],
		shelfY: 640,
		shelfLabel: 'No skill covers these yet',
		edges: [
			'M114 262 L114 296',
			'M114 424 L114 458',
			'M204 522 L228 522',
		],
		rest: [ 'M114 276 L114 310', 'M114 446 L114 470', 'M204 540 L228 540' ],
		support: [ 'M206 200 L288 200' ],
		supportRest: [ 'M206 300 L288 300' ],
		gate: true,
		next: 'tests',
		dur: [ '1.4s', '1.4s', '1s' ],
		crosses: [],
		zone: 'outside',
	},
	tests: {
		members: { agent: 1, bench: 2 },
		place: { agent: [ 24, 298 ], bench: [ 556, 652 ] },
		park: [ 'plugin', 'client', 'connectors', 'mcp', 'abilities' ],
		noStrip: [ 'bench' ],
		shelfY: 140,
		shelfXs: [ 236, 394, 552, 710, 868 ],
		shelfK: 0.64,
		edges: [ 'M114 422 L546 726' ],
		rest: [ 'M114 402 L546 722' ],
		dur: [ '2.8s' ],
		crosses: [ 'left', 'bottom' ],
	},
};

describe( 'Core AI Living Block Map', () => {
	let context;
	let currentElement;
	let root;

	beforeAll( () => {
		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			value: 'visible',
		} );
		window.matchMedia = jest.fn( () => ( { matches: false } ) );
	} );

	beforeEach( () => {
		jest.useFakeTimers();
		document.body.innerHTML = `
			<header><a href="/elsewhere">Theme navigation</a></header>
			<section
				class="core-ai-map"
				data-inactivity-timeout="90000"
				data-offline-enabled="false"
			>
				<button class="core-ai-map__prompt" type="button">Start with WordPress uses AI</button>
				<button class="core-ai-map__attract-browse" type="button">
					Compare components
				</button>
				<button class="core-ai-map__about-trigger" type="button">
					About this exhibit
				</button>
				<button class="core-ai-map__browse" type="button">
					Compare components
				</button>
				<button class="core-ai-map__reset" type="button">Start over</button>
				<div class="core-ai-map__block core-ai-map__block--plugin">
					<button class="core-ai-map__block-body" type="button">
						<span class="core-ai-map__step">1</span>AI Plugin
					</button>
				</div>
				<div class="core-ai-map__block core-ai-map__block--client">
					<button class="core-ai-map__block-body" type="button">
						<span class="core-ai-map__step">2</span>AI Client
					</button>
				</div>
				<div class="core-ai-map__actor core-ai-map__actor--assistant">
					<button class="core-ai-map__actor-body" type="button" aria-controls="core-ai-map-test-panel-assistant">
						<span class="core-ai-map__step">1</span>AI assistant
					</button>
				</div>
				<div class="core-ai-map__block core-ai-map__block--mcp">
					<button class="core-ai-map__block-body" type="button" aria-controls="core-ai-map-test-panel-mcp">
						<span class="core-ai-map__step">2</span>MCP Adapter
					</button>
				</div>
				<div class="core-ai-map__block core-ai-map__block--abilities">
					<button class="core-ai-map__block-body" type="button" aria-controls="core-ai-map-test-panel-abilities">
						<span class="core-ai-map__step">3</span>Abilities API
					</button>
				</div>
				<aside class="core-ai-map__details">
					<button class="core-ai-map__details-close" type="button">
						Back to the map
					</button>
					<button class="core-ai-map__details-next" type="button">
						Next step
					</button>
				</aside>
				<aside class="core-ai-map__about" role="dialog" aria-modal="true">
					<button class="core-ai-map__about-close" type="button">
						Close
					</button>
				</aside>
			</section>
		`;

		root = document.querySelector( '.core-ai-map' );
		context = {
			screen: 'attract',
			story: '',
			inspect: '',
			previewIndex: 0,
			previewPhase: 'assembling',
			attractPhase: 'assembling',
			flowPhase: 'settled',
			idleStoryIndex: 0,
			isOffline: false,
			ready: false,
			resetWarning: false,
			offlineCacheStatus: 'Not enabled',
			wakeLockStatus: 'Checking',
			suggestion: 0,
			announcement: '',
			pendingTakeawayStory: '',
			recompose: true,
			shapes: true,
			storyIds: [ 'uses-ai', 'uses-wp', 'learns', 'tests' ],
			storyCopy: {
				'uses-ai': 'A plugin asks the AI Client for a capability.',
				'uses-wp':
					'A person asks an outside assistant for available booking times.',
			},
			openingStory: 'uses-ai',
			storyTitles: {
				'uses-ai': 'WordPress uses AI',
				'uses-wp': 'AI uses WordPress',
				learns: 'An agent learns WordPress',
				tests: 'WordPress tests the result',
			},
			storyTakeaways: {
				'uses-ai':
					'A WordPress feature uses a common AI interface instead of integrating directly with every provider.',
				'uses-wp':
					'The MCP Adapter is a plugin at the WordPress boundary, not part of Core, and only translates. Core’s Abilities API returns available times or a refusal.',
			},
			storySituations: {
				'uses-ai':
					'A feature inside WordPress needs an AI-generated result.',
				'uses-wp':
					'A person asks an outside assistant to check which booking times are available on this WordPress site.',
			},
			storyOutcomes: {
				'uses-ai': 'WordPress requests an AI result',
				'uses-wp':
					'An assistant checks booking availability in WordPress',
			},
			storySteps: {
				'uses-ai': '1 → 2 → 3 → 4',
				'uses-wp': '1 → 2 → 3',
				learns: '1 → 2 → 3',
				tests: '1 → 2',
			},
			participants: {
				'uses-ai': [
					'plugin',
					'client',
					'provider',
					'connectors',
					'provider-plugin',
				],
				'uses-wp': [ 'assistant', 'mcp', 'abilities' ],
				learns: [ 'skills', 'agent', 'task' ],
				tests: [ 'agent', 'bench' ],
			},
			walkthroughs: {
				'uses-wp': [ 'assistant', 'mcp', 'abilities' ],
			},
			cardTitles: {
				plugin: 'AI Plugin',
				client: 'AI Client',
				bench: 'WP-Bench',
				assistant: 'AI assistant',
				mcp: 'MCP Adapter',
				abilities: 'Abilities API',
				skills: 'Agent Skills',
				'provider-plugin': 'AI provider plugin',
			},
			cardStatuses: {
				plugin: 'WordPress plugin, Experimental',
				client: 'Core API, Since 7.0',
				bench: 'Core AI project, Early benchmark',
				assistant: 'External, AI assistant',
				mcp: 'WordPress plugin, Not in Core',
				abilities: 'Core API, Since 6.9',
				skills: 'Core AI project, Guidance',
				'provider-plugin': 'WordPress plugin, Not in Core',
			},
			guidance: {
				attract: 'Choose a flow to begin.',
				flow: 'Follow %1$s. Highlighted components take part in this flow. Tap one to learn what it contributes.',
				inspect: 'You are viewing this component’s role in “%1$s.”',
				browse: 'Open any component to learn what it is and where it belongs.',
				cardAction: '%1$s — view its role in “%2$s.”',
				cardActionStep: 'Step %1$s: %2$s — view its role in “%3$s.”',
				cardActionBrowse: '%1$s — %2$s. Open its details.',
				cardActionBrowseStart:
					'Start here: %1$s — %2$s. Open its details.',
				cardQuiet: '%1$s — what “%2$s” is about. Open its details.',
				cardInactive: '%1$s — not part of this flow.',
			},
			labels: {
				railEmptyLabel: 'Guided stories',
				railActiveLabel: 'Choose another flow',
				takeawayHeading: 'What this flow shows',
				shelfLabel: 'Also part of the ecosystem',
			},
			announcements: {
				flowSelected: '%1$s.',
				flowReplayed: '%1$s replayed.',
				takeaway: '%1$s: %2$s',
				browse: 'All components are on the canvas with no flow selected. Start with AI Client, then compare what ships in Core, what is installed, and what stays outside WordPress.',
				nextSuggestion: 'The AI Plugin shows the next suggestion.',
				detailsStep:
					'Step %1$s of %2$s: %3$s. Its role in %4$s is open.',
			},
			benchOrder: [ 'task', 'model', 'sandbox', 'checks', 'evidence' ],
			benchTitles: {
				task: 'One task, one message',
				model: 'Whatever the model wrote',
				sandbox: 'A real WordPress, thrown away after',
				checks: 'WordPress is the grader',
				evidence: 'Pass or fail. Never a percentage',
			},
			neutral: {
				plugin: [ 268, 160 ],
				client: [ 556, 160 ],
				connectors: [ 912, 160 ],
				mcp: [ 216, 400 ],
				abilities: [ 556, 400 ],
				bench: [ 556, 672 ],
				assistant: [ 24, 120 ],
				skills: [ 24, 240 ],
				agent: [ 24, 360 ],
				provider: [ 1150, 330 ],
				task: [ 24, 480 ],
				'provider-plugin': [ 912, 400 ],
			},
			loose: {
				plugin: [ -38, 26, -1.4 ],
			},
			shelfX: [ 236, 414, 592, 770, 948, 1126 ],
			layout: LAYOUT,
			suggestions: [
				{ label: 'Alt text', text: 'Two people reviewing a site' },
				{ label: 'Post title', text: 'A quieter way to explain AI' },
			],
			phases: [ 'Needs review', 'Applied' ],
			previews: [
				{
					storyId: 'uses-ai',
					scale: 0.8,
					ids: [ 'plugin', 'client', 'provider' ],
					steps: { plugin: 1, client: 2, provider: 0 },
					sidecars: [ 'connectors' ],
					providerPlugin: {
						step: 3,
						position: [ 716, 200 ],
						scale: 0.8,
					},
					at: {
						plugin: [ 260, 200 ],
						client: [ 488, 200 ],
						connectors: [ 728, 340 ],
						provider: [ 1060, 211 ],
					},
				},
				{
					storyId: 'uses-wp',
					scale: 0.8,
					ids: [ 'assistant', 'mcp', 'abilities' ],
					at: {},
				},
			],
		};
		currentElement = root;

		getContext.mockImplementation( () => context );
		getElement.mockImplementation( () => ( { ref: currentElement } ) );
		useEffect.mockReset();
	} );

	it( 'keeps phone inspection mode across portrait and landscape', () => {
		const effects = [];
		let viewportWidth = 390;
		let viewportHeight = 844;
		Object.defineProperties( root, {
			clientWidth: {
				configurable: true,
				get: () => viewportWidth,
			},
			clientHeight: {
				configurable: true,
				get: () => viewportHeight,
			},
		} );
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		expect( root.classList ).toContain( 'is-phone-inspection' );
		expect(
			Number.parseFloat( root.style.getPropertyValue( '--cai-scale' ) )
		).toBeCloseTo( 0.7496339677891655, 10 );

		viewportWidth = 844;
		viewportHeight = 390;
		window.dispatchEvent( new Event( 'orientationchange' ) );

		expect( root.classList ).toContain( 'is-phone-inspection' );
		expect(
			Number.parseFloat( root.style.getPropertyValue( '--cai-scale' ) )
		).toBeCloseTo( 0.7496339677891655, 10 );

		cleanupKiosk();
	} );

	it( 'keeps iPad kiosk viewports on the centered fit path', () => {
		const effects = [];
		let viewportWidth = 1024;
		let viewportHeight = 768;
		Object.defineProperties( root, {
			clientWidth: {
				configurable: true,
				get: () => viewportWidth,
			},
			clientHeight: {
				configurable: true,
				get: () => viewportHeight,
			},
		} );
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		expect( root.classList ).not.toContain( 'is-phone-inspection' );
		expect(
			Number.parseFloat( root.style.getPropertyValue( '--cai-scale' ) )
		).toBeCloseTo( 0.7496339677891655, 10 );

		viewportWidth = 1366;
		viewportHeight = 1024;
		window.dispatchEvent( new Event( 'resize' ) );

		expect( root.classList ).not.toContain( 'is-phone-inspection' );
		expect(
			Number.parseFloat( root.style.getPropertyValue( '--cai-scale' ) )
		).toBe( 1 );

		cleanupKiosk();
	} );

	describe( 'desktop browsing', () => {
		let originalMatchMedia;
		let desktopQuery;
		let viewportWidth;
		let viewportHeight;
		let fixture;

		beforeEach( () => {
			originalMatchMedia = window.matchMedia;
			desktopQuery = new EventTarget();
			desktopQuery.matches = true;
			window.matchMedia = jest.fn( ( query ) =>
				query === '(hover: hover) and (pointer: fine)'
					? desktopQuery
					: { matches: false }
			);
			viewportWidth = 1440;
			viewportHeight = 800;
			fixture = undefined;
			Object.defineProperties( root, {
				offsetWidth: { configurable: true, get: () => viewportWidth },
				clientWidth: {
					configurable: true,
					get: () => viewportWidth - 15,
				},
				clientHeight: { configurable: true, get: () => viewportHeight },
			} );
		} );

		afterEach( () => {
			fixture?.cleanup();
			window.matchMedia = originalMatchMedia;
		} );

		it( 'fits the available width without shrinking for a short window', () => {
			fixture = mountMotionFixture();
			expect( root.classList ).toContain( 'is-desktop-view' );
			expect(
				Number( root.style.getPropertyValue( '--cai-scale' ) )
			).toBeCloseTo( 1425 / 1366 );

			root.scrollTop = 250;
			viewportHeight = 500;
			window.dispatchEvent( new Event( 'resize' ) );
			expect(
				Number( root.style.getPropertyValue( '--cai-scale' ) )
			).toBeCloseTo( 1425 / 1366 );
			expect( root.scrollTop ).toBe( 250 );
			expect( root.classList ).not.toContain( 'is-phone-inspection' );
			expect( root.classList ).not.toContain( 'is-pannable-inspection' );

			viewportWidth = 2560;
			window.dispatchEvent( new Event( 'resize' ) );
			expect(
				Number( root.style.getPropertyValue( '--cai-scale' ) )
			).toBeCloseTo( 1600 / 1366 );

			viewportWidth = 800;
			window.dispatchEvent( new Event( 'resize' ) );
			expect( root.classList ).toContain( 'is-desktop-view' );
			expect(
				Number( root.style.getPropertyValue( '--cai-scale' ) )
			).toBeCloseTo( 1024 / 1366 );
		} );

		it( 'keeps the current component open while a desktop reader is inactive', () => {
			context.screen = 'inspect';
			context.story = 'uses-wp';
			context.inspect = 'mcp';
			fixture = mountMotionFixture();

			jest.advanceTimersByTime( 300000 );
			expect( context.screen ).toBe( 'inspect' );
			expect( context.story ).toBe( 'uses-wp' );
			expect( context.inspect ).toBe( 'mcp' );
			expect( context.resetWarning ).toBe( false );
		} );

		it( 'preserves enlargement when a desktop reader zooms the browser', () => {
			const originalProperties = Object.fromEntries(
				[ 'devicePixelRatio', 'outerWidth', 'outerHeight' ].map(
					( key ) => [
						key,
						Object.getOwnPropertyDescriptor( window, key ),
					]
				)
			);
			let pixelRatio = 1;
			Object.defineProperties( window, {
				devicePixelRatio: { configurable: true, get: () => pixelRatio },
				outerWidth: { configurable: true, value: 1440 },
				outerHeight: { configurable: true, value: 900 },
			} );
			try {
				fixture = mountMotionFixture();
				const initialScale = Number(
					root.style.getPropertyValue( '--cai-scale' )
				);
				viewportWidth = 720;
				viewportHeight = 400;
				pixelRatio = 2;
				window.dispatchEvent( new Event( 'resize' ) );
				const zoomedScale = Number(
					root.style.getPropertyValue( '--cai-scale' )
				);
				expect( root.classList ).toContain( 'is-desktop-view' );
				// The page magnifies the map instead of fitting it back down.
				expect( zoomedScale * pixelRatio ).toBeGreaterThan(
					initialScale * 1.9
				);
				expect(
					Number.parseFloat(
						root.style.getPropertyValue( '--cai-viewport-height' )
					) * zoomedScale
				).toBeCloseTo( 400 );

				viewportWidth = 1440;
				viewportHeight = 800;
				pixelRatio = 1;
				window.dispatchEvent( new Event( 'resize' ) );
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBeCloseTo( initialScale );
			} finally {
				Object.defineProperties( window, originalProperties );
			}
		} );

		it( 'reveals keyboard focus in the scrollable desktop map', () => {
			context.screen = 'map';
			fixture = mountMotionFixture();
			const button = root.querySelector( '.core-ai-map__browse' );
			button.scrollIntoView = jest.fn();
			button.focus();
			expect( document.activeElement ).toBe( button );
			expect( button.scrollIntoView ).toHaveBeenCalledWith( {
				block: 'nearest',
				inline: 'nearest',
			} );
		} );

		it( 'cancels a kiosk warning when a mouse becomes primary and restores touch inactivity', () => {
			desktopQuery.matches = false;
			context.screen = 'map';
			fixture = mountMotionFixture();
			jest.advanceTimersByTime( 70000 );
			expect( context.resetWarning ).toBe( true );

			desktopQuery.matches = true;
			desktopQuery.dispatchEvent( new Event( 'change' ) );
			expect( root.classList ).toContain( 'is-desktop-view' );
			expect( context.resetWarning ).toBe( false );
			jest.advanceTimersByTime( 300000 );
			expect( context.screen ).toBe( 'map' );
			expect( context.resetWarning ).toBe( false );

			desktopQuery.matches = false;
			desktopQuery.dispatchEvent( new Event( 'change' ) );
			expect( root.classList ).not.toContain( 'is-desktop-view' );
			jest.advanceTimersByTime( 70000 );
			expect( context.resetWarning ).toBe( true );
			jest.advanceTimersByTime( 20000 );
			expect( context.screen ).toBe( 'attract' );

			fixture.cleanup();
			fixture = undefined;
			desktopQuery.matches = true;
			desktopQuery.dispatchEvent( new Event( 'change' ) );
			expect( root.classList ).not.toContain( 'is-desktop-view' );
		} );
	} );

	it.each( [ 1, 2 ] )(
		'preserves enlargement at browser zoom with initial DPR %i',
		( initialRatio ) => {
			const effects = [];
			let viewportWidth = 1366;
			let viewportHeight = 1024;
			const originalRatio = window.devicePixelRatio;
			Object.defineProperties( root, {
				clientWidth: { configurable: true, get: () => viewportWidth },
				clientHeight: { configurable: true, get: () => viewportHeight },
			} );
			Object.defineProperty( window, 'devicePixelRatio', {
				configurable: true,
				writable: true,
				value: initialRatio,
			} );
			useEffect.mockImplementation( ( effect ) =>
				effects.push( effect )
			);
			mapStore.callbacks.useKiosk();
			const cleanup = effects[ 0 ]();
			try {
				expect( root.classList ).not.toContain(
					'is-pannable-inspection'
				);
				viewportWidth = 683;
				viewportHeight = 512;
				window.devicePixelRatio = initialRatio * 2;
				window.dispatchEvent( new Event( 'resize' ) );
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBe( 1 );
				expect( root.classList ).toContain( 'is-pannable-inspection' );
				expect( root.classList ).not.toContain( 'is-phone-inspection' );
				const button = root.querySelector( '.core-ai-map__reset' );
				button.scrollIntoView = jest.fn();
				button.focus();
				expect( button.scrollIntoView ).toHaveBeenCalledWith( {
					block: 'nearest',
					inline: 'nearest',
				} );
				window.devicePixelRatio = initialRatio;
				viewportWidth = 1366;
				viewportHeight = 1024;
				window.dispatchEvent( new Event( 'resize' ) );
				expect( root.classList ).not.toContain(
					'is-pannable-inspection'
				);
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBe( 1 );
			} finally {
				cleanup();
				window.devicePixelRatio = originalRatio;
			}
		}
	);

	it.each( [
		[ 1024, 768, 0.7496339677891655 ],
		[ 1366, 1024, 1 ],
	] )(
		'restores the centered %i by %i viewport after zoom adds scrollbars',
		( width, height, expectedScale ) => {
			const effects = [];
			let zoom = 1;
			const originalRatio = window.devicePixelRatio;
			const scrollbar = () =>
				root.classList.contains( 'is-pannable-inspection' ) ? 15 : 0;
			Object.defineProperties( root, {
				offsetWidth: { configurable: true, get: () => width / zoom },
				offsetHeight: { configurable: true, get: () => height / zoom },
				clientWidth: {
					configurable: true,
					get: () => width / zoom - scrollbar(),
				},
				clientHeight: {
					configurable: true,
					get: () => height / zoom - scrollbar(),
				},
			} );
			Object.defineProperty( window, 'devicePixelRatio', {
				configurable: true,
				writable: true,
				value: 1,
			} );
			useEffect.mockImplementation( ( effect ) =>
				effects.push( effect )
			);
			mapStore.callbacks.useKiosk();
			const cleanup = effects[ 0 ]();
			try {
				zoom = 2;
				window.devicePixelRatio = 2;
				window.dispatchEvent( new Event( 'resize' ) );
				expect( root.classList ).toContain( 'is-pannable-inspection' );
				root.scrollLeft = 100;
				root.scrollTop = 60;
				zoom = 1;
				window.devicePixelRatio = 1;
				window.dispatchEvent( new Event( 'resize' ) );
				expect( root.classList ).not.toContain(
					'is-pannable-inspection'
				);
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBeCloseTo( expectedScale, 10 );
				expect( root.scrollLeft ).toBe( 0 );
				expect( root.scrollTop ).toBe( 0 );
			} finally {
				cleanup();
				window.devicePixelRatio = originalRatio;
			}
		}
	);

	it.each( [
		[ 1, 2, 1 ],
		[ 2, 1, 1 ],
		[ 1, 2, 1.25 ],
		[ 2, 1, 1.25 ],
	] )(
		'preserves a display change from DPR %f to %f at zoom %f',
		( initialRatio, displayRatio, initialZoom ) => {
			const effects = [];
			let width = 1366;
			let height = 1024;
			const originalRatio = window.devicePixelRatio;
			Object.defineProperties( root, {
				offsetWidth: { configurable: true, get: () => width },
				offsetHeight: { configurable: true, get: () => height },
			} );
			window.devicePixelRatio = initialRatio;
			useEffect.mockImplementation( ( effect ) =>
				effects.push( effect )
			);
			mapStore.callbacks.useKiosk();
			const cleanup = effects[ 0 ]();
			try {
				width = Math.round( 1366 / initialZoom );
				height = Math.round( 1024 / initialZoom );
				window.devicePixelRatio = initialRatio * initialZoom;
				window.dispatchEvent( new Event( 'resize' ) );
				window.devicePixelRatio = displayRatio * initialZoom;
				window.dispatchEvent( new Event( 'resize' ) );
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBeCloseTo( 1, 2 );
				expect( root.classList ).not.toContain( 'is-phone-inspection' );
				expect(
					root.classList.contains( 'is-pannable-inspection' )
				).toBe( initialZoom > 1 );

				// Page zoom must continue to work against the new display density.
				width = 683;
				height = 512;
				window.devicePixelRatio = displayRatio * 2;
				window.dispatchEvent( new Event( 'resize' ) );
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBeCloseTo( 1, 2 );
				expect( root.classList ).toContain( 'is-pannable-inspection' );

				width = 1366;
				height = 1024;
				window.devicePixelRatio = displayRatio;
				window.dispatchEvent( new Event( 'resize' ) );
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBeCloseTo( 1, 2 );
				expect( root.classList ).not.toContain(
					'is-pannable-inspection'
				);
			} finally {
				cleanup();
				window.devicePixelRatio = originalRatio;
			}
		}
	);

	it.each( [
		[ 1, 2 ],
		[ 2, 1 ],
	] )(
		'refits a resized browser window when display density changes from %i to %i',
		( initialRatio, displayRatio ) => {
			const effects = [];
			let ratio = initialRatio;
			const originalRatio = window.devicePixelRatio;
			const originalWidth = Object.getOwnPropertyDescriptor(
				window,
				'outerWidth'
			);
			const originalHeight = Object.getOwnPropertyDescriptor(
				window,
				'outerHeight'
			);
			Object.defineProperties( root, {
				offsetWidth: { configurable: true, get: () => 2732 / ratio },
				offsetHeight: { configurable: true, get: () => 2048 / ratio },
			} );
			Object.defineProperties( window, {
				outerWidth: { configurable: true, get: () => 2732 / ratio },
				outerHeight: { configurable: true, get: () => 2200 / ratio },
			} );
			window.devicePixelRatio = initialRatio;
			useEffect.mockImplementation( ( effect ) =>
				effects.push( effect )
			);
			mapStore.callbacks.useKiosk();
			const cleanup = effects[ 0 ]();
			try {
				ratio = displayRatio;
				window.devicePixelRatio = displayRatio;
				window.dispatchEvent( new Event( 'resize' ) );
				expect(
					Number( root.style.getPropertyValue( '--cai-scale' ) )
				).toBe( displayRatio === 2 ? 1 : 2 );
				expect( root.classList ).not.toContain(
					'is-pannable-inspection'
				);
				expect( root.classList ).not.toContain( 'is-phone-inspection' );
			} finally {
				cleanup();
				window.devicePixelRatio = originalRatio;
				Object.defineProperty( window, 'outerWidth', originalWidth );
				Object.defineProperty( window, 'outerHeight', originalHeight );
			}
		}
	);

	it( 'rebases display density without a resize before the next page zoom and removes its listener', () => {
		const effects = [];
		const queries = [];
		let width = 1366;
		let height = 1024;
		const originalRatio = window.devicePixelRatio;
		const originalMatchMedia = window.matchMedia;
		window.matchMedia = ( query ) => {
			if ( ! query.startsWith( '(resolution:' ) ) {
				return originalMatchMedia( query );
			}
			const result = new EventTarget();
			queries.push( result );
			return result;
		};
		Object.defineProperties( root, {
			offsetWidth: { configurable: true, get: () => width },
			offsetHeight: { configurable: true, get: () => height },
		} );
		context.screen = 'map';
		window.devicePixelRatio = 1;
		useEffect.mockImplementation( ( effect ) => effects.push( effect ) );
		mapStore.callbacks.useKiosk();
		const cleanup = effects[ 0 ]();
		try {
			window.devicePixelRatio = 2;
			queries.at( -1 )?.dispatchEvent( new Event( 'change' ) );
			width = 683;
			height = 512;
			window.devicePixelRatio = 4;
			window.dispatchEvent( new Event( 'resize' ) );
			queries.at( -1 )?.dispatchEvent( new Event( 'change' ) );
			expect(
				Number( root.style.getPropertyValue( '--cai-scale' ) )
			).toBe( 1 );
			expect( root.classList ).toContain( 'is-pannable-inspection' );
			expect( root.classList ).not.toContain( 'is-phone-inspection' );
			cleanup();
			width = 1000;
			height = 800;
			window.devicePixelRatio = 1;
			queries.at( -1 )?.dispatchEvent( new Event( 'change' ) );
			expect(
				Number( root.style.getPropertyValue( '--cai-scale' ) )
			).toBe( 1 );
		} finally {
			cleanup();
			window.devicePixelRatio = originalRatio;
			window.matchMedia = originalMatchMedia;
		}
	} );

	it( 'shows the fallback continuation cue only while content remains below', async () => {
		const effects = [];
		const details = root.querySelector( '.core-ai-map__details' );
		let contentHeight = 400;
		Object.defineProperties( details, {
			clientHeight: { configurable: true, value: 400 },
			scrollHeight: { configurable: true, get: () => contentHeight },
		} );
		context.screen = 'inspect';
		context.inspect = 'client';
		useEffect.mockImplementation( ( effect ) => effects.push( effect ) );
		mapStore.callbacks.useKiosk();
		const cleanup = effects[ 0 ]();
		try {
			jest.advanceTimersByTime( 32 );
			expect( details.classList ).not.toContain( 'has-more-content' );
			contentHeight = 900;
			details.appendChild( document.createElement( 'article' ) );
			await Promise.resolve();
			jest.advanceTimersByTime( 32 );
			expect( details.classList ).toContain( 'has-more-content' );
			details.scrollTop = 500;
			details.dispatchEvent( new Event( 'scroll' ) );
			jest.advanceTimersByTime( 32 );
			expect( details.classList ).not.toContain( 'has-more-content' );
			details.scrollTop = 200;
			details.dispatchEvent( new Event( 'scroll' ) );
			jest.advanceTimersByTime( 32 );
			expect( details.classList ).toContain( 'has-more-content' );
			details.hidden = true;
			await Promise.resolve();
			jest.advanceTimersByTime( 32 );
			expect( details.classList ).not.toContain( 'has-more-content' );
		} finally {
			cleanup();
		}
		details.hidden = false;
		details.dispatchEvent( new Event( 'scroll' ) );
		await Promise.resolve();
		jest.advanceTimersByTime( 32 );
		expect( details.classList ).not.toContain( 'has-more-content' );
	} );

	it( 'removes covered theme chrome from the accessibility tree while mounted', () => {
		const effects = [];
		const themeHeader = document.querySelector( 'body > header' );
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		expect( themeHeader.inert ).toBe( true );
		expect( themeHeader.getAttribute( 'aria-hidden' ) ).toBe( 'true' );

		cleanupKiosk();

		expect( themeHeader.inert ).toBe( false );
		expect( themeHeader.hasAttribute( 'aria-hidden' ) ).toBe( false );
	} );

	it( 'synchronizes SVG state markers from the final kiosk effect', () => {
		root.insertAdjacentHTML(
			'beforeend',
			`<svg class="core-ai-map__wires">
				<path data-core-ai-rule="left"></path>
				<path data-core-ai-rule="right"></path>
				<g class="core-ai-map__hairlines is-hidden"></g>
				<g data-core-ai-preview="0"><path class="core-ai-map__preview-path"></path><circle class="core-ai-map__preview-signal"></circle></g>
				<g data-core-ai-preview="1" hidden><path class="core-ai-map__preview-path"></path><circle class="core-ai-map__preview-signal"></circle></g>
				<g class="core-ai-map__flow">
					<path data-core-ai-story="uses-ai" data-core-ai-variant="edges"></path>
					<path data-core-ai-story="uses-ai" data-core-ai-variant="rest"></path>
				</g>
				<path class="core-ai-map__config-path" data-core-ai-story="uses-ai" data-core-ai-variant="edges" hidden></path>
				<path class="core-ai-map__config-path" data-core-ai-story="uses-ai" data-core-ai-variant="rest" hidden></path>
					<path class="core-ai-map__gate" data-core-ai-gate="learns"></path>
				</svg>`
		);
		context.screen = 'map';
		context.story = 'uses-ai';
		context.recompose = false;
		context.flowPhase = 'transition';
		const effects = [];
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);

		mapStore.callbacks.useKiosk();
		effects.at( -1 )();

		const wires = root.querySelector( '.core-ai-map__wires' );
		expect(
			wires.querySelector( '[data-core-ai-rule="right"]' ).classList
		).toContain( 'is-lit' );
		expect(
			wires.querySelector( '[data-core-ai-rule="left"]' ).classList
		).not.toContain( 'is-lit' );
		expect(
			wires.querySelector( '.core-ai-map__hairlines' ).classList
		).not.toContain( 'is-hidden' );
		expect(
			wires
				.querySelector(
					'[data-core-ai-variant="rest"]:not(.core-ai-map__config-path)'
				)
				.classList.contains( 'is-visible' )
		).toBe( true );
		expect(
			wires
				.querySelector(
					'[data-core-ai-variant="rest"]:not(.core-ai-map__config-path)'
				)
				.classList.contains( 'is-live' )
		).toBe( true );
		expect(
			wires
				.querySelector(
					'[data-core-ai-variant="edges"]:not(.core-ai-map__config-path)'
				)
				.classList.contains( 'is-visible' )
		).toBe( false );
		/*
		 * `hidden` is an HTMLElement property, so these SVG nodes are only
		 * really hidden when the attribute itself moves.
		 */
		expect(
			wires
				.querySelector(
					'.core-ai-map__config-path[data-core-ai-variant="rest"]'
				)
				.hasAttribute( 'hidden' )
		).toBe( false );
		expect(
			wires
				.querySelector(
					'.core-ai-map__config-path[data-core-ai-variant="edges"]'
				)
				.hasAttribute( 'hidden' )
		).toBe( true );
		// The stop on the boundary belongs to one flow and shows only there.
		expect(
			wires
				.querySelector( '.core-ai-map__gate' )
				.classList.contains( 'is-visible' )
		).toBe( false );

		context.story = 'learns';
		effects.at( -1 )();
		expect(
			wires
				.querySelector( '.core-ai-map__gate' )
				.classList.contains( 'is-visible' )
		).toBe( true );
		context.story = 'uses-ai';

		context.screen = 'attract';
		context.story = '';
		context.recompose = true;
		context.previewIndex = 1;
		context.previewPhase = 'signalling';
		effects.at( -1 )();

		expect(
			wires.querySelector( '.core-ai-map__hairlines' ).classList
		).toContain( 'is-hidden' );
		expect(
			wires
				.querySelector( '[data-core-ai-preview="0"]' )
				.hasAttribute( 'hidden' )
		).toBe( true );
		expect(
			wires
				.querySelector( '[data-core-ai-preview="1"]' )
				.hasAttribute( 'hidden' )
		).toBe( false );
		expect(
			wires
				.querySelector( '[data-core-ai-preview="1"] path' )
				.classList.contains( 'is-live' )
		).toBe( true );
		expect(
			wires
				.querySelector( '[data-core-ai-preview="1"] circle' )
				.classList.contains( 'is-live' )
		).toBe( true );
		expect(
			wires
				.querySelector(
					'.core-ai-map__config-path[data-core-ai-variant="rest"]'
				)
				.hasAttribute( 'hidden' )
		).toBe( true );
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
		document.body.className = '';
	} );

	const mountMotionFixture = () => {
		const details = root.querySelector( '.core-ai-map__details' );
		const panel = document.createElement( 'div' );
		panel.className = 'core-ai-map__details-motion t-panel-slide';
		panel.hidden = true;
		details.before( panel );
		panel.append( details );
		const about = root.querySelector( '.core-ai-map__about' );
		const modal = document.createElement( 'div' );
		modal.className = 'core-ai-map__about-content t-modal';
		modal.append( ...about.childNodes );
		about.append( modal );
		about.hidden = true;
		const effects = [];
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		currentElement = root;
		mapStore.callbacks.useKiosk();
		const cleanup = effects[ 0 ]();
		const renderEffects = () => {
			currentElement = root;
			effects.slice( 1 ).forEach( ( effect ) => effect() );
		};
		renderEffects();
		return { panel, about, modal, cleanup, renderEffects };
	};

	it( 'keeps the browse caption painted until its surface finishes closing', () => {
		const surface = document.createElement( 'div' );
		surface.className = 'core-ai-map__story-copy';
		root.append( surface );
		context.screen = 'map';
		const { cleanup, renderEffects } = mountMotionFixture();
		try {
			expect( mapStore.state.isBrowseNoteHidden ).toBe( false );
			context.screen = 'inspect';
			renderEffects();
			expect( surface.hidden ).toBe( false );
			expect( surface.hasAttribute( 'inert' ) ).toBe( true );
			expect( mapStore.state.isBrowseNoteHidden ).toBe( false );
			jest.advanceTimersByTime( 220 );
			expect( surface.hidden ).toBe( true );
			expect( mapStore.state.isBrowseNoteHidden ).toBe( true );
		} finally {
			cleanup();
		}
	} );

	it( 'retains the exiting caption after reset without retaining the active story', () => {
		const surface = document.createElement( 'div' );
		surface.className = 'core-ai-map__story-copy';
		root.append( surface );
		context.screen = 'map';
		context.story = 'learns';
		context.storyId = 'learns';
		context.nextStoryId = 'tests';
		const { cleanup, renderEffects } = mountMotionFixture();
		try {
			mapStore.actions.reset();
			renderEffects();
			expect( context.story ).toBe( '' );
			expect( mapStore.state.isStoryNotSelected ).toBe( true );
			expect( mapStore.state.isStoryNextHidden ).toBe( true );
			expect( surface.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
			expect( mapStore.state.isCaptionStoryHidden ).toBe( false );
			expect( mapStore.state.isCaptionNextHidden ).toBe( false );
			jest.advanceTimersByTime( 100 );
			context.screen = 'map';
			context.story = 'uses-ai';
			renderEffects();
			jest.advanceTimersByTime( 220 );
			expect( surface.hidden ).toBe( false );
			expect( mapStore.state.isCaptionStoryHidden ).toBe( true );
			expect( mapStore.state.isCaptionNextHidden ).toBe( true );
			context.storyId = 'uses-ai';
			expect( mapStore.state.isCaptionStoryHidden ).toBe( false );
			context.screen = 'inspect';
			renderEffects();
			jest.advanceTimersByTime( 220 );
			expect( mapStore.state.isCaptionStoryHidden ).toBe( true );
		} finally {
			cleanup();
		}
	} );

	it.each( [ 'inspectCard', 'openAbout', 'openBench', 'reset' ] )(
		'captures the current caption when %s precedes passive synchronization',
		( action ) => {
			const surface = document.createElement( 'div' );
			surface.className = 'core-ai-map__story-copy';
			root.append( surface );
			context.screen = 'map';
			context.story = 'learns';
			context.nextStoryId = 'tests';
			const { cleanup, renderEffects } = mountMotionFixture();
			try {
				context.storyId = 'uses-wp';
				mapStore.actions.selectStory();
				// Leave before useEffect can refresh the previous settled caption.
				context.cardId = 'mcp';
				mapStore.actions[ action ]();
				renderEffects();
				expect( mapStore.state.isCaptionStoryHidden ).toBe( false );
				expect( mapStore.state.isCaptionNextHidden ).toBe( true );
				context.storyId = 'learns';
				expect( mapStore.state.isCaptionStoryHidden ).toBe( true );
			} finally {
				cleanup();
			}
		}
	);

	it.each( [ 'story-copy', 'rail' ] )(
		'fades the %s out before hiding it and cancels dismissal on return',
		( name ) => {
			const surface = document.createElement( 'div' );
			surface.className = `core-ai-map__${ name }`;
			surface.hidden = true;
			root.append( surface );
			context.screen = 'map';
			const { cleanup, renderEffects } = mountMotionFixture();
			try {
				expect( surface.hidden ).toBe( false );
				context.screen = 'inspect';
				renderEffects();
				expect( surface.hidden ).toBe( false );
				expect( surface.hasAttribute( 'inert' ) ).toBe( true );
				jest.advanceTimersByTime( 100 );
				context.screen = 'map';
				renderEffects();
				jest.advanceTimersByTime( 220 );
				expect( surface.hidden ).toBe( false );
				expect( surface.hasAttribute( 'inert' ) ).toBe( false );
				context.screen = 'inspect';
				renderEffects();
				jest.advanceTimersByTime( 220 );
				expect( surface.hidden ).toBe( true );
			} finally {
				cleanup();
			}
		}
	);

	it( 'keeps closing inspector content visible but inert until its exit finishes', () => {
		context.screen = 'map';
		const { panel, cleanup, renderEffects } = mountMotionFixture();
		const card = root.querySelector( '.core-ai-map__block--client button' );
		try {
			currentElement = card;
			context.cardId = 'client';
			mapStore.actions.inspectCard();
			renderEffects();
			expect( panel.hidden ).toBe( false );
			expect( panel.dataset.open ).toBe( 'true' );
			mapStore.actions.closeInspect();
			renderEffects();
			expect( panel.hidden ).toBe( false );
			expect( panel.hasAttribute( 'inert' ) ).toBe( true );
			expect( panel.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
			expect( mapStore.state.isCardNotInspected ).toBe( false );
			jest.advanceTimersByTime( 80 );
			expect( document.activeElement ).toBe( card );
			jest.advanceTimersByTime( 270 );
			expect( panel.hidden ).toBe( true );
			expect( mapStore.state.isCardNotInspected ).toBe( true );
		} finally {
			cleanup();
		}
	} );

	it( 'reveals the conclusion only after settlement and preserves its space during replay', () => {
		const takeaway = document.createElement( 'p' );
		takeaway.dataset.coreAiTakeaway = 'uses-ai';
		takeaway.className = 'core-ai-map__takeaway t-stagger';
		takeaway.innerHTML =
			'<strong class="t-stagger-line">Conclusion</strong>';
		root.append( takeaway );
		const { cleanup, renderEffects } = mountMotionFixture();
		try {
			currentElement = root.querySelector( '.core-ai-map__prompt' );
			mapStore.actions.start();
			renderEffects();
			jest.advanceTimersByTime( 2899 );
			renderEffects();
			expect( takeaway.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
			expect( takeaway.hidden ).toBe( false );
			jest.advanceTimersByTime( 1 );
			renderEffects();
			expect( takeaway.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
			expect( takeaway.classList.contains( 'is-shown' ) ).toBe( true );
			mapStore.actions.replayStory();
			renderEffects();
			expect( takeaway.hidden ).toBe( false );
			expect( takeaway.hasAttribute( 'inert' ) ).toBe( true );
			context.motionReduced = true;
			renderEffects();
			expect( takeaway.classList.contains( 'is-hiding' ) ).toBe( false );
		} finally {
			cleanup();
		}
	} );

	it( 'applies immediately while its translated visual labels finish swapping', () => {
		const workbench = document.createElement( 'div' );
		workbench.innerHTML = `<em data-core-ai-text-swap="phase">Revisar</em>
			<span data-core-ai-text-swap="action">Aplicar</span>`;
		root.append( workbench );
		context.screen = 'map';
		context.phases = [ 'Revisar', 'Aplicado' ];
		context.labels.applyLabel = 'Aplicar';
		context.labels.appliedLabel = 'Aplicado';
		const { cleanup, renderEffects } = mountMotionFixture();
		try {
			mapStore.actions.applySuggestion();
			renderEffects();
			expect( mapStore.state.isSuggestionApplied ).toBe( true );
			expect( mapStore.state.suggestionActionLabel ).toBe( 'Aplicado' );
			expect( workbench.querySelector( 'span' ).textContent ).toBe(
				'Aplicar'
			);
			jest.advanceTimersByTime( 150 );
			expect( workbench.querySelector( 'span' ).textContent ).toBe(
				'Aplicado'
			);
			expect( workbench.querySelector( 'em' ).textContent ).toBe(
				'Aplicado'
			);
		} finally {
			cleanup();
		}
	} );

	it.each( [ 'inspect', 'about' ] )(
		'cancels stale %s exits when reopened and settles closing under reduced motion',
		( screen ) => {
			context.screen = 'map';
			const fixture = mountMotionFixture();
			const { cleanup, renderEffects } = fixture;
			const surface =
				screen === 'inspect' ? fixture.panel : fixture.about;
			const open = screen === 'inspect' ? 'inspectCard' : 'openAbout';
			const close = screen === 'inspect' ? 'closeInspect' : 'closeAbout';
			try {
				context.cardId = 'client';
				mapStore.actions[ open ]();
				renderEffects();
				expect( surface.hidden ).toBe( false );
				mapStore.actions[ close ]();
				renderEffects();
				jest.advanceTimersByTime( 50 );
				mapStore.actions[ open ]();
				renderEffects();
				jest.advanceTimersByTime( 400 );
				expect( surface.hidden ).toBe( false );
				expect( surface.hasAttribute( 'inert' ) ).toBe( false );
				mapStore.actions[ close ]();
				renderEffects();
				context.motionReduced = true;
				renderEffects();
				expect( surface.hidden ).toBe( true );
			} finally {
				cleanup();
			}
			jest.advanceTimersByTime( 500 );
			expect( surface.hidden ).toBe( true );
		}
	);

	it.each( [ 'ltr', 'rtl' ] )(
		'positions the %s Abilities highlight in local coordinates and refits after resize',
		( direction ) => {
			root.setAttribute( 'dir', direction );
			const bar = document.createElement( 'div' );
			bar.className = 'core-ai-map__ability-tabs t-tabs';
			bar.innerHTML = `<span class="t-tabs-pill" aria-hidden="true"></span>
			<button role="tab" data-core-ai-abilities-tab="overview">Overview</button>
			<button role="tab" data-core-ai-abilities-tab="anatomy">Anatomy</button>`;
			root.querySelector( '.core-ai-map__details' ).append( bar );
			const tabs = bar.querySelectorAll( 'button' );
			let secondLeft = 130;
			Object.defineProperties( tabs[ 0 ], {
				offsetLeft: { value: 0 },
				offsetWidth: { value: 124 },
				offsetHeight: { value: 60 },
			} );
			Object.defineProperties( tabs[ 1 ], {
				offsetLeft: { get: () => secondLeft },
				offsetWidth: { value: 142 },
				offsetHeight: { value: 60 },
			} );
			context.screen = 'map';
			const { cleanup, renderEffects } = mountMotionFixture();
			const pill = bar.querySelector( '.t-tabs-pill' );
			try {
				context.cardId = 'abilities';
				mapStore.actions.inspectCard();
				renderEffects();
				expect( pill.style.transform ).toBe( 'translateX(0px)' );
				expect( pill.style.left ).toBe( '0px' );
				expect( pill.style.right ).toBe( 'auto' );
				expect( pill.style.width ).toBe( '124px' );
				currentElement = tabs[ 1 ];
				context.tabId = 'anatomy';
				mapStore.actions.selectAbilityTab();
				renderEffects();
				expect( pill.style.transform ).toBe( 'translateX(130px)' );
				expect( pill.style.width ).toBe( '142px' );
				secondLeft = 150;
				window.dispatchEvent( new Event( 'resize' ) );
				expect( pill.style.transform ).toBe( 'translateX(150px)' );
				expect( tabs[ 1 ].tabIndex ).toBe( 0 );
			} finally {
				cleanup();
			}
			secondLeft = 170;
			window.dispatchEvent( new Event( 'resize' ) );
			expect( pill.style.transform ).toBe( 'translateX(150px)' );
		}
	);

	it( 'opens directly into the first flow and focuses step one', () => {
		currentElement = root.querySelector( '.core-ai-map__prompt' );

		mapStore.actions.start();
		jest.advanceTimersByTime( 80 );

		expect( context.screen ).toBe( 'map' );
		expect( context.story ).toBe( 'uses-ai' );
		expect( context.announcement ).toContain( 'WordPress uses AI' );
		expect( context.announcement ).toContain(
			'A feature inside WordPress needs an AI-generated result.'
		);
		expect( context.flowPhase ).toBe( 'transition' );
		expect( mapStore.state.isTakeawayHidden ).toBe( true );
		expect( document.activeElement ).toBe(
			root.querySelector(
				'.core-ai-map__block--plugin .core-ai-map__block-body'
			)
		);

		jest.advanceTimersByTime( 2820 );
		expect( context.flowPhase ).toBe( 'settled' );
		expect( mapStore.state.isTakeawayHidden ).toBe( false );
		expect( context.announcement ).toContain(
			'A WordPress feature uses a common AI interface'
		);
	} );

	it( 'opens the component explorer from the welcome browse control', () => {
		context.screen = 'attract';
		context.story = 'uses-ai';
		currentElement = root.querySelector( '.core-ai-map__attract-browse' );

		mapStore.actions.browseAll();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.story ).toBe( '' );
		expect( context.announcement ).toContain( 'no flow selected' );
		expect( document.activeElement ).toBe(
			root.querySelector(
				'.core-ai-map__block--client .core-ai-map__block-body'
			)
		);
	} );

	it( 'keeps AI Client visibly and accessibly marked as the neutral starting point', () => {
		context.screen = 'map';
		context.story = '';
		context.cardId = 'client';

		expect( mapStore.state.isBrowseStartingPoint ).toBe( true );
		expect( mapStore.state.isNotBrowseStartingPoint ).toBe( false );
		expect( mapStore.state.cardActionLabel ).toBe(
			'Start here: AI Client — Core API, Since 7.0. Open its details.'
		);

		/*
		 * The cue is one authored template, not an English prefix glued onto
		 * the ordinary one — a translation has to be able to move it.
		 */
		context.guidance.cardActionBrowseStart = '%1$s (%2$s) — hier beginnen.';
		expect( mapStore.state.cardActionLabel ).toBe(
			'AI Client (Core API, Since 7.0) — hier beginnen.'
		);
		context.guidance.cardActionBrowseStart =
			'Start here: %1$s — %2$s. Open its details.';

		context.cardId = 'plugin';
		expect( mapStore.state.isBrowseStartingPoint ).toBe( false );
		expect( mapStore.state.isNotBrowseStartingPoint ).toBe( true );
		expect( mapStore.state.cardActionLabel ).toBe(
			'AI Plugin — WordPress plugin, Experimental. Open its details.'
		);

		context.cardId = 'client';
		context.story = 'uses-ai';
		expect( mapStore.state.isBrowseStartingPoint ).toBe( false );
	} );

	it( 'names the state the visitor is in, one instruction at a time', () => {
		expect( mapStore.state.guidance ).toBe( 'Choose a flow to begin.' );
		expect( mapStore.state.isGuidanceHidden ).toBe( true );

		context.screen = 'map';
		context.story = 'uses-ai';
		expect( mapStore.state.guidance ).toBe(
			'Follow 1 → 2 → 3 → 4. Highlighted components take part in this flow. Tap one to learn what it contributes.'
		);
		expect( mapStore.state.isGuidanceHidden ).toBe( false );
		expect( mapStore.state.railLabel ).toBe( 'Choose another flow' );

		context.story = '';
		expect( mapStore.state.guidance ).toBe(
			'Open any component to learn what it is and where it belongs.'
		);
		expect( mapStore.state.railLabel ).toBe( 'Guided stories' );
		expect( mapStore.state.isDiagramKeyHidden ).toBe( true );

		context.story = 'uses-ai';
		context.screen = 'inspect';
		expect( mapStore.state.isGuidanceHidden ).toBe( true );
		expect( mapStore.state.inspectGuidance ).toBe(
			'You are viewing this component’s role in “WordPress uses AI.”'
		);
	} );

	it( 'shows the complete teaching state immediately with reduced motion', () => {
		window.matchMedia.mockImplementation( () => ( { matches: true } ) );
		currentElement = root.querySelector( '.core-ai-map__prompt' );

		try {
			mapStore.actions.start();

			expect( context.story ).toBe( 'uses-ai' );
			expect( context.flowPhase ).toBe( 'settled' );
			expect( mapStore.state.isTakeawayHidden ).toBe( false );
			expect( context.announcement ).toContain(
				'A feature inside WordPress needs an AI-generated result.'
			);
			expect( context.announcement ).toContain(
				'A WordPress feature uses a common AI interface'
			);
		} finally {
			window.matchMedia.mockImplementation( () => ( {
				matches: false,
			} ) );
		}
	} );

	it( 'cancels a stale conclusion when another flow is selected', () => {
		const railButton = document.createElement( 'button' );
		root.append( railButton );
		currentElement = railButton;
		context.screen = 'map';
		context.storyId = 'uses-ai';

		mapStore.actions.selectStory();
		jest.advanceTimersByTime( 1000 );

		context.storyId = 'uses-wp';
		mapStore.actions.selectStory();
		jest.advanceTimersByTime( 1900 );

		expect( context.story ).toBe( 'uses-wp' );
		expect( context.flowPhase ).toBe( 'transition' );
		expect( context.announcement ).toContain(
			'A person asks an outside assistant to check which booking times are available on this WordPress site.'
		);
		expect( context.announcement ).not.toContain(
			'A WordPress feature uses a common AI interface'
		);

		jest.advanceTimersByTime( 1000 );
		expect( context.flowPhase ).toBe( 'settled' );
		expect( context.announcement ).toContain(
			'The MCP Adapter is a plugin at the WordPress boundary'
		);
	} );

	it( 'restarts a live replay and gives its new run the full teaching interval', () => {
		root.insertAdjacentHTML(
			'beforeend',
			`<svg><g class="core-ai-map__flow"><path data-core-ai-story="uses-wp" data-core-ai-variant="edges" class="is-live"></path></g></svg>
			<div class="core-ai-map__tokens is-live"><span class="core-ai-map__token"></span></div>
			<span class="core-ai-map__spark is-live"></span>`
		);
		context.storyId = 'uses-wp';
		mapStore.actions.selectStory();
		jest.advanceTimersByTime( 1000 );
		const live = [
			...root.querySelectorAll(
				'.core-ai-map__flow path, .core-ai-map__tokens, .core-ai-map__spark'
			),
		];
		let resetAtLayout = false;
		Object.defineProperty( root, 'offsetWidth', {
			get: () => {
				resetAtLayout = live.every(
					( element ) => ! element.classList.contains( 'is-live' )
				);
				return 1366;
			},
		} );

		mapStore.actions.replayStory();

		expect( resetAtLayout ).toBe( true );
		expect(
			live.every( ( element ) => element.classList.contains( 'is-live' ) )
		).toBe( true );
		jest.advanceTimersByTime( 1900 );
		expect( context.flowPhase ).toBe( 'transition' );
		jest.advanceTimersByTime( 1000 );
		expect( context.flowPhase ).toBe( 'settled' );
		expect( context.announcement ).toContain( 'What this flow shows' );
	} );

	it( 'settles an active preview immediately when the motion preference changes', () => {
		const effects = [];
		const motion = new EventTarget();
		motion.matches = false;
		window.matchMedia.mockImplementation( ( query ) =>
			query.includes( 'prefers-reduced-motion' )
				? motion
				: { matches: false }
		);
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanup = effects[ 0 ]();
		try {
			jest.advanceTimersByTime( 2000 );
			motion.matches = true;
			motion.dispatchEvent( new Event( 'change' ) );
			expect( context.previewPhase ).toBe( 'settled' );
			jest.advanceTimersByTime( 20000 );
			expect( context.previewIndex ).toBe( 0 );
			expect( context.previewPhase ).toBe( 'settled' );

			motion.matches = false;
			motion.dispatchEvent( new Event( 'change' ) );
			expect( context.previewPhase ).toBe( 'assembling' );
			jest.advanceTimersByTime( 6500 );
			expect( context.previewIndex ).toBe( 1 );
		} finally {
			cleanup();
			window.matchMedia.mockImplementation( () => ( {
				matches: false,
			} ) );
		}
		motion.matches = true;
		motion.dispatchEvent( new Event( 'change' ) );
		expect( context.previewPhase ).toBe( 'assembling' );
	} );

	it.each( [ 'map', 'inspect', 'bench' ] )(
		'settles an interrupted flow without losing its conclusion on %s',
		( screen ) => {
			const effects = [];
			const motion = new EventTarget();
			motion.matches = false;
			window.matchMedia.mockImplementation( ( query ) =>
				query.includes( 'prefers-reduced-motion' )
					? motion
					: { matches: false }
			);
			useEffect.mockImplementation( ( callback ) =>
				effects.push( callback )
			);
			mapStore.callbacks.useKiosk();
			const cleanup = effects[ 0 ]();
			try {
				mapStore.actions.start();
				jest.advanceTimersByTime( 1000 );
				context.screen = screen;
				context.benchPathsLive = screen === 'bench';
				motion.matches = true;
				motion.dispatchEvent( new Event( 'change' ) );
				expect( context.flowPhase ).toBe( 'settled' );
				expect( context.benchPathsLive ).toBe( false );
				expect( context.announcement ).toContain(
					screen === 'map'
						? 'What this flow shows'
						: 'WordPress uses AI'
				);
				expect( context.pendingTakeawayStory ).toBe(
					screen === 'map' ? '' : 'uses-ai'
				);
				motion.matches = false;
				motion.dispatchEvent( new Event( 'change' ) );
				jest.advanceTimersByTime( 3000 );
				expect( context.flowPhase ).toBe( 'settled' );
			} finally {
				cleanup();
				window.matchMedia.mockImplementation( () => ( {
					matches: false,
				} ) );
			}
		}
	);

	it( 'announces a conclusion once after an early inspector visit', () => {
		const prompt = root.querySelector( '.core-ai-map__prompt' );
		const card = root.querySelector(
			'.core-ai-map__block--client .core-ai-map__block-body'
		);
		const close = root.querySelector( '.core-ai-map__details-close' );

		currentElement = prompt;
		mapStore.actions.start();
		context.cardId = 'client';
		currentElement = card;
		mapStore.actions.inspectCard();
		jest.advanceTimersByTime( 2900 );

		expect( context.screen ).toBe( 'inspect' );
		expect( context.pendingTakeawayStory ).toBe( 'uses-ai' );
		expect( context.announcement ).not.toContain( 'What this flow shows' );

		currentElement = close;
		mapStore.actions.closeInspect();
		expect( context.pendingTakeawayStory ).toBe( '' );
		expect( context.announcement ).toContain(
			'What this flow shows: A WordPress feature uses a common AI interface'
		);

		context.cardId = 'client';
		currentElement = card;
		mapStore.actions.inspectCard();
		currentElement = close;
		mapStore.actions.closeInspect();
		expect( context.announcement ).not.toContain( 'What this flow shows' );
	} );

	it( 'announces a pending conclusion after returning from About', () => {
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		const closeButton = root.querySelector( '.core-ai-map__about-close' );
		currentElement = root.querySelector( '.core-ai-map__prompt' );
		mapStore.actions.start();
		currentElement = aboutTrigger;
		mapStore.actions.openAbout();
		jest.advanceTimersByTime( 3000 );

		currentElement = closeButton;
		mapStore.actions.closeAbout();

		expect( context.announcement ).toContain( 'What this flow shows' );
		expect( context.announcement ).toContain(
			'A WordPress feature uses a common AI interface'
		);
		expect( context.pendingTakeawayStory ).toBe( '' );
	} );

	it( 'restarts the attract preview after About closes to welcome', () => {
		const effects = [];
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		const closeButton = root.querySelector( '.core-ai-map__about-close' );

		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			currentElement = aboutTrigger;
			mapStore.actions.openAbout();
			jest.advanceTimersByTime( 10000 );
			currentElement = closeButton;
			mapStore.actions.closeAbout();
			expect( context.screen ).toBe( 'attract' );

			jest.advanceTimersByTime( 6500 );
			expect( context.previewIndex ).toBe( 1 );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'lets a flow highlight only the cards that take part in it', () => {
		context.screen = 'map';
		context.story = 'uses-ai';

		context.cardId = 'client';
		expect( mapStore.state.isCardNotTappable ).toBe( false );
		expect( mapStore.state.isTapCueHidden ).toBe( false );
		expect( mapStore.state.cardActionLabel ).toBe(
			'Step 2: AI Client — view its role in “WordPress uses AI.”'
		);

		context.cardId = 'bench';
		expect( mapStore.state.isCardNotTappable ).toBe( true );
		expect( mapStore.state.isTapCueHidden ).toBe( true );
		expect( mapStore.state.isCardDimmed ).toBe( true );
		expect( mapStore.state.cardActionLabel ).toBe(
			'WP-Bench — not part of this flow.'
		);

		context.cardId = 'assistant';
		expect( mapStore.state.isCardDimmed ).toBe( true );
	} );

	it( 'makes every component tappable and uncued in the explorer', () => {
		context.screen = 'map';
		context.story = '';

		for ( const cardId of [
			'client',
			'bench',
			'assistant',
			'provider-plugin',
		] ) {
			context.cardId = cardId;
			expect( mapStore.state.isCardNotTappable ).toBe( false );
			expect( mapStore.state.isTapCueHidden ).toBe( true );
			expect( mapStore.state.isCardDimmed ).toBe( false );
		}
		expect( mapStore.state.isProviderPluginHidden ).toBe( false );

		context.cardId = 'bench';
		expect( mapStore.state.cardActionLabel ).toBe(
			'WP-Bench — Core AI project, Early benchmark. Open its details.'
		);
	} );

	it( 'keeps every operable card fully opaque on the neutral map', () => {
		context.screen = 'map';
		context.story = '';
		context.cardId = 'assistant';

		expect( mapStore.state.cardOpacity ).toBe( '1' );
	} );

	/*
	 * An actor belongs to the flow that names it. With a flow selected the cast
	 * is exactly its participants; the transient provider layer still has a
	 * resting place on the canvas, so it stays and reads as unavailable.
	 */
	it( 'clears off-flow actors and the off-flow provider layer', () => {
		context.screen = 'map';
		context.story = 'uses-wp';

		context.cardId = 'skills';
		expect( mapStore.state.isActorHidden ).toBe( true );
		expect( mapStore.state.isCardNotTappable ).toBe( true );
		expect( mapStore.state.cardActionLabel ).toBe(
			'Agent Skills — not part of this flow.'
		);

		context.cardId = 'assistant';
		expect( mapStore.state.isActorHidden ).toBe( false );

		context.screen = 'attract';
		context.cardId = 'skills';
		expect( mapStore.state.isActorHidden ).toBe( false );
		context.screen = 'map';

		/*
		 * The provider layer only exists inside a request path that routes
		 * through it, so a flow that does not leaves it out rather than
		 * parking a dimmed card in open canvas.
		 */
		context.cardId = 'provider-plugin';
		expect( mapStore.state.isProviderPluginHidden ).toBe( true );
		expect( mapStore.state.isCardNotTappable ).toBe( true );

		context.story = 'uses-ai';
		expect( mapStore.state.isProviderPluginHidden ).toBe( false );

		context.story = '';
		expect( mapStore.state.isProviderPluginHidden ).toBe( false );
	} );

	it( 'keeps Connectors as an unnumbered configuration sidecar', () => {
		context.screen = 'map';
		context.story = 'uses-ai';

		context.cardId = 'connectors';
		expect( mapStore.state.cardTransform ).toBe(
			'translate(-122px, 280px)'
		);
		expect( mapStore.state.isCardSidecar ).toBe( true );
		expect( mapStore.state.isCardActive ).toBe( true );
		expect( mapStore.state.isCardParked ).toBe( false );
		// A sidecar takes part, so it shows what it holds — above the card,
		// because it sits low enough that below would leave the band.
		expect( mapStore.state.isStripLive ).toBe( true );
		expect( mapStore.state.stripTop ).toBe( '-70px' );
		expect( mapStore.state.cardStep ).toBe( '' );

		context.cardId = 'provider';
		expect( mapStore.state.cardTransform ).toBe( 'translate(0px, -124px)' );
		expect( mapStore.state.isCardActive ).toBe( true );
		expect( mapStore.state.cardStep ).toBe( '4' );

		expect( mapStore.state.isProviderPluginHidden ).toBe( false );
		expect( mapStore.state.providerPluginTransform ).toBe(
			'translate(-68px, -208px)'
		);

		// The shelf runs under the WordPress band, starting at the boundary.
		context.cardId = 'mcp';
		expect( mapStore.state.cardTransform ).toBe( 'translate(20px, 240px)' );
		expect( mapStore.state.isCardParked ).toBe( true );
		expect( mapStore.state.isCardParkedTight ).toBe( false );
		expect( mapStore.state.isCardActive ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );
		expect( mapStore.state.shelfLabel ).toBe(
			'Also part of the ecosystem'
		);
		expect( mapStore.state.shelfLeft ).toBe( '236px' );
		expect( mapStore.state.shelfTop ).toBe( '606px' );
		expect( mapStore.state.isRuntimeZoneHidden ).toBe( true );
	} );

	/*
	 * The agent-learning flow is about three components no step of it touches.
	 * They stay on the canvas, unnumbered and openable, because what the
	 * guidance covers is the lesson.
	 */
	it( 'keeps the components a flow is about quiet rather than parked', () => {
		context.screen = 'map';
		context.story = 'learns';

		context.cardId = 'client';
		expect( mapStore.state.isCardQuiet ).toBe( true );
		expect( mapStore.state.isCardParked ).toBe( false );
		expect( mapStore.state.isCardActive ).toBe( false );
		expect( mapStore.state.isCardNotTappable ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );
		expect( mapStore.state.cardTransform ).toBe(
			'translate(-264px, 102px)'
		);
		/*
		 * A pressable card is cued and named as pressable. Telling a screen
		 * reader it is "not part of this flow" while the button stays enabled
		 * and uncued is the same card saying three different things.
		 */
		expect( mapStore.state.isTapCueHidden ).toBe( false );
		expect( mapStore.state.cardActionLabel ).toBe(
			'AI Client — what “An agent learns WordPress” is about. Open its details.'
		);

		context.cardId = 'bench';
		expect( mapStore.state.isCardQuiet ).toBe( false );
		expect( mapStore.state.isCardParked ).toBe( true );
		expect( mapStore.state.isCardNotTappable ).toBe( true );
		expect( mapStore.state.isTapCueHidden ).toBe( true );
		expect( mapStore.state.cardActionLabel ).toBe(
			'WP-Bench — not part of this flow.'
		);
		expect( mapStore.state.shelfLabel ).toBe( 'No skill covers these yet' );
	} );

	/*
	 * Five parked cards do not fit the shared shelf pitch inside the boundary
	 * band, so that one shelf gets its own columns and narrower cards.
	 */
	it( 'gives the shelf inside the boundary band its own columns', () => {
		context.screen = 'map';
		context.story = 'tests';

		context.cardId = 'plugin';
		expect( mapStore.state.isCardParked ).toBe( true );
		expect( mapStore.state.isCardParkedTight ).toBe( true );
		expect( mapStore.state.cardTransform ).toBe(
			'translate(-32px, -20px)'
		);

		context.cardId = 'abilities';
		expect( mapStore.state.cardTransform ).toBe(
			'translate(312px, -260px)'
		);
		expect( mapStore.state.shelfLeft ).toBe( '236px' );
		expect( mapStore.state.shelfTop ).toBe( '106px' );
		expect( mapStore.state.isRuntimeZoneHidden ).toBe( false );
	} );

	it( 'teaches the same provider path in the attract preview', () => {
		context.screen = 'attract';
		context.previewIndex = 0;
		context.previewPhase = 'settled';

		context.cardId = 'connectors';
		expect( mapStore.state.isPreviewSidecar ).toBe( true );
		expect( mapStore.state.isPreviewMember ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );
		expect( mapStore.state.cardOpacity ).toBe( '0.86' );

		context.cardId = 'provider';
		expect( mapStore.state.isPreviewMember ).toBe( true );
		expect( mapStore.state.cardTransform ).toBe(
			'translate(-90px, -119px) scale(0.8)'
		);
		expect( mapStore.state.cardStep ).toBe( '' );
		expect( mapStore.state.cardOpacity ).toBe( '1' );
		expect( mapStore.state.isProviderPluginHidden ).toBe( false );
		expect( mapStore.state.providerPluginTransform ).toBe(
			'translate(-196px, -200px) scale(0.8)'
		);

		context.previewPhase = 'releasing';
		expect( mapStore.state.isProviderPluginHidden ).toBe( true );
	} );

	it( 'holds positions and dims non-members when recomposition is off', () => {
		context.screen = 'map';
		context.story = 'uses-ai';
		context.recompose = false;
		context.cardId = 'mcp';

		expect( mapStore.state.cardTransform ).toBe( '' );
		expect( mapStore.state.isCardParked ).toBe( false );
		expect( mapStore.state.isCardDimmed ).toBe( true );

		context.cardId = 'connectors';
		expect( mapStore.state.cardTransform ).toBe( '' );
		expect( mapStore.state.isCardSidecar ).toBe( false );
		expect( mapStore.state.isCardDimmed ).toBe( false );
		expect( mapStore.state.providerPluginTransform ).toBe(
			'translate(-68px, -68px)'
		);

		// Recomposition off falls back to the resting connector paths.
		context.storyId = 'uses-ai';
		context.variant = 'rest';
		context.flowPhase = 'transition';
		expect( mapStore.state.isEdgeLive ).toBe( true );
		expect( mapStore.state.isProviderConfigPathHidden ).toBe( false );

		context.variant = 'edges';
		expect( mapStore.state.isEdgeLive ).toBe( false );
		expect( mapStore.state.isProviderConfigPathHidden ).toBe( true );
	} );

	it( 'lights only the boundary rules a story actually crosses', () => {
		context.story = 'uses-ai';
		context.side = 'right';
		expect( mapStore.state.isRuleLit ).toBe( true );

		context.side = 'left';
		expect( mapStore.state.isRuleLit ).toBe( false );

		context.story = 'uses-wp';
		expect( mapStore.state.isRuleLit ).toBe( true );
	} );

	it( 'keeps post-engagement paths visible but only animates during the one-shot transition', () => {
		context.screen = 'map';
		context.story = 'uses-wp';
		context.flowPhase = 'settled';
		context.storyId = 'uses-wp';
		context.variant = 'edges';

		const settled = {
			pathVisible: mapStore.state.isPathVisible,
			edgeLive: mapStore.state.isEdgeLive,
			sparkLive: mapStore.state.isSparkLive,
			tokensLive: mapStore.state.areTokensLive,
		};

		context.flowPhase = 'transition';
		const transition = {
			pathVisible: mapStore.state.isPathVisible,
			edgeLive: mapStore.state.isEdgeLive,
			sparkLive: mapStore.state.isSparkLive,
			tokensLive: mapStore.state.areTokensLive,
		};

		expect( { settled, transition } ).toEqual( {
			settled: {
				pathVisible: true,
				edgeLive: false,
				sparkLive: false,
				tokensLive: false,
			},
			transition: {
				pathVisible: true,
				edgeLive: true,
				sparkLive: false,
				tokensLive: true,
			},
		} );
	} );

	it( 'shows role strips for story members and for the open block', () => {
		context.screen = 'map';
		context.story = 'uses-wp';

		context.cardId = 'mcp';
		expect( mapStore.state.isStripLive ).toBe( true );
		expect( mapStore.state.isStripHidden ).toBe( false );
		expect( mapStore.state.stripTop ).toBe( '-58px' );

		context.cardId = 'bench';
		expect( mapStore.state.isStripLive ).toBe( false );
		expect( mapStore.state.isStripHidden ).toBe( true );
		expect( mapStore.state.stripTop ).toBe( '158px' );

		context.screen = 'inspect';
		context.story = '';
		context.inspect = 'bench';
		expect( mapStore.state.isStripLive ).toBe( true );

		context.shapes = false;
		expect( mapStore.state.isStripLive ).toBe( false );
	} );

	it( 'applies the AI Plugin suggestion and advances it when the story replays', () => {
		context.story = 'uses-ai';
		context.suggestion = 0;
		expect( mapStore.state.suggestionPhase ).toBe( 'Needs review' );
		expect( mapStore.state.suggestionLabel ).toBe( 'Alt text' );
		expect( mapStore.state.isSuggestionApplied ).toBe( false );

		mapStore.actions.applySuggestion();
		expect( context.suggestion ).toBe( 1 );
		expect( mapStore.state.suggestionPhase ).toBe( 'Applied' );
		expect( mapStore.state.isSuggestionApplied ).toBe( true );

		mapStore.actions.replayStory();
		expect( context.suggestion ).toBe( 2 );
		expect( mapStore.state.suggestionPhase ).toBe( 'Needs review' );
		expect( mapStore.state.suggestionLabel ).toBe( 'Post title' );
		expect( context.announcement ).toContain(
			'WordPress uses AI replayed.'
		);
		expect( context.announcement ).toContain(
			'A feature inside WordPress needs an AI-generated result.'
		);
		expect( context.announcement ).toContain(
			'The AI Plugin shows the next suggestion.'
		);

		context.story = 'uses-wp';
		mapStore.actions.replayStory();
		expect( context.announcement ).toContain(
			'AI uses WordPress replayed.'
		);
		expect( context.announcement ).toContain(
			'A person asks an outside assistant to check which booking times are available on this WordPress site.'
		);
	} );

	it( 'does not turn Escape into an undocumented map reset', () => {
		const effects = [];
		context.screen = 'map';
		context.story = 'uses-wp';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		root.dispatchEvent(
			new window.KeyboardEvent( 'keydown', {
				bubbles: true,
				key: 'Escape',
			} )
		);

		expect( context.screen ).toBe( 'map' );
		expect( context.story ).toBe( 'uses-wp' );
		cleanupKiosk();
	} );

	it( 'retains the selected story through the inspector and returns focus to its card', () => {
		const blockButton = root.querySelector( '.core-ai-map__block-body' );
		const closeButton = root.querySelector( '.core-ai-map__details-close' );

		context.screen = 'map';
		context.story = 'uses-wp';
		context.cardId = 'client';
		currentElement = blockButton;
		blockButton.focus();
		mapStore.actions.inspectCard();
		expect( document.activeElement ).not.toBe( blockButton );
		jest.advanceTimersByTime( 80 );

		const whileInspecting = {
			screen: context.screen,
			inspect: context.inspect,
			story: context.story,
			activeElement: document.activeElement,
		};

		currentElement = closeButton;
		mapStore.actions.closeInspect();
		jest.advanceTimersByTime( 40 );

		expect( {
			whileInspecting,
			afterClose: {
				screen: context.screen,
				inspect: context.inspect,
				story: context.story,
				activeElement: document.activeElement,
			},
		} ).toEqual( {
			whileInspecting: {
				screen: 'inspect',
				inspect: 'client',
				story: 'uses-wp',
				activeElement: closeButton,
			},
			afterClose: {
				screen: 'map',
				inspect: '',
				story: 'uses-wp',
				activeElement: blockButton,
			},
		} );
	} );

	it( 'guides the optional assistant to adapter to Core sequence and restores focus to its final card', () => {
		const benchStage = document.createElement( 'button' );
		benchStage.className = 'core-ai-map__bench-stage';
		benchStage.setAttribute(
			'aria-controls',
			'core-ai-map-test-bench-panel-abilities'
		);
		root.prepend( benchStage );
		const assistant = root.querySelector(
			'.core-ai-map__actor--assistant .core-ai-map__actor-body'
		);
		const mcp = root.querySelector(
			'.core-ai-map__block--mcp .core-ai-map__block-body'
		);
		const abilities = root.querySelector(
			'.core-ai-map__block--abilities .core-ai-map__block-body'
		);
		const next = root.querySelector( '.core-ai-map__details-next' );
		const close = root.querySelector( '.core-ai-map__details-close' );
		const details = root.querySelector( '.core-ai-map__details' );

		context.screen = 'map';
		context.story = 'uses-wp';
		context.cardId = 'assistant';
		details.scrollTop = 120;
		currentElement = assistant;
		mapStore.actions.inspectCard();
		jest.advanceTimersByTime( 80 );

		expect( context.inspect ).toBe( 'assistant' );
		expect( details.scrollTop ).toBe( 0 );
		expect( document.activeElement ).toBe( close );
		expect( context.announcement ).toContain( 'Step 1 of 3: AI assistant' );

		context.nextCardId = 'mcp';
		details.scrollTop = 240;
		currentElement = next;
		mapStore.actions.inspectNextCard();
		jest.advanceTimersByTime( 80 );

		expect( context.inspect ).toBe( 'mcp' );
		expect( details.scrollTop ).toBe( 0 );
		expect( document.activeElement ).toBe( close );
		expect( context.announcement ).toContain( 'Step 2 of 3: MCP Adapter' );

		context.nextCardId = 'abilities';
		currentElement = next;
		mapStore.actions.inspectNextCard();
		jest.advanceTimersByTime( 80 );

		expect( context.inspect ).toBe( 'abilities' );
		expect( context.abilitiesTab ).toBe( 'overview' );
		expect( context.announcement ).toContain(
			'Step 3 of 3: Abilities API'
		);

		currentElement = close;
		mapStore.actions.closeInspect();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.story ).toBe( 'uses-wp' );
		expect( document.activeElement ).toBe( abilities );
		expect( document.activeElement ).not.toBe( assistant );
		expect( document.activeElement ).not.toBe( mcp );
	} );

	it( 'opens the AI transparency dialog and restores focus to its trigger on Escape', () => {
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		const closeButton = root.querySelector( '.core-ai-map__about-close' );
		const effects = [];

		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();
		currentElement = root.querySelector( '.core-ai-map__prompt' );
		mapStore.actions.start();
		aboutTrigger.focus();
		currentElement = aboutTrigger;
		mapStore.actions.openAbout();
		jest.advanceTimersByTime( 3000 );

		expect( context.screen ).toBe( 'about' );
		expect( document.activeElement ).toBe( closeButton );
		expect( root.querySelector( '.core-ai-map__prompt' ).inert ).toBe(
			true
		);
		expect(
			root
				.querySelector( '.core-ai-map__prompt' )
				.getAttribute( 'aria-hidden' )
		).toBe( 'true' );

		currentElement = closeButton;
		root.dispatchEvent(
			new window.KeyboardEvent( 'keydown', {
				key: 'Escape',
				bubbles: true,
			} )
		);
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( document.activeElement ).toBe( aboutTrigger );
		expect( root.querySelector( '.core-ai-map__prompt' ).inert ).toBe(
			false
		);
		expect(
			root
				.querySelector( '.core-ai-map__prompt' )
				.hasAttribute( 'aria-hidden' )
		).toBe( false );
		expect( context.announcement ).toContain( 'What this flow shows' );
		expect( context.pendingTakeawayStory ).toBe( '' );
		cleanupKiosk();
	} );

	it( 'cycles Tab and Shift+Tab inside About', () => {
		const effects = [];
		const about = root.querySelector( '.core-ai-map__about' );
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		const closeButton = root.querySelector( '.core-ai-map__about-close' );
		const secondary = document.createElement( 'button' );
		secondary.type = 'button';
		secondary.textContent = 'Kiosk status';
		about.append( secondary );

		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			currentElement = aboutTrigger;
			mapStore.actions.openAbout();
			jest.advanceTimersByTime( 80 );

			secondary.focus();
			secondary.dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Tab',
				} )
			);
			expect( document.activeElement ).toBe( closeButton );

			closeButton.focus();
			closeButton.dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Tab',
					shiftKey: true,
				} )
			);
			expect( document.activeElement ).toBe( secondary );

			/*
			 * Focus can sit on the dialog itself when the visitor clicks its
			 * padding. Every surface behind About is inert, so an untrapped
			 * Tab there would leave the exhibit for good.
			 */
			closeButton.blur();
			about.dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Tab',
				} )
			);
			expect( document.activeElement ).toBe( closeButton );

			about.dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Tab',
					shiftKey: true,
				} )
			);
			expect( document.activeElement ).toBe( secondary );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'hands focus back to About when its reset warning is dismissed', () => {
		const effects = [];
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		const closeButton = root.querySelector( '.core-ai-map__about-close' );

		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			currentElement = aboutTrigger;
			mapStore.actions.openAbout();
			jest.advanceTimersByTime( 80 );
			jest.advanceTimersByTime( 80000 );

			expect( context.resetWarning ).toBe( true );

			// The button lives in the row that dismissing it hides.
			closeButton.blur();
			mapStore.actions.keepExploring();
			jest.advanceTimersByTime( 40 );

			expect( context.screen ).toBe( 'about' );
			expect( context.resetWarning ).toBe( false );
			expect( document.activeElement ).toBe( closeButton );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'replays rather than clears the flow already showing', () => {
		const railButton = document.createElement( 'button' );
		railButton.textContent = 'WordPress uses AI';
		root.append( railButton );
		currentElement = railButton;

		context.screen = 'map';
		context.story = '';
		context.storyId = 'uses-ai';

		mapStore.actions.selectStory();
		jest.advanceTimersByTime( 80 );
		expect( context.story ).toBe( 'uses-ai' );
		expect( document.activeElement ).toBe(
			root.querySelector(
				'.core-ai-map__block--plugin .core-ai-map__block-body'
			)
		);
		expect( context.announcement ).toContain(
			'A feature inside WordPress needs an AI-generated result.'
		);

		// The rail switches between flows; leaving them is the explorer's job.
		mapStore.actions.selectStory();
		jest.advanceTimersByTime( 80 );
		expect( context.story ).toBe( 'uses-ai' );
		expect( context.announcement ).toContain( 'replayed' );
		expect( document.activeElement ).toBe(
			root.querySelector(
				'.core-ai-map__block--plugin .core-ai-map__block-body'
			)
		);
	} );

	/*
	 * Two flows are one story: an agent writes code, then WordPress judges it.
	 * The handoff waits for the path to settle so it never competes with it.
	 */
	it( 'hands off to the flow this one leads into once it has settled', () => {
		const handoff = document.createElement( 'button' );
		root.append( handoff );
		currentElement = handoff;

		context.screen = 'map';
		context.story = 'learns';
		context.nextStoryId = 'tests';

		context.flowPhase = 'transition';
		expect( mapStore.state.isStoryNextHidden ).toBe( true );

		context.flowPhase = 'settled';
		expect( mapStore.state.isStoryNextHidden ).toBe( false );

		context.story = 'uses-ai';
		expect( mapStore.state.isStoryNextHidden ).toBe( true );

		context.story = 'learns';
		mapStore.actions.selectNextStory();
		jest.advanceTimersByTime( 80 );

		expect( context.story ).toBe( 'tests' );
		expect( context.announcement ).toContain(
			'WordPress tests the result'
		);
	} );

	it( 'replay returns keyboard focus to the first numbered step', () => {
		const replay = document.createElement( 'button' );
		root.append( replay );
		context.screen = 'map';
		context.story = 'uses-ai';
		currentElement = replay;

		mapStore.actions.replayStory();
		jest.advanceTimersByTime( 80 );

		expect( document.activeElement ).toBe(
			root.querySelector(
				'.core-ai-map__block--plugin .core-ai-map__block-body'
			)
		);
	} );

	it( 'cancels a pending conclusion when the visitor resets', () => {
		currentElement = root.querySelector( '.core-ai-map__prompt' );
		mapStore.actions.start();
		jest.advanceTimersByTime( 1000 );

		currentElement = root.querySelector( '.core-ai-map__reset' );
		mapStore.actions.reset();
		jest.advanceTimersByTime( 3000 );

		expect( context.screen ).toBe( 'attract' );
		expect( context.story ).toBe( '' );
		expect( context.announcement ).toBe(
			'The Living Block Map returned to its welcome screen.'
		);
	} );

	it( 'keeps the flow and restores focus when a panel closes', () => {
		const card = root.querySelector(
			'.core-ai-map__block--client .core-ai-map__block-body'
		);
		currentElement = card;
		context.screen = 'map';
		context.story = 'uses-ai';
		context.cardId = 'client';

		mapStore.actions.inspectCard();
		expect( context.screen ).toBe( 'inspect' );
		expect( context.inspect ).toBe( 'client' );
		expect( context.story ).toBe( 'uses-ai' );
		expect( mapStore.state.isFlowContextHidden ).toBe( false );
		expect( mapStore.state.detailsBackLabel ).toBe(
			'Back to WordPress uses AI'
		);

		currentElement = root.querySelector( '.core-ai-map__details-close' );
		mapStore.actions.closeInspect();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.story ).toBe( 'uses-ai' );
		expect( context.announcement ).toContain( 'Back in WordPress uses AI' );
		expect( document.activeElement ).toBe( card );
	} );

	it( 'returns to the attract screen and focuses its prompt', () => {
		context.screen = 'inspect';
		context.inspect = 'client';
		context.story = '';
		context.suggestion = 1;
		currentElement = root.querySelector( '.core-ai-map__reset' );

		mapStore.actions.reset();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'attract' );
		expect( context.inspect ).toBe( '' );
		expect( context.story ).toBe( '' );
		expect( context.previewIndex ).toBe( 0 );
		expect( context.suggestion ).toBe( 0 );
		expect( document.activeElement ).toBe(
			root.querySelector( '.core-ai-map__prompt' )
		);
	} );

	it( 'resets after the configured inactivity timeout', () => {
		const effects = [];

		context.screen = 'map';
		context.story = '';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();

		const cleanupKiosk = effects[ 0 ]();
		effects[ 1 ]();

		jest.advanceTimersByTime( 69999 );
		expect( context.resetWarning ).toBe( false );
		jest.advanceTimersByTime( 1 );
		expect( context.resetWarning ).toBe( true );
		expect( context.screen ).toBe( 'map' );
		expect( context.announcement ).toContain(
			'return to the welcome screen in 20 seconds'
		);

		currentElement = root;
		mapStore.actions.keepExploring();
		expect( context.resetWarning ).toBe( false );
		expect( context.announcement ).toBe(
			'Keep exploring. Reset postponed.'
		);

		jest.advanceTimersByTime( 89999 );
		expect( context.screen ).toBe( 'map' );
		jest.advanceTimersByTime( 1 );
		expect( context.screen ).toBe( 'attract' );

		cleanupKiosk();
	} );

	it( 'warns and returns to welcome when About is left open', () => {
		const effects = [];
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);

		context.screen = 'map';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			currentElement = aboutTrigger;
			mapStore.actions.openAbout();
			jest.advanceTimersByTime( 80 );
			jest.advanceTimersByTime( 80000 );

			expect( context.screen ).toBe( 'about' );
			expect( context.resetWarning ).toBe( true );
			expect( mapStore.state.isResetWarningHidden ).toBe( true );
			expect( mapStore.state.isAboutResetWarningHidden ).toBe( false );
			expect( context.announcement ).toContain(
				'return to the welcome screen in 20 seconds'
			);

			jest.advanceTimersByTime( 10040 );

			expect( context.screen ).toBe( 'attract' );
			expect( context.resetWarning ).toBe( false );
			expect( document.activeElement ).toBe(
				root.querySelector( '.core-ai-map__prompt' )
			);
			expect( root.querySelector( '.core-ai-map__prompt' ).inert ).toBe(
				false
			);
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'uses one timeout in deep screens and treats reading as activity', () => {
		const effects = [];

		context.screen = 'inspect';
		context.inspect = 'client';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();
		effects[ 1 ]();

		try {
			jest.advanceTimersByTime( 79000 );
			root.dispatchEvent( new window.Event( 'scroll' ) );
			jest.advanceTimersByTime( 11000 );
			expect( context.screen ).toBe( 'inspect' );
			expect( context.resetWarning ).toBe( false );

			root.dispatchEvent(
				new window.FocusEvent( 'focusin', { bubbles: true } )
			);
			jest.advanceTimersByTime( 89999 );
			expect( context.screen ).toBe( 'inspect' );
			jest.advanceTimersByTime( 1 );
			expect( context.screen ).toBe( 'attract' );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'marks the enhanced map ready and restores the gated state on cleanup', () => {
		const effects = [];
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		aboutTrigger.focus();
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);

		expect( mapStore.state.isNotReady ).toBe( true );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();
		expect( context.ready ).toBe( true );
		expect( mapStore.state.isReady ).toBe( true );
		expect( context.announcement ).toBe(
			'Core AI Living Block Map ready. Start with WordPress uses AI, or compare components.'
		);
		expect( document.activeElement ).toBe( aboutTrigger );

		cleanupKiosk();
		expect( context.ready ).toBe( false );
	} );

	it( 'reports cache results in About', () => {
		const effects = [];
		const listeners = {};
		const originalServiceWorker = navigator.serviceWorker;
		const originalSecureContext = window.isSecureContext;
		Object.defineProperty( navigator, 'serviceWorker', {
			configurable: true,
			value: {
				addEventListener: jest.fn( ( type, callback ) => {
					listeners[ type ] = callback;
				} ),
				removeEventListener: jest.fn(),
			},
		} );
		Object.defineProperty( window, 'isSecureContext', {
			configurable: true,
			value: false,
		} );
		root.dataset.offlineEnabled = 'true';
		Object.assign( context.labels, {
			offlineReady: 'Lista',
			offlineUnavailable: 'No disponible',
			wakeLockNotSupported: 'No compatible',
		} );
		context.offlineCacheStatus = 'Preparando';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			expect( context.offlineCacheStatus ).toBe( 'No disponible' );
			expect( context.wakeLockStatus ).toBe( 'No compatible' );
			listeners.message( {
				data: { type: 'CORE_AI_MAP_CACHE_RESULT', ok: true },
			} );
			expect( context.offlineCacheStatus ).toBe( 'Lista' );
			expect( root.dataset.offlineReady ).toBe( 'true' );
			listeners.message( {
				data: { type: 'CORE_AI_MAP_CACHE_RESULT', ok: false },
			} );
			expect( context.offlineCacheStatus ).toBe( 'No disponible' );
		} finally {
			cleanupKiosk();
			Object.defineProperty( navigator, 'serviceWorker', {
				configurable: true,
				value: originalServiceWorker,
			} );
			Object.defineProperty( window, 'isSecureContext', {
				configurable: true,
				value: originalSecureContext,
			} );
		}
	} );

	it( 'waits for the scoped service worker before asking it to cache an anonymous page', async () => {
		const effects = [];
		const postMessage = jest.fn();
		const active = { state: 'activated', postMessage };
		const register = jest.fn().mockResolvedValue( { active } );
		const getRegistrations = jest.fn().mockResolvedValue( [] );
		const originalServiceWorker = navigator.serviceWorker;
		const originalSecureContext = window.isSecureContext;
		const originalGetEntriesByType = performance.getEntriesByType;
		const observedScript = `${ window.location.origin }/wp-includes/js/navigation.js?ver=1`;
		const observedRest = `${ window.location.origin }/wp-json/wp/v2/users/me`;
		Object.defineProperty( performance, 'getEntriesByType', {
			configurable: true,
			value: jest
				.fn()
				.mockReturnValue( [
					{ name: observedScript },
					{ name: observedRest },
				] ),
		} );

		Object.defineProperty( navigator, 'serviceWorker', {
			configurable: true,
			value: {
				controller: active,
				getRegistrations,
				ready: Promise.resolve( { active } ),
				register,
			},
		} );
		Object.defineProperty( window, 'isSecureContext', {
			configurable: true,
			value: true,
		} );
		root.dataset.offlineEnabled = 'true';
		root.dataset.cachePage = 'true';
		root.dataset.cachePageUrl = 'https://example.test/living-block-map/';
		root.dataset.serviceWorkerUrl = '/?_core_ai_map_sw=1';
		root.dataset.serviceWorkerScope = '/living-block-map/';
		root.dataset.assetUrls = '[]';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			expect( register ).toHaveBeenCalledWith(
				expect.stringContaining( '_core_ai_map_sw=1' ),
				{ scope: '/living-block-map/' }
			);
			expect( postMessage ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'CACHE_CORE_AI_MAP',
					pageUrl: 'https://example.test/living-block-map/',
					assets: expect.arrayContaining( [ observedScript ] ),
				} )
			);
			expect( postMessage.mock.calls.at( -1 )[ 0 ].assets ).not.toContain(
				observedRest
			);
		} finally {
			cleanupKiosk();
			Object.defineProperty( performance, 'getEntriesByType', {
				configurable: true,
				value: originalGetEntriesByType,
			} );
			Object.defineProperty( navigator, 'serviceWorker', {
				configurable: true,
				value: originalServiceWorker,
			} );
			Object.defineProperty( window, 'isSecureContext', {
				configurable: true,
				value: originalSecureContext,
			} );
		}
	} );

	it( 'times out a translated pending offline-cache status', async () => {
		const effects = [];
		const active = { state: 'activated', postMessage: jest.fn() };
		const originalServiceWorker = navigator.serviceWorker;
		const originalSecureContext = window.isSecureContext;

		Object.defineProperty( navigator, 'serviceWorker', {
			configurable: true,
			value: {
				getRegistrations: jest.fn().mockResolvedValue( [] ),
				ready: Promise.resolve( { active } ),
				register: jest.fn().mockResolvedValue( { active } ),
			},
		} );
		Object.defineProperty( window, 'isSecureContext', {
			configurable: true,
			value: true,
		} );
		root.dataset.offlineEnabled = 'true';
		root.dataset.cachePage = 'false';
		root.dataset.serviceWorkerUrl = '/?_core_ai_map_sw=1';
		root.dataset.serviceWorkerScope = '/living-block-map/';
		root.dataset.assetUrls = '[]';
		context.offlineCacheStatus = 'Preparando';
		context.labels.offlineUnavailable = 'No disponible';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			for ( let tick = 0; tick < 8; tick++ ) {
				await Promise.resolve();
			}
			jest.advanceTimersByTime( 15000 );

			expect( context.offlineCacheStatus ).toBe( 'No disponible' );
			expect( root.dataset.offlineReady ).toBe( 'false' );
		} finally {
			cleanupKiosk();
			Object.defineProperty( navigator, 'serviceWorker', {
				configurable: true,
				value: originalServiceWorker,
			} );
			Object.defineProperty( window, 'isSecureContext', {
				configurable: true,
				value: originalSecureContext,
			} );
		}
	} );

	it( 'shows offline state when the service worker marks cached HTML', () => {
		const effects = [];
		const originalOnLine = Object.getOwnPropertyDescriptor(
			navigator,
			'onLine'
		);
		Object.defineProperty( navigator, 'onLine', {
			configurable: true,
			value: true,
		} );
		const marker = document.createElement( 'meta' );
		marker.name = 'core-ai-map-offline';
		marker.content = 'true';
		document.head.append( marker );
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			expect( context.isOffline ).toBe( true );
		} finally {
			cleanupKiosk();
			marker.remove();
			if ( originalOnLine ) {
				Object.defineProperty( navigator, 'onLine', originalOnLine );
			}
		}
	} );

	it( 'cleans up the same kiosk post worker after its permalink changes', async () => {
		const effects = [];
		const postMessage = jest.fn();
		const unregister = jest.fn().mockResolvedValue( true );
		const oldWorker = {
			postMessage,
			scriptURL: `${ window.location.origin }/?_core_ai_map_sw=1&_core_ai_map_scope=%2Fold%2F`,
		};
		const getRegistrations = jest.fn().mockResolvedValue( [
			{
				active: oldWorker,
				scope: `${ window.location.origin }/old/`,
				unregister,
			},
		] );
		const originalServiceWorker = navigator.serviceWorker;
		const originalSecureContext = window.isSecureContext;

		Object.defineProperty( navigator, 'serviceWorker', {
			configurable: true,
			value: { getRegistrations },
		} );
		Object.defineProperty( window, 'isSecureContext', {
			configurable: true,
			value: true,
		} );
		root.dataset.offlineEnabled = 'false';
		root.dataset.serviceWorkerUrl = '/?_core_ai_map_sw=1';
		root.dataset.serviceWorkerScope = '/new/';
		root.dataset.kioskKey = 'post-7';
		window.localStorage.setItem(
			'coreAiMapWorker:post-7',
			JSON.stringify( { scope: `${ window.location.origin }/old/` } )
		);
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			expect( postMessage ).toHaveBeenCalledWith( {
				type: 'CLEAR_CORE_AI_MAP',
			} );
			expect( unregister ).toHaveBeenCalledTimes( 1 );
			expect(
				window.localStorage.getItem( 'coreAiMapWorker:post-7' )
			).toBeNull();
		} finally {
			cleanupKiosk();
			window.localStorage.clear();
			Object.defineProperty( navigator, 'serviceWorker', {
				configurable: true,
				value: originalServiceWorker,
			} );
			Object.defineProperty( window, 'isSecureContext', {
				configurable: true,
				value: originalSecureContext,
			} );
		}
	} );

	it( 'keeps the disabled cache status when worker cleanup fails', async () => {
		const effects = [];
		const originalServiceWorker = navigator.serviceWorker;
		const originalSecureContext = window.isSecureContext;

		Object.defineProperty( navigator, 'serviceWorker', {
			configurable: true,
			value: {
				getRegistrations: jest
					.fn()
					.mockRejectedValue( new Error( 'cleanup failed' ) ),
			},
		} );
		Object.defineProperty( window, 'isSecureContext', {
			configurable: true,
			value: true,
		} );
		root.dataset.offlineEnabled = 'false';
		root.dataset.serviceWorkerUrl = '/?_core_ai_map_sw=1';
		root.dataset.serviceWorkerScope = '/living-block-map/';
		context.labels.offlineNotEnabled = 'No activada';
		context.labels.offlineUnavailable = 'No disponible';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			for ( let tick = 0; tick < 4; tick++ ) {
				await Promise.resolve();
			}

			expect( context.offlineCacheStatus ).toBe( 'No activada' );
			expect( root.dataset.offlineReady ).toBeUndefined();
		} finally {
			cleanupKiosk();
			Object.defineProperty( navigator, 'serviceWorker', {
				configurable: true,
				value: originalServiceWorker,
			} );
			Object.defineProperty( window, 'isSecureContext', {
				configurable: true,
				value: originalSecureContext,
			} );
		}
	} );

	it( 'retires the previous permalink worker before enabling the new scope', async () => {
		const effects = [];
		const oldPostMessage = jest.fn();
		const unregister = jest.fn().mockResolvedValue( true );
		const newPostMessage = jest.fn();
		const newWorker = { state: 'activated', postMessage: newPostMessage };
		const register = jest.fn().mockResolvedValue( {
			active: newWorker,
			scope: `${ window.location.origin }/new/`,
		} );
		const getRegistrations = jest.fn().mockResolvedValue( [
			{
				active: {
					postMessage: oldPostMessage,
					scriptURL: `${ window.location.origin }/?_core_ai_map_sw=1&_core_ai_map_scope=%2Fold%2F`,
				},
				scope: `${ window.location.origin }/old/`,
				unregister,
			},
		] );
		const originalServiceWorker = navigator.serviceWorker;
		const originalSecureContext = window.isSecureContext;
		const originalGetEntriesByType = performance.getEntriesByType;
		const observedAuthenticatedAsset = `${ window.location.origin }/wp-content/private-dashboard.js`;
		Object.defineProperty( performance, 'getEntriesByType', {
			configurable: true,
			value: jest
				.fn()
				.mockReturnValue( [ { name: observedAuthenticatedAsset } ] ),
		} );

		Object.defineProperty( navigator, 'serviceWorker', {
			configurable: true,
			value: {
				getRegistrations,
				ready: Promise.resolve( { active: newWorker } ),
				register,
			},
		} );
		Object.defineProperty( window, 'isSecureContext', {
			configurable: true,
			value: true,
		} );
		root.dataset.offlineEnabled = 'true';
		root.dataset.cachePage = 'false';
		root.dataset.serviceWorkerUrl = '/?_core_ai_map_sw=1';
		root.dataset.serviceWorkerScope = '/new/';
		root.dataset.kioskKey = 'post-7';
		root.dataset.assetUrls = '[]';
		window.localStorage.setItem(
			'coreAiMapWorker:post-7',
			JSON.stringify( { scope: `${ window.location.origin }/old/` } )
		);
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			for ( let tick = 0; tick < 8; tick++ ) {
				await Promise.resolve();
			}
			expect( oldPostMessage ).toHaveBeenCalledWith( {
				type: 'CLEAR_CORE_AI_MAP',
			} );
			expect( unregister ).toHaveBeenCalledTimes( 1 );
			expect( register ).toHaveBeenCalledWith(
				expect.stringContaining( '_core_ai_map_sw=1' ),
				{ scope: '/new/' }
			);
			expect( newPostMessage ).toHaveBeenCalledWith(
				expect.objectContaining( { type: 'CACHE_CORE_AI_MAP' } )
			);
			expect(
				newPostMessage.mock.calls.at( -1 )[ 0 ].assets
			).not.toContain( observedAuthenticatedAsset );
		} finally {
			cleanupKiosk();
			window.localStorage.clear();
			Object.defineProperty( performance, 'getEntriesByType', {
				configurable: true,
				value: originalGetEntriesByType,
			} );
			Object.defineProperty( navigator, 'serviceWorker', {
				configurable: true,
				value: originalServiceWorker,
			} );
			Object.defineProperty( window, 'isSecureContext', {
				configurable: true,
				value: originalSecureContext,
			} );
		}
	} );

	it( 'cycles attract previews while interactive story selection remains empty', () => {
		const effects = [];

		context.screen = 'attract';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		jest.advanceTimersByTime( 6500 );
		expect( context.previewIndex ).toBe( 1 );
		expect( context.story ).toBe( '' );

		cleanupKiosk();
	} );

	it( 'walks each attract preview through assemble, draw, signal, and settled phases before advancing', () => {
		const effects = [];

		context.screen = 'attract';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			expect( context.attractPhase ).toBe( 'assembling' );

			jest.advanceTimersByTime( 560 );
			expect( context.attractPhase ).toBe( 'drawing' );

			jest.advanceTimersByTime( 440 );
			expect( context.attractPhase ).toBe( 'signalling' );
			context.previewId = 0;
			expect( mapStore.state.isPreviewSignalLive ).toBe( true );

			jest.advanceTimersByTime( 1900 );
			expect( context.attractPhase ).toBe( 'settled' );
			expect( mapStore.state.isPreviewSignalLive ).toBe( false );

			context.cardId = 'plugin';
			expect( mapStore.state.cardTransform ).toBe(
				'translate(-8px, 40px) scale(0.8)'
			);

			jest.advanceTimersByTime( 2300 );
			expect( context.attractPhase ).toBe( 'releasing' );
			expect( mapStore.state.cardTransform ).toBe(
				'translate(-38px, 26px) rotate(-1.4deg)'
			);

			jest.advanceTimersByTime( 1300 );
			expect( context.previewIndex ).toBe( 1 );
			expect( context.story ).toBe( '' );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'keeps the active attract preview composed with its path and caption under reduced motion', () => {
		window.matchMedia.mockImplementation( () => ( { matches: true } ) );

		try {
			context.screen = 'attract';
			context.previewIndex = 0;
			context.previewId = 0;
			context.previewPhase = 'settled';
			context.cardId = 'plugin';

			expect( mapStore.state.cardTransform ).toBe(
				'translate(-8px, 40px) scale(0.8)'
			);
			expect( mapStore.state.isPreviewPathVisible ).toBe( true );
			expect( mapStore.state.isPreviewTextVisible ).toBe( true );
			expect( mapStore.state.isPreviewSignalLive ).toBe( false );
		} finally {
			window.matchMedia.mockImplementation( () => ( {
				matches: false,
			} ) );
		}
	} );

	it( 'freezes the first attract preview when reduced motion is requested', () => {
		const effects = [];
		window.matchMedia.mockImplementation( () => ( { matches: true } ) );
		context.screen = 'attract';
		context.previewIndex = 0;
		currentElement = root;
		useEffect.mockImplementation( ( callback ) =>
			effects.push( callback )
		);
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			expect( context.attractPhase ).toBe( 'settled' );
			jest.advanceTimersByTime( 30000 );
			expect( context.previewIndex ).toBe( 0 );
		} finally {
			cleanupKiosk();
			window.matchMedia.mockImplementation( () => ( {
				matches: false,
			} ) );
		}
	} );

	it( 'removes hidden screens and the story rail from the tab order', () => {
		context.screen = 'attract';
		expect( mapStore.state.isNotAttract ).toBe( false );
		expect( mapStore.state.isRailHidden ).toBe( true );
		expect( mapStore.state.isCanvasHidden ).toBe( true );

		context.screen = 'map';
		expect( mapStore.state.isNotAttract ).toBe( true );
		expect( mapStore.state.isRailHidden ).toBe( false );
		expect( mapStore.state.isCanvasHidden ).toBe( false );

		context.screen = 'inspect';
		expect( mapStore.state.isRailHidden ).toBe( true );
		expect( mapStore.state.isCanvasHidden ).toBe( false );
		expect( mapStore.state.isCanvasInert ).toBe( true );
	} );

	it( 'selects Abilities detail tabs through context state', () => {
		const anatomyTab = document.createElement( 'button' );
		anatomyTab.setAttribute( 'role', 'tab' );
		root.append( anatomyTab );
		context.screen = 'inspect';
		context.inspect = 'abilities';
		context.abilitiesTab = 'what';
		context.tabId = 'anatomy';
		currentElement = anatomyTab;

		mapStore.actions.selectAbilityTab?.();

		expect( {
			tab: context.abilitiesTab,
			selected: mapStore.state.isAbilityTabSelected,
		} ).toEqual( {
			tab: 'anatomy',
			selected: true,
		} );
		expect( anatomyTab.tabIndex ).toBe( 0 );
	} );

	it( 'uses roving focus for the Abilities tabs with arrow, Home, and End keys', () => {
		const effects = [];
		const tablist = document.createElement( 'div' );
		tablist.innerHTML = `
			<button role="tab" data-core-ai-abilities-tab="overview" tabindex="0">Overview</button>
			<button role="tab" data-core-ai-abilities-tab="anatomy" tabindex="-1">Anatomy</button>
			<button role="tab" data-core-ai-abilities-tab="permissions" tabindex="-1">Permissions</button>
		`;
		root.append( tablist );
		const tabs = [ ...tablist.querySelectorAll( '[role="tab"]' ) ];

		context.screen = 'inspect';
		context.inspect = 'abilities';
		context.abilitiesTab = 'overview';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			tabs[ 0 ].focus();
			tabs[ 0 ].dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'ArrowRight',
				} )
			);
			expect( context.abilitiesTab ).toBe( 'anatomy' );
			expect( document.activeElement ).toBe( tabs[ 1 ] );
			expect( tabs.map( ( tab ) => tab.tabIndex ) ).toEqual( [
				-1, 0, -1,
			] );

			tabs[ 1 ].dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'End',
				} )
			);
			expect( context.abilitiesTab ).toBe( 'permissions' );
			expect( document.activeElement ).toBe( tabs[ 2 ] );

			tabs[ 2 ].dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Home',
				} )
			);
			expect( context.abilitiesTab ).toBe( 'overview' );
			expect( document.activeElement ).toBe( tabs[ 0 ] );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'scopes global keyboard handling to the map that owns the event target', () => {
		const effects = [];
		const outsideButton = document.createElement( 'button' );
		document.body.append( outsideButton );
		context.screen = 'inspect';
		context.inspect = 'client';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			outsideButton.dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Escape',
				} )
			);
			expect( context.screen ).toBe( 'inspect' );

			root.querySelector( '.core-ai-map__details-close' ).dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Escape',
				} )
			);
			expect( context.screen ).toBe( 'map' );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'restores focus to the WP-Bench card after opening the run loop from its inspector', () => {
		const card = root.querySelector( '.core-ai-map__block-body' );
		const inspector = root.querySelector( '.core-ai-map__details' );
		const runButton = document.createElement( 'button' );
		inspector.append( runButton );

		context.screen = 'map';
		context.story = 'uses-ai';
		context.cardId = 'bench';
		currentElement = card;
		mapStore.actions.inspectCard();
		jest.advanceTimersByTime( 80 );

		currentElement = runButton;
		mapStore.actions.openBench();
		expect( context.screen ).toBe( 'bench' );

		currentElement = root.querySelector( '.core-ai-map__reset' );
		mapStore.actions.closeBench();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.announcement ).toContain( 'What this flow shows' );
		expect( document.activeElement ).toBe( card );
	} );

	it( 'announces a clean component title when opening details', () => {
		const card = root.querySelector(
			'.core-ai-map__block--client .core-ai-map__block-body'
		);
		card.append( document.createTextNode( ' Tap for its role' ) );
		context.screen = 'map';
		context.story = 'uses-ai';
		context.cardId = 'client';
		currentElement = card;

		mapStore.actions.inspectCard();

		expect( context.announcement ).toBe(
			'AI Client details open in WordPress uses AI.'
		);
		expect( context.announcement ).not.toContain( 'Tap for its role' );
	} );

	it( 'cancels the Bench flow timer when Escape closes the run loop', () => {
		const effects = [];
		const card = root.querySelector( '.core-ai-map__block-body' );
		context.screen = 'map';
		context.story = 'uses-ai';
		context.cardId = 'bench';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		try {
			currentElement = card;
			mapStore.actions.openBench();
			jest.advanceTimersByTime( 1000 );
			root.dispatchEvent(
				new window.KeyboardEvent( 'keydown', {
					bubbles: true,
					key: 'Escape',
				} )
			);
			const closedAnnouncement = context.announcement;

			expect( context.screen ).toBe( 'map' );
			expect( context.flowPhase ).toBe( 'settled' );
			expect( context.storyMotionPhase ).toBe( 'settled' );
			expect( closedAnnouncement ).toContain( 'What this flow shows' );
			jest.advanceTimersByTime( 3000 );
			expect( context.announcement ).toBe( closedAnnouncement );
		} finally {
			cleanupKiosk();
		}
	} );

	it( 'opens WP-Bench at stage 01 and selects its evidence stage', () => {
		context.screen = 'map';
		context.benchStage = '';
		currentElement = root;

		mapStore.actions.openBench?.();
		expect( context.benchStage ).toBe( 'task' );
		expect( context.announcement ).toBe(
			'WP-Bench run loop open. Stage 01, One task, one message, selected.'
		);
		context.stageId = 'evidence';
		mapStore.actions.selectBenchStage?.();

		expect( {
			screen: context.screen,
			stage: context.benchStage,
			selected: mapStore.state.isBenchStageSelected,
		} ).toEqual( {
			screen: 'bench',
			stage: 'evidence',
			selected: true,
		} );
		expect( context.benchPathsLive ).toBe( true );
		expect( context.announcement ).toBe(
			'WP-Bench stage selected: Pass or fail. Never a percentage.'
		);

		jest.advanceTimersByTime( 2900 );
		expect( context.benchPathsLive ).toBe( false );
	} );

	it( 'moves through WP-Bench in order and clamps at both ends', () => {
		context.screen = 'bench';
		context.benchStage = 'task';

		expect( mapStore.state.isPreviousBenchStageDisabled ).toBe( true );
		expect( mapStore.state.isNextBenchStageDisabled ).toBe( false );
		mapStore.actions.selectPreviousBenchStage();
		expect( context.benchStage ).toBe( 'task' );

		mapStore.actions.selectNextBenchStage();
		expect( context.benchStage ).toBe( 'model' );
		expect( context.announcement ).toBe(
			'WP-Bench stage 02 selected: Whatever the model wrote.'
		);

		context.benchStage = 'evidence';
		expect( mapStore.state.isPreviousBenchStageDisabled ).toBe( false );
		expect( mapStore.state.isNextBenchStageDisabled ).toBe( true );
		mapStore.actions.selectNextBenchStage();
		expect( context.benchStage ).toBe( 'evidence' );
	} );

	it( 'changes WP-Bench detail without replaying the run-loop path animation', () => {
		context.screen = 'map';
		context.benchStage = '';
		currentElement = root;

		mapStore.actions.openBench();
		expect( context.benchPathsLive ).toBe( true );

		jest.advanceTimersByTime( 2900 );
		expect( context.benchPathsLive ).toBe( false );

		context.stageId = 'evidence';
		mapStore.actions.selectBenchStage();

		expect( context.benchStage ).toBe( 'evidence' );
		expect( context.benchPathsLive ).toBe( false );
		expect( context.announcement ).toBe(
			'WP-Bench stage selected: Pass or fail. Never a percentage.'
		);
	} );

	it( 'turns Apply into a completed one-shot action', () => {
		context.suggestion = 0;
		expect( mapStore.state.suggestionActionLabel ).toBe( 'Apply' );
		expect( mapStore.state.isSuggestionApplied ).toBe( false );

		mapStore.actions.applySuggestion();
		expect( context.suggestion ).toBe( 1 );
		expect( mapStore.state.suggestionActionLabel ).toBe( 'Applied' );
		expect( mapStore.state.isSuggestionApplied ).toBe( true );
		const announcement = context.announcement;

		mapStore.actions.applySuggestion();
		expect( context.suggestion ).toBe( 1 );
		expect( context.announcement ).toBe( announcement );
	} );

	it.each( [ 30000, 60000, 90000, 1000, 0 ] )(
		'gives twenty seconds to extend a configured %i ms timeout',
		( configuredTimeout ) => {
			root.dataset.inactivityTimeout = String( configuredTimeout );
			context.screen = 'map';
			context.announcements.resetWarning = 'Aviso: quedan 20 segundos.';
			context.announcements.inactivityReset = 'Reinicio por inactividad.';
			const effects = [];
			useEffect.mockImplementation( ( effect ) =>
				effects.push( effect )
			);
			mapStore.callbacks.useKiosk();
			const cleanup = effects[ 0 ]();
			const timeout = Math.max( configuredTimeout, 30000 );
			try {
				jest.advanceTimersByTime( timeout - 20001 );
				expect( context.resetWarning ).toBe( false );
				jest.advanceTimersByTime( 1 );
				expect( context.resetWarning ).toBe( true );
				expect( context.announcement ).toBe(
					'Aviso: quedan 20 segundos.'
				);
				jest.advanceTimersByTime( 19999 );
				expect( context.screen ).toBe( 'map' );
				jest.advanceTimersByTime( 1 );
				expect( context.screen ).toBe( 'attract' );
				expect( context.announcement ).toBe(
					'Reinicio por inactividad.'
				);
			} finally {
				cleanup();
			}
		}
	);

	it( 'retains translated navigation and announcements through deep screens', () => {
		Object.assign( context.labels, {
			backToFlow: '%1$s: volver',
			backToMap: 'Volver al mapa',
		} );
		Object.assign( context.announcements, {
			aboutOpen: 'Acerca del mapa.',
			aboutClosed: 'Acerca cerrado.',
			detailsClosedFlow: '%1$s: detalles cerrados.',
			detailsClosedMap: 'Detalles cerrados.',
			welcome: 'Bienvenido.',
			resetPostponed: 'Reinicio aplazado.',
			suggestionApplied: 'Sugerencia aplicada.',
			benchOpen: '%1$s: banco abierto.',
			benchClosed: 'Banco cerrado.',
			benchStageSelected: '%1$s: etapa seleccionada.',
			benchStageNumberSelected: '%2$s: etapa %1$s.',
		} );
		context.screen = 'map';
		context.story = 'uses-ai';
		expect( mapStore.state.detailsBackLabel ).toBe(
			'WordPress uses AI: volver'
		);
		mapStore.actions.closeInspect();
		expect( context.announcement ).toBe(
			'WordPress uses AI: detalles cerrados.'
		);
		context.story = '';
		expect( mapStore.state.detailsBackLabel ).toBe( 'Volver al mapa' );
		mapStore.actions.closeInspect();
		expect( context.announcement ).toBe( 'Detalles cerrados.' );
		mapStore.actions.openAbout();
		expect( context.announcement ).toBe( 'Acerca del mapa.' );
		mapStore.actions.closeAbout();
		expect( context.announcement ).toBe( 'Acerca cerrado.' );
		mapStore.actions.keepExploring();
		expect( context.announcement ).toBe( 'Reinicio aplazado.' );
		mapStore.actions.applySuggestion();
		expect( context.announcement ).toBe( 'Sugerencia aplicada.' );
		context.benchTitles.task = 'Una tarea';
		mapStore.actions.openBench();
		expect( context.announcement ).toBe( 'Una tarea: banco abierto.' );
		context.stageId = 'model';
		mapStore.actions.selectBenchStage();
		expect( context.announcement ).toBe(
			'Whatever the model wrote: etapa seleccionada.'
		);
		mapStore.actions.selectPreviousBenchStage();
		expect( context.announcement ).toBe( 'Una tarea: etapa 01.' );
		mapStore.actions.closeBench();
		expect( context.announcement ).toBe( 'Banco cerrado.' );
		mapStore.actions.reset();
		expect( context.announcement ).toBe( 'Bienvenido.' );
	} );

	it( 'keeps translated action and progress labels after hydration', () => {
		Object.assign( context.labels, {
			applyLabel: 'Aplicar',
			appliedLabel: 'Aplicado',
			benchProgress: 'Etapa %1$s de %2$s',
		} );
		context.suggestion = 0;
		context.benchStage = 'model';

		expect( mapStore.state.suggestionActionLabel ).toBe( 'Aplicar' );
		expect( mapStore.state.benchProgressLabel ).toBe( 'Etapa 02 de 05' );

		mapStore.actions.applySuggestion();
		expect( mapStore.state.suggestionActionLabel ).toBe( 'Aplicado' );
	} );
} );
