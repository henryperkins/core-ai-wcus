/**
 * Keep an exiting surface painted while removing it from interaction immediately.
 * CSS owns the motion; this controller owns only visibility and cancellation.
 *
 * @param {HTMLElement} surface Surface wrapper.
 * @param {Object}      options Motion target, close token and completion callback.
 * @return {Object} Visibility controller.
 */
export const createSurfaceMotion = ( surface, options = {} ) => {
	const target = options.target || surface;
	let open;
	let closingTimer;
	const finishClose = () => {
		window.clearTimeout( closingTimer );
		closingTimer = undefined;
		if ( surface ) {
			surface.hidden = true;
			surface.classList.remove( 'is-closing' );
			target.classList.remove( 'is-closing' );
		}
		options.onHidden?.();
	};
	const update = ( nextOpen, reduced = false ) => {
		if ( ! surface ) {
			return;
		}
		if ( open === nextOpen ) {
			if ( reduced && ! open && closingTimer !== undefined ) {
				finishClose();
			}
			return;
		}
		const wasOpen = open;
		open = nextOpen;
		window.clearTimeout( closingTimer );
		closingTimer = undefined;
		surface.inert = ! open;
		surface.toggleAttribute( 'inert', ! open );
		surface.setAttribute( 'aria-hidden', String( ! open ) );
		if ( open && surface.hidden ) {
			surface.hidden = false;
			// Establish the closed style after display:none, before the open hook.
			if ( ! reduced ) {
				void surface.offsetWidth;
			}
		}
		surface.dataset.open = String( open );
		for ( const element of new Set( [ surface, target ] ) ) {
			element.classList.toggle( 'is-open', open );
			element.classList.toggle( 'is-closing', ! open );
		}
		if ( open ) {
			return;
		}
		if ( ! wasOpen || reduced ) {
			finishClose();
			return;
		}
		const token = window
			.getComputedStyle( surface )
			.getPropertyValue( options.closeToken )
			.trim();
		const parsed = Number.parseFloat( token );
		const duration = Number.isFinite( parsed )
			? parsed * ( token.endsWith( 'ms' ) ? 1 : 1000 )
			: options.closeMs;
		closingTimer = window.setTimeout( finishClose, duration );
	};
	return {
		update,
		destroy() {
			update( false, true );
			finishClose();
		},
	};
};

/**
 * Measure in authored CSS pixels, independent of the kiosk's stage transform.
 * Initial placement, font loading and resize snap; a selected tab change slides.
 *
 * @param {HTMLElement} bar Abilities tab list.
 * @return {Object} Indicator controller.
 */
export const createSlidingTabs = ( bar ) => {
	const pill = bar?.querySelector( '.t-tabs-pill' );
	let activeId;
	let active = true;
	const position = ( animate ) => {
		if ( ! active || ! pill || bar.closest( '[hidden]' ) ) {
			return;
		}
		const tab = [ ...bar.querySelectorAll( '[role="tab"]' ) ].find(
			( candidate ) => candidate.dataset.coreAiAbilitiesTab === activeId
		);
		if ( ! tab?.offsetWidth ) {
			return;
		}
		const previous = pill.style.transition;
		if ( ! animate || ! bar.classList.contains( 'has-indicator' ) ) {
			pill.style.transition = 'none';
		}
		// offsetLeft is physical in both directions; override the RTL stylesheet.
		pill.style.left = '0px';
		pill.style.right = 'auto';
		pill.style.transform = `translateX(${ tab.offsetLeft }px)`;
		pill.style.width = `${ tab.offsetWidth }px`;
		pill.style.height = `${ tab.offsetHeight }px`;
		pill.style.top = `${ tab.offsetTop }px`;
		bar.classList.add( 'has-indicator' );
		if ( pill.style.transition === 'none' ) {
			void pill.offsetWidth;
			pill.style.transition = previous;
		}
	};
	const refit = () => position( false );
	const resize =
		bar && window.ResizeObserver
			? new window.ResizeObserver( refit )
			: undefined;
	if ( pill ) {
		resize?.observe( bar );
		window.addEventListener( 'resize', refit );
		document.fonts?.ready.then( refit );
	}
	return {
		update( id, animate ) {
			const changed = activeId !== id;
			activeId = id;
			position( animate && changed );
		},
		destroy() {
			active = false;
			resize?.disconnect();
			window.removeEventListener( 'resize', refit );
		},
	};
};
