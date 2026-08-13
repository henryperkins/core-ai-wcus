/* eslint-disable no-unused-expressions */
/* global getComputedStyle */

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

	page.on( 'console', ( message ) => {
		if ( message.type() === 'error' ) {
			consoleErrors.push( message.text() );
		}
	} );
	page.on( 'pageerror', ( error ) => pageErrors.push( error.message ) );

	await page.context().setOffline( false );
	await page.emulateMedia( { reducedMotion: 'no-preference' } );
	await page.setViewportSize( { width: 1366, height: 1024 } );
	await page.goto( 'http://127.0.0.1:9400/living-block-map/', {
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
		document.querySelector( '.core-ai-map__preview-signal.is-live' )
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

	await page
		.getByRole( 'button', { name: 'Add the blocks to the canvas' } )
		.click();
	await page.waitForTimeout( 80 );
	assert(
		await root.evaluate( ( element ) =>
			element.classList.contains( 'is-map' )
		),
		'Prompt did not open the neutral map.'
	);
	assert(
		await page
			.locator( '.core-ai-map__block-body' )
			.first()
			.evaluate(
				( element ) => element === element.ownerDocument.activeElement
			),
		'Neutral map did not focus the first block.'
	);

	const storyButtons = page.locator( '.core-ai-map__rail button' );
	assert(
		( await storyButtons.count() ) === 4,
		'Story rail did not contain four stories.'
	);
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
		.getByRole( 'button', { name: 'Add the blocks to the canvas' } )
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
		};
	} );
	observations.reduced = reduced;
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
		.getByRole( 'button', { name: 'Add the blocks to the canvas' } )
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
