/* eslint-disable no-unused-expressions */
/* prettier-ignore */
async ( page ) => {
	const expected =
		'Building a real WordPress 7.0 site in your browser — no server, about 45 seconds.';
	const failures = [];
	const consoleErrors = [];
	const pageErrors = [];
	const requestFailures = [];
	const httpErrors = [];
	const assert = ( condition, message ) => {
		if ( ! condition ) {
			failures.push( message );
		}
	};

	page.on( 'console', ( message ) => {
		if ( message.type() === 'error' ) {
			consoleErrors.push( message.text() );
		}
	} );
	page.on( 'pageerror', ( error ) => pageErrors.push( error.message ) );
	page.on( 'requestfailed', ( request ) =>
		requestFailures.push(
			`${ request.url() }: ${ request.failure()?.errorText ?? 'unknown failure' }`
		)
	);
	page.on( 'response', ( response ) => {
		if ( response.status() >= 400 ) {
			httpErrors.push( `${ response.status() } ${ response.url() }` );
		}
	} );

	const origin = await page.evaluate( () => window.location.origin );
	if ( ! /^https?:\/\//.test( origin ) ) {
		throw new Error( 'Open the Playground origin before running the loader verifier.' );
	}
	await page.addInitScript( () => {
		globalThis.__coreAiLoaderObservations = [];
		const capture = () => {
			const kioskLoader = document.querySelector( '[data-core-ai-loader]' );
			const oldCopy = 'Preparing WordPress';
			const oldCopyIsExposed = [
				...document.querySelectorAll(
					'h1, [role="status"], [role="progressbar"]'
				),
			].some( ( element ) => {
				const text = `${ element.textContent ?? '' } ${
					element.getAttribute( 'aria-valuetext' ) ?? ''
				}`;
				return (
					text.includes( oldCopy ) &&
					! element.closest( '[inert], [aria-hidden="true"]' )
				);
			} );
			const observation = {
				kioskHeading:
					kioskLoader?.querySelector( 'h1' )?.textContent?.trim() ?? '',
				kioskStatus:
					kioskLoader
						?.querySelector( '[role="status"]' )
						?.textContent?.trim() ?? '',
				rootHidden:
					document.getElementById( 'root' )?.hasAttribute( 'inert' ) ===
						true &&
					document
						.getElementById( 'root' )
						?.getAttribute( 'aria-hidden' ) === 'true',
				oldCopyIsExposed,
				heading:
					document.querySelector( 'h1' )?.textContent?.trim() ?? '',
				progress:
					document
						.querySelector( '[role="progressbar"]' )
						?.getAttribute( 'aria-valuetext' )
						?.trim() ?? '',
				status:
					document
						.querySelector( '[role="status"]' )
						?.textContent?.trim() ?? '',
			};
			if (
				! observation.kioskHeading &&
				! observation.heading &&
				! observation.progress &&
				! observation.status
			) {
				return;
			}
			const previous = globalThis.__coreAiLoaderObservations.at( -1 );
			if ( JSON.stringify( previous ) !== JSON.stringify( observation ) ) {
				globalThis.__coreAiLoaderObservations.push( observation );
			}
		};
		new globalThis.MutationObserver( capture ).observe( document, {
			attributes: true,
			attributeFilter: [ 'aria-valuetext' ],
			characterData: true,
			childList: true,
			subtree: true,
		} );
		document.addEventListener( 'DOMContentLoaded', capture );
	} );

	await page.goto( `${ origin }/?loader-test=${ Date.now() }`, {
		waitUntil: 'domcontentloaded',
	} );
	await page.waitForFunction(
		( approvedCopy ) =>
			globalThis.__coreAiLoaderObservations?.some(
				( observation ) =>
					observation.kioskHeading === approvedCopy &&
					observation.kioskStatus === approvedCopy &&
					observation.rootHidden
			),
		expected,
		{ timeout: 15000 }
	);
	const shellObservations = await page.evaluate(
		() => globalThis.__coreAiLoaderObservations
	);
	const shellApproved = shellObservations.find(
		( observation ) =>
			observation.kioskHeading === expected &&
			observation.kioskStatus === expected &&
			observation.rootHidden
	);
	const shellHeadingText = shellApproved?.kioskHeading ?? '';
	const shellStatusText = shellApproved?.kioskStatus ?? '';
	assert(
		shellHeadingText === expected,
		`Unexpected shell loader heading: ${ shellHeadingText }`
	);
	assert(
		shellStatusText === expected,
		`Unexpected shell loader status text: ${ shellStatusText }`
	);
	assert(
		! shellObservations.some( ( observation ) => observation.oldCopyIsExposed ),
		'The outer shell exposed the upstream loader copy.'
	);
	const remote = await page.waitForEvent( 'framenavigated', {
		predicate: ( frame ) => frame.url().startsWith( `${ origin }/remote.html` ),
		timeout: 30000,
	} ).catch( () =>
		page
			.frames()
			.find( ( frame ) => frame.url().startsWith( `${ origin }/remote.html` ) )
	);
	assert( remote, 'The Playground runtime did not navigate to /remote.html.' );

	let headingText = '';
	let statusText = '';
	if ( remote ) {
		await remote.waitForFunction(
			( approvedCopy ) =>
				globalThis.__coreAiLoaderObservations?.some(
					( observation ) =>
						observation.heading === approvedCopy &&
						observation.status === approvedCopy
				),
			expected,
			{ timeout: 15000 }
		);
		const runtimeObservations = await remote.evaluate(
			() => globalThis.__coreAiLoaderObservations
		);
		const runtimeApproved = runtimeObservations.find(
			( observation ) =>
				observation.heading === expected &&
				observation.status === expected
		);
		headingText = runtimeApproved?.heading ?? '';
		statusText = runtimeApproved?.status ?? '';
		assert( headingText === expected, `Unexpected loader heading: ${ headingText }` );
		assert( statusText === expected, `Unexpected loader status: ${ statusText }` );
		assert(
			! runtimeObservations.some(
				( observation ) =>
					observation.heading === 'Preparing WordPress' ||
					observation.status === 'Preparing WordPress'
			),
			'The runtime frame exposed the upstream loader copy.'
		);
	}

	await page.waitForFunction(
		() => {
			const loader = document.querySelector( '[data-core-ai-loader]' );
			const root = document.getElementById( 'root' );
			return (
				loader?.hidden === true &&
				root?.hasAttribute( 'inert' ) === false &&
				root?.hasAttribute( 'aria-hidden' ) === false
			);
		},
		undefined,
		{ timeout: 90000 }
	);
	const shellSettled = await page.evaluate( () => ( {
		loaderHidden: document.querySelector( '[data-core-ai-loader]' )?.hidden,
		rootInert: document.getElementById( 'root' )?.hasAttribute( 'inert' ),
		rootAriaHidden: document
			.getElementById( 'root' )
			?.hasAttribute( 'aria-hidden' ),
	} ) );
	assert( shellSettled.loaderHidden === true, 'The kiosk loader did not close.' );
	assert( shellSettled.rootInert === false, 'The Playground root remained inert.' );
	assert(
		shellSettled.rootAriaHidden === false,
		'The Playground root remained hidden from assistive technology.'
	);

	assert( consoleErrors.length === 0, `Console errors: ${ consoleErrors.join( ' | ' ) }` );
	assert( pageErrors.length === 0, `Page errors: ${ pageErrors.join( ' | ' ) }` );
	assert( requestFailures.length === 0, `Request failures: ${ requestFailures.join( ' | ' ) }` );
	assert( httpErrors.length === 0, `HTTP errors: ${ httpErrors.join( ' | ' ) }` );

	return {
		ok: failures.length === 0,
		failures,
		runtimeUrl: remote?.url() ?? null,
		shellHeadingText,
		shellStatusText,
		shellObservations,
		shellSettled,
		headingText,
		statusText,
		consoleErrors,
		pageErrors,
		requestFailures,
		httpErrors,
	};
}
