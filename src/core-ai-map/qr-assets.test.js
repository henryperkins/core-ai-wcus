const fs = require( 'fs' );
const path = require( 'path' );
const { TextDecoder, TextEncoder } = require( 'util' );
const QRCode = require( 'qrcode' );

Object.assign( global, { TextDecoder, TextEncoder } );

const qrDirectory = path.join( __dirname, '..', '..', 'assets', 'qr' );

const expectedQrs = {
	abilities: 'https://developer.wordpress.org/apis/abilities-api/',
	client: 'https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/',
	connectors:
		'https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/',
	plugin: 'https://wordpress.org/plugins/ai/',
	mcp: 'https://github.com/WordPress/mcp-adapter',
	bench: 'https://github.com/WordPress/wp-bench',
	skills: 'https://github.com/WordPress/agent-skills',
	feedback:
		'https://docs.google.com/forms/d/e/1FAIpQLSfs2LeNn7M_L66d57sXLnD1bAh28vgEoQfTx90AYkuFsVT4gA/viewform',
};

const qrOptions = {
	type: 'svg',
	errorCorrectionLevel: 'M',
	margin: 4,
	color: {
		dark: '#000000',
		light: '#ffffff',
	},
};

describe( 'Living Block Map QR assets', () => {
	test( 'commits eight deterministic SVG QR codes with a four-module quiet zone', async () => {
		const expectedFiles = Object.keys( expectedQrs )
			.map( ( key ) => `${ key }.svg` )
			.sort();

		expect( fs.existsSync( qrDirectory ) ).toBe( true );
		expect( fs.readdirSync( qrDirectory ).sort() ).toEqual(
			[ ...expectedFiles, 'manifest.json' ].sort()
		);

		const manifest = JSON.parse(
			fs.readFileSync( path.join( qrDirectory, 'manifest.json' ), 'utf8' )
		);
		expect( manifest ).toEqual( expectedQrs );

		for ( const [ key, payload ] of Object.entries( expectedQrs ) ) {
			const svg = fs.readFileSync(
				path.join( qrDirectory, `${ key }.svg` ),
				'utf8'
			);
			const expectedSvg = await QRCode.toString( payload, qrOptions );
			const moduleCount = QRCode.create( payload, {
				errorCorrectionLevel: qrOptions.errorCorrectionLevel,
			} ).modules.size;
			const viewBox = svg.match( /viewBox="0 0 (\d+) (\d+)"/ );

			expect( svg.trimStart().startsWith( '<svg' ) ).toBe( true );
			expect( viewBox ).not.toBeNull();
			expect( viewBox.slice( 1 ).map( Number ) ).toEqual( [
				moduleCount + qrOptions.margin * 2,
				moduleCount + qrOptions.margin * 2,
			] );
			expect( svg ).toBe( expectedSvg );
		}
	} );
} );
