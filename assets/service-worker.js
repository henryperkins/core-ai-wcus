/* global caches, self */

const CACHE_PREFIX = 'core-ai-living-map-';
const CACHE_NAME = `${ CACHE_PREFIX }v1`;

self.addEventListener( 'install', () => self.skipWaiting() );

self.addEventListener( 'activate', ( event ) => {
	event.waitUntil(
		caches
			.keys()
			.then( ( names ) =>
				Promise.all(
					names
						.filter(
							( name ) =>
								name.startsWith( CACHE_PREFIX ) &&
								name !== CACHE_NAME
						)
						.map( ( name ) => caches.delete( name ) )
				)
			)
			.then( () => self.clients.claim() )
	);
} );

self.addEventListener( 'message', ( event ) => {
	if ( event.data?.type !== 'CACHE_CORE_AI_MAP' ) {
		return;
	}

	const urls = [ event.data.pageUrl, ...( event.data.assets || [] ) ].filter(
		( url ) => {
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
		caches.open( CACHE_NAME ).then( ( cache ) =>
			Promise.allSettled(
				[ ...new Set( urls ) ].map( async ( url ) => {
					const request = new Request( url, {
						credentials: 'same-origin',
					} );
					const response = await fetch( request );

					if ( response.ok ) {
						await cache.put( request, response );
					}
				} )
			)
		)
	);
} );

self.addEventListener( 'fetch', ( event ) => {
	const { request } = event;
	const url = new URL( request.url );

	if ( request.method !== 'GET' || url.origin !== self.location.origin ) {
		return;
	}

	event.respondWith(
		caches.open( CACHE_NAME ).then( async ( cache ) => {
			const cached = await cache.match( request );

			if ( ! cached ) {
				return fetch( request );
			}

			if ( request.mode === 'navigate' ) {
				try {
					const response = await fetch( request );

					if ( response.ok ) {
						event.waitUntil(
							cache.put( request, response.clone() )
						);
					}

					return response;
				} catch {
					return cached;
				}
			}

			event.waitUntil(
				fetch( request )
					.then( ( response ) => {
						if ( response.ok ) {
							return cache.put( request, response );
						}
						return undefined;
					} )
					.catch( () => undefined )
			);

			return cached;
		} )
	);
} );
