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
		members: { plugin: 1, client: 2, provider: 0 },
		sidecars: [ 'connectors' ],
		providerPlugin: {
			step: 3,
			position: [ 824, 214 ],
			restPosition: [ 824, 332 ],
		},
		place: {
			plugin: [ 268, 192 ],
			client: [ 556, 192 ],
			connectors: [ 836, 360 ],
			provider: [ 1180, 206 ],
		},
		park: [ 'mcp', 'abilities', 'bench' ],
		shelfY: 512,
		shelfStart: 3,
		edges: [
			'M504 266 L556 266',
			'M792 266 L824 266',
			'M1024 266 L1180 266',
		],
		sidecarEdges: [ 'M924 360 L924 318' ],
		sidecarRest: [ 'M924 332 C954 318 1012 320 1030 308' ],
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
			assistant: [ 24, 156 ],
			mcp: [ 122, 318 ],
			abilities: [ 556, 318 ],
		},
		park: [ 'plugin', 'client', 'connectors', 'bench' ],
		shelfY: 512,
		strips: { mcp: [ 0, -58 ], abilities: [ 0, -58 ] },
		edges: [ 'M114 262 L114 392 L118 392', 'M358 392 L556 392' ],
		rest: [ 'M114 276 L230 395', 'M358 474 L556 474' ],
		dur: [ '2.1s', '1.9s' ],
		crosses: [ 'left' ],
		tokens: true,
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
				<button class="core-ai-map__prompt" type="button">Explore the first flow</button>
				<button class="core-ai-map__attract-browse" type="button">
					Browse all components
				</button>
				<button class="core-ai-map__about-trigger" type="button">
					About this exhibit
				</button>
				<button class="core-ai-map__browse" type="button">
					Browse all components
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
				<aside class="core-ai-map__details">
					<button class="core-ai-map__details-close" type="button">
						Back to the map
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
			suggestion: 0,
			announcement: '',
			recompose: true,
			shapes: true,
			storyIds: [ 'uses-ai', 'uses-wp' ],
			storyCopy: {
				'uses-ai': 'A plugin asks the AI Client for a capability.',
				'uses-wp':
					'An authorized assistant calls in through WordPress.',
			},
			openingStory: 'uses-ai',
			storyTitles: {
				'uses-ai': 'WordPress uses AI',
				'uses-wp': 'AI uses WordPress',
			},
			storyTakeaways: {
				'uses-ai':
					'A WordPress feature uses a common AI interface instead of integrating directly with every provider.',
				'uses-wp': 'The assistant does not bypass WordPress.',
			},
			storySituations: {
				'uses-ai':
					'A feature inside WordPress needs an AI-generated result.',
				'uses-wp':
					'An outside assistant asks WordPress to perform an allowed action.',
			},
			storyOutcomes: {
				'uses-ai': 'WordPress requests an AI result',
				'uses-wp': 'An assistant requests a WordPress action',
			},
			storySteps: {
				'uses-ai': '1 → 2 → 3',
				'uses-wp': '1 → 2 → 3',
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
			},
			cardTitles: {
				plugin: 'AI Plugin',
				client: 'AI Client',
				bench: 'WP-Bench',
				assistant: 'AI assistant',
			},
			guidance: {
				attract: 'Choose a flow to begin.',
				flow: 'Follow %1$s. Highlighted components take part in this flow. Tap one to learn what it contributes.',
				inspect: 'You are viewing this component’s role in “%1$s.”',
				browse: 'Tap any component to learn what it is and where it belongs.',
				cardAction: '%1$s — view its role in “%2$s.”',
				cardActionBrowse: '%1$s — open its details.',
			},
			labels: {
				railEmptyLabel: 'Choose a flow',
				railActiveLabel: 'Choose another flow',
			},
			benchTitles: { evidence: 'Pass or fail. Never a percentage' },
			neutral: {
				plugin: [ 268, 160 ],
				client: [ 556, 160 ],
				connectors: [ 912, 160 ],
				mcp: [ 122, 400 ],
				abilities: [ 556, 400 ],
				bench: [ 556, 672 ],
				assistant: [ 24, 112 ],
				skills: [ 24, 244 ],
				agent: [ 24, 376 ],
				provider: [ 1150, 330 ],
				task: [ 24, 508 ],
			},
			loose: {
				plugin: [ -38, 26, -1.4 ],
			},
			shelfX: [ 250, 436, 622, 808, 994, 1170 ],
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
		expect(
			wires.querySelector(
				'.core-ai-map__config-path[data-core-ai-variant="rest"]'
			).hidden
		).toBe( false );
		expect(
			wires.querySelector(
				'.core-ai-map__config-path[data-core-ai-variant="edges"]'
			).hidden
		).toBe( true );

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
			wires.querySelector( '[data-core-ai-preview="0"]' ).hidden
		).toBe( true );
		expect(
			wires.querySelector( '[data-core-ai-preview="1"]' ).hidden
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
			wires.querySelector(
				'.core-ai-map__config-path[data-core-ai-variant="rest"]'
			).hidden
		).toBe( true );
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
		document.body.className = '';
	} );

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
				'.core-ai-map__block--plugin .core-ai-map__block-body'
			)
		);
	} );

	it( 'names the state the visitor is in, one instruction at a time', () => {
		expect( mapStore.state.guidance ).toBe( 'Choose a flow to begin.' );
		expect( mapStore.state.isGuidanceHidden ).toBe( true );

		context.screen = 'map';
		context.story = 'uses-ai';
		expect( mapStore.state.guidance ).toBe(
			'Follow 1 → 2 → 3. Highlighted components take part in this flow. Tap one to learn what it contributes.'
		);
		expect( mapStore.state.isGuidanceHidden ).toBe( false );
		expect( mapStore.state.railLabel ).toBe( 'Choose another flow' );

		context.story = '';
		expect( mapStore.state.guidance ).toBe(
			'Tap any component to learn what it is and where it belongs.'
		);
		expect( mapStore.state.railLabel ).toBe( 'Choose a flow' );

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
			'An outside assistant asks WordPress to perform an allowed action.'
		);
		expect( context.announcement ).not.toContain(
			'A WordPress feature uses a common AI interface'
		);

		jest.advanceTimersByTime( 1000 );
		expect( context.flowPhase ).toBe( 'settled' );
		expect( context.announcement ).toContain(
			'The assistant does not bypass WordPress.'
		);
	} );

	it( 'lets a flow highlight only the cards that take part in it', () => {
		context.screen = 'map';
		context.story = 'uses-ai';

		context.cardId = 'client';
		expect( mapStore.state.isCardNotTappable ).toBe( false );
		expect( mapStore.state.isTapCueHidden ).toBe( false );
		expect( mapStore.state.cardActionLabel ).toBe(
			'AI Client — view its role in “WordPress uses AI.”'
		);

		context.cardId = 'bench';
		expect( mapStore.state.isCardNotTappable ).toBe( true );
		expect( mapStore.state.isTapCueHidden ).toBe( true );
	} );

	it( 'makes every component tappable and uncued in the explorer', () => {
		context.screen = 'map';
		context.story = '';

		for ( const cardId of [ 'client', 'bench', 'assistant' ] ) {
			context.cardId = cardId;
			expect( mapStore.state.isCardNotTappable ).toBe( false );
			expect( mapStore.state.isTapCueHidden ).toBe( true );
		}

		context.cardId = 'bench';
		expect( mapStore.state.cardActionLabel ).toBe(
			'WP-Bench — open its details.'
		);
	} );

	it( 'keeps every operable card fully opaque on the neutral map', () => {
		context.screen = 'map';
		context.story = '';
		context.cardId = 'assistant';

		expect( mapStore.state.isCardOffstage ).toBe( false );
		expect( mapStore.state.cardOpacity ).toBe( '1' );
	} );

	it( 'keeps Connectors as an unnumbered configuration sidecar', () => {
		context.screen = 'map';
		context.story = 'uses-ai';

		context.cardId = 'connectors';
		expect( mapStore.state.cardTransform ).toBe(
			'translate(-76px, 200px)'
		);
		expect( mapStore.state.isCardSidecar ).toBe( true );
		expect( mapStore.state.isCardActive ).toBe( false );
		expect( mapStore.state.isCardParked ).toBe( false );
		expect( mapStore.state.isCardOffstage ).toBe( false );
		expect( mapStore.state.isStripLive ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );

		context.cardId = 'provider';
		expect( mapStore.state.cardTransform ).toBe(
			'translate(30px, -124px)'
		);
		expect( mapStore.state.isCardOffstage ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );

		expect( mapStore.state.isProviderPluginHidden ).toBe( false );
		expect( mapStore.state.providerPluginTransform ).toBe( '' );

		// uses-ai starts its compact shelf in slot 3, leaving space around the
		// active workflow while using the full 176px card width.
		context.cardId = 'mcp';
		expect( mapStore.state.cardTransform ).toBe(
			'translate(686px, 112px)'
		);
		expect( mapStore.state.isCardParked ).toBe( true );
		expect( mapStore.state.isCardActive ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );
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
			'translate(-108px, -14px) scale(0.8)'
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
		expect( mapStore.state.isCardOffstage ).toBe( false );
		expect( mapStore.state.providerPluginTransform ).toBe(
			'translate(0px, 118px)'
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
			'An outside assistant asks WordPress to perform an allowed action.'
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

	it( 'opens the AI transparency dialog and restores focus to its trigger on Escape', () => {
		const aboutTrigger = root.querySelector(
			'.core-ai-map__about-trigger'
		);
		const closeButton = root.querySelector( '.core-ai-map__about-close' );
		const effects = [];

		context.screen = 'map';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );
		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();
		aboutTrigger.focus();
		currentElement = aboutTrigger;
		mapStore.actions.openAbout();
		jest.advanceTimersByTime( 80 );

		expect( context.screen ).toBe( 'about' );
		expect( document.activeElement ).toBe( closeButton );

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
		cleanupKiosk();
	} );

	it( 'replays rather than clears the flow already showing', () => {
		const railButton = document.createElement( 'button' );
		railButton.textContent = 'WordPress uses AI';
		currentElement = railButton;

		context.screen = 'map';
		context.story = '';
		context.storyId = 'uses-ai';

		mapStore.actions.selectStory();
		expect( context.story ).toBe( 'uses-ai' );
		expect( context.announcement ).toContain(
			'A feature inside WordPress needs an AI-generated result.'
		);

		// The rail switches between flows; leaving them is the explorer's job.
		mapStore.actions.selectStory();
		expect( context.story ).toBe( 'uses-ai' );
		expect( context.announcement ).toContain( 'replayed' );
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

		jest.advanceTimersByTime( 89999 );
		expect( context.screen ).toBe( 'map' );

		jest.advanceTimersByTime( 1 );
		expect( context.screen ).toBe( 'attract' );

		cleanupKiosk();
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
		expect( mapStore.state.isCanvasHidden ).toBe( true );
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
		expect( document.activeElement ).toBe( card );
	} );

	it( 'opens WP-Bench at the sandbox and selects its evidence stage', () => {
		context.screen = 'map';
		context.benchStage = '';
		currentElement = root;

		mapStore.actions.openBench?.();
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
} );
