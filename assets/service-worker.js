/* global caches, self */

const CACHE_PREFIX = 'core-ai-living-map-';
const SCOPE_PATH = new URL( self.registration.scope ).pathname;
const SCOPE_KEY = encodeURIComponent( SCOPE_PATH );
const CACHE_SCOPE_PREFIX = `${ CACHE_PREFIX }${ SCOPE_KEY || 'kiosk' }-`;
const CACHE_NAME = `${ CACHE_SCOPE_PREFIX }v3.1.2-review-1`;
const CACHE_READY_KEY = new Request(
	new URL( '__core-ai-map-cache-ready__', self.registration.scope ).href
);

/**
 * WordPress adds a `ver` query to registered scripts and styles. Cache the
 * same local asset under a stable URL so the page's versioned request can use
 * the copy populated from the server-rendered offline asset list.
 *
 * @param {Request|string} input Request or URL to normalize.
 * @return {Request} Stable same-origin cache key.
 */
const cacheKeyFor = ( input ) => {
	const request = input instanceof Request ? input : new Request( input );
	const url = new URL( request.url, self.location.origin );
	url.searchParams.delete( 'ver' );

	return new Request( url.href, { credentials: 'omit' } );
};

/**
 * Limit runtime handling to the kiosk page and the packaged static asset
 * formats. Other same-origin requests (including REST/API responses) stay
 * completely outside this worker's cache and fallback behavior.
 *
 * @param {Request} request Request being considered by the fetch handler.
 * @return {boolean} Whether it is an allowed static asset request.
 */
const isStaticAssetRequest = ( request ) =>
	/\.(?:css|m?js|woff2|svg|png)$/i.test( new URL( request.url ).pathname );

const isCacheableResponse = ( request, response, isPage = false ) => {
	if ( ! response.ok || response.redirected ) {
		return false;
	}

	const contentType =
		response.headers.get( 'content-type' )?.toLowerCase() || '';
	const cacheControl =
		response.headers.get( 'cache-control' )?.toLowerCase() || '';
	if ( /(?:^|,)\s*(?:private|no-store)(?:\s|=|,|$)/.test( cacheControl ) ) {
		return false;
	}

	if ( isPage ) {
		return (
			contentType.includes( 'text/html' ) &&
			response.headers.get( 'x-core-ai-map-public' ) === '1'
		);
	}

	const pathname = new URL( request.url ).pathname.toLowerCase();
	if ( pathname.endsWith( '.css' ) ) {
		return contentType.includes( 'text/css' );
	}
	if ( pathname.endsWith( '.js' ) || pathname.endsWith( '.mjs' ) ) {
		return /(?:java|ecma)script/.test( contentType );
	}
	if ( pathname.endsWith( '.woff2' ) ) {
		return /(?:font\/woff2|application\/(?:font-woff|octet-stream))/.test(
			contentType
		);
	}
	if ( pathname.endsWith( '.svg' ) ) {
		return contentType.includes( 'image/svg+xml' );
	}
	if ( pathname.endsWith( '.png' ) ) {
		return contentType.includes( 'image/png' );
	}

	return false;
};

const OFFLINE_PAGE_MARKER = '<meta name="core-ai-map-offline" content="true">';

/**
 * Mark only the HTML response served from the offline cache. The hydrated map
 * can then expose Offline mode without issuing a deliberately failing probe.
 *
 * @param {Response} response Cached public kiosk response.
 * @return {Promise<Response>} Equivalent HTML response with an offline marker.
 */
const offlinePageResponse = async ( response ) => {
	const headers = new Headers( response.headers );
	headers.delete( 'content-length' );
	headers.delete( 'content-encoding' );
	const html = await response.text();
	const markedHtml = /<head(?:\s[^>]*)?>/i.test( html )
		? html.replace( /<head(?:\s[^>]*)?>/i, `$&${ OFFLINE_PAGE_MARKER }` )
		: `${ OFFLINE_PAGE_MARKER }${ html }`;

	return new Response( markedHtml, {
		status: response.status,
		statusText: response.statusText,
		headers,
	} );
};

const reportCacheResult = ( event, ok, detail = '' ) => {
	event.source?.postMessage( {
		type: 'CORE_AI_MAP_CACHE_RESULT',
		ok,
		detail,
	} );
};

