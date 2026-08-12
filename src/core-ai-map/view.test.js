import {
	getContext,
	getElement,
	store,
	useEffect,
} from '@wordpress/interactivity';
import { animate, stagger } from 'motion';

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

jest.mock( 'motion', () => ( {
	animate: jest.fn(),
	stagger: jest.fn(),
} ) );

const mapStore = store.mock.calls.find(
	( [ namespace ] ) => namespace === 'core-ai/map'
)[ 1 ];

describe( 'Core AI map interactions', () => {
	let context;
	let currentElement;
	let root;

	beforeAll( () => {
		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			value: 'visible',
		} );
		window.matchMedia = jest.fn( () => ( {
			matches: false,
		} ) );
	} );

	beforeEach( () => {
		jest.useFakeTimers();
		document.body.innerHTML = `
			<section
				class="core-ai-map"
				data-inactivity-timeout="20000"
				data-offline-enabled="false"
			>
				<button class="core-ai-map__prompt" type="button">Explore</button>
				<button class="core-ai-map__reset" type="button">Start over</button>
				<div class="core-ai-map__node">
					<button type="button">Abilities API</button>
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
			selectedProject: '',
			activeScenario: 'create',
			scenarioPaths: {
				create: [ 'plugin', 'client', 'abilities' ],
				connect: [ 'skills', 'mcp', 'abilities' ],
			},
			announcement: '',
			toast: '',
			isOffline: false,
			idleScenarioIndex: 0,
		};
		currentElement = root;

		getContext.mockImplementation( () => context );
		getElement.mockImplementation( () => ( { ref: currentElement } ) );
		useEffect.mockReset();
		animate.mockReturnValue( {
			pause: jest.fn(),
			play: jest.fn(),
			stop: jest.fn(),
		} );
		stagger.mockReturnValue( 0 );
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
		document.body.className = '';
	} );

	it( 'opens the map and moves focus to the first project', () => {
		currentElement = root.querySelector( '.core-ai-map__prompt' );

		mapStore.actions.start();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.activeScenario ).toBe( '' );
		expect( document.activeElement ).toBe(
			root.querySelector( '.core-ai-map__node button' )
		);
	} );

	it( 'opens and closes project details without losing keyboard focus', () => {
		const projectButton = root.querySelector( '.core-ai-map__node button' );
		const closeButton = root.querySelector( '.core-ai-map__details-close' );

		context.screen = 'map';
		context.projectId = 'abilities';
		currentElement = projectButton;
		mapStore.actions.selectProject();
		jest.advanceTimersByTime( 80 );

		expect( context.screen ).toBe( 'detail' );
		expect( context.selectedProject ).toBe( 'abilities' );
		expect( document.activeElement ).toBe( closeButton );

		currentElement = closeButton;
		mapStore.actions.closeDetails();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'map' );
		expect( context.selectedProject ).toBe( '' );
		expect( document.activeElement ).toBe( projectButton );
	} );

	it( 'returns to the attract screen and focuses its prompt', () => {
		context.screen = 'detail';
		context.selectedProject = 'abilities';
		context.activeScenario = '';
		currentElement = root.querySelector( '.core-ai-map__reset' );

		mapStore.actions.reset();
		jest.advanceTimersByTime( 40 );

		expect( context.screen ).toBe( 'attract' );
		expect( context.selectedProject ).toBe( '' );
		expect( context.activeScenario ).toBe( 'create' );
		expect( document.activeElement ).toBe(
			root.querySelector( '.core-ai-map__prompt' )
		);
	} );

	it( 'derives active projects, paths, and inactive background state', () => {
		context.screen = 'detail';
		context.projectId = 'client';
		context.fromProject = 'plugin';
		context.toProject = 'client';

		expect( mapStore.state.isExperienceInactive ).toBe( true );
		expect( mapStore.state.isProjectActive ).toBe( true );
		expect( mapStore.state.isProjectDimmed ).toBe( false );
		expect( mapStore.state.isPathActive ).toBe( true );
	} );

	it( 'starts the inactivity timer when the map opens', () => {
		const effects = [];

		context.screen = 'map';
		context.activeScenario = '';
		currentElement = root;
		useEffect.mockImplementation( ( callback ) => {
			effects.push( callback );
		} );

		mapStore.callbacks.useKiosk();

		const cleanupKiosk = effects[ 1 ]();
		const cleanupMotion = effects[ 0 ]();

		jest.advanceTimersByTime( 19999 );
		expect( context.screen ).toBe( 'map' );

		jest.advanceTimersByTime( 1 );
		expect( context.screen ).toBe( 'attract' );

		cleanupMotion();
		cleanupKiosk();
	} );
} );
