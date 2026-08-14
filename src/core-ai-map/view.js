import {
	getContext,
	getElement,
	store,
	useEffect,
} from '@wordpress/interactivity';

const STAGE_WIDTH = 1366;
const STAGE_HEIGHT = 1024;
const FLOW_SETTLE_DELAY = 2900;
const ATTRACT_TIMELINE = {
	drawing: 560,
	signalling: 1000,
	settled: 2900,
	releasing: 5200,
	next: 6500,
	restart: 8000,
};

const resetSchedulers = new WeakMap();
const attractSchedulers = new WeakMap();
const flowTimers = new WeakMap();
const attractTimers = new WeakMap();
const lastCardTriggers = new WeakMap();
const lastBenchTriggers = new WeakMap();
const lastAboutTriggers = new WeakMap();

const getRoot = ( element ) => element?.closest( '.core-ai-map' );

const getObservedStaticAssets = () => {
	try {
		return performance
			.getEntriesByType( 'resource' )
			.map( ( entry ) => entry.name )
			.filter( ( assetUrl ) => {
				const url = new URL( assetUrl, window.location.href );
				return (
					url.origin === window.location.origin &&
					[ ...url.searchParams.keys() ].every(
						( key ) => key === 'ver'
					) &&
					/\.(?:css|m?js|woff2|svg|png)$/i.test( url.pathname )
				);
			} );
	} catch {
		return [];
	}
};

const isolateKioskPage = ( root ) => {
	const records = [];
	let branch = root;

	while ( branch?.parentElement ) {
		const parent = branch.parentElement;
		for ( const sibling of parent.children ) {
			if ( sibling === branch ) {
				continue;
			}
			records.push( {
				element: sibling,
				hadInert: sibling.hasAttribute( 'inert' ),
				inert: sibling.inert,
				hadAriaHidden: sibling.hasAttribute( 'aria-hidden' ),
				ariaHidden: sibling.getAttribute( 'aria-hidden' ),
			} );
			sibling.inert = true;
			sibling.setAttribute( 'aria-hidden', 'true' );
		}
		if ( parent === root.ownerDocument.body ) {
			break;
		}
		branch = parent;
	}

	return () => {
		for ( const record of records ) {
			if ( record.hadInert ) {
				record.element.inert = record.inert;
			} else {
				record.element.inert = false;
				record.element.removeAttribute( 'inert' );
			}
			if ( record.hadAriaHidden ) {
				record.element.setAttribute( 'aria-hidden', record.ariaHidden );
			} else {
				record.element.removeAttribute( 'aria-hidden' );
			}
		}
	};
};

const activeLayout = ( context ) =>
	( context.story && context.layout?.[ context.story ] ) || null;

const hasLayoutMember = ( layout, id ) =>
	Boolean( layout?.members && Object.hasOwn( layout.members, id ) );

const isLayoutSidecar = ( layout, id ) =>
	Boolean( layout?.sidecars?.includes( id ) );

/**
 * Whether a card takes part in the selected flow.
 *
 * Participation is the single rule the interface is built on: a participating
 * card is highlighted, tappable, cued, and carries a role. Everything else is
 * parked, quiet, and inert until the visitor picks a different flow.
 *
 * @param {Object} context Element context.
 * @param {string} id      Card id.
 * @return {boolean} True when the card takes part in the selected flow.
 */
const isParticipant = ( context, id ) =>
	Boolean( context.participants?.[ context.story ]?.includes( id ) );

/**
 * Fills the numbered placeholders in an authored template.
 *
 * @param {string}    template Template carrying %1$s style placeholders.
 * @param {...string} values   Replacement values, in order.
 * @return {string} The completed string.
 */
const format = ( template, ...values ) =>
	values.reduce(
		( carry, value, index ) =>
			carry.replaceAll( `%${ index + 1 }$s`, value ),
		String( template || '' )
	);

const previewList = ( context ) => {
	if ( Array.isArray( context.previews ) && context.previews.length ) {
		return context.previews;
	}

	return ( context.storyIds || [] )
		.map( ( storyId ) => {
			const layout = context.layout?.[ storyId ];
			if ( ! layout ) {
				return null;
			}
			return {
				storyId,
				ids: Object.keys( layout.members || {} ),
				steps: layout.members || {},
				sidecars: layout.sidecars || [],
				at: layout.place || {},
				scale: 1,
			};
		} )
		.filter( Boolean );
};

const activePreview = ( context ) => {
	const previews = previewList( context );
	if ( ! previews.length ) {
		return null;
	}
	return previews[ context.previewIndex % previews.length ] || previews[ 0 ];
};

const isRecomposed = ( context ) =>
	Boolean( activeLayout( context ) ) && context.recompose !== false;

const reducedMotion = ( root ) =>
	Boolean(
		root?.ownerDocument?.defaultView?.matchMedia?.(
			'(prefers-reduced-motion: reduce)'
		).matches ??
			window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches
	);

const isCurrentPathVariant = (
	context,
	storyId = context.storyId,
	variant = context.variant
) => {
	if ( ! context.story || storyId !== context.story ) {
		return false;
	}
	return variant === ( context.recompose === false ? 'rest' : 'edges' );
};

const isRuleLit = ( context, side = context.side ) =>
	( activeLayout( context )?.crosses || [] ).includes( side );

const areHairlinesHidden = ( context ) =>
	context.screen === 'attract' || isRecomposed( context );

