/**
 * Read CSS timing in either seconds or milliseconds.
 *
 * @param {string} value    CSS time.
 * @param {number} fallback Duration when the stylesheet is unavailable.
 * @return {number} Milliseconds.
 */
const milliseconds = ( value, fallback ) => {
	const parsed = Number.parseFloat( value );
	return Number.isFinite( parsed )
		? parsed * ( value.trim().endsWith( 'ms' ) ? 1 : 1000 )
		: fallback;
};

/**
 * Reveal a takeaway without removing the space its text occupies.
 *
 * @param {HTMLElement} element Takeaway wrapper.
 * @return {Object} Reveal controller.
 */
export const createTextReveal = ( element ) => {
	let shown;
	let timer;
	const finishHide = () => {
		window.clearTimeout( timer );
		timer = undefined;
		element.classList.remove( 'is-hiding' );
	};
	const update = ( nextShown, reduced = false ) => {
		if ( shown === nextShown ) {
			if ( reduced && ! shown ) {
				finishHide();
			}
			return;
		}
		const wasShown = shown;
		shown = nextShown;
		finishHide();
		element.toggleAttribute( 'inert', ! shown );
		element.setAttribute( 'aria-hidden', String( ! shown ) );
		element.classList.remove( 'is-shown' );
		if ( shown ) {
			if ( ! reduced ) {
				void element.offsetHeight;
			}
			element.classList.add( 'is-shown' );
		} else if ( wasShown && ! reduced ) {
			element.classList.add( 'is-hiding' );
			const line = element.querySelector( '.t-stagger-line' );
			const duration = window
				.getComputedStyle( line || element )
				.transitionDuration.split( ',' )[ 0 ];
			timer = window.setTimeout(
				finishHide,
				milliseconds( duration, 200 )
			);
		}
	};
	return {
		update,
		destroy() {
			update( false, true );
			finishHide();
		},
	};
};

/**
 * Swap visual text after its exit; application state changes independently.
 *
 * @param {HTMLElement} element Visual status label.
 * @return {Object} Text controller.
 */
export const createTextSwap = ( element ) => {
	let nextText = element.textContent;
	let timer;
	const settle = () => {
		window.clearTimeout( timer );
		timer = undefined;
		element.textContent = nextText;
		element.classList.remove( 'is-exit', 'is-enter-start' );
	};
	return {
		update( text, immediate = false ) {
			if ( immediate || text === element.textContent ) {
				nextText = text;
				settle();
				return;
			}
			if ( text === nextText && timer !== undefined ) {
				return;
			}
			nextText = text;
			window.clearTimeout( timer );
			element.classList.remove( 'is-enter-start' );
			element.classList.add( 'is-exit' );
			const duration = window
				.getComputedStyle( element )
				.getPropertyValue( '--text-swap-dur' );
			timer = window.setTimeout(
				() => {
					timer = undefined;
					element.textContent = nextText;
					element.classList.remove( 'is-exit' );
					element.classList.add( 'is-enter-start' );
					void element.offsetHeight;
					element.classList.remove( 'is-enter-start' );
				},
				milliseconds( duration, 150 )
			);
		},
		destroy: settle,
	};
};

/**
 * Keep native details semantics while allowing its body to finish collapsing.
 *
 * @param {HTMLDetailsElement} details Native disclosure.
 * @return {Object} Disclosure controller.
 */
export const createDisclosureMotion = ( details ) => {
	const summary = details.querySelector( 'summary' );
	const panel = details.querySelector( '.t-acc-panel' );
	let open = details.open;
	let reduced = false;
	let timer;
	const sync = () => {
		details.dataset.open = String( open );
		summary.setAttribute( 'aria-expanded', String( open ) );
		panel.toggleAttribute( 'inert', ! open );
		panel.setAttribute( 'aria-hidden', String( ! open ) );
	};
	const finishClose = () => {
		window.clearTimeout( timer );
		timer = undefined;
		details.open = false;
	};
	const toggle = ( event ) => {
		event.preventDefault();
		window.clearTimeout( timer );
		timer = undefined;
		open = ! open;
		if ( open ) {
			details.open = true;
			if ( ! reduced ) {
				void panel.offsetHeight;
			}
		}
		sync();
		if ( ! open ) {
			if ( reduced ) {
				finishClose();
			} else {
				const duration = window
					.getComputedStyle( details )
					.getPropertyValue( '--acc-collapse' );
				timer = window.setTimeout(
					finishClose,
					milliseconds( duration, 250 )
				);
			}
		}
	};
	const nativeToggle = () => {
		if (
			details.open === open ||
			( timer !== undefined && details.open )
		) {
			return;
		}
		window.clearTimeout( timer );
		timer = undefined;
		open = details.open;
		sync();
	};
	sync();
	summary.addEventListener( 'click', toggle );
	details.addEventListener( 'toggle', nativeToggle );
	return {
		updateMotion( nextReduced ) {
			reduced = nextReduced;
			if ( reduced && timer !== undefined ) {
				finishClose();
			}
		},
		destroy() {
			window.clearTimeout( timer );
			summary.removeEventListener( 'click', toggle );
			details.removeEventListener( 'toggle', nativeToggle );
			details.open = open;
		},
	};
};
