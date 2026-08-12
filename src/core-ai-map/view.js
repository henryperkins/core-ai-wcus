import {
	getContext,
	getElement,
	store,
	useEffect,
} from '@wordpress/interactivity';
import { animate, stagger } from 'motion';

const animationControls = new WeakMap();
const lastProjectTriggers = new WeakMap();
const toastTimers = new WeakMap();

const getRoot = ( element ) => element?.closest( '.core-ai-map' );

const getScenarioPath = ( context ) =>
	context.scenarioPaths?.[ context.activeScenario ] || [];

const stopAnimations = ( root ) => {
	( animationControls.get( root ) || [] ).forEach( ( control ) => {
		control.stop?.();
	} );
	animationControls.delete( root );
};

const cleanMotionStyles = ( root ) => {
	root.querySelectorAll(
		'.core-ai-map__node, .core-ai-map__paths path, .core-ai-map__prompt, .core-ai-map__details'
	).forEach( ( element ) => {
		element.style.removeProperty( 'opacity' );
		element.style.removeProperty( 'transform' );
		element.style.removeProperty( 'stroke-dashoffset' );
		element.style.removeProperty( 'box-shadow' );
	} );
};

const runMotion = ( root, screen ) => {
	stopAnimations( root );
	cleanMotionStyles( root );

	const reduceMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;
	root.classList.toggle( 'core-ai-map--reduce-motion', reduceMotion );

	if ( reduceMotion || document.visibilityState === 'hidden' ) {
		return undefined;
	}

	const controls = [];
	const nodes = root.querySelectorAll( '.core-ai-map__node' );
	const activeNodes = root.querySelectorAll( '.core-ai-map__node.is-active' );
	const activePaths = root.querySelectorAll(
		'.core-ai-map__paths path.is-active'
	);

	if ( screen === 'attract' ) {
		nodes.forEach( ( node, index ) => {
			controls.push(
				animate(
					node,
					{ y: [ 0, index % 2 === 0 ? -7 : 7, 0 ] },
					{
						duration: 5.5 + index * 0.25,
						delay: index * 0.18,
						ease: 'easeInOut',
						repeat: Infinity,
					}
				)
			);
		} );
		controls.push(
			animate(
				root.querySelector( '.core-ai-map__prompt' ),
				{
					boxShadow: [
						'0 14px 36px rgba(56, 88, 233, 0.2)',
						'0 18px 52px rgba(56, 88, 233, 0.38)',
						'0 14px 36px rgba(56, 88, 233, 0.2)',
					],
				},
				{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }
			)
		);
	}

	if ( screen === 'map' ) {
		controls.push(
			animate(
				nodes,
				{ opacity: [ 0, 1 ], scale: [ 0.88, 1 ], y: [ 20, 0 ] },
				{
					duration: 0.5,
					delay: stagger( 0.055 ),
					ease: [ 0.22, 1, 0.36, 1 ],
				}
			)
		);
	}

	if ( screen === 'detail' ) {
		const details = root.querySelector( '.core-ai-map__details' );

		if ( details ) {
			controls.push(
				animate(
					details,
					{ opacity: [ 0, 1 ], x: [ 44, 0 ] },
					{ duration: 0.4, ease: [ 0.22, 1, 0.36, 1 ] }
				)
			);
		}
	}

	if ( activeNodes.length ) {
		controls.push(
			animate(
				activeNodes,
				{ scale: [ 1, 1.035, 1 ] },
				{
					duration: 1.6,
					delay: stagger( 0.12 ),
					ease: 'easeInOut',
				}
			)
		);
	}

	activePaths.forEach( ( path, index ) => {
		controls.push(
			animate(
				path,
				{ strokeDashoffset: [ 1, 0 ] },
				{
					duration: 1.25,
					delay: index * 0.14,
					ease: 'linear',
					repeat: screen === 'attract' ? Infinity : 1,
				}
			)
		);
	} );

	animationControls.set( root, controls.filter( Boolean ) );

	return () => stopAnimations( root );
};