const isEdgeLive = ( context, root, storyId, variant ) =>
	Boolean(
		isCurrentPathVariant( context, storyId, variant ) &&
			( context.flowPhase ?? 'transition' ) === 'transition' &&
			! reducedMotion( root )
	);

const isPreviewHidden = ( context, previewId = context.previewId ) =>
	context.screen !== 'attract' ||
	Number( previewId ) !== Number( context.previewIndex );

const isPreviewPathVisible = ( context, root, previewId ) =>
	Boolean(
		! isPreviewHidden( context, previewId ) &&
			( reducedMotion( root ) ||
				[ 'drawing', 'signalling', 'settled' ].includes(
					context.previewPhase
				) )
	);

const isPreviewTextVisible = ( context, root, previewId ) =>
	Boolean(
		! isPreviewHidden( context, previewId ) &&
			( reducedMotion( root ) ||
				[ 'signalling', 'settled' ].includes( context.previewPhase ) )
	);

const isPreviewSignalLive = ( context, root, previewId ) =>
	Boolean(
		! isPreviewHidden( context, previewId ) &&
			context.previewPhase === 'signalling' &&
			! reducedMotion( root )
	);

const isProviderConfigPathHidden = ( context, storyId, variant ) =>
	context.screen !== 'map' ||
	! isCurrentPathVariant( context, storyId, variant );

const syncSvgState = ( root, context ) => {
	if ( ! root ) {
		return;
	}

	root.querySelectorAll( '[data-core-ai-rule]' ).forEach( ( rule ) => {
		rule.classList.toggle(
			'is-lit',
			isRuleLit( context, rule.dataset.coreAiRule )
		);
	} );
	root.querySelectorAll( '.core-ai-map__hairlines' ).forEach(
		( hairlines ) => {
			hairlines.classList.toggle(
				'is-hidden',
				areHairlinesHidden( context )
			);
		}
	);
	root.querySelectorAll( '[data-core-ai-preview]' ).forEach( ( preview ) => {
		const previewId = preview.dataset.coreAiPreview;
		const hidden = isPreviewHidden( context, previewId );
		preview.hidden = hidden;
		preview.querySelectorAll( 'path' ).forEach( ( path ) => {
			path.classList.toggle(
				'is-live',
				isPreviewPathVisible( context, root, previewId )
			);
		} );
		preview
			.querySelectorAll( '.core-ai-map__preview-signal' )
			.forEach( ( signal ) => {
				signal.classList.toggle(
					'is-live',
					isPreviewSignalLive( context, root, previewId )
				);
			} );
	} );
	root.querySelectorAll( '.core-ai-map__flow [data-core-ai-story]' ).forEach(
		( path ) => {
			const { coreAiStory: storyId, coreAiVariant: variant } =
				path.dataset;
			const visible = isCurrentPathVariant( context, storyId, variant );
			path.classList.toggle( 'is-visible', visible );
			path.classList.toggle(
				'is-live',
				isEdgeLive( context, root, storyId, variant )
			);
		}
	);
	root.querySelectorAll(
		'.core-ai-map__config-path[data-core-ai-story]'
	).forEach( ( path ) => {
		const { coreAiStory: storyId, coreAiVariant: variant } = path.dataset;
		path.hidden = isProviderConfigPathHidden( context, storyId, variant );
	} );
	root.querySelectorAll( '[data-core-ai-bench-flow]' ).forEach( ( flow ) => {
		flow.classList.toggle( 'is-live', Boolean( context.benchPathsLive ) );
		flow.classList.toggle( 'is-visible', context.screen === 'bench' );
	} );
};

const focusElement = ( element, delay = 40 ) => {
	if ( ! element ) {
		return;
	}
	window.setTimeout( () => element.focus( { preventScroll: true } ), delay );
};

const focusWithin = ( root, selector, delay = 40 ) => {
	if ( root ) {
		window.setTimeout(
			() =>
				root
					.querySelector( selector )
					?.focus( { preventScroll: true } ),
			delay
		);
	}
};

/**
 * Focuses step one of the assembled flow.
 *
 * A visitor is asked to follow the path in order, so a keyboard visitor starts
 * where the path starts. The step numbers are written by the same render the
 * flow selection triggers, so this reads the settled DOM rather than guessing
 * which card leads a given flow.
 *
 * @param {Element} root  Kiosk root.
 * @param {number}  delay Milliseconds to wait for the flow to render.
 */
const focusFirstStep = ( root, delay = 80 ) => {
	if ( ! root ) {
		return;
	}

	window.setTimeout( () => {
		const leading = [ ...root.querySelectorAll( '.core-ai-map__step' ) ]
			.find( ( node ) => node.textContent.trim() === '1' )
			?.closest( 'button' );

		(
			leading ||
			root.querySelector( '.core-ai-map__block-body:not([disabled])' )
		)?.focus( { preventScroll: true } );
	}, delay );
};

const clearTimers = ( timers, root ) => {
	for ( const timer of timers.get( root ) || [] ) {
		window.clearTimeout( timer );
	}
	timers.set( root, [] );
};

const addTimer = ( timers, root, callback, delay ) => {
	const timer = window.setTimeout( callback, delay );
	const current = timers.get( root ) || [];
	current.push( timer );
	timers.set( root, current );
	return timer;
};

const setPreviewPhase = ( context, phase ) => {
	context.previewPhase = phase;
	// Retained as an alias for the original RED contract and assistive tooling.
	context.attractPhase = phase;
};

