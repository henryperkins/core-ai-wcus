/* eslint-disable no-unused-expressions */
/* global getComputedStyle, NodeFilter */
/*
 * Agent runs use Browser Run against a public HTTPS preview; see README.md.
 * Retain this callback as the assertion contract, not a local agent entry point.
 */

/* prettier-ignore */
async ( page ) => {
	const failures = [];
	const observations = {};
	const consoleErrors = [];
	const pageErrors = [];
	const assert = ( condition, message ) => {
		if ( ! condition ) {
			failures.push( message );
		}
	};
	const root = page.locator( '.core-ai-map' );
	const measureCardGeometry = () =>
		page.evaluate( () => {
			const isVisible = ( element ) => {
				const rect = element.getBoundingClientRect();
				const style = getComputedStyle( element );
				return (
					! element.hidden &&
					style.visibility !== 'hidden' &&
					rect.width > 0 &&
					rect.height > 0
				);
			};
			const overlapArea = ( first, second ) =>
				Math.max(
					0,
					Math.min( first.right, second.right ) -
						Math.max( first.left, second.left )
				) *
				Math.max(
					0,
					Math.min( first.bottom, second.bottom ) -
						Math.max( first.top, second.top )
				);
			const cardId = ( card ) =>
				card.classList.contains( 'core-ai-map__provider-plugin' )
					? 'provider-plugin'
					: card.className.match(
							/core-ai-map__(?:actor|block)--([a-z-]+)/
						)[ 1 ];
			const cards = [
				...document.querySelectorAll(
					'.core-ai-map__actor, .core-ai-map__block, .core-ai-map__provider-plugin'
				),
			].filter( isVisible ).map( ( card ) => ( {
				id: cardId( card ),
				rect: card.getBoundingClientRect().toJSON(),
			} ) );
			const intersections = [];
			for ( let first = 0; first < cards.length; first += 1 ) {
				for (
					let second = first + 1;
					second < cards.length;
					second += 1
				) {
					const area = overlapArea(
						cards[ first ].rect,
						cards[ second ].rect
					);
					if ( area > 0 ) {
						intersections.push(
							`${ cards[ first ].id }/${ cards[ second ].id }:${ area }`
						);
					}
				}
			}
			const bodies = [
				...document.querySelectorAll(
					'.core-ai-map__actor-body, .core-ai-map__block-body, .core-ai-map__provider-plugin'
				),
			].filter( isVisible );
			const bodyOverflows = [];
			const textOverflows = [];
			for ( const body of bodies ) {
				const card = body.closest(
					'.core-ai-map__actor, .core-ai-map__block, .core-ai-map__provider-plugin'
				);
				const id = cardId( card );
				if ( body.scrollHeight > body.clientHeight ) {
					bodyOverflows.push( id );
				}
				const textNodes = [];
				const walker = document.createTreeWalker(
					body,
					NodeFilter.SHOW_TEXT
				);
				while ( walker.nextNode() ) {
					if ( walker.currentNode.nodeValue.trim() ) {
						textNodes.push( walker.currentNode );
					}
				}
				const lastText = textNodes.at( -1 );
				if ( ! lastText ) {
					continue;
				}
				const range = document.createRange();
				range.selectNodeContents( lastText );
				const textRect = range.getBoundingClientRect();
				const bodyRect = body.getBoundingClientRect();
				if (
					textRect.left < bodyRect.left ||
					textRect.right > bodyRect.right ||
					textRect.top < bodyRect.top ||
					textRect.bottom > bodyRect.bottom
				) {
					textOverflows.push( id );
				}
			}

			return { cards, intersections, bodyOverflows, textOverflows };
		} );
	const assertCardGeometry = ( geometry, composition ) => {
		assert(
			geometry.intersections.length === 0,
			`${ composition } card intersections: ${ geometry.intersections.join(
				', '
			) }`
		);
		assert(
			geometry.bodyOverflows.length === 0,
			`${ composition } card body overflow: ${ geometry.bodyOverflows.join(
				', '
			) }`
		);
		assert(
			geometry.textOverflows.length === 0,
			`${ composition } card text overflow: ${ geometry.textOverflows.join(
				', '
			) }`
		);
	};

	page.on( 'console', ( message ) => {
		if ( message.type() === 'error' ) {
			consoleErrors.push( message.text() );
		}
	} );
	page.on( 'pageerror', ( error ) => pageErrors.push( error.message ) );

	const origin = await page.evaluate( () => window.location.origin );
	if ( ! /^https:\/\//.test( origin ) ) {
		throw new Error(
			'Open the public HTTPS WordPress preview before running the retained acceptance assertions.'
		);
	}
	await page.context().setOffline( false );
	await page.emulateMedia( { reducedMotion: 'no-preference' } );
	await page.setViewportSize( { width: 1366, height: 1024 } );
	await page.goto( `${ origin }/living-block-map/`, {
		waitUntil: 'networkidle',
	} );
	await root.waitFor();
	await page.waitForFunction( () =>
		document
			.querySelector( '.core-ai-map' )
			?.classList.contains( 'is-ready' )
	);

	const targetFit = await page.evaluate( () => {
		const map = document.querySelector( '.core-ai-map' );
		const stage = document.querySelector( '.core-ai-map__stage' );
		return {
			map: map.getBoundingClientRect().toJSON(),
			stage: stage.getBoundingClientRect().toJSON(),
			scale: Number.parseFloat(
				getComputedStyle( map ).getPropertyValue( '--cai-scale' )
			),
			scrollWidth: document.documentElement.scrollWidth,
			scrollHeight: document.documentElement.scrollHeight,
			themeTabStops: [
				...document.querySelectorAll(
					'header a, footer a, .skip-link'
				),
			].filter(
				( element ) =>
					! element.closest( '.core-ai-map' ) &&
					! element.closest( '[inert]' )
			).length,
		};
	} );
	observations.targetFit = targetFit;
	assert( targetFit.scale === 1, '1366 viewport did not use scale 1.' );
	assert(
		targetFit.stage.width === 1366 && targetFit.stage.height === 1024,
		'1366 stage did not exactly fill the target viewport.'
	);
	assert(
		targetFit.scrollWidth <= 1366 && targetFit.scrollHeight <= 1024,
		'1366 page introduced document scrolling.'
	);
	assert(
		targetFit.themeTabStops === 0,
		'Covered theme chrome remained in the keyboard path.'
	);

	await page.waitForFunction( () =>
		document.querySelector(
			'.core-ai-map__preview-flow[data-core-ai-preview="0"] .core-ai-map__preview-signal.is-live'
		)
	);
	const attract = await page.evaluate( () => ( {
		promptColor: getComputedStyle(
			document.querySelector( '.core-ai-map__prompt' )
		).color,
		previewMembers:
			document.querySelectorAll( '.is-preview-member' ).length,
		signals: document.querySelectorAll(
			'.core-ai-map__preview-signal.is-live'
		).length,
		pathVisible: [
			...document.querySelectorAll(
				'.core-ai-map__preview-flow path.is-live'
			),
		].some(
			( path ) =>
				Number.parseFloat( getComputedStyle( path ).opacity ) > 0
		),
		providerPluginVisible:
			! document.querySelector( '.core-ai-map__provider-plugin' ).hidden,
		externalService: document
			.querySelector( '.core-ai-map__actor--provider' )
			.getBoundingClientRect()
			.toJSON(),
		steps: [
			'.core-ai-map__block--plugin',
			'.core-ai-map__block--client',
			'.core-ai-map__provider-plugin',
			'.core-ai-map__block--connectors',
			'.core-ai-map__actor--provider',
		].map( ( selector ) =>
			document
				.querySelector( `${ selector } .core-ai-map__step` )
				?.textContent.trim()
		),
		connectorsSidecar: document
			.querySelector( '.core-ai-map__block--connectors' )
			.classList.contains( 'is-preview-sidecar' ),
		runtimePaths: [
			...document.querySelectorAll(
				'.core-ai-map__preview-flow[data-core-ai-preview="0"] path:not(.core-ai-map__preview-config).is-live'
			),
		].map( ( path ) => path.getAttribute( 'd' ) ),
		configPath: ( () => {
			const path = document.querySelector(
				'.core-ai-map__preview-flow[data-core-ai-preview="0"] .core-ai-map__preview-config.is-live'
			);
			return path
				? {
						d: path.getAttribute( 'd' ),
						dash: getComputedStyle( path ).strokeDasharray,
					}
				: null;
		} )(),
	} ) );
	observations.attract = attract;
	assert(
		attract.previewMembers >= 3,
		'Attract workflow did not assemble members.'
	);
	assert( attract.signals === 1, 'Attract workflow did not run one signal.' );
	assert( attract.pathVisible, 'Attract workflow path was not visible.' );
	assert(
		attract.promptColor === 'rgb(255, 255, 255)',
		'Attract prompt text was not white on its blue background.'
	);
	assert(
		attract.providerPluginVisible &&
			attract.steps.join( ',' ) === '1,2,3,,',
		'Attract did not teach Plugin -> Client -> provider plugin as the numbered runtime path.'
	);
	assert(
		attract.externalService.left >= 1030,
		'Attract did not keep the external AI service outside the WordPress boundary.'
	);
	assert(
		attract.connectorsSidecar &&
			attract.configPath?.dash.includes( '5px' ) &&
			attract.runtimePaths.length === 3,
		'Attract did not distinguish Connectors configuration from the three runtime paths.'
	);
	const attractGeometry = await measureCardGeometry();
	observations.attractGeometry = attractGeometry;
	assertCardGeometry( attractGeometry, 'Attract composition' );

	await page
		.getByRole( 'button', { name: 'Explore the first flow' } )
		.click();
	await page.waitForTimeout( 120 );
	assert(
		await root.evaluate(
			( element ) =>
				element.classList.contains( 'is-map' ) &&
				element.classList.contains( 'has-story' )
		),
		'Prompt did not open directly into the first flow.'
	);

	/*
	 * The promised sequence is: choose a flow, follow the numbered path, tap a
	 * highlighted component. Each of those three beats is checked here against
	 * the flow the primary control opens.
	 */
	const flowFirst = await page.evaluate( () => {
		const visible = ( element ) =>
			Boolean( element ) &&
			! element.hidden &&
			element.getBoundingClientRect().height > 0;
		const takeaway = [
			...document.querySelectorAll( '.core-ai-map__takeaway' ),
		].find( ( node ) => visible( node ) );
		const situation = [
			...document.querySelectorAll( '.core-ai-map__situation' ),
		].find( ( node ) => visible( node ) );
		const cards = [
			...document.querySelectorAll(
				'.core-ai-map__actor-body, .core-ai-map__block-body, .core-ai-map__provider-plugin-body'
			),
		].filter( ( card ) => visible( card ) );

		return {
			guidance: document
				.querySelector( '.core-ai-map__guidance' )
				?.textContent.trim(),
			situation: situation?.textContent.replace( /\s+/g, ' ' ).trim(),
			takeaway: takeaway?.textContent.replace( /\s+/g, ' ' ).trim(),
			focusedStep: document
				.querySelector( '.core-ai-map' )
				.ownerDocument.activeElement?.querySelector(
					'.core-ai-map__step'
				)
				?.textContent.trim(),
			// A highlighted card is tappable and cued; a dimmed one is neither.
			cued: cards
				.filter( ( card ) =>
					visible( card.querySelector( '.core-ai-map__tap-cue' ) )
				)
				.map( ( card ) => card.getAttribute( 'aria-label' ) ),
			dimmedWithCue: cards.filter(
				( card ) =>
					card.disabled &&
					visible( card.querySelector( '.core-ai-map__tap-cue' ) )
			).length,
			enabledWithoutCue: cards.filter(
				( card ) =>
					! card.disabled &&
					! visible( card.querySelector( '.core-ai-map__tap-cue' ) )
			).length,
			pointerOnDimmed: cards
				.filter( ( card ) => card.disabled )
				.map( ( card ) => getComputedStyle( card ).cursor ),
		};
	} );
	observations.flowFirst = flowFirst;
	assert(
		flowFirst.guidance ===
			'Follow 1 → 2 → 3. Highlighted components take part in this flow. Tap one to learn what it contributes.',
		`Flow guidance was wrong: ${ flowFirst.guidance }`
	);
	assert(
		flowFirst.situation?.includes(
			'A feature inside WordPress needs an AI-generated result.'
		) && ! flowFirst.takeaway,
		`Flow did not open on its situation: ${ flowFirst.situation }; takeaway: ${ flowFirst.takeaway }`
	);
	assert(
		flowFirst.focusedStep === '1',
		`Opening a flow did not focus step one; focused step ${ flowFirst.focusedStep }.`
	);
	assert(
		flowFirst.cued.length === 5,
		`Expected five cued participants, saw ${ flowFirst.cued.length }.`
	);
	assert(
		flowFirst.cued.every( ( label ) =>
			label?.includes( 'view its role in' )
		),
		'A participating card did not name its action in its accessible name.'
	);

	await page.waitForTimeout( 3000 );
	const flowConclusion = await page.evaluate( () => {
		const takeaway = [
			...document.querySelectorAll( '.core-ai-map__takeaway' ),
		].find(
			( node ) =>
				! node.hidden && node.getBoundingClientRect().height > 0
		);

		return takeaway?.textContent.replace( /\s+/g, ' ' ).trim();
	} );
	observations.flowConclusion = flowConclusion;
	assert(
		flowConclusion?.startsWith( 'What this flow shows' ) &&
			flowConclusion.includes( 'common AI interface' ) &&
			flowConclusion.includes( 'AI service remains outside WordPress' ),
		`Flow conclusion was missing or wrong: ${ flowConclusion }`
	);
	assert(
		flowFirst.dimmedWithCue === 0 && flowFirst.enabledWithoutCue === 0,
		'Tap cues did not match which cards take part in the flow.'
	);
	assert(
		flowFirst.pointerOnDimmed.every( ( cursor ) => cursor !== 'pointer' ),
		'A dimmed card still presented a tap affordance.'
	);

	// Opening a component must not cost the visitor the flow they were in.
	const firstStep = page.locator(
		'.core-ai-map__block--plugin .core-ai-map__block-body'
	);
	await firstStep.click();
	await page.waitForTimeout( 140 );
	const panelContext = await page.evaluate( () => {
		const panel = document.querySelector(
			'.core-ai-map__details article:not([hidden])'
		);
		const block = panel?.querySelector(
			'.core-ai-map__details-context:not([hidden])'
		);
		return {
			guidance: document
				.querySelector( '.core-ai-map__details-guidance' )
				?.textContent.trim(),
			breadcrumb: block
				?.querySelector( '.core-ai-map__breadcrumb' )
				?.textContent.replace( /\s+/g, ' ' )
				.trim(),
			roles: block?.querySelectorAll( '.core-ai-map__role dd' ).length,
			back: document
				.querySelector( '.core-ai-map__details-close' )
				?.textContent.replace( /\s+/g, ' ' )
				.trim(),
		};
	} );
	observations.panelContext = panelContext;
	assert(
		panelContext.guidance ===
			'You are viewing this component’s role in “WordPress uses AI.”',
		`Panel did not identify the active flow: ${ panelContext.guidance }`
	);
	assert(
		panelContext.breadcrumb === 'WordPress uses AI → AI Plugin',
		`Panel breadcrumb was wrong: ${ panelContext.breadcrumb }`
	);
	assert(
		panelContext.roles === 3,
		'Panel did not state what the component receives, does, and passes on.'
	);
	assert(
		panelContext.back?.includes( 'Back to WordPress uses AI' ),
		`Panel back control lost the flow: ${ panelContext.back }`
	);

	await page.locator( '.core-ai-map__details-close' ).click();
	await page.waitForTimeout( 140 );
	const afterClose = await page.evaluate( () => ( {
		hasStory: document
			.querySelector( '.core-ai-map' )
			.classList.contains( 'has-story' ),
		focusRestored: Boolean(
			document
				.querySelector( '.core-ai-map' )
				.ownerDocument.activeElement?.closest(
					'.core-ai-map__block--plugin'
				)
		),
	} ) );
	observations.afterClose = afterClose;
	assert(
		afterClose.hasStory,
		'Closing the panel cleared the flow the visitor was learning.'
	);
	assert(
		afterClose.focusRestored,
		'Closing the panel did not return focus to the card that opened it.'
	);

	/*
	 * The neutral canvas is now the secondary component explorer, reached on
	 * purpose rather than landed on by default.
	 */
	await page
		.getByRole( 'button', { name: 'Browse all components' } )
		.click();
	await page.waitForTimeout( 120 );
	assert(
		await root.evaluate(
			( element ) =>
				element.classList.contains( 'is-map' ) &&
				! element.classList.contains( 'has-story' )
		),
		'Browse all components did not open the neutral map.'
	);
	assert(
		await page.evaluate(
			() =>
				document
					.querySelector( '.core-ai-map__guidance' )
					?.textContent.trim() ===
				'Tap any component to learn what it is and where it belongs.'
		),
		'Component explorer did not carry its own instruction.'
	);
	assert(
		await page.evaluate( () => {
			const note = document.querySelector(
				'.core-ai-map__browse-note'
			);
			const band = document.querySelector(
				'.core-ai-map__story-copy'
			);
			return (
				! note.hidden &&
				getComputedStyle( band ).opacity === '1' &&
				note.textContent.includes( 'no flow selected' )
			);
		} ),
		'The band under the map went blank in the component explorer.'
	);
	assert(
		await page.evaluate(
			() =>
				[
					...document.querySelectorAll(
						'.core-ai-map__actor-body, .core-ai-map__block-body'
					),
				].every( ( card ) => ! card.disabled ) &&
				! [
					...document.querySelectorAll( '.core-ai-map__tap-cue' ),
				].some( ( cue ) => ! cue.hidden )
		),
		'Component explorer did not make every component tappable and uncued.'
	);
	const neutral = await page.evaluate( () => {
		const overlapArea = ( first, second ) =>
			Math.max(
				0,
				Math.min( first.right, second.right ) -
					Math.max( first.left, second.left )
			) *
			Math.max(
				0,
				Math.min( first.bottom, second.bottom ) -
				Math.max( first.top, second.top )
			);
		const luminance = ( color ) => {
			const channels = color
				.match( /\d+(?:\.\d+)?/g )
				.slice( 0, 3 )
				.map( ( channel ) => Number.parseFloat( channel ) / 255 )
				.map( ( channel ) =>
					channel <= 0.04045
						? channel / 12.92
						: ( ( channel + 0.055 ) / 1.055 ) ** 2.4
				);
			return (
				0.2126 * channels[ 0 ] +
				0.7152 * channels[ 1 ] +
				0.0722 * channels[ 2 ]
			);
		};
		const ratio = ( foreground, background ) => {
			const high = Math.max(
				luminance( foreground ),
				luminance( background )
			);
			const low = Math.min(
				luminance( foreground ),
				luminance( background )
			);
			return ( high + 0.05 ) / ( low + 0.05 );
		};
		const backgroundFor = ( element ) => {
			let current = element;
			while ( current ) {
				const background = getComputedStyle( current ).backgroundColor;
				const channels = background.match( /\d+(?:\.\d+)?/g ) || [];
				if ( channels.length < 4 || Number.parseFloat( channels[ 3 ] ) > 0 ) {
					return background;
				}
				current = current.parentElement;
			}
			return 'rgb(255, 255, 255)';
		};
		const rail = document
			.querySelector( '.core-ai-map__rail' )
			.getBoundingClientRect();
		const footnote = document
			.querySelector( '.core-ai-map__about-trigger' )
			.getBoundingClientRect();
		const stage = document
			.querySelector( '.core-ai-map__stage' )
			.getBoundingClientRect();

		const actors = [
			...document.querySelectorAll( '.core-ai-map__actor' ),
		].map( ( actor ) => ( {
				hidden: actor.hidden,
				id: actor.className.match( /core-ai-map__actor--([a-z-]+)/ )[ 1 ],
				opacity: getComputedStyle( actor ).opacity,
				rect: actor.getBoundingClientRect().toJSON(),
			} ) );
		const actorOverlaps = [];
		for ( let first = 0; first < actors.length; first += 1 ) {
			for ( let second = first + 1; second < actors.length; second += 1 ) {
				if ( overlapArea( actors[ first ].rect, actors[ second ].rect ) ) {
					actorOverlaps.push(
						`${ actors[ first ].id }/${ actors[ second ].id }`
					);
				}
			}
		}
		const cardOpacities = [
			...document.querySelectorAll(
				'.core-ai-map__actor, .core-ai-map__block-body'
			),
		].map( ( card ) => ( {
			selector: card.className,
			opacity: getComputedStyle( card ).opacity,
		} ) );
		const textContrast = [
			...document.querySelectorAll(
				'.core-ai-map__actor-body strong, .core-ai-map__actor-body small, .core-ai-map__block-body strong, .core-ai-map__block-body small'
			),
		]
			.filter( ( element ) => element.getClientRects().length > 0 )
			.map( ( element ) => {
				const foreground = getComputedStyle( element ).color;
				const background = backgroundFor( element );
				return {
					text: element.textContent.trim(),
					foreground,
					background,
					ratio: ratio( foreground, background ),
				};
			} );

		return {
			actors,
			actorOverlaps,
			cardOpacities,
			textContrast,
			footnote: {
				railOverlap: overlapArea( rail, footnote ),
				clearsRail: Math.round( footnote.top - rail.bottom ),
				clearsStage: Math.round( stage.bottom - footnote.bottom ),
				height: Math.round( footnote.height ),
			},
		};
	} );
	observations.neutral = neutral;
	assert(
		neutral.actors.length === 5 &&
			neutral.actors.every(
				( actor ) => ! actor.hidden && actor.opacity === '1'
			),
		'Neutral map did not keep all five outside actors visible and fully opaque.'
	);
	assert(
		neutral.cardOpacities.length > 5 &&
			neutral.cardOpacities.every( ( card ) => card.opacity === '1' ),
		`Browse-all cards were not fully opaque: ${ neutral.cardOpacities
			.filter( ( card ) => card.opacity !== '1' )
			.map( ( card ) => `${ card.selector }=${ card.opacity }` )
			.join( ', ' ) }`
	);
	assert(
		neutral.textContrast.length > 0 &&
			neutral.textContrast.every( ( sample ) => sample.ratio >= 4.5 ),
		`Browse-all card text fell below 4.5:1 contrast: ${ neutral.textContrast
			.filter( ( sample ) => sample.ratio < 4.5 )
			.map( ( sample ) => `${ sample.text }=${ sample.ratio.toFixed( 2 ) }` )
			.join( ', ' ) }`
	);
	assert(
		neutral.actorOverlaps.length === 0,
		`Neutral actors overlapped: ${ neutral.actorOverlaps.join( ', ' ) }`
	);
	assert(
		neutral.footnote.railOverlap === 0 &&
			neutral.footnote.clearsRail > 0 &&
			neutral.footnote.clearsStage >= 0,
		'About footnote did not sit clear of the story rail inside the stage.'
	);
	assert(
		neutral.footnote.height >= 24,
		'About footnote fell below the 24px minimum touch target.'
	);
	const neutralGeometry = await measureCardGeometry();
	observations.neutralGeometry = neutralGeometry;
	assertCardGeometry( neutralGeometry, 'Neutral map' );

	const aboutTrigger = page.getByRole( 'button', {
		name: 'About this exhibit',
	} );
	await aboutTrigger.click();
	await page.waitForTimeout( 120 );
	const about = await page.evaluate( () => {
		const overlapArea = ( first, second ) =>
			Math.max(
				0,
				Math.min( first.right, second.right ) -
					Math.max( first.left, second.left )
			) *
			Math.max(
				0,
				Math.min( first.bottom, second.bottom ) -
					Math.max( first.top, second.top )
			);
		const close = document.querySelector( '.core-ai-map__about-close' );
		const content = document.querySelector( '.core-ai-map__about-content' );
		const brand = document.querySelector( '.core-ai-map__brand' );

		return {
			closeInsideContent: content.firstElementChild === close,
			closeBrandOverlap: overlapArea(
				close.getBoundingClientRect(),
				brand.getBoundingClientRect()
			),
			focusedClose: close.ownerDocument.activeElement === close,
		};
	} );
	observations.about = about;
	assert(
		about.closeInsideContent && about.closeBrandOverlap === 0,
		'About Back control was not contained by the white card without brand overlap.'
	);
	assert( about.focusedClose, 'About dialog did not focus its Back control.' );
	await page.locator( '.core-ai-map__about-close' ).click();
	await page.waitForTimeout( 80 );
	assert(
		await aboutTrigger.evaluate(
			( element ) => element === element.ownerDocument.activeElement
		),
		'About dialog did not restore focus to its trigger.'
	);

	const storyButtons = page.locator( '.core-ai-map__rail button' );
	assert(
		( await storyButtons.count() ) === 4,
		'Story rail did not contain four stories.'
	);
	await storyButtons.nth( 0 ).click();
	await page.waitForTimeout( 800 );
	const storyOne = await page.evaluate( () => {
		const bounds = ( selector ) =>
			document.querySelector( selector ).getBoundingClientRect().toJSON();
		const step = ( selector ) =>
			document
				.querySelector( `${ selector } .core-ai-map__step` )
				?.textContent.trim();
		const configPath = document.querySelector(
			'.core-ai-map__config-path:not(.core-ai-map__preview-config):not([hidden])'
		);
		return {
			providerPlugin: bounds( '.core-ai-map__provider-plugin' ),
			externalService: bounds( '.core-ai-map__actor--provider' ),
			steps: [
				step( '.core-ai-map__block--plugin' ),
				step( '.core-ai-map__block--client' ),
				step( '.core-ai-map__provider-plugin' ),
				step( '.core-ai-map__block--connectors' ),
				step( '.core-ai-map__actor--provider' ),
			],
			connectorsSidecar: document
				.querySelector( '.core-ai-map__block--connectors' )
				.classList.contains( 'is-sidecar' ),
			runtimePaths: [
				...document.querySelectorAll(
					'.core-ai-map__flow path.is-visible'
				),
			].map( ( path ) => path.getAttribute( 'd' ) ),
			configPath: configPath
				? {
						d: configPath.getAttribute( 'd' ),
						dash: getComputedStyle( configPath ).strokeDasharray,
					}
				: null,
		};
	} );
	observations.storyOne = storyOne;
	assert(
		storyOne.steps.join( ',' ) === '1,2,3,,',
		'Story 01 did not number only Plugin -> Client -> provider plugin.'
	);
	assert(
		storyOne.providerPlugin.right <= 1030 &&
			storyOne.externalService.left >= 1030,
		'Story 01 did not keep the provider plugin inside WordPress and the external service outside.'
	);
	assert(
		storyOne.connectorsSidecar &&
			storyOne.configPath?.dash.includes( '5px' ) &&
			storyOne.runtimePaths.length === 3,
		'Story 01 did not distinguish the Connectors sidecar from the runtime path.'
	);
	const storyOneGeometry = await measureCardGeometry();
	observations.storyOneGeometry = storyOneGeometry;
	assertCardGeometry( storyOneGeometry, 'Story 01' );

	await storyButtons.nth( 1 ).click();
	await page.waitForTimeout( 800 );
	const storyTwoGeometry = await measureCardGeometry();
	observations.storyTwoGeometry = storyTwoGeometry;
	assertCardGeometry( storyTwoGeometry, 'Story 02' );

	await storyButtons.nth( 2 ).click();
	await page.waitForTimeout( 800 );
	const storyThree = await page.evaluate( () => {
		const task = document.querySelector(
			'.core-ai-map__actor--task .core-ai-map__actor-body'
		);
		const parked = [
			...document.querySelectorAll( '.core-ai-map__block.is-parked' ),
		];
		return {
			taskHeight: task.getBoundingClientRect().height,
			taskScrollHeight: task.scrollHeight,
			taskClientHeight: task.clientHeight,
			parkedCount: parked.length,
			parkedWidths: parked.map(
				( card ) => card.getBoundingClientRect().width
			),
			parkedScales: parked.map(
				( card ) => getComputedStyle( card ).transform
			),
			storyPressed: document.querySelectorAll(
				'.core-ai-map__rail button[aria-pressed="true"]'
			).length,
			nothingHereRuns: Boolean(
				document.querySelector( '.core-ai-map__learns-site' ) &&
					getComputedStyle(
						document.querySelector( '.core-ai-map__learns-site' )
					).borderStyle === 'dashed'
			),
		};
	} );
	observations.storyThree = storyThree;
	assert(
		storyThree.taskHeight === 120,
		'WordPress task actor was not 120px high.'
	);
	assert(
		storyThree.taskScrollHeight <= storyThree.taskClientHeight,
		'WordPress task copy overflowed its actor.'
	);
	assert(
		storyThree.parkedCount === 6,
		'Story 03 did not park six ecosystem cards.'
	);
	assert(
		storyThree.parkedWidths.every( ( width ) => width === 176 ),
		'Parked cards were not a direct 176px compact treatment.'
	);
	assert(
		storyThree.storyPressed === 1,
		'Story aria-pressed state was incorrect.'
	);
	assert(
		storyThree.nothingHereRuns,
		'Story 03 absence panel lost its dashed cue.'
	);
	const storyThreeGeometry = await measureCardGeometry();
	observations.storyThreeGeometry = storyThreeGeometry;
	assertCardGeometry( storyThreeGeometry, 'Story 03' );

	await storyButtons.nth( 2 ).click();
	await page
		.locator( '.core-ai-map__block--abilities .core-ai-map__block-body' )
		.click();
	await page.waitForTimeout( 120 );
	const inspector = await page.evaluate( () => ( {
		screen: document.querySelector( '.core-ai-map' ).className,
		canvasInert: document.querySelector( '.core-ai-map__canvas' ).inert,
		focused: document.body.ownerDocument.activeElement?.textContent?.trim(),
		tabs: document.querySelectorAll(
			'.core-ai-map__ability-tabs [role="tab"]'
		).length,
		tabStops: [
			...document.querySelectorAll(
				'.core-ai-map__ability-tabs [role="tab"]'
			),
		].filter( ( tab ) => tab.tabIndex === 0 ).length,
	} ) );
	observations.inspector = inspector;
	assert(
		inspector.screen.includes( 'is-inspect' ),
		'Abilities inspector did not open.'
	);
	assert(
		inspector.canvasInert,
		'Map canvas was not inert under the inspector.'
	);
	assert(
		inspector.focused.includes( 'Back to the map' ),
		'Inspector focus did not enter on Back to the map.'
	);
	assert(
		inspector.tabs === 3 && inspector.tabStops === 1,
		'Abilities tabs were not a three-tab roving set.'
	);
	const abilitiesCopy = await page
		.locator( '.core-ai-map__details-note' )
		.textContent();
	assert(
		abilitiesCopy.includes( 'scheduled for WordPress 7.1 on August 19, 2026' ) &&
			abilitiesCopy.includes( 'this exhibit runs WordPress 7.0' ) &&
			! abilitiesCopy.includes( 'ships 19' ),
		'Abilities overview did not use scheduled 7.1 wording and the running 7.0 disclosure.'
	);
	await page
		.locator( '[data-core-ai-abilities-tab="anatomy"]' )
		.click();
	const anatomyCopy = await page
		.locator( '.core-ai-map__ability-notes' )
		.textContent();
	assert(
		anatomyCopy.includes( 'One public default, per-channel control' ) &&
			! anatomyCopy.includes( 'One flag, every client' ),
		'Abilities Anatomy did not explain the per-channel 7.1 control.'
	);
	const contrast = await page.evaluate( () => {
		const luminance = ( color ) => {
			const channels = color
				.match( /\d+(?:\.\d+)?/g )
				.slice( 0, 3 )
				.map( ( channel ) => Number.parseFloat( channel ) / 255 )
				.map( ( channel ) =>
					channel <= 0.04045
						? channel / 12.92
						: ( ( channel + 0.055 ) / 1.055 ) ** 2.4
				);
			return (
				0.2126 * channels[ 0 ] +
				0.7152 * channels[ 1 ] +
				0.0722 * channels[ 2 ]
			);
		};
		const ratio = ( foreground, background ) => {
			const high = Math.max(
				luminance( foreground ),
				luminance( background )
			);
			const low = Math.min(
				luminance( foreground ),
				luminance( background )
			);
			return ( high + 0.05 ) / ( low + 0.05 );
		};
		return [
			'.core-ai-map__brand small',
			'.core-ai-map__actor-badge',
			'.core-ai-map__rail button:not(.is-active) span',
			'.core-ai-map__details-heading',
		].map( ( selector ) => {
			const element = document.querySelector( selector );
			const foreground = getComputedStyle( element ).color;
			let parent = element;
			let background = 'rgba(0, 0, 0, 0)';
			while ( parent && background.endsWith( ', 0)' ) ) {
				background = getComputedStyle( parent ).backgroundColor;
				parent = parent.parentElement;
			}
			return {
				selector,
				foreground,
				background,
				ratio: ratio( foreground, background ),
			};
		} );
	} );
	observations.contrast = contrast;
	assert(
		contrast.every(
			( sample ) =>
				sample.foreground !== 'rgb(167, 170, 173)' &&
				sample.ratio >= 4.5
		),
		'Muted small text did not reach 4.5:1 contrast.'
	);
	await page.keyboard.press( 'Escape' );
	await page.waitForTimeout( 80 );
	assert(
		await page
			.locator(
				'.core-ai-map__block--abilities .core-ai-map__block-body'
			)
			.evaluate(
				( element ) => element === element.ownerDocument.activeElement
			),
		'Escape did not restore focus to Abilities.'
	);

	await storyButtons.nth( 0 ).click();
	await page.waitForTimeout( 800 );
	const apply = page.locator( '.core-ai-map__workbench-apply' );
	assert(
		await apply.isVisible(),
		'AI Plugin Apply control was not visible.'
	);
	assert(
		( await apply.boundingBox() ).height >= 44,
		'AI Plugin Apply control was smaller than 44px.'
	);
	await apply.click();
	await page.waitForFunction( () =>
		document
			.querySelector( '.core-ai-map__workbench-phase' )
			?.textContent.includes( 'Applied' )
	);
	assert(
		(
			await page.locator( '.core-ai-map__workbench-phase' ).textContent()
		).includes( 'Applied' ),
		'AI Plugin did not enter Applied state.'
	);
	await page
		.locator( '.core-ai-map__story-copy .core-ai-map__replay:visible' )
		.click();
	await page.waitForFunction( () =>
		document
			.querySelector( '.core-ai-map__workbench-phase' )
			?.textContent.includes( 'Needs review' )
	);
	assert(
		(
			await page.locator( '.core-ai-map__workbench-phase' ).textContent()
		).includes( 'Needs review' ),
		'Replay did not advance to a new Needs review suggestion.'
	);

	await storyButtons.nth( 3 ).click();
	await page.waitForTimeout( 800 );
	const runLoopLink = page.locator( '.core-ai-map__run-loop-link:visible' );
	const runLoopColor = await runLoopLink.evaluate(
		( element ) => getComputedStyle( element ).color
	);
	observations.runLoopColor = runLoopColor;
	assert(
		runLoopColor === 'rgb(255, 255, 255)',
		'Run-loop link text was not white on its blue background.'
	);
	const storyFourGeometry = await measureCardGeometry();
	observations.storyFourGeometry = storyFourGeometry;
	assertCardGeometry( storyFourGeometry, 'Story 04' );
	await runLoopLink.click();
	await page.waitForTimeout( 120 );
	const bench = await page.evaluate( () => {
		const back = document.querySelector(
			'.core-ai-map__bench-heading button'
		);
		const box = back.getBoundingClientRect();
		const hit = document.elementFromPoint(
			box.left + box.width / 2,
			box.top + box.height / 2
		);
		return {
			stages: document.querySelectorAll( '.core-ai-map__bench-stage' )
				.length,
			topbarVisible:
				getComputedStyle(
					document.querySelector( '.core-ai-map__topbar' )
				).visibility !== 'hidden',
			backHit: hit === back || back.contains( hit ),
			focusedBack: back.ownerDocument.activeElement === back,
		};
	} );
	observations.bench = bench;
	assert( bench.stages === 5, 'WP-Bench did not render five stages.' );
	assert(
		bench.topbarVisible,
		'Persistent brand bar disappeared in WP-Bench.'
	);
	assert( bench.backHit, 'WP-Bench Back control was pointer-blocked.' );
	assert( bench.focusedBack, 'WP-Bench did not focus its Back control.' );
	await page.locator( '.core-ai-map__bench-heading button' ).click();

	await page.waitForTimeout( 3200 );
	const infiniteAfterEngagement = await root.evaluate(
		( element ) =>
			element
				.getAnimations( { subtree: true } )
				.filter(
					( animation ) =>
						animation.effect?.getTiming().iterations === Infinity &&
						animation.playState === 'running'
				).length
	);
	observations.infiniteAfterEngagement = infiniteAfterEngagement;
	assert(
		infiniteAfterEngagement === 0,
		'Infinite animation continued after engagement.'
	);

	await page.emulateMedia( { reducedMotion: 'reduce' } );
	await page.reload( { waitUntil: 'networkidle' } );
	await page
		.getByRole( 'button', { name: 'Explore the first flow' } )
		.click();
	await page.locator( '.core-ai-map__rail button' ).nth( 1 ).click();
	await page.waitForTimeout( 80 );
	const reduced = await page.evaluate( () => {
		const durations = [
			...document.querySelectorAll( '.core-ai-map, .core-ai-map *' ),
		]
			.flatMap( ( element ) =>
				getComputedStyle( element ).transitionDuration.split( ',' )
			)
			.map(
				( value ) =>
					Number.parseFloat( value ) *
					( value.includes( 'ms' ) ? 1 : 1000 )
			)
			.filter( Number.isFinite );
		return {
			maxTransitionMs: Math.max( 0, ...durations ),
			pathOffsets: [
				...document.querySelectorAll(
					'.core-ai-map__flow path.is-visible'
				),
			].map( ( path ) => getComputedStyle( path ).strokeDashoffset ),
			callOpacity: getComputedStyle(
				document.querySelector( '.core-ai-map__token--call' )
			).opacity,
			abilityOpacity: getComputedStyle(
				document.querySelector( '.core-ai-map__token--ability' )
			).opacity,
			// The lesson cannot depend on having watched the movement.
			takeaway: [
				...document.querySelectorAll( '.core-ai-map__takeaway' ),
			]
				.find(
					( node ) =>
						! node.hidden &&
						node.getBoundingClientRect().height > 0
				)
				?.textContent.replace( /\s+/g, ' ' )
				.trim(),
			guidance: document
				.querySelector( '.core-ai-map__guidance' )
				?.textContent.trim(),
		};
	} );
	observations.reduced = reduced;
	assert(
		reduced.takeaway?.includes( 'does not bypass WordPress' ),
		`Reduced motion did not state the flow's takeaway: ${ reduced.takeaway }`
	);
	assert(
		reduced.guidance?.startsWith( 'Follow 1 → 2 → 3' ),
		'Reduced motion did not carry the flow instruction.'
	);
	assert(
		reduced.maxTransitionMs <= 0.011,
		'Reduced-motion transitions exceeded 0.01ms.'
	);
	assert(
		reduced.pathOffsets.every( ( value ) => value === '0px' ),
		'Reduced-motion paths were not settled.'
	);
	assert(
		reduced.callOpacity === '0' && reduced.abilityOpacity === '1',
		'Reduced-motion token endpoint was incorrect.'
	);

	await page.emulateMedia( { reducedMotion: 'no-preference' } );
	await page.setViewportSize( { width: 1024, height: 768 } );
	await page.reload( { waitUntil: 'networkidle' } );
	await page
		.getByRole( 'button', { name: 'Explore the first flow' } )
		.click();
	const compatibility = await page.evaluate( () => {
		const map = document.querySelector( '.core-ai-map' );
		const stage = document
			.querySelector( '.core-ai-map__stage' )
			.getBoundingClientRect();
		const story = document
			.querySelector( '.core-ai-map__rail button' )
			.getBoundingClientRect();
		const reset = document
			.querySelector( '.core-ai-map__reset' )
			.getBoundingClientRect();
		return {
			scale: Number.parseFloat(
				getComputedStyle( map ).getPropertyValue( '--cai-scale' )
			),
			stage: stage.toJSON(),
			storyHeight: story.height,
			resetHeight: reset.height,
			scrollWidth: document.documentElement.scrollWidth,
			scrollHeight: document.documentElement.scrollHeight,
		};
	} );
	observations.compatibility = compatibility;
	assert(
		Math.abs( compatibility.scale - 0.75 ) < 0.002,
		'1024 compatibility scale was not approximately 0.75.'
	);
	assert(
		compatibility.stage.width <= 1024 && compatibility.stage.height <= 768,
		'1024 stage clipped.'
	);
	assert(
		compatibility.scrollWidth <= 1024 && compatibility.scrollHeight <= 768,
		'1024 page scrolled.'
	);
	assert(
		compatibility.storyHeight >= 44 && compatibility.resetHeight >= 44,
		'1024 controls fell below 44px.'
	);
	const compatibilityNeutralGeometry = await measureCardGeometry();
	observations.compatibilityNeutralGeometry = compatibilityNeutralGeometry;
	assertCardGeometry( compatibilityNeutralGeometry, '1024 neutral map' );
	await page.locator( '.core-ai-map__rail button' ).nth( 0 ).click();
	await page.waitForTimeout( 800 );
	const compatibilityStoryOne = await page.evaluate( () => {
		const map = document.querySelector( '.core-ai-map' );
		const stage = document
			.querySelector( '.core-ai-map__stage' )
			.getBoundingClientRect();
		const scale = Number.parseFloat(
			getComputedStyle( map ).getPropertyValue( '--cai-scale' )
		);
		const logicalBounds = ( selector ) => {
			const box = document.querySelector( selector ).getBoundingClientRect();
			return {
				left: ( box.left - stage.left ) / scale,
				right: ( box.right - stage.left ) / scale,
			};
		};
		return {
			providerPlugin: logicalBounds( '.core-ai-map__provider-plugin' ),
			externalService: logicalBounds( '.core-ai-map__actor--provider' ),
			providerStep: document
				.querySelector(
					'.core-ai-map__provider-plugin .core-ai-map__step'
				)
				.textContent.trim(),
			connectorsStep: document
				.querySelector(
					'.core-ai-map__block--connectors .core-ai-map__step'
				)
				.textContent.trim(),
			connectorsSidecar: document
				.querySelector( '.core-ai-map__block--connectors' )
				.classList.contains( 'is-sidecar' ),
			scrollWidth: document.documentElement.scrollWidth,
			scrollHeight: document.documentElement.scrollHeight,
		};
	} );
	observations.compatibilityStoryOne = compatibilityStoryOne;
	assert(
		compatibilityStoryOne.providerPlugin.right <= 1030 &&
			compatibilityStoryOne.externalService.left >= 1030 &&
			compatibilityStoryOne.providerStep === '3' &&
			compatibilityStoryOne.connectorsStep === '' &&
			compatibilityStoryOne.connectorsSidecar,
		'Story 01 lost its provider-plugin and Connectors-sidecar model at 1024.'
	);
	assert(
		compatibilityStoryOne.scrollWidth <= 1024 &&
			compatibilityStoryOne.scrollHeight <= 768,
		'Story 01 introduced scrolling in the 1024 compatibility view.'
	);
	const compatibilityStoryOneGeometry = await measureCardGeometry();
	observations.compatibilityStoryOneGeometry = compatibilityStoryOneGeometry;
	assertCardGeometry(
		compatibilityStoryOneGeometry,
		'1024 Story 01'
	);

	await page.waitForFunction(
		() =>
			document.querySelector( '.core-ai-map' )?.dataset.offlineReady ===
			'true',
		null,
		{ timeout: 20000 }
	);
	await page.context().setOffline( true );
	await page.reload( { waitUntil: 'domcontentloaded', timeout: 15000 } );
	await root.waitFor( { timeout: 10000 } );
	await page.waitForFunction(
		() =>
			document.querySelector( '.core-ai-map__offline' )?.hidden === false,
		null,
		{ timeout: 6000 }
	);
	const offline = await page.evaluate( () => ( {
		ready: document
			.querySelector( '.core-ai-map' )
			?.classList.contains( 'is-ready' ),
		offlineBadgeHidden: document.querySelector( '.core-ai-map__offline' )
			?.hidden,
		url: window.location.href,
	} ) );
	observations.offline = offline;
	assert(
		offline.ready,
		'Canonical page did not hydrate from the offline cache.'
	);
	assert(
		offline.offlineBadgeHidden === false,
		'Offline reload did not expose Offline mode.'
	);
	await page.context().setOffline( false );

	assert(
		consoleErrors.length === 0,
		`Console errors: ${ consoleErrors.join( ' | ' ) }`
	);
	assert(
		pageErrors.length === 0,
		`Page errors: ${ pageErrors.join( ' | ' ) }`
	);

	return {
		ok: failures.length === 0,
		failures,
		consoleErrors,
		pageErrors,
		observations,
	};
}