const setAttractState = ( context ) => {
	const scenarioIds = Object.keys( context.scenarioPaths || {} );
	context.screen = 'attract';
	context.selectedProject = '';
	context.activeScenario = scenarioIds[ 0 ] || '';
	context.idleScenarioIndex = 0;
	context.toast = '';
	context.announcement = 'The Core AI map returned to its welcome screen.';
};

store( 'core-ai/map', {
	state: {
		get isAttract() {
			return getContext().screen === 'attract';
		},
		get isMap() {
			return getContext().screen === 'map';
		},
		get isDetail() {
			return getContext().screen === 'detail';
		},
		get isNotDetail() {
			return getContext().screen !== 'detail';
		},
		get isOnline() {
			return ! getContext().isOffline;
		},
		get isOffline() {
			return getContext().isOffline;
		},
		get hasScenario() {
			return Boolean( getContext().activeScenario );
		},
		get isScenarioSelected() {
			const context = getContext();
			return (
				Boolean( context.scenarioId ) &&
				context.scenarioId === context.activeScenario
			);
		},
		get isScenarioNotSelected() {
			const context = getContext();
			return context.scenarioId !== context.activeScenario;
		},
		get isProjectSelected() {
			const context = getContext();
			return (
				Boolean( context.projectId ) &&
				context.projectId === context.selectedProject
			);
		},
		get isProjectNotSelected() {
			const context = getContext();
			return context.projectId !== context.selectedProject;
		},
		get isProjectActive() {
			const context = getContext();
			const path = getScenarioPath( context );

			return (
				context.projectId === context.selectedProject ||
				path.includes( context.projectId )
			);
		},
		get isProjectDimmed() {
			const context = getContext();

			if ( context.selectedProject ) {
				return context.projectId !== context.selectedProject;
			}

			const path = getScenarioPath( context );
			return path.length > 0 && ! path.includes( context.projectId );
		},
		get isPathActive() {
			const context = getContext();
			const path = getScenarioPath( context );

			return path.some( ( projectId, index ) => {
				const nextProjectId = path[ index + 1 ];
				return (
					( projectId === context.fromProject &&
						nextProjectId === context.toProject ) ||
					( projectId === context.toProject &&
						nextProjectId === context.fromProject )
				);
			} );
		},
		get announcement() {
			return getContext().announcement;
		},
		get toast() {
			return getContext().toast;
		},
		get hasNoToast() {
			return ! getContext().toast;
		},
	},
	actions: {
		start() {
			const context = getContext();
			context.screen = 'map';
			context.selectedProject = '';
			context.activeScenario = '';
			context.announcement =
				'Map open. Choose one of six projects or follow a story.';
		},
		selectProject() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );

			if ( root ) {
				lastProjectTriggers.set( root, ref );
			}

			context.screen = 'detail';
			context.selectedProject = context.projectId;
			context.activeScenario = '';
			context.announcement = `${ ref.textContent.trim() } details open.`;

			window.setTimeout( () => {
				root?.querySelector( '.core-ai-map__details-close' )?.focus( {
					preventScroll: true,
				} );
			}, 80 );
		},
		closeDetails() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			const previousTrigger = root
				? lastProjectTriggers.get( root )
				: undefined;

			context.screen = 'map';
			context.selectedProject = '';
			context.announcement = 'Project details closed. Back on the map.';

			window.setTimeout( () => {
				previousTrigger?.focus( { preventScroll: true } );
			}, 40 );
		},
		selectScenario() {
			const context = getContext();
			const { ref } = getElement();
			const isCurrent = context.activeScenario === context.scenarioId;

			context.screen = 'map';
			context.selectedProject = '';
			context.activeScenario = isCurrent ? '' : context.scenarioId;
			context.announcement = isCurrent
				? 'Scenario cleared.'
				: `${ ref.textContent.trim() } path highlighted.`;
		},
		reset() {
			setAttractState( getContext() );
		},
		keepInKiosk( event ) {
			event.preventDefault();

			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			const url = ref.getAttribute( 'href' );

			context.toast = `This display stays on the map. Visit ${ url } on your device.`;

			if ( root ) {
				window.clearTimeout( toastTimers.get( root ) );
				toastTimers.set(
					root,
					window.setTimeout( () => {
						context.toast = '';
					}, 6500 )
				);
			}
		},
	},
	callbacks: {
		useKiosk() {
			const context = getContext();
			const screen = context.screen;
			const selectedProject = context.selectedProject;
			const activeScenario = context.activeScenario;

			useEffect( () => {
				const { ref } = getElement();

				if ( ! ref ) {
					return undefined;
				}

				return runMotion(
					ref,
					screen,
					selectedProject,
					activeScenario
				);
			}, [ screen, selectedProject, activeScenario ] );

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
				const scenarioIds = Object.keys( context.scenarioPaths || {} );
				let resetTimer;
				let wakeLock;

				const resetForInactivity = () => {
					if (
						document.visibilityState === 'visible' &&
						context.screen !== 'attract'
					) {
						setAttractState( context );
						context.announcement =
							'The map reset after a period of inactivity.';
					}
				};

				const scheduleReset = () => {
					window.clearTimeout( resetTimer );
					if ( context.screen !== 'attract' ) {
						resetTimer = window.setTimeout(
							resetForInactivity,
							Number.isFinite( timeout ) ? timeout : 60000
						);
					}
				};

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
					const controls = animationControls.get( root ) || [];

					controls.forEach( ( control ) => {
						if ( document.visibilityState === 'hidden' ) {
							control.pause?.();
						} else {
							control.play?.();
						}
					} );

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

					if ( context.screen === 'detail' ) {
						context.screen = 'map';
						context.selectedProject = '';
						context.announcement =
							'Project details closed. Back on the map.';
					} else if ( context.screen === 'map' ) {
						setAttractState( context );
					}
				};

				const cycleAttractScenario = () => {
					if (
						context.screen !== 'attract' ||
						document.visibilityState !== 'visible' ||
						scenarioIds.length === 0
					) {
						return;
					}

					context.idleScenarioIndex =
						( context.idleScenarioIndex + 1 ) % scenarioIds.length;
					context.activeScenario =
						scenarioIds[ context.idleScenarioIndex ];
				};

				const registerServiceWorker = async () => {
					if (
						root.dataset.offlineEnabled !== 'true' ||
						! ( 'serviceWorker' in navigator ) ||
						! window.isSecureContext
					) {
						return;
					}

					try {
						await navigator.serviceWorker.register(
							root.dataset.serviceWorkerUrl,
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

				const idleScenarioTimer = window.setInterval(
					cycleAttractScenario,
					9000
				);

				root.addEventListener( 'pointerdown', scheduleReset, {
					passive: true,
				} );
				window.addEventListener( 'keydown', handleKeydown );
				window.addEventListener( 'online', updateNetworkStatus );
				window.addEventListener( 'offline', updateNetworkStatus );
				document.addEventListener(
					'visibilitychange',
					handleVisibility
				);

				updateNetworkStatus();
				requestWakeLock();
				registerServiceWorker();

				return () => {
					window.clearTimeout( resetTimer );
					window.clearTimeout( toastTimers.get( root ) );
					window.clearInterval( idleScenarioTimer );
					root.removeEventListener( 'pointerdown', scheduleReset );
					window.removeEventListener( 'keydown', handleKeydown );
					window.removeEventListener( 'online', updateNetworkStatus );
					window.removeEventListener(
						'offline',
						updateNetworkStatus
					);
					document.removeEventListener(
						'visibilitychange',
						handleVisibility
					);
					wakeLock?.release?.();
					stopAnimations( root );
					root.classList.remove( 'is-ready' );

					if ( ! document.querySelector( '.core-ai-map.is-ready' ) ) {
						document.body.classList.remove(
							'core-ai-kiosk-active'
						);
					}
				};
			}, [] );
		},
	},
} );
