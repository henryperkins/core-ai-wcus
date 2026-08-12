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
		members: { plugin: 1, client: 2, connectors: 3, provider: 4 },
		place: {
			plugin: [ 268, 192 ],
			client: [ 556, 192 ],
			connectors: [ 900, 192 ],
			provider: [ 1180, 216 ],
		},
		park: [ 'mcp', 'abilities', 'bench' ],
		shelfY: 512,
		edges: [
			'M504 266 L556 266',
			'M792 266 L900 266',
			'M1136 266 L1180 266',
		],
		rest: [
			'M504 234 L556 234',
			'M792 234 L912 234',
			'M1090 308 L1146 377',
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

describe( 'Core AI boundary map', () => {
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
			<section
				class="core-ai-map"
				data-inactivity-timeout="90000"
				data-offline-enabled="false"
			>
				<button class="core-ai-map__prompt" type="button">Add the blocks</button>
				<button class="core-ai-map__reset" type="button">Start over</button>
				<div class="core-ai-map__block">
					<button class="core-ai-map__block-body" type="button">AI Client</button>
				</div>
				<aside class="core-ai-map__details">
					<button class="core-ai-map__details-close" type="button">
						Back to the map
					</button>
				</aside>
			</section>
		`;

		root = document.querySelector( '.core-ai-map' );
		context = {
			screen: 'attract',
			story: 'uses-ai',
			inspect: '',
			idleStoryIndex: 0,
			isOffline: false,
			suggestion: 0,
			announcement: '',
			recompose: true,
			shapes: true,
			storyIds: [ 'uses-ai', 'uses-wp' ],
			neutral: {
				plugin: [ 268, 160 ],
				client: [ 556, 160 ],
				connectors: [ 912, 160 ],
				mcp: [ 122, 400 ],
				abilities: [ 556, 400 ],
				bench: [ 556, 672 ],
				assistant: [ 24, 176 ],
				provider: [ 1150, 330 ],
			},
			shelfX: [ 256, 384, 512, 640, 768, 896 ],
			layout: LAYOUT,
			suggestions: [
				{ label: 'Alt text', text: 'Two people reviewing a site' },
				{ label: 'Post title', text: 'A quieter way to explain AI' },
			],
			phases: [ 'Suggested', 'Review', 'Applied' ],
		};
		currentElement = root;

		getContext.mockImplementation( () => context );
		getElement.mockImplementation( () => ( { ref: currentElement } ) );
		useEffect.mockReset();
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
		document.body.className = '';
	} );

	it( 'opens the neutral map and moves focus to the first block', () => {
		currentElement = root.querySelector( '.core-ai-map__prompt' );

		mapStore.actions.start();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.story ).toBe( '' );
		expect( document.activeElement ).toBe(
			root.querySelector( '.core-ai-map__block-body' )
		);
	} );

	it( 'slides a story member into place and parks a non-member', () => {
		context.screen = 'map';
		context.story = 'uses-ai';

		context.cardId = 'connectors';
		expect( mapStore.state.cardTransform ).toBe( 'translate(-12px, 32px)' );
		expect( mapStore.state.isCardActive ).toBe( true );
		expect( mapStore.state.cardStep ).toBe( '3' );

		// mcp is park slot 0, so it lands on the first shelf position.
		context.cardId = 'mcp';
		expect( mapStore.state.cardTransform ).toBe(
			'translate(134px, 112px) scale(0.5)'
		);
		expect( mapStore.state.isCardParked ).toBe( true );
		expect( mapStore.state.isCardActive ).toBe( false );
		expect( mapStore.state.cardStep ).toBe( '' );
	} );

	it( 'holds positions and dims non-members when recomposition is off', () => {
		context.screen = 'map';
		context.story = 'uses-ai';
		context.recompose = false;
		context.cardId = 'mcp';

		expect( mapStore.state.cardTransform ).toBe( '' );
		expect( mapStore.state.isCardParked ).toBe( false );
		expect( mapStore.state.isCardDimmed ).toBe( true );

		// Recomposition off falls back to the resting connector paths.
		context.storyId = 'uses-ai';
		context.variant = 'rest';
		expect( mapStore.state.isEdgeLive ).toBe( true );

		context.variant = 'edges';
		expect( mapStore.state.isEdgeLive ).toBe( false );
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

	it( 'runs the token motion only for the story that owns it', () => {
		context.screen = 'map';
		context.story = 'uses-wp';
		expect( mapStore.state.areTokensLive ).toBe( true );

		// Sparks stand down while the tokens carry the motion.
		context.screen = 'attract';
		context.storyId = 'uses-wp';
		context.variant = 'edges';
		expect( mapStore.state.isSparkLive ).toBe( false );

		context.story = 'uses-ai';
		context.storyId = 'uses-ai';
		expect( mapStore.state.areTokensLive ).toBe( false );
		expect( mapStore.state.isSparkLive ).toBe( true );

		// A path belonging to another story stays dark.
		context.storyId = 'uses-wp';
		expect( mapStore.state.isSparkLive ).toBe( false );
	} );

	it( 'shows role strips for story members and for the open block', () => {
		context.screen = 'map';
		context.story = 'uses-wp';

		context.cardId = 'mcp';
		expect( mapStore.state.isStripLive ).toBe( true );
		expect( mapStore.state.stripTop ).toBe( '-58px' );

		context.cardId = 'bench';
		expect( mapStore.state.isStripLive ).toBe( false );
		expect( mapStore.state.stripTop ).toBe( '158px' );

		context.screen = 'inspect';
		context.story = '';
		context.inspect = 'bench';
		expect( mapStore.state.isStripLive ).toBe( true );

		context.shapes = false;
		expect( mapStore.state.isStripLive ).toBe( false );
	} );

	it( 'cycles the AI Plugin suggestion through its three phases', () => {
		context.suggestion = 0;
		expect( mapStore.state.suggestionPhase ).toBe( 'Suggested' );
		expect( mapStore.state.suggestionLabel ).toBe( 'Alt text' );
		expect( mapStore.state.isSuggestionReviewing ).toBe( false );

		context.suggestion = 1;
		expect( mapStore.state.suggestionPhase ).toBe( 'Review' );
		expect( mapStore.state.isSuggestionReviewing ).toBe( true );

		context.suggestion = 2;
		expect( mapStore.state.isSuggestionApplied ).toBe( true );

		// A full cycle moves on to the next suggestion.
		context.suggestion = 3;
		expect( mapStore.state.suggestionLabel ).toBe( 'Post title' );
	} );

	it( 'opens and closes a detail panel without losing keyboard focus', () => {
		const blockButton = root.querySelector( '.core-ai-map__block-body' );
		const closeButton = root.querySelector( '.core-ai-map__details-close' );

		context.screen = 'map';
		context.cardId = 'client';
		currentElement = blockButton;
		mapStore.actions.inspectCard();
		jest.advanceTimersByTime( 80 );

		expect( context.screen ).toBe( 'inspect' );
		expect( context.inspect ).toBe( 'client' );
		expect( context.story ).toBe( '' );
		expect( document.activeElement ).toBe( closeButton );

		currentElement = closeButton;
		mapStore.actions.closeInspect();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.inspect ).toBe( '' );
		expect( document.activeElement ).toBe( blockButton );
	} );

	it( 'toggles a story off when its rail button is pressed again', () => {
		const railButton = document.createElement( 'button' );
		railButton.textContent = 'WordPress uses AI';
		currentElement = railButton;

		context.screen = 'map';
		context.story = '';
		context.storyId = 'uses-ai';

		mapStore.actions.selectStory();
		expect( context.story ).toBe( 'uses-ai' );

		mapStore.actions.selectStory();
		expect( context.story ).toBe( '' );
	} );

	it( 'returns to the attract screen and focuses its prompt', () => {
		context.screen = 'inspect';
		context.inspect = 'client';
		context.story = '';
		currentElement = root.querySelector( '.core-ai-map__reset' );

		mapStore.actions.reset();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'attract' );
		expect( context.inspect ).toBe( '' );
		expect( context.story ).toBe( 'uses-ai' );
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

	it( 'cycles stories while the attract screen is showing', () => {
		const effects = [];

		context.screen = 'attract';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();
		const cleanupKiosk = effects[ 0 ]();

		jest.advanceTimersByTime( 9000 );
		expect( context.story ).toBe( 'uses-wp' );

		jest.advanceTimersByTime( 9000 );
		expect( context.story ).toBe( 'uses-ai' );

		cleanupKiosk();
	} );
} );
