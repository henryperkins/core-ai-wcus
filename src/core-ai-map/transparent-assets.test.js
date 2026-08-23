const { existsSync, readFileSync, statSync } = require( 'node:fs' );
const { join } = require( 'node:path' );
const { inflateSync } = require( 'node:zlib' );

const assetPath = join(
	__dirname,
	'..',
	'..',
	'assets',
	'generated',
	'illustrative-ceramic-mug.png'
);

const paeth = ( left, up, upperLeft ) => {
	const estimate = left + up - upperLeft;
	const leftDistance = Math.abs( estimate - left );
	const upDistance = Math.abs( estimate - up );
	const upperLeftDistance = Math.abs( estimate - upperLeft );

	if ( leftDistance <= upDistance && leftDistance <= upperLeftDistance ) {
		return left;
	}
	if ( upDistance <= upperLeftDistance ) {
		return up;
	}
	return upperLeft;
};

const decodeRgbaPng = ( bytes ) => {
	expect( bytes.subarray( 0, 8 ) ).toEqual(
		Buffer.from( [ 137, 80, 78, 71, 13, 10, 26, 10 ] )
	);

	let offset = 8;
	let header;
	const imageData = [];

	while ( offset < bytes.length ) {
		const length = bytes.readUInt32BE( offset );
		const type = bytes.toString( 'ascii', offset + 4, offset + 8 );
		const data = bytes.subarray( offset + 8, offset + 8 + length );
		offset += length + 12;

		if ( type === 'IHDR' ) {
			header = {
				width: data.readUInt32BE( 0 ),
				height: data.readUInt32BE( 4 ),
				bitDepth: data[ 8 ],
				colorType: data[ 9 ],
				compression: data[ 10 ],
				filter: data[ 11 ],
				interlace: data[ 12 ],
			};
		}
		if ( type === 'IDAT' ) {
			imageData.push( data );
		}
		if ( type === 'IEND' ) {
			break;
		}
	}

	expect( header ).toEqual(
		expect.objectContaining( {
			bitDepth: 8,
			colorType: 6,
			compression: 0,
			filter: 0,
			interlace: 0,
		} )
	);
	expect( header.width ).toBe( header.height );
	expect( header.width ).toBeGreaterThanOrEqual( 1024 );
	expect( header.width ).toBeLessThanOrEqual( 1536 );

	const bytesPerPixel = 4;
	const rowLength = header.width * bytesPerPixel;
	const inflated = inflateSync( Buffer.concat( imageData ) );
	const rgba = Buffer.alloc( rowLength * header.height );
	let sourceOffset = 0;
	let previousRow = Buffer.alloc( rowLength );

	for ( let y = 0; y < header.height; y += 1 ) {
		const filterType = inflated[ sourceOffset ];
		sourceOffset += 1;
		const row = Buffer.alloc( rowLength );

		for ( let x = 0; x < rowLength; x += 1 ) {
			const raw = inflated[ sourceOffset + x ];
			const left = x >= bytesPerPixel ? row[ x - bytesPerPixel ] : 0;
			const up = previousRow[ x ];
			const upperLeft =
				x >= bytesPerPixel ? previousRow[ x - bytesPerPixel ] : 0;
			let predictor = 0;

			if ( filterType === 1 ) {
				predictor = left;
			} else if ( filterType === 2 ) {
				predictor = up;
			} else if ( filterType === 3 ) {
				predictor = Math.floor( ( left + up ) / 2 );
			} else if ( filterType === 4 ) {
				predictor = paeth( left, up, upperLeft );
			} else if ( filterType !== 0 ) {
				throw new Error( `Unsupported PNG filter ${ filterType }.` );
			}

			row[ x ] = ( raw + predictor ) % 256;
		}

		row.copy( rgba, y * rowLength );
		previousRow = row;
		sourceOffset += rowLength;
	}

	return { ...header, rgba };
};

describe( 'transparent inspector assets', () => {
	it( 'ships a bounded RGBA mug cutout with real transparent pixels', () => {
		const exists = existsSync( assetPath );

		expect( exists ).toBe( true );
		if ( ! exists ) {
			return;
		}

		const bytes = readFileSync( assetPath );
		const image = decodeRgbaPng( bytes );
		const alphaValues = [];

		for ( let index = 3; index < image.rgba.length; index += 4 ) {
			alphaValues.push( image.rgba[ index ] );
		}

		const transparentPixels = alphaValues.filter(
			( alpha ) => alpha === 0
		).length;
		const nearOpaquePixels = alphaValues.filter(
			( alpha ) => alpha >= 250
		).length;
		const transparentShare = transparentPixels / alphaValues.length;
		const cornerIndexes = [
			3,
			( image.width - 1 ) * 4 + 3,
			( image.height - 1 ) * image.width * 4 + 3,
			image.rgba.length - 1,
		];

		expect( statSync( assetPath ).size ).toBeLessThan( 3 * 1024 * 1024 );
		expect( transparentPixels ).toBeGreaterThan( 0 );
		expect( nearOpaquePixels ).toBeGreaterThan( 0 );
		expect( transparentShare ).toBeGreaterThan( 0.35 );
		expect( cornerIndexes.map( ( index ) => image.rgba[ index ] ) ).toEqual(
			[ 0, 0, 0, 0 ]
		);
	} );
} );
