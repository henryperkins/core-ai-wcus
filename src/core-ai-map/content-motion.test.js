import {
	createTextReveal,
	createTextSwap,
	createDisclosureMotion,
} from './content-motion';

describe( 'content motion lifecycle', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
		document.body.innerHTML = '';
	} );

	it( 'keeps reserved takeaway space inaccessible during exit and cancels stale cleanup', () => {
		document.body.innerHTML = `<p class="t-stagger" aria-hidden="true" inert>
			<strong class="t-stagger-line" style="transition-duration: 0.2s">Conclusion</strong>
		</p>`;
		const element = document.querySelector( 'p' );
		const motion = createTextReveal( element );
		motion.update( false );
		motion.update( true );
		expect( element.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
		motion.update( false );
		expect( element.hidden ).toBe( false );
		expect( element.hasAttribute( 'inert' ) ).toBe( true );
		expect( element.classList.contains( 'is-hiding' ) ).toBe( true );
		jest.advanceTimersByTime( 100 );
		motion.update( true );
		jest.advanceTimersByTime( 200 );
		expect( element.classList.contains( 'is-shown' ) ).toBe( true );
		expect( element.hasAttribute( 'inert' ) ).toBe( false );
		motion.update( false );
		motion.update( false, true );
		expect( element.classList.contains( 'is-hiding' ) ).toBe( false );
		motion.destroy();
	} );

	it( 'shows only the latest text after its CSS-configured exit, including seconds units', () => {
		document.body.innerHTML =
			'<span style="--text-swap-dur: 0.15s">Needs review</span>';
		const element = document.querySelector( 'span' );
		const motion = createTextSwap( element );
		motion.update( 'Needs review' );
		motion.update( 'Applied' );
		jest.advanceTimersByTime( 100 );
		expect( element.textContent ).toBe( 'Needs review' );
		motion.update( 'Next suggestion' );
		jest.advanceTimersByTime( 149 );
		expect( element.textContent ).toBe( 'Needs review' );
		jest.advanceTimersByTime( 1 );
		expect( element.textContent ).toBe( 'Next suggestion' );
		expect( element.className ).toBe( '' );
		motion.destroy();
	} );

	it( 'settles a pending text swap immediately under reduced motion and cancels it on teardown', () => {
		document.body.innerHTML =
			'<span style="--text-swap-dur: 150ms">Apply</span>';
		const element = document.querySelector( 'span' );
		const motion = createTextSwap( element );
		motion.update( 'Apply' );
		motion.update( 'Applied' );
		motion.update( 'Applied', true );
		expect( element.textContent ).toBe( 'Applied' );
		expect( element.className ).toBe( '' );
		motion.update( 'Apply' );
		motion.destroy();
		element.textContent = 'Removed';
		jest.advanceTimersByTime( 500 );
		expect( element.textContent ).toBe( 'Removed' );
	} );

	const mountDisclosure = () => {
		document.body.innerHTML = `<details style="--acc-collapse: 250ms">
			<summary>Kiosk status</summary>
			<div class="t-acc-panel"><div class="t-acc-panel-inner">Available</div></div>
		</details>`;
		const details = document.querySelector( 'details' );
		const summary = details.querySelector( 'summary' );
		const panel = details.querySelector( '.t-acc-panel' );
		return {
			details,
			summary,
			panel,
			motion: createDisclosureMotion( details ),
		};
	};

	it( 'retains native details through the close animation while immediately hiding its content from interaction', () => {
		const { details, summary, panel, motion } = mountDisclosure();
		summary.click();
		expect( details.open ).toBe( true );
		expect( summary.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		summary.click();
		expect( details.open ).toBe( true );
		expect( panel.hasAttribute( 'inert' ) ).toBe( true );
		expect( summary.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		jest.advanceTimersByTime( 249 );
		expect( details.open ).toBe( true );
		jest.advanceTimersByTime( 1 );
		expect( details.open ).toBe( false );
		motion.destroy();
	} );

	it( 'cancels a stale disclosure close on reversal and finishes immediately when motion is reduced', () => {
		const { details, summary, panel, motion } = mountDisclosure();
		summary.click();
		summary.click();
		jest.advanceTimersByTime( 100 );
		summary.click();
		jest.advanceTimersByTime( 300 );
		expect( details.open ).toBe( true );
		expect( panel.hasAttribute( 'inert' ) ).toBe( false );
		summary.click();
		motion.updateMotion( true );
		expect( details.open ).toBe( false );
		summary.click();
		expect( details.open ).toBe( true );
		summary.click();
		expect( details.open ).toBe( false );
		motion.destroy();
	} );

	it( 'synchronizes native disclosure changes and releases its listeners on teardown', () => {
		const { details, summary, motion } = mountDisclosure();
		details.open = true;
		details.dispatchEvent( new Event( 'toggle' ) );
		expect( details.dataset.open ).toBe( 'true' );
		details.open = false;
		details.dispatchEvent( new Event( 'toggle' ) );
		expect( summary.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		motion.destroy();
		const click = new window.MouseEvent( 'click', { cancelable: true } );
		summary.dispatchEvent( click );
		expect( click.defaultPrevented ).toBe( false );
	} );
} );