self.addEventListener( 'install', () => self.skipWaiting() );

self.addEventListener( 'activate', ( event ) => {
	// Keep the last complete scoped cache during an update. It is retired only
	// after the new worker validates and commits its replacement batch.
	event.waitUntil( self.clients.claim() );
} );

self.addEventListener( 'message', ( event ) => {
	if ( event.data?.type === 'CLEAR_CORE_AI_MAP' ) {
		event.waitUntil(
			caches
				.keys()
				.then( ( names ) =>
					Promise.all(
						names
							.filter( ( name ) =>
								name.startsWith( CACHE_SCOPE_PREFIX )
							)
							.map( ( name ) => caches.delete( name ) )
					)
				)
		);
		return;
	}

	if ( event.data?.type !== 'CACHE_CORE_AI_MAP' ) {
		return;
	}

	const pageUrl = event.data.pageUrl || '';
	const urls = [ pageUrl, ...( event.data.assets || [] ) ].filter(
		( url ) => {
			if ( ! url ) {
				return false;
			}
			try {
				return (
					new URL( url, self.location.origin ).origin ===
					self.location.origin
				);
			} catch {
				return false;
			}
		}
	);

	event.waitUntil(
		( async () => {
			try {
				const entries = await Promise.all(
					[ ...new Set( urls ) ].map( async ( url ) => {
						const request = new Request( url, {
							credentials: 'omit',
						} );
						const response = await fetch( request );

						if (
							! isCacheableResponse(
								request,
								response,
								url === pageUrl
							)
						) {
							throw new Error(
								`Invalid offline response: ${ url }`
							);
						}

						return [ cacheKeyFor( request ), response ];
					} )
				);
				const cache = await caches.open( CACHE_NAME );
				await cache.delete( CACHE_READY_KEY );
				await Promise.all(
					entries.map( ( [ key, response ] ) =>
						cache.put( key, response )
					)
				);
				await cache.put( CACHE_READY_KEY, new Response( 'ready' ) );
				const names = await caches.keys();
				await Promise.all(
					names
						.filter(
							( name ) =>
								name.startsWith( CACHE_SCOPE_PREFIX ) &&
								name !== CACHE_NAME
						)
						.map( ( name ) => caches.delete( name ) )
				);
				reportCacheResult( event, true );
			} catch ( error ) {
				reportCacheResult( event, false, error.message );
			}
		} )()
	);
} );

self.addEventListener( 'fetch', ( event ) => {
	const { request } = event;
	const url = new URL( request.url );

	if ( request.method !== 'GET' || url.origin !== self.location.origin ) {
		return;
	}

	const isScopedNavigation =
		request.mode === 'navigate' && url.pathname === SCOPE_PATH;
	if ( ! isScopedNavigation && ! isStaticAssetRequest( request ) ) {
		return;
	}

	event.respondWith(
		caches.open( CACHE_NAME ).then( async ( cache ) => {
			const ready = await cache.match( CACHE_READY_KEY );
			let cached = ready
				? await cache.match( cacheKeyFor( request ) )
				: undefined;

			if ( ! cached ) {
				const names = await caches.keys();
				for ( const name of names.reverse() ) {
					if (
						name.startsWith( CACHE_SCOPE_PREFIX ) &&
						name !== CACHE_NAME
					) {
						const fallback = await caches.open( name );
						if ( await fallback.match( CACHE_READY_KEY ) ) {
							cached = await fallback.match(
								cacheKeyFor( request )
							);
							break;
						}
					}
				}
			}

			if ( isScopedNavigation ) {
				try {
					// Only the explicit CACHE_CORE_AI_MAP message stores HTML.
					// That message is omitted for logged-in WordPress responses,
					// keeping personalized toolbar/account markup out of the cache.
					return await fetch( request );
				} catch ( error ) {
					if ( cached ) {
						return offlinePageResponse( cached );
					}
					throw error;
				}
			}

			try {
				const response = await fetch( request );
				if ( cached && isCacheableResponse( request, response ) ) {
					event.waitUntil(
						cache.put( cacheKeyFor( request ), response.clone() )
					);
				}
				return response.ok || ! cached ? response : cached;
			} catch ( error ) {
				if ( cached ) {
					return cached;
				}
				throw error;
			}
		} )
	);
} );
