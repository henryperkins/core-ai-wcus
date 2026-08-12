import {
	getContext,
	getElement,
	store,
	useEffect,
} from '@wordpress/interactivity';

/**
 * Core AI Boundary Map.
 *
 * The map has three screens — attract, map, inspect — and four stories. Picking
 * a story recomposes the canvas: its members slide into a numbered left-to-right
 * workflow and everything else parks on a shelf. All of the geometry comes from
 * the layout table `render.php` puts in the context, so PHP stays the single
 * source of truth for placement.
 */

const STAGE_WIDTH = 1366;
const STAGE_HEIGHT = 1024;
const ATTRACT_STORY_INTERVAL = 9000;
const SUGGESTION_INTERVAL = 1200;

const resetSchedulers = new WeakMap();
const lastCardTriggers = new WeakMap();

const getRoot = ( element ) => element?.closest( '.core-ai-map' );

/**
 * @param {Object} context Interactivity context.
 * @return {Object|null} Layout of the story currently on the canvas.
 */
const activeLayout = ( context ) =>
	( context.story && context.layout?.[ context.story ] ) || null;

/**
 * @param {Object} context Interactivity context.
 * @return {boolean} Whether members physically move for the current story.
 */
const isRecomposed = ( context ) =>
	Boolean( activeLayout( context ) ) && context.recompose !== false;

/**
 * Every story's connector paths are in the DOM at once; each one carries the
 * story it belongs to and whether it is a recomposed (`edges`) or resting
 * (`rest`) path. Only the set matching the current story is shown.
 *
 * @param {Object} context Interactivity context.
 * @return {boolean} Whether this path belongs to what is on the canvas now.
 */
const isCurrentPathVariant = ( context ) => {
	if ( ! context.story || context.storyId !== context.story ) {
		return false;
	}

	const wanted = context.recompose === false ? 'rest' : 'edges';

	return context.variant === wanted;
};

const focusElement = ( element, delay = 40 ) => {
	if ( ! element ) {
		return;
	}

	window.setTimeout( () => {
		element.focus( { preventScroll: true } );
	}, delay );
};

const focusWithin = ( root, selector, delay = 40 ) => {
	if ( ! root ) {
		return;
	}

	window.setTimeout( () => {
		root.querySelector( selector )?.focus( { preventScroll: true } );
	}, delay );
};

const setAttractState = ( context ) => {
	context.screen = 'attract';
	context.inspect = '';
	context.idleStoryIndex = 0;
	context.story = context.storyIds?.[ 0 ] || '';
	context.announcement = 'The boundary map returned to its welcome screen.';
};

