/**
 * Browser Run regression contract for an open inspector in a pannable kiosk.
 * Call after hydration and opening component details; no layout values are mocked.
 *
 * @param {HTMLElement} root Kiosk root.
 * @return {Object} Measured geometry and failures.
 */
export const verifyInspectionGeometry = ( root ) => {
	const stage = root.querySelector( '.core-ai-map__stage' );
	const details = root.querySelector( '.core-ai-map__details' );
	const cue = [
		...details.querySelectorAll( '.core-ai-map__details-continuation' ),
	].find( ( element ) => ! element.closest( '[hidden]' ) );
	const failures = [];
	const measure = () => ( {
		stage: stage.getBoundingClientRect().toJSON(),
		cue: cue.getBoundingClientRect().toJSON(),
		scrollLeft: root.scrollLeft,
		scrollTop: root.scrollTop,
		detailsScrollTop: details.scrollTop,
	} );

	if ( ! cue || details.hidden ) {
		throw new Error(
			'Open a component inspector with a continuation cue.'
		);
	}
	root.scrollTo( 0, 0 );
	details.scrollTop = 0;
	const before = measure();
	root.scrollTo( 100, 60 );
	const panned = measure();
	if ( panned.scrollLeft === 0 && panned.scrollTop === 0 ) {
		failures.push( 'The fixture did not exercise stage panning.' );
	}
	for ( const edge of [ 'right', 'bottom' ] ) {
		const beforeOffset = before.stage[ edge ] - before.cue[ edge ];
		const afterOffset = panned.stage[ edge ] - panned.cue[ edge ];
		if ( Math.abs( beforeOffset - afterOffset ) > 1 ) {
			failures.push(
				`The continuation cue detached from the stage at ${ edge }.`
			);
		}
	}

	details.scrollTop = 100;
	const scrolled = measure();
	if ( scrolled.detailsScrollTop === 0 ) {
		failures.push( 'The fixture did not exercise inspector scrolling.' );
	}
	if ( Math.abs( scrolled.cue.top - panned.cue.top ) > 1 ) {
		failures.push( 'The continuation cue moved with the inspector text.' );
	}
	root.scrollTo( root.scrollWidth, root.scrollHeight );
	return {
		passed: failures.length === 0,
		failures,
		before,
		panned,
		scrolled,
	};
};