const setAttractState = ( context ) => {
	context.screen = 'attract';
	context.aboutReturnScreen = '';
	context.story = '';
	context.inspect = '';
	context.previewIndex = 0;
	context.flowPhase = 'settled';
	context.storyMotionPhase = 'settled';
	context.benchPathsLive = false;
	context.suggestion = Math.floor( ( context.suggestion || 0 ) / 2 ) * 2;
	setPreviewPhase( context, 'assembling' );
	context.announcement =
		'The Living Block Map returned to its welcome screen.';
};

const startAttractCycle = ( root, context ) => {
	if ( ! root ) {
		return;
	}
	clearTimers( attractTimers, root );

	const run = () => {
		if ( context.screen !== 'attract' ) {
			return;
		}

		setPreviewPhase(
			context,
			reducedMotion( root ) ? 'settled' : 'assembling'
		);
		if ( ! reducedMotion( root ) ) {
			addTimer(
				attractTimers,
				root,
				() => {
					if ( context.screen === 'attract' ) {
						setPreviewPhase( context, 'drawing' );
					}
				},
				ATTRACT_TIMELINE.drawing
			);
			addTimer(
				attractTimers,
				root,
				() => {
					if ( context.screen === 'attract' ) {
						setPreviewPhase( context, 'signalling' );
					}
				},
				ATTRACT_TIMELINE.signalling
			);
			addTimer(
				attractTimers,
				root,
				() => {
					if ( context.screen === 'attract' ) {
						setPreviewPhase( context, 'settled' );
					}
				},
				ATTRACT_TIMELINE.settled
			);
			addTimer(
				attractTimers,
				root,
				() => {
					if ( context.screen === 'attract' ) {
						setPreviewPhase( context, 'releasing' );
					}
				},
				ATTRACT_TIMELINE.releasing
			);
		}

		addTimer(
			attractTimers,
			root,
			() => {
				if ( context.screen !== 'attract' ) {
					return;
				}
				const previews = previewList( context );
				context.previewIndex = previews.length
					? ( context.previewIndex + 1 ) % previews.length
					: 0;
				setPreviewPhase(
					context,
					reducedMotion( root ) ? 'settled' : 'assembling'
				);
			},
			ATTRACT_TIMELINE.next
		);

		addTimer( attractTimers, root, run, ATTRACT_TIMELINE.restart );
	};

	attractSchedulers.set( root, () => startAttractCycle( root, context ) );
	run();
};

const runFlow = ( root, context, { bench = false } = {} ) => {
	if ( root ) {
		clearTimers( flowTimers, root );
	}
	context.flowPhase = reducedMotion( root ) ? 'settled' : 'transition';
	context.storyMotionPhase = context.flowPhase;
	context.benchPathsLive = Boolean(
		bench && context.flowPhase === 'transition'
	);

	if ( context.flowPhase !== 'transition' || ! root ) {
		return;
	}
	addTimer(
		flowTimers,
		root,
		() => {
			context.flowPhase = 'settled';
			context.storyMotionPhase = 'settled';
			context.benchPathsLive = false;
		},
		FLOW_SETTLE_DELAY
	);
};

