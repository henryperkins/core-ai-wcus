/**
 * Structural contracts that are easiest to regress in a dynamic PHP block.
 *
 * Interactive behavior belongs in view.test.js. These assertions keep the
 * server-rendered first paint, kiosk accessibility hooks, and v3.1.1 screens
 * present before a browser ever hydrates the block.
 */

import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve( __dirname );
const render = fs.readFileSync( path.join( directory, 'render.php' ), 'utf8' );
const styles = fs.readFileSync( path.join( directory, 'style.scss' ), 'utf8' );
const view = fs.readFileSync( path.join( directory, 'view.js' ), 'utf8' );
const edit = fs.readFileSync( path.join( directory, 'edit.js' ), 'utf8' );
const plugin = fs.readFileSync(
	path.resolve( directory, '..', '..', 'core-ai-map.php' ),
	'utf8'
);
const worker = fs.readFileSync(
	path.resolve( directory, '..', '..', 'assets', 'service-worker.js' ),
	'utf8'
);

describe( 'Living Block Map v3.2.1 server render', () => {
	it( 'renders the provider plugin runtime layer and Connectors sidecar', () => {
		expect( render ).toContain( 'core-ai-map__provider-plugin' );
		expect( render ).toContain( 'AI provider plugin' );
		expect( render ).toContain( 'Provider-specific integration' );
		expect( render ).toContain(
			'data-wp-class--is-sidecar="state.isCardSidecar"'
		);
		expect( render ).toContain( 'core-ai-map__config-path' );
		expect( render ).toContain( 'Setup · discovery · credentials' );
		expect( render ).toMatch(
			/core-ai-map__provider-plugin-body[\s\S]*?data-wp-bind--disabled="state\.isCardNotTappable"/
		);
		expect( styles ).toMatch(
			/&__preview-flow path\.core-ai-map__preview-config\s*\{[\s\S]*?stroke:\s*var\(--core-ai-text-muted\)[\s\S]*?stroke-dasharray:\s*5 6/
		);
		expect( styles ).toMatch(
			/&__provider-plugin\.is-dimmed\s*\{\s*opacity:\s*0\.4/
		);
	} );

	it( 'keeps interactive role strips after the contiguous card controls', () => {
		expect( render ).toContain( 'core-ai-map__strip-anchor' );
		expect( render ).toMatch(
			/foreach \( \$card_dom_order as \$card_id \)[\s\S]*?endforeach;[\s\S]*?foreach \( \$block_ids as \$strip_id \)/
		);
	} );

	it( 'uses shipped 7.1 language and a per-channel public default', () => {
		expect( render ).toContain(
			'arrive in WordPress 7.1 on August 19, 2026'
		);
		expect( render ).toContain( 'runs a 7.1 release candidate' );
		expect( render ).toContain(
			'One public default, per-channel control. New in 7.1.'
		);
		expect( render ).not.toContain(
			'One public default, per-channel control. Scheduled for 7.1.'
		);
	} );

	it( 'uses a passing muted-text token while preserving decorative gray lines', () => {
		expect( styles ).toContain( '--core-ai-text-muted: #646970;' );
		expect( styles ).not.toMatch( /color:\s*var\(--core-ai-line-strong\)/ );
		expect( styles ).toMatch(
			/border:\s*1px dashed var\(--core-ai-line-strong\)/
		);
	} );

	it( 'renders the explicit WordPress task actor in story 03', () => {
		expect( render ).toMatch( /\$actor_ids[\s\S]*?'task'/ );
		expect( render ).toMatch( /'learns'[\s\S]*?'task'\s*=>\s*3/ );
		expect( render ).toContain( 'Nothing here runs' );
	} );

	it( 'renders the Abilities inspector as three accessible tabs', () => {
		expect( render ).toContain( 'data-core-ai-abilities-tab="overview"' );
		expect( render ).toContain( 'data-core-ai-abilities-tab="anatomy"' );
		expect( render ).toContain(
			'data-core-ai-abilities-tab="permissions"'
		);
		expect( render.match( /role="tab"/g ) ).toHaveLength( 3 );
		expect( render ).toContain( 'Who is allowed' );
	} );

	it( 'renders the selectable five-stage WP-Bench run loop', () => {
		expect( render ).toContain( 'data-core-ai-screen="bench"' );
		for ( const stage of [
			'task',
			'model',
			'sandbox',
			'checks',
			'evidence',
		] ) {
			expect( render ).toContain( `data-core-ai-stage="${ stage }"` );
		}
	} );

	it( 'ships accessible QR assets without the hatch fallback', () => {
		expect( render ).toContain( 'data-core-ai-qr=' );
		expect( render ).toContain( 'core-ai-map__qr-url' );
		expect( render ).toContain( 'QR code for' );
		expect( render ).not.toContain( 'QR code goes here' );
	} );

	it( 'keeps non-map screens out of the server-rendered tab order', () => {
		expect( render ).toMatch(
			/data-core-ai-surface="canvas"[\s\S]*?\binert\b/
		);
		expect( render ).toMatch(
			/data-core-ai-screen="bench"[\s\S]*?\bhidden\b/
		);
		expect( render ).toMatch(
			/class="core-ai-map__details"[\s\S]*?\bhidden\b/
		);
		expect( render ).toMatch(
			/class="core-ai-map__rail"[\s\S]*?data-wp-bind--hidden="state\.isRailHidden"[\s\S]*?\bhidden\b/
		);
		expect( render ).toMatch(
			/class="core-ai-map__attract"[\s\S]*?data-wp-bind--hidden="state\.isNotAttract"/
		);
		expect( render ).toMatch(
			/class="core-ai-map__offline"(?=[^>]*data-wp-bind--hidden="state\.isOnline")(?=[^>]*\shidden(?:\s|\/?>))[^>]*>/
		);
	} );

	it( 'includes progressive disclosure state before Interactivity hydrates', () => {
		expect( render ).toMatch(
			/aria-controls="<\?php echo esc_attr\( \$detail_id \); \?>"[\s\S]*?aria-expanded="false"[\s\S]*?data-wp-bind--aria-expanded/
		);
		expect( render ).toMatch(
			/aria-pressed="false"[\s\S]*?data-wp-bind--aria-pressed="state\.isStorySelected"/
		);
	} );

	it( 'renders static preview markers with only the initial workflow visible', () => {
		expect( render.match( /core-ai-map__preview-signal/g ) ).toHaveLength(
			4
		);
		expect( render ).toMatch( /data-core-ai-preview="0"\s*>/ );
		for ( const preview of [ 1, 2, 3 ] ) {
			expect( render ).toMatch(
				new RegExp( `data-core-ai-preview="${ preview }"\\s+hidden` )
			);
		}
		expect( render ).not.toContain(
			'data-wp-class--is-live="state.isPreviewSignalLive"'
		);
		expect( render ).not.toContain(
			'class="core-ai-map__preview-signal is-live"'
		);
	} );

	it( 'renders the AI Plugin review, Apply, note, and Replay controls', () => {
		expect( render ).toContain( 'A person reviews' );
		expect( render ).toContain(
			'data-wp-on--click="actions.applySuggestion"'
		);
		expect( render ).toContain(
			'data-wp-bind--hidden="state.isSuggestionNotApplied"'
		);
		expect( render ).toContain( 'data-wp-on--click="actions.replayStory"' );
	} );

	it( 'uses the corrected actor, parked-card, and touch geometry', () => {
		expect( styles ).toMatch(
			/body\.core-ai-kiosk-active\s*\{[^}]*position:\s*fixed[^}]*height:\s*100dvh/
		);
		expect( styles ).toMatch(
			/\.core-ai-map\s*\{[\s\S]*?position:\s*fixed[\s\S]*?height:\s*100dvh/
		);
		expect( styles ).not.toContain( '.wp-block-core-ai-core-ai-map' );
		expect( styles ).toMatch(
			/button\.core-ai-map__prompt[\s\S]*?color:\s*#fff/
		);
		expect( styles ).toMatch(
			/button\.core-ai-map__run-loop-link[\s\S]*?color:\s*#fff/
		);
		expect( styles ).toMatch( /&__actor-body[\s\S]*?min-height:\s*120px/ );
		expect( styles ).toMatch(
			/button\.core-ai-map__attract-browse[\s\S]*?min-height:\s*60px/
		);
		expect( styles ).toMatch( /&__block\.is-parked[\s\S]*?width:\s*176px/ );
		expect( styles ).toMatch(
			/&__rail[\s\S]*?button[\s\S]*?min-height:\s*68px/
		);
		expect( styles ).toMatch( /&__qr-url[\s\S]*?user-select:\s*text/ );
		expect( styles ).toMatch(
			/prefers-reduced-motion[\s\S]*?\.core-ai-map \*[\s\S]*?transition-duration:\s*0\.01ms/
		);
		expect( styles ).toMatch(
			/&__tokens\.is-live[\s\S]*?core-ai-map-token-call[\s\S]*?core-ai-map-token-ability/
		);
	} );

	it( 'keeps active outcome text at AA contrast', () => {
		expect( styles ).toMatch(
			/&\.is-active[\s\S]*?core-ai-map__rail-outcome[\s\S]*?color:\s*#fff/
		);
		expect( styles ).not.toMatch(
			/core-ai-map__rail-outcome[\s\S]*?rgba\(255,\s*255,\s*255,\s*0\.7\)/
		);
	} );

	it( 'renders the inspector hierarchy as named semantic headings', () => {
		expect( render ).toContain(
			"aria-labelledby=\"<?php echo esc_attr( $instance_id . '-panel-' . $panel_id . '-title' ); ?>\""
		);
		for ( const label of [
			'roleHeading',
			'lessonHeading',
			'definitionHeading',
			'technicalHeading',
			'exploreHeading',
		] ) {
			expect( render ).toContain(
				`<h3 class="core-ai-map__details-heading${
					label === 'technicalHeading'
						? ' core-ai-map__details-section'
						: ''
				}"><?php echo esc_html( $labels['${ label }'] ); ?></h3>`
			);
		}
	} );

	it( 'normalizes the reviewed date in the editor as well as the server', () => {
		expect( edit ).toMatch(
			/const reviewedDate = withCurrentDefault\(\s*metadata,\s*'reviewedDate',\s*savedReviewedDate\s*\)/
		);
	} );

	it( 'keeps the take-away QR discoverable below the inspector fold', () => {
		expect( render ).toContain(
			'class="core-ai-map__details-continuation"'
		);
		expect( render ).toContain(
			'Scroll or swipe for Under the hood and Keep exploring'
		);
		expect( styles ).toMatch(
			/&__details\s*\{[\s\S]*?container-type:\s*scroll-state/
		);
		expect( styles ).toMatch(
			/&__details-continuation\s*\{[\s\S]*?position:\s*fixed[\s\S]*?pointer-events:\s*none/
		);
		expect( styles ).toMatch(
			/@container\s+scroll-state\(scrollable:\s*bottom\)[\s\S]*?core-ai-map__details-continuation/
		);
	} );

	it( 'emits modern and Apple install-capability metadata', () => {
		expect( plugin ).toContain(
			'<meta name="mobile-web-app-capable" content="yes">'
		);
		expect( plugin ).toContain(
			'<meta name="apple-mobile-web-app-capable" content="yes">'
		);
	} );

	it( 'skips only the unreadable split-filesystem theme style on the kiosk', () => {
		expect( plugin ).toMatch(
			/function core_ai_map_skip_unreadable_kiosk_theme_inline_path\(\)[\s\S]*?core_ai_map_is_kiosk_page\(\)/
		);
		expect( plugin ).toContain( "'/wp-content/themes/twentytwentyfive/'" );
		expect( plugin ).toContain( "'/assets/css/style.min.css'" );
		expect( plugin ).toMatch(
			/is_readable\( \$path \)[\s\S]*?\$wp_styles->add_data\( \$handle, 'path', false \)/
		);
		expect( plugin ).toContain(
			"add_action( 'wp_enqueue_scripts', 'core_ai_map_skip_unreadable_kiosk_theme_inline_path', PHP_INT_MAX );"
		);
		expect( plugin ).not.toContain(
			"remove_action( 'wp_head', 'wp_maybe_inline_styles'"
		);
	} );

	it( 'keeps the Bench Back control clickable below the persistent brand bar', () => {
		expect( styles ).toMatch(
			/&__topbar\s*\{[\s\S]*?pointer-events:\s*none/
		);
		expect( styles ).toMatch(
			/&__reset,\s*\n\s*&__browse\s*\{[\s\S]*?pointer-events:\s*auto/
		);
	} );

	it( 'keeps the band under the map legible in both map modes', () => {
		// The band carries a flow's takeaway or the explorer's description, so
		// it is gated on the map screen rather than on having a story.
		expect( styles ).toMatch(
			/\.core-ai-map:not\(\.is-map\) \.core-ai-map__story-copy \{\s*opacity: 0;/
		);
		expect( styles ).not.toMatch(
			/\.core-ai-map:not\(\.has-story\) \.core-ai-map__story-copy/
		);
	} );

	it( 'holds the MCP token choreography in its semantic end state', () => {
		expect( styles ).toMatch(
			/&__tokens\.is-visible:not\(\.is-live\)[\s\S]*?core-ai-map__token--call[\s\S]*?opacity:\s*0[\s\S]*?core-ai-map__token--ability[\s\S]*?opacity:\s*1/
		);
		expect( styles ).toMatch(
			/@keyframes core-ai-map-token-ability[\s\S]*?100%\s*\{[\s\S]*?opacity:\s*1/
		);
	} );

	it( 'does not register a site-wide service-worker scope', () => {
		expect( plugin ).toContain( '_core_ai_map_scope' );
		expect( plugin ).not.toContain(
			"header( 'Service-Worker-Allowed: /' );"
		);
		expect( render ).not.toMatch(
			/\$service_scope\s*=\s*wp_parse_url\(\s*home_url\(\s*'\/'\s*\)/
		);
	} );

	it( 'normalizes versioned cache keys and precaches built local fonts', () => {
		expect( worker ).toContain(
			'const CACHE_NAME = `${ CACHE_SCOPE_PREFIX }v3.2.1-review-1`;'
		);
		expect( worker ).toContain( "searchParams.delete( 'ver' )" );
		expect( worker ).toMatch(
			/cache\.match\(\s*cacheKeyFor\( request \)\s*\)/
		);
		expect( render ).toContain( 'build/fonts/*.woff2' );
	} );

	it( 'validates complete offline batches and updates assets network-first', () => {
		expect( worker ).toContain( 'isCacheableResponse' );
		expect( worker ).toContain( 'response.redirected' );
		expect( worker ).toContain( "contentType.includes( 'text/css' )" );
		expect( worker ).toContain( 'CORE_AI_MAP_CACHE_RESULT' );
		expect( worker ).toContain( 'const entries = await Promise.all' );
		expect( worker ).toContain( 'CACHE_READY_KEY' );
		expect( worker ).toContain( 'await cache.delete( CACHE_READY_KEY )' );
		expect( worker ).toContain(
			"await cache.put( CACHE_READY_KEY, new Response( 'ready' ) )"
		);
		expect( worker ).toMatch(
			/await cache\.put\( CACHE_READY_KEY[\s\S]*?names[\s\S]*?name !== CACHE_NAME[\s\S]*?caches\.delete/
		);
		expect( worker ).toMatch(
			/activate[\s\S]*?Keep the last complete scoped cache[\s\S]*?self\.clients\.claim/
		);
		expect( worker ).toMatch(
			/if \( ! cached \)[\s\S]*?name !== CACHE_NAME[\s\S]*?fallback\.match\( CACHE_READY_KEY \)[\s\S]*?fallback\.match\([\s\S]*?cacheKeyFor\( request \)/
		);
		expect( worker ).not.toContain( 'Promise.allSettled' );
		expect( worker ).toMatch(
			/filter\([\s\S]*?if \( ! url \) \{\s*return false;/
		);
		expect( worker ).toMatch(
			/try \{\s*const response = await fetch\( request \);[\s\S]*?return response\.ok \|\| ! cached \? response : cached;/
		);
	} );

	it( 'never intercepts or caches arbitrary same-origin API responses', () => {
		expect( worker ).toContain( 'isStaticAssetRequest' );
		expect( worker ).toMatch(
			/if \( ! isScopedNavigation && ! isStaticAssetRequest\( request \) \) \{\s*return;\s*\}/
		);
		expect( worker ).toMatch(
			/if \( cached && isCacheableResponse\( request, response \) \)/
		);
		expect( worker ).toMatch(
			/if \( pathname\.endsWith\( '\.png' \) \)[\s\S]*?return false;\s*\};/
		);
	} );

	it( 'discovers extra static assets only on public anonymous kiosk pages', () => {
		expect( view ).toMatch(
			/root\.dataset\.cachePage === 'true'[\s\S]*?getObservedStaticAssets\(\)/
		);
		expect( worker ).toMatch(
			/const request = new Request\( url, \{\s*credentials: 'omit'/
		);
		expect( worker ).toMatch(
			/cacheControl[\s\S]*?private\|no-store[\s\S]*?if \( isPage \)/
		);
	} );

	it( 'marks cached navigation HTML without a failing client-side probe', () => {
		expect( worker ).toContain( 'offlinePageResponse' );
		expect( worker ).toContain(
			'<meta name="core-ai-map-offline" content="true">'
		);
		expect( worker ).toMatch(
			/if \( cached \) \{\s*return offlinePageResponse\( cached \);/
		);
	} );

	it( 'caches the canonical permalink rather than a query-string variant', () => {
		expect( render ).toContain( "'data-cache-page-url'" );
		expect( render ).toContain( "? get_permalink() : ''" );
	} );

	it( 'isolates exact kiosk scopes and never precaches authenticated HTML', () => {
		expect( worker ).toContain( 'encodeURIComponent( SCOPE_PATH )' );
		expect( worker ).not.toMatch( /SCOPE_PATH[^;]*replace\(/ );
		expect( render ).toContain( '! is_user_logged_in()' );
		expect( render ).toContain( "'data-cache-page'" );
		expect( plugin ).toContain( 'X-Core-AI-Map-Public' );
		expect( worker ).toMatch(
			/const request = new Request\( url, \{\s*credentials: 'omit'/
		);
		expect( worker ).toContain(
			"response.headers.get( 'x-core-ai-map-public' ) === '1'"
		);
		expect( worker ).toMatch( /private\|no-store/ );
		const navigationBranch = worker.match(
			/if \( isScopedNavigation \) \{([\s\S]*?)\n\s*\}\n\n\s*try \{/
		)?.[ 1 ];
		expect( navigationBranch ).toBeDefined();
		expect( navigationBranch ).not.toContain( 'cache.put' );
	} );
} );