store( 'core-ai/map', {
	state: {
		get isAttract() {
			return getContext().screen === 'attract';
		},
		get isMap() {
			return getContext().screen === 'map';
		},
		get isInspect() {
			return getContext().screen === 'inspect';
		},
		get isNotInspect() {
			return getContext().screen !== 'inspect';
		},
		get hasStory() {
			return Boolean( activeLayout( getContext() ) );
		},
		get isOnline() {
			return ! getContext().isOffline;
		},

		/* Stories ------------------------------------------------------ */

		get isStorySelected() {
			const context = getContext();
			return (
				Boolean( context.storyId ) && context.storyId === context.story
			);
		},
		get isStoryNotSelected() {
			const context = getContext();
			return context.storyId !== context.story;
		},
		get isStoryCopyHidden() {
			const context = getContext();
			return (
				context.screen === 'attract' ||
				context.screen === 'inspect' ||
				! activeLayout( context )
			);
		},

		/* Cards -------------------------------------------------------- */

		get cardTransform() {
			const context = getContext();
			const layout = activeLayout( context );
			const neutral = context.neutral?.[ context.cardId ];

			if ( ! layout || ! neutral || context.recompose === false ) {
				return '';
			}

			const place = layout.place?.[ context.cardId ];

			if ( place ) {
				return `translate(${ place[ 0 ] - neutral[ 0 ] }px, ${
					place[ 1 ] - neutral[ 1 ]
				}px)`;
			}

			const slot = ( layout.park || [] ).indexOf( context.cardId );

			// Actors do not park — they simply leave the canvas.
			if ( slot < 0 ) {
				return '';
			}

			const shelfX =
				context.shelfX?.[ slot ] ?? context.shelfX?.[ 0 ] ?? 0;

			return `translate(${ shelfX - neutral[ 0 ] }px, ${
				layout.shelfY - neutral[ 1 ]
			}px) scale(0.5)`;
		},
		get cardStep() {
			const context = getContext();
			const step = activeLayout( context )?.members?.[ context.cardId ];

			return step ? String( step ) : '';
		},
		get isCardActive() {
			const context = getContext();

			return Boolean(
				activeLayout( context )?.members?.[ context.cardId ]
			);
		},
		get isCardParked() {
			const context = getContext();

			return (
				isRecomposed( context ) &&
				! activeLayout( context ).members[ context.cardId ] &&
				( activeLayout( context ).park || [] ).includes(
					context.cardId
				)
			);
		},
		get isCardDimmed() {
			const context = getContext();
			const layout = activeLayout( context );

			return Boolean(
				layout &&
					! isRecomposed( context ) &&
					! layout.members[ context.cardId ]
			);
		},
		get isCardOffstage() {
			const context = getContext();

			return ! activeLayout( context )?.members?.[ context.cardId ];
		},
		get isCardInspected() {
			const context = getContext();
			return context.cardId === context.inspect;
		},
		get isCardNotInspected() {
			const context = getContext();
			return context.cardId !== context.inspect;
		},

		/* Role strips -------------------------------------------------- */

		get isStripLive() {
			const context = getContext();

			if ( context.shapes === false ) {
				return false;
			}

			const isActiveOnMap =
				context.screen === 'map' &&
				Boolean( activeLayout( context )?.members?.[ context.cardId ] );

			return isActiveOnMap || context.inspect === context.cardId;
		},
		get stripTop() {
			const context = getContext();
			const offset =
				activeLayout( context )?.strips?.[ context.cardId ]?.[ 1 ];

			return `${ offset ?? 158 }px`;
		},

		/* Boundary ----------------------------------------------------- */

		get isRuleLit() {
			const context = getContext();
			const crosses = activeLayout( context )?.crosses || [];

			return crosses.includes( context.side );
		},
		get areHairlinesHidden() {
			return isRecomposed( getContext() );
		},
		get isOutsideZoneLit() {
			return activeLayout( getContext() )?.zone === 'outside';
		},
		get isShelfHidden() {
			return ! isRecomposed( getContext() );
		},
		get shelfTop() {
			const layout = activeLayout( getContext() );

			return `${ layout ? layout.shelfY - 22 : 490 }px`;
		},

		/* Flow --------------------------------------------------------- */

		get isEdgeLive() {
			return isCurrentPathVariant( getContext() );
		},
		get isSparkLive() {
			const context = getContext();

			// The travelling sparks belong to the attract loop, and they stand
			// down for the story that already carries the token motion.
			return (
				context.screen === 'attract' &&
				! activeLayout( context )?.tokens &&
				isCurrentPathVariant( context )
			);
		},
		get areTokensLive() {
			const context = getContext();

			return Boolean(
				activeLayout( context )?.tokens &&
					context.shapes !== false &&
					context.screen !== 'inspect'
			);
		},

		/* AI Plugin suggestion cycle ----------------------------------- */

		get suggestionLabel() {
			const context = getContext();
			const items = context.suggestions || [];

			if ( ! items.length ) {
				return '';
			}

			return (
				items[ Math.floor( context.suggestion / 3 ) % items.length ]
					?.label || ''
			);
		},
		get suggestionText() {
			const context = getContext();
			const items = context.suggestions || [];

			if ( ! items.length ) {
				return '';
			}

			return (
				items[ Math.floor( context.suggestion / 3 ) % items.length ]
					?.text || ''
			);
		},
		get suggestionPhase() {
			const context = getContext();
			const phases = context.phases || [];

			return phases[ context.suggestion % 3 ] || '';
		},
		get isSuggestionReviewing() {
			return getContext().suggestion % 3 === 1;
		},
		get isSuggestionApplied() {
			return getContext().suggestion % 3 === 2;
		},

		get announcement() {
			return getContext().announcement;
		},
	},

	actions: {
		start() {
			const context = getContext();
			const root = getRoot( getElement().ref );

			context.screen = 'map';
			context.story = '';
			context.inspect = '';
			context.announcement =
				'The blocks are on the canvas. Open a block, or follow a story.';
			focusWithin( root, '.core-ai-map__block-body' );
		},

		selectStory() {
			const context = getContext();
			const { ref } = getElement();
			const isCurrent = context.story === context.storyId;

			context.screen = 'map';
			context.inspect = '';
			context.story = isCurrent ? '' : context.storyId;
			context.announcement = isCurrent
				? 'Story cleared. The blocks returned to the neutral map.'
				: `${ ref.textContent.trim() }. The blocks recomposed.`;
		},

		inspectCard() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );

			if ( root ) {
				lastCardTriggers.set( root, ref );
			}

			context.screen = 'inspect';
			context.inspect = context.cardId;
			context.story = '';
			context.announcement = `${ ref.textContent.trim() } details open.`;
			focusWithin( root, '.core-ai-map__details-close', 80 );
		},

		closeInspect() {
			const context = getContext();
			const root = getRoot( getElement().ref );

			context.screen = 'map';
			context.inspect = '';
			context.announcement = 'Details closed. Back on the map.';
			focusElement( root ? lastCardTriggers.get( root ) : undefined );
		},

		reset() {
			const context = getContext();
			const root = getRoot( getElement().ref );

			setAttractState( context );
			focusWithin( root, '.core-ai-map__prompt' );
		},
	},

	callbacks: {
		useKiosk() {
			const context = getContext();

			useEffect( () => {
				const { ref: root } = getElement();

				if ( ! root ) {
					return undefined;
				}

				root.classList.add( 'is-ready' );
				document.body.classList.add( 'core-ai-kiosk-active' );

				const timeout = Number.parseInt(
					root.dataset.inactivityTimeout,
					10
				);
				let resetTimer;
				let wakeLock;

				// The stage is authored at exactly 1366x1024; scale it to fit
				// whatever viewport it lands in rather than making the geometry
				// responsive.
				const fitStage = () => {
					const scale = Math.min(
						root.clientWidth / STAGE_WIDTH,
						root.clientHeight / STAGE_HEIGHT
					);

					if ( Number.isFinite( scale ) && scale > 0 ) {
						root.style.setProperty(
							'--cai-scale',
							String( scale )
						);
					}
				};

				const resetForInactivity = () => {
					if (
						document.visibilityState === 'visible' &&
						context.screen !== 'attract'
					) {
						setAttractState( context );
						context.announcement =
							'The map reset after a period of inactivity.';

						if (
							root.contains( root.ownerDocument.activeElement )
						) {
							focusWithin( root, '.core-ai-map__prompt' );
						}
					}
				};

				const scheduleReset = () => {
					window.clearTimeout( resetTimer );

					if ( context.screen !== 'attract' ) {
						resetTimer = window.setTimeout(
							resetForInactivity,
							Number.isFinite( timeout ) ? timeout : 90000
						);
					}
				};

				resetSchedulers.set( root, scheduleReset );

				const updateNetworkStatus = () => {
					context.isOffline = ! navigator.onLine;
				};

				const requestWakeLock = async () => {
					if (
						'wakeLock' in navigator &&
						document.visibilityState === 'visible'
					) {
						try {
							wakeLock =
								await navigator.wakeLock.request( 'screen' );
						} catch {
							wakeLock = undefined;
						}
					}
				};

				const handleVisibility = () => {
					if ( document.visibilityState === 'visible' ) {
						scheduleReset();
						requestWakeLock();
					}
				};

				const handleKeydown = ( event ) => {
					scheduleReset();

					if ( event.key !== 'Escape' ) {
						return;
					}

					event.preventDefault();

					if ( context.screen === 'inspect' ) {
						context.screen = 'map';
						context.inspect = '';
						context.announcement =
							'Details closed. Back on the map.';
						focusElement( lastCardTriggers.get( root ) );
					} else if ( context.screen === 'map' ) {
						setAttractState( context );
						focusWithin( root, '.core-ai-map__prompt' );
					}
				};

				// The attract loop walks the four stories so a passer-by sees
				// the map compose itself before touching anything.
				const cycleAttractStory = () => {
					const storyIds = context.storyIds || [];

					if (
						context.screen !== 'attract' ||
						document.visibilityState !== 'visible' ||
						storyIds.length === 0
					) {
						return;
					}

					context.idleStoryIndex =
						( context.idleStoryIndex + 1 ) % storyIds.length;
					context.story = storyIds[ context.idleStoryIndex ];
				};

				// The AI Plugin card runs a live suggestion -> review -> apply
				// cycle whenever it is the block being talked about.
				const advanceSuggestion = () => {
					const isPluginInStory = Boolean(
						context.screen === 'map' &&
							context.layout?.[ context.story ]?.members?.plugin
					);
					const isPluginOpen =
						context.screen === 'inspect' &&
						context.inspect === 'plugin';

					if (
						document.visibilityState !== 'visible' ||
						( ! isPluginInStory && ! isPluginOpen )
					) {
						return;
					}

					context.suggestion += 1;
				};

				const syncServiceWorker = async () => {
					if (
						! ( 'serviceWorker' in navigator ) ||
						! window.isSecureContext
					) {
						return;
					}

					try {
						const serviceWorkerUrl = new URL(
							root.dataset.serviceWorkerUrl,
							window.location.href
						).href;

						if ( root.dataset.offlineEnabled !== 'true' ) {
							const registrations =
								await navigator.serviceWorker.getRegistrations();

							await Promise.all(
								registrations.map( ( registration ) => {
									const workers = [
										registration.active,
										registration.waiting,
										registration.installing,
									].filter( Boolean );
									const worker = workers.find(
										( candidate ) =>
											candidate.scriptURL ===
											serviceWorkerUrl
									);

									if ( ! worker ) {
										return undefined;
									}

									worker.postMessage( {
										type: 'CLEAR_CORE_AI_MAP',
									} );
									return registration.unregister();
								} )
							);
							return;
						}

						await navigator.serviceWorker.register(
							serviceWorkerUrl,
							{ scope: root.dataset.serviceWorkerScope || '/' }
						);
						const registration =
							await navigator.serviceWorker.ready;
						const worker =
							registration.active ||
							registration.waiting ||
							registration.installing;
						const assets = JSON.parse(
							root.dataset.assetUrls || '[]'
						);

						worker?.postMessage( {
							type: 'CACHE_CORE_AI_MAP',
							pageUrl: window.location.href,
							assets,
						} );
					} catch {
						// The server-rendered experience remains usable.
					}
				};

				const storyTimer = window.setInterval(
					cycleAttractStory,
					ATTRACT_STORY_INTERVAL
				);
				const suggestionTimer = window.setInterval(
					advanceSuggestion,
					SUGGESTION_INTERVAL
				);

				root.addEventListener( 'pointerdown', scheduleReset, {
					passive: true,
				} );
				window.addEventListener( 'keydown', handleKeydown );
				window.addEventListener( 'online', updateNetworkStatus );
				window.addEventListener( 'offline', updateNetworkStatus );
				window.addEventListener( 'resize', fitStage );
				document.addEventListener(
					'visibilitychange',
					handleVisibility
				);

				fitStage();
				updateNetworkStatus();
				requestWakeLock();
				syncServiceWorker();

				return () => {
					window.clearTimeout( resetTimer );
					window.clearInterval( storyTimer );
					window.clearInterval( suggestionTimer );
					resetSchedulers.delete( root );
					root.removeEventListener( 'pointerdown', scheduleReset );
					window.removeEventListener( 'keydown', handleKeydown );
					window.removeEventListener( 'online', updateNetworkStatus );
					window.removeEventListener(
						'offline',
						updateNetworkStatus
					);
					window.removeEventListener( 'resize', fitStage );
					document.removeEventListener(
						'visibilitychange',
						handleVisibility
					);
					wakeLock?.release?.();
					root.classList.remove( 'is-ready' );

					if ( ! document.querySelector( '.core-ai-map.is-ready' ) ) {
						document.body.classList.remove(
							'core-ai-kiosk-active'
						);
					}
				};
			}, [ context ] );

			// Any screen change restarts the inactivity countdown.
			useEffect( () => {
				const { ref: root } = getElement();

				if ( root ) {
					resetSchedulers.get( root )?.();
				}
			}, [ context.screen, context.story, context.inspect ] );
		},
	},
} );