store( 'core-ai/map', {
	state: {
		get isAttract() {
			return getContext().screen === 'attract';
		},
		get isNotAttract() {
			return getContext().screen !== 'attract';
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
		get isBench() {
			return getContext().screen === 'bench';
		},
		get isAbout() {
			return getContext().screen === 'about';
		},
		get isNotAbout() {
			return getContext().screen !== 'about';
		},
		get isAboutControlHidden() {
			return [ 'about', 'inspect', 'bench' ].includes(
				getContext().screen
			);
		},
		get isNotBench() {
			return getContext().screen !== 'bench';
		},
		get isCanvasHidden() {
			return getContext().screen !== 'map';
		},
		get isCanvasInert() {
			return getContext().screen !== 'map';
		},
		get isResetHidden() {
			return getContext().screen !== 'map';
		},
		get isRailHidden() {
			return getContext().screen !== 'map';
		},
		get hasStory() {
			return Boolean( activeLayout( getContext() ) );
		},
		get isOnline() {
			return ! getContext().isOffline;
		},

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
		/*
		 * The band under the map is always present on the map screen. A flow
		 * fills it with that flow's takeaway; the component explorer fills it
		 * with what the explorer is for.
		 */
		get isStoryBandHidden() {
			return getContext().screen !== 'map';
		},
		get isBrowseNoteHidden() {
			const context = getContext();
			return (
				context.screen !== 'map' || Boolean( activeLayout( context ) )
			);
		},
		get isBrowseControlHidden() {
			const context = getContext();
			return context.screen !== 'map' || ! activeLayout( context );
		},

		/*
		 * One instruction per state. The panel carries its own, so the header
		 * line stands down while a panel or the run loop is open.
		 */
		get guidance() {
			const context = getContext();
			const strings = context.guidance || {};

			if ( context.screen === 'attract' ) {
				return strings.attract || '';
			}

			if ( ! activeLayout( context ) ) {
				return strings.browse || '';
			}

			return format(
				strings.flow,
				context.storySteps?.[ context.story ] || ''
			);
		},
		get isGuidanceHidden() {
			return [ 'inspect', 'bench', 'about' ].includes(
				getContext().screen
			);
		},
		get inspectGuidance() {
			const context = getContext();
			return format(
				context.guidance?.inspect,
				context.storyTitles?.[ context.story ] || ''
			);
		},
		get isFlowContextHidden() {
			return ! activeLayout( getContext() );
		},
		get detailsBackLabel() {
			const context = getContext();
			const title = context.storyTitles?.[ context.story ];
			return title ? `Back to ${ title }` : 'Back to the map';
		},

		get cardTransform() {
			const context = getContext();
			const neutral = context.neutral?.[ context.cardId ];
			if ( ! neutral ) {
				return '';
			}

			if ( context.screen === 'attract' ) {
				const preview = activePreview( context );
				const place = preview?.at?.[ context.cardId ];
				if ( place && context.previewPhase !== 'releasing' ) {
					return `translate(${ place[ 0 ] - neutral[ 0 ] }px, ${
						place[ 1 ] - neutral[ 1 ]
					}px) scale(${ preview.scale ?? 1 })`;
				}
				const loose = context.loose?.[ context.cardId ];
				return loose
					? `translate(${ loose[ 0 ] }px, ${ loose[ 1 ] }px) rotate(${ loose[ 2 ] }deg)`
					: '';
			}

			const layout = activeLayout( context );
			if ( ! layout ) {
				return '';
			}
			const place = layout.place?.[ context.cardId ];
			if ( context.recompose === false ) {
				return '';
			}
			if ( isLayoutSidecar( layout, context.cardId ) && place ) {
				return `translate(${ place[ 0 ] - neutral[ 0 ] }px, ${
					place[ 1 ] - neutral[ 1 ]
				}px)`;
			}
			if ( place ) {
				return `translate(${ place[ 0 ] - neutral[ 0 ] }px, ${
					place[ 1 ] - neutral[ 1 ]
				}px)`;
			}
			const slot = ( layout.park || [] ).indexOf( context.cardId );
			if ( slot < 0 ) {
				return '';
			}
			const shelfIndex = ( layout.shelfStart || 0 ) + slot;
			const shelfX =
				context.shelfX?.[ shelfIndex ] ?? context.shelfX?.[ 0 ] ?? 0;
			return `translate(${ shelfX - neutral[ 0 ] }px, ${
				layout.shelfY - neutral[ 1 ]
			}px)`;
		},
		get cardStep() {
			const context = getContext();
			if ( context.screen === 'attract' ) {
				if ( context.previewPhase === 'releasing' ) {
					return '';
				}
				const preview = activePreview( context );
				const previewStep = preview?.steps?.[ context.cardId ];
				if ( preview?.steps ) {
					return previewStep ? String( previewStep ) : '';
				}
				const index = preview?.ids?.indexOf( context.cardId ) ?? -1;
				return index >= 0 ? String( index + 1 ) : '';
			}
			const step = activeLayout( context )?.members?.[ context.cardId ];
			return step ? String( step ) : '';
		},
		get isCardActive() {
			const context = getContext();
			if ( context.screen === 'attract' ) {
				return this.isPreviewMember;
			}
			return Boolean(
				Number(
					activeLayout( context )?.members?.[ context.cardId ] || 0
				) > 0
			);
		},
		get isCardSidecar() {
			const context = getContext();
			return Boolean(
				isRecomposed( context ) &&
					isLayoutSidecar( activeLayout( context ), context.cardId )
			);
		},
		get isCardParked() {
			const context = getContext();
			const layout = activeLayout( context );
			return Boolean(
				isRecomposed( context ) &&
					! hasLayoutMember( layout, context.cardId ) &&
					! isLayoutSidecar( layout, context.cardId ) &&
					layout.park?.includes( context.cardId )
			);
		},
		get isPreviewMember() {
			const context = getContext();
			return Boolean(
				context.screen === 'attract' &&
					context.previewPhase !== 'releasing' &&
					activePreview( context )?.ids?.includes( context.cardId )
			);
		},
		get isPreviewSidecar() {
			const context = getContext();
			return Boolean(
				context.screen === 'attract' &&
					context.previewPhase !== 'releasing' &&
					activePreview( context )?.sidecars?.includes(
						context.cardId
					)
			);
		},
		get cardOpacity() {
			const context = getContext();
			if ( context.screen === 'map' && ! activeLayout( context ) ) {
				return '1';
			}
			if ( context.screen !== 'attract' ) {
				return '';
			}
			if ( this.isPreviewMember ) {
				return '1';
			}
			if ( this.isPreviewSidecar ) {
				return '0.86';
			}
			return context.previewPhase === 'releasing' ? '0.62' : '0.2';
		},
		get isCardDimmed() {
			const context = getContext();
			const layout = activeLayout( context );
			return Boolean(
				layout &&
					! isRecomposed( context ) &&
					! hasLayoutMember( layout, context.cardId ) &&
					! isLayoutSidecar( layout, context.cardId )
			);
		},
		get isCardOffstage() {
			const context = getContext();
			if ( context.screen === 'attract' ) {
				return false;
			}
			const layout = activeLayout( context );
			if ( context.screen === 'map' && ! layout ) {
				return false;
			}
			return ! (
				hasLayoutMember( layout, context.cardId ) ||
				isLayoutSidecar( layout, context.cardId )
			);
		},
		get isCardInspected() {
			const context = getContext();
			return context.cardId === context.inspect;
		},
		get isCardNotInspected() {
			const context = getContext();
			return context.cardId !== context.inspect;
		},

		/*
		 * Highlighted means tappable, and dimmed means it is not part of this
		 * flow. Disabling the parked cards is what makes that promise true
		 * rather than merely visual: a card that cannot answer is a card the
		 * visitor cannot press.
		 */
		get isCardNotTappable() {
			const context = getContext();
			return (
				Boolean( activeLayout( context ) ) &&
				! isParticipant( context, context.cardId )
			);
		},
		get isTapCueHidden() {
			const context = getContext();
			return ! (
				context.screen === 'map' &&
				Boolean( activeLayout( context ) ) &&
				isParticipant( context, context.cardId )
			);
		},
		get cardActionLabel() {
			const context = getContext();
			const strings = context.guidance || {};
			const name = context.cardTitles?.[ context.cardId ] || '';

			if (
				activeLayout( context ) &&
				isParticipant( context, context.cardId )
			) {
				return format(
					strings.cardAction,
					name,
					context.storyTitles?.[ context.story ] || ''
				);
			}

			return format( strings.cardActionBrowse, name );
		},

		get isStripLive() {
			const context = getContext();
			if ( context.shapes === false ) {
				return false;
			}
			if ( context.inspect === context.cardId ) {
				return true;
			}
			const layout = activeLayout( context );
			return Boolean(
				context.screen === 'map' &&
					Number( layout?.members?.[ context.cardId ] || 0 ) > 0 &&
					! layout.noStrip?.includes( context.cardId )
			);
		},
		get isStripHidden() {
			return ! this.isStripLive;
		},
		get stripTop() {
			const context = getContext();
			return `${
				activeLayout( context )?.strips?.[ context.cardId ]?.[ 1 ] ??
				158
			}px`;
		},

		get isRuleLit() {
			const context = getContext();
			return isRuleLit( context );
		},
		get areHairlinesHidden() {
			return areHairlinesHidden( getContext() );
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
		get shelfLeft() {
			const context = getContext();
			const layout = activeLayout( context );
			return `${
				layout ? context.shelfX?.[ layout.shelfStart || 0 ] ?? 250 : 250
			}px`;
		},

		get isPathVisible() {
			return isCurrentPathVariant( getContext() );
		},
		get isEdgeLive() {
			const context = getContext();
			return isEdgeLive(
				context,
				getRoot( getElement().ref ),
				context.storyId,
				context.variant
			);
		},
		get isSparkLive() {
			const context = getContext();
			return Boolean(
				this.isEdgeLive &&
					! activeLayout( context )?.tokens &&
					context.screen === 'map'
			);
		},
		get areTokensLive() {
			const context = getContext();
			return Boolean(
				this.isEdgeLive &&
					activeLayout( context )?.tokens &&
					context.shapes !== false &&
					context.screen === 'map'
			);
		},
		get areTokensVisible() {
			const context = getContext();
			return Boolean(
				activeLayout( context )?.tokens &&
					context.shapes !== false &&
					context.screen === 'map'
			);
		},

		get isPreviewHidden() {
			return isPreviewHidden( getContext() );
		},
		get isPreviewPathVisible() {
			const context = getContext();
			return isPreviewPathVisible(
				context,
				getRoot( getElement().ref ),
				context.previewId
			);
		},
		get isPreviewTextVisible() {
			const context = getContext();
			return isPreviewTextVisible(
				context,
				getRoot( getElement().ref ),
				context.previewId
			);
		},
		get isPreviewSignalLive() {
			const context = getContext();
			return isPreviewSignalLive(
				context,
				getRoot( getElement().ref ),
				context.previewId
			);
		},

		get isProviderPluginHidden() {
			const context = getContext();
			if ( context.screen === 'map' ) {
				return context.story !== 'uses-ai';
			}
			return ! (
				context.screen === 'attract' &&
				context.previewPhase !== 'releasing' &&
				activePreview( context )?.storyId === 'uses-ai'
			);
		},
		get providerPluginTransform() {
			const context = getContext();
			const providerPlugin =
				context.layout?.[ 'uses-ai' ]?.providerPlugin;
			if (
				context.screen === 'map' &&
				context.story === 'uses-ai' &&
				context.recompose === false
			) {
				const base = providerPlugin?.position;
				const position = providerPlugin?.restPosition;
				if ( ! base || ! position ) {
					return '';
				}
				return `translate(${ position[ 0 ] - base[ 0 ] }px, ${
					position[ 1 ] - base[ 1 ]
				}px)`;
			}
			if ( context.screen !== 'attract' ) {
				return '';
			}
			const preview = activePreview( context );
			const base = providerPlugin?.position;
			const position = preview?.providerPlugin?.position;
			if ( ! base || ! position ) {
				return '';
			}
			return `translate(${ position[ 0 ] - base[ 0 ] }px, ${
				position[ 1 ] - base[ 1 ]
			}px) scale(${ preview.providerPlugin.scale ?? 1 })`;
		},
		get isProviderConfigPathHidden() {
			const context = getContext();
			return isProviderConfigPathHidden(
				context,
				context.storyId,
				context.variant
			);
		},

		get suggestionLabel() {
			const context = getContext();
			const items = context.suggestions || [];
			return items.length
				? items[ Math.floor( context.suggestion / 2 ) % items.length ]
						?.label || ''
				: '';
		},
		get suggestionText() {
			const context = getContext();
			const items = context.suggestions || [];
			return items.length
				? items[ Math.floor( context.suggestion / 2 ) % items.length ]
						?.text || ''
				: '';
		},
		get suggestionPhase() {
			return getContext().phases?.[ getContext().suggestion % 2 ] || '';
		},
		get isSuggestionApplied() {
			return getContext().suggestion % 2 === 1;
		},
		get isSuggestionNotApplied() {
			return ! this.isSuggestionApplied;
		},

		get isAbilityTabSelected() {
			const context = getContext();
			return context.tabId === context.abilitiesTab;
		},
		get isAbilityTabNotSelected() {
			return ! this.isAbilityTabSelected;
		},
		get abilityTabIndex() {
			return this.isAbilityTabSelected ? '0' : '-1';
		},
		get isBenchStageSelected() {
			const context = getContext();
			return context.stageId === context.benchStage;
		},
		get isBenchStageNotSelected() {
			return ! this.isBenchStageSelected;
		},
		get benchPathsLive() {
			return Boolean( getContext().benchPathsLive );
		},
		get announcement() {
			return getContext().announcement;
		},
	},

	actions: {
		/*
		 * The exhibit is flow-first. The primary control opens an assembled,
		 * meaningful example rather than a canvas of unexplained parts, so the
		 * visitor learns how the pieces relate before they are asked to browse
		 * them. The neutral map is still there, one control away.
		 */
		start() {
			const context = getContext();
			const root = getRoot( getElement().ref );
			clearTimers( attractTimers, root );
			context.screen = 'map';
			context.story = context.openingStory || '';
			context.inspect = '';
			context.suggestion =
				Math.floor( ( context.suggestion || 0 ) / 2 ) * 2;
			runFlow( root, context );
			context.announcement = `${
				context.storyTitles?.[ context.story ] || ''
			}. ${ context.storyTakeaways?.[ context.story ] || '' }`;
			resetSchedulers.get( root )?.();
			focusFirstStep( root );
		},
		browseAll() {
			const context = getContext();
			const root = getRoot( getElement().ref );
			context.screen = 'map';
			context.story = '';
			context.inspect = '';
			context.flowPhase = 'settled';
			context.storyMotionPhase = 'settled';
			context.benchPathsLive = false;
			context.announcement =
				'Every component is on the canvas with no flow selected. Tap any component to learn what it is and where it belongs.';
			resetSchedulers.get( root )?.();
			focusWithin( root, '.core-ai-map__block-body:not([disabled])' );
		},
		selectStory() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			/*
			 * Choosing a flow never clears one. The rail switches between
			 * flows; leaving them behind is what the component explorer is
			 * for. Pressing the flow already showing replays it, which is what
			 * pressing it looks like it should do.
			 */
			const isCurrent = context.story === context.storyId;
			context.screen = 'map';
			context.inspect = '';
			context.story = context.storyId;
			context.suggestion =
				Math.floor( ( context.suggestion || 0 ) / 2 ) * 2;
			runFlow( root, context );
			context.announcement = `${
				context.storyTitles?.[ context.storyId ] ||
				ref.textContent.trim()
			}${ isCurrent ? ' replayed' : '' }. ${
				context.storyTakeaways?.[ context.storyId ] || ''
			}`;
			resetSchedulers.get( root )?.();
		},
		replayStory() {
			const context = getContext();
			const advancesSuggestion = context.story === 'uses-ai';
			if ( advancesSuggestion ) {
				context.suggestion =
					( Math.floor( context.suggestion / 2 ) + 1 ) * 2;
			}
			runFlow( getRoot( getElement().ref ), context );
			context.announcement = advancesSuggestion
				? 'The story flow replayed with the next AI Plugin suggestion.'
				: 'The story flow replayed.';
		},
		inspectCard() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			ref?.blur?.();
			if ( root ) {
				lastCardTriggers.set( root, ref );
			}
			context.screen = 'inspect';
			context.inspect = context.cardId;
			if ( context.inspect === 'abilities' ) {
				context.abilitiesTab = 'overview';
			}
			context.announcement = `${ ref.textContent.trim() } details open.`;
			resetSchedulers.get( root )?.();
			focusWithin( root, '.core-ai-map__details-close', 80 );
		},
		openAbout() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			ref?.blur?.();
			if ( root ) {
				lastAboutTriggers.set( root, ref );
			}
			context.aboutReturnScreen = context.screen;
			context.screen = 'about';
			context.announcement = 'About this exhibit open.';
			resetSchedulers.get( root )?.();
			focusWithin( root, '.core-ai-map__about-close', 80 );
		},
		closeAbout() {
			const context = getContext();
			const root = getRoot( getElement().ref );
			context.screen =
				context.aboutReturnScreen === 'map' ? 'map' : 'attract';
			context.aboutReturnScreen = '';
			context.announcement = 'About this exhibit closed.';
			resetSchedulers.get( root )?.();
			focusElement( root ? lastAboutTriggers.get( root ) : undefined );
		},
		closeInspect() {
			const context = getContext();
			const root = getRoot( getElement().ref );
			/*
			 * Closing a panel returns the visitor to the flow they were
			 * learning, not to a cleared canvas, and focus goes back to the
			 * card they opened.
			 */
			const title = context.storyTitles?.[ context.story ];
			context.screen = 'map';
			context.inspect = '';
			context.announcement = title
				? `Details closed. Back in ${ title }.`
				: 'Details closed. Back on the map.';
			resetSchedulers.get( root )?.();
			focusElement( root ? lastCardTriggers.get( root ) : undefined );
		},
		selectAbilityTab() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			context.abilitiesTab = context.tabId || 'overview';
			root?.querySelectorAll( '[role="tab"]' ).forEach( ( tab ) => {
				tab.tabIndex = tab === ref ? 0 : -1;
			} );
		},
		openBench() {
			const context = getContext();
			const { ref } = getElement();
			const root = getRoot( ref );
			ref?.blur?.();
			if ( root ) {
				const openedFromInspector = Boolean(
					ref.closest( '.core-ai-map__details' )
				);
				const restoreTarget = openedFromInspector
					? lastCardTriggers.get( root ) ||
					  root.querySelector(
							'.core-ai-map__block--bench .core-ai-map__block-body'
					  )
					: ref;
				lastBenchTriggers.set( root, restoreTarget );
			}
			context.screen = 'bench';
			context.inspect = '';
			context.benchStage = 'sandbox';
			runFlow( root, context, { bench: true } );
			context.announcement = 'WP-Bench run loop open. Sandbox selected.';
			resetSchedulers.get( root )?.();
			focusWithin( root, '.core-ai-map__bench-heading button' );
		},
		closeBench() {
			const context = getContext();
			const root = getRoot( getElement().ref );
			context.screen = 'map';
			context.benchPathsLive = false;
			context.flowPhase = 'settled';
			context.announcement = 'WP-Bench run loop closed. Back on the map.';
			resetSchedulers.get( root )?.();
			focusElement( root ? lastBenchTriggers.get( root ) : undefined );
		},
		selectBenchStage() {
			const context = getContext();
			context.benchStage = context.stageId || 'sandbox';
			context.announcement = `WP-Bench stage selected: ${
				context.benchTitles?.[ context.benchStage ] ||
				context.benchStage
			}.`;
		},
		applySuggestion() {
			const context = getContext();
			context.suggestion = Math.floor( context.suggestion / 2 ) * 2 + 1;
			context.announcement =
				'A person chose Apply. The AI Plugin suggestion is now applied.';
		},
		reset() {
			const context = getContext();
			const root = getRoot( getElement().ref );
			setAttractState( context );
			attractSchedulers.get( root )?.();
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
				const restorePage = isolateKioskPage( root );
				const timeout = Number.parseInt(
					root.dataset.inactivityTimeout,
					10
				);
				let resetTimer;
				let wakeLock;
				let servedFromOfflineCache = Boolean(
					document.querySelector(
						'meta[name="core-ai-map-offline"][content="true"]'
					)
				);

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
						attractSchedulers.get( root )?.();
						if (
							root.contains( root.ownerDocument.activeElement )
						) {
							focusWithin( root, '.core-ai-map__prompt' );
						}
					}
				};
				const scheduleReset = () => {
					window.clearTimeout( resetTimer );
					if ( context.screen === 'attract' ) {
						return;
					}
					const base = Number.isFinite( timeout ) ? timeout : 60000;
					const deep =
						context.screen === 'inspect' ||
						context.screen === 'bench';
					resetTimer = window.setTimeout(
						resetForInactivity,
						base + ( deep ? 30000 : 0 )
					);
				};
				resetSchedulers.set( root, scheduleReset );

				const updateNetworkStatus = ( event ) => {
					if ( event?.type === 'online' ) {
						servedFromOfflineCache = false;
					}
					context.isOffline =
						servedFromOfflineCache || ! navigator.onLine;
				};
				const handleCacheResult = ( event ) => {
					if ( event.data?.type === 'CORE_AI_MAP_CACHE_RESULT' ) {
						root.dataset.offlineReady = event.data.ok
							? 'true'
							: 'false';
					}
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
					if ( ! root.contains( event.target ) ) {
						return;
					}

					scheduleReset();
					const tab = event.target?.closest?.( '[role="tab"]' );
					if (
						tab &&
						context.screen === 'inspect' &&
						context.inspect === 'abilities' &&
						[ 'ArrowLeft', 'ArrowRight', 'Home', 'End' ].includes(
							event.key
						)
					) {
						const tabs = [
							...root.querySelectorAll( '[role="tab"]' ),
						];
						const current = tabs.indexOf( tab );
						let next;
						if ( event.key === 'Home' ) {
							next = 0;
						} else if ( event.key === 'End' ) {
							next = tabs.length - 1;
						} else {
							const direction =
								event.key === 'ArrowRight' ? 1 : -1;
							next =
								( current + direction + tabs.length ) %
								tabs.length;
						}
						event.preventDefault();
						const nextTab = tabs[ next ];
						context.abilitiesTab =
							nextTab?.dataset.coreAiAbilitiesTab ||
							context.abilitiesTab;
						tabs.forEach( ( candidate, index ) => {
							candidate.tabIndex = index === next ? 0 : -1;
						} );
						nextTab?.focus( { preventScroll: true } );
						return;
					}
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
					} else if ( context.screen === 'bench' ) {
						context.screen = 'map';
						context.benchPathsLive = false;
						context.announcement =
							'WP-Bench closed. Back on the map.';
						focusElement( lastBenchTriggers.get( root ) );
					} else if ( context.screen === 'about' ) {
						context.screen =
							context.aboutReturnScreen === 'map'
								? 'map'
								: 'attract';
						context.aboutReturnScreen = '';
						context.announcement = 'About this exhibit closed.';
						focusElement( lastAboutTriggers.get( root ) );
					}
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
						const currentScope = new URL(
							root.dataset.serviceWorkerScope,
							window.location.origin
						).href;
						const storageKey = root.dataset.kioskKey
							? `coreAiMapWorker:${ root.dataset.kioskKey }`
							: '';
						let previousScope = '';
						if ( storageKey ) {
							try {
								previousScope =
									JSON.parse(
										window.localStorage.getItem(
											storageKey
										) || '{}'
									).scope || '';
							} catch {
								previousScope = '';
							}
						}
						const clearScopes = async ( scopes ) => {
							if ( ! scopes.size ) {
								return;
							}
							const registrations =
								await navigator.serviceWorker.getRegistrations();
							await Promise.allSettled(
								registrations.map( ( registration ) => {
									const worker = [
										registration.active,
										registration.waiting,
										registration.installing,
									]
										.filter( Boolean )
										.find( ( candidate ) => {
											try {
												const url = new URL(
													candidate.scriptURL
												);
												return (
													url.origin ===
														window.location
															.origin &&
													url.searchParams.get(
														'_core_ai_map_sw'
													) === '1'
												);
											} catch {
												return false;
											}
										} );
									if (
										! worker ||
										! scopes.has( registration.scope )
									) {
										return undefined;
									}
									worker.postMessage( {
										type: 'CLEAR_CORE_AI_MAP',
									} );
									return registration.unregister();
								} )
							);
						};
						if ( root.dataset.offlineEnabled !== 'true' ) {
							const ownedScopes = new Set(
								[ currentScope, previousScope ].filter(
									Boolean
								)
							);
							await clearScopes( ownedScopes );
							if ( storageKey ) {
								try {
									window.localStorage.removeItem(
										storageKey
									);
								} catch {
									// Storage is optional; worker cleanup already ran.
								}
							}
							return;
						}
						if ( previousScope && previousScope !== currentScope ) {
							await clearScopes( new Set( [ previousScope ] ) );
						}
						const registration =
							await navigator.serviceWorker.register(
								serviceWorkerUrl,
								{
									scope: root.dataset.serviceWorkerScope,
								}
							);
						if ( storageKey ) {
							try {
								window.localStorage.setItem(
									storageKey,
									JSON.stringify( {
										scope:
											registration.scope || currentScope,
									} )
								);
							} catch {
								// Offline caching does not depend on local storage.
							}
						}
						const installingWorker =
							registration.installing || registration.waiting;
						if (
							installingWorker &&
							installingWorker.state !== 'activated'
						) {
							await new Promise( ( resolve ) => {
								const handleState = () => {
									if (
										installingWorker.state ===
											'activated' ||
										installingWorker.state === 'redundant'
									) {
										installingWorker.removeEventListener(
											'statechange',
											handleState
										);
										resolve();
									}
								};
								installingWorker.addEventListener(
									'statechange',
									handleState
								);
							} );
						}
						const readyRegistration =
							await navigator.serviceWorker.ready;
						if ( document.readyState !== 'complete' ) {
							await new Promise( ( resolve ) =>
								window.addEventListener( 'load', resolve, {
									once: true,
								} )
							);
						}
						await document.fonts?.ready;
						const worker =
							readyRegistration.active || registration.active;
						const configuredAssets = JSON.parse(
							root.dataset.assetUrls || '[]'
						);
						const observedAssets =
							root.dataset.cachePage === 'true'
								? getObservedStaticAssets()
								: [];
						worker?.postMessage( {
							type: 'CACHE_CORE_AI_MAP',
							pageUrl:
								root.dataset.cachePage === 'true'
									? root.dataset.cachePageUrl
									: '',
							assets: [
								...new Set( [
									...configuredAssets,
									...observedAssets,
								] ),
							],
						} );
					} catch {
						// The server-rendered experience remains usable.
					}
				};

				root.addEventListener( 'pointerdown', scheduleReset, {
					passive: true,
				} );
				window.addEventListener( 'keydown', handleKeydown );
				window.addEventListener( 'online', updateNetworkStatus );
				window.addEventListener( 'offline', updateNetworkStatus );
				navigator.serviceWorker?.addEventListener?.(
					'message',
					handleCacheResult
				);
				window.addEventListener( 'resize', fitStage );
				window.addEventListener( 'orientationchange', fitStage );
				document.addEventListener(
					'visibilitychange',
					handleVisibility
				);
				fitStage();
				updateNetworkStatus();
				requestWakeLock();
				syncServiceWorker();
				if ( context.screen === 'attract' ) {
					startAttractCycle( root, context );
				} else {
					scheduleReset();
				}

				return () => {
					window.clearTimeout( resetTimer );
					clearTimers( flowTimers, root );
					clearTimers( attractTimers, root );
					resetSchedulers.delete( root );
					attractSchedulers.delete( root );
					root.removeEventListener( 'pointerdown', scheduleReset );
					window.removeEventListener( 'keydown', handleKeydown );
					window.removeEventListener( 'online', updateNetworkStatus );
					window.removeEventListener(
						'offline',
						updateNetworkStatus
					);
					navigator.serviceWorker?.removeEventListener?.(
						'message',
						handleCacheResult
					);
					window.removeEventListener( 'resize', fitStage );
					window.removeEventListener( 'orientationchange', fitStage );
					document.removeEventListener(
						'visibilitychange',
						handleVisibility
					);
					wakeLock?.release?.();
					restorePage();
					root.classList.remove( 'is-ready' );
					if ( ! document.querySelector( '.core-ai-map.is-ready' ) ) {
						document.body.classList.remove(
							'core-ai-kiosk-active'
						);
					}
				};
			}, [ context ] );

			useEffect( () => {
				const { ref: root } = getElement();
				resetSchedulers.get( root )?.();
			}, [
				context.screen,
				context.story,
				context.inspect,
				context.benchStage,
			] );

			useEffect( () => {
				const { ref: root } = getElement();
				syncSvgState( root, getContext() );
			}, [
				context.screen,
				context.story,
				context.recompose,
				context.flowPhase,
				context.previewIndex,
				context.previewPhase,
				context.shapes,
			] );
		},
	},
} );
