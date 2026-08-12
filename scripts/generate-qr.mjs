import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = dirname( dirname( fileURLToPath( import.meta.url ) ) );
const qrDirectory = join( root, 'assets', 'qr' );
const manifest = JSON.parse(
	await readFile( join( qrDirectory, 'manifest.json' ), 'utf8' )
);
const qrOptions = {
	type: 'svg',
	errorCorrectionLevel: 'M',
	margin: 4,
	color: {
		dark: '#000000',
		light: '#ffffff',
	},
};

await mkdir( qrDirectory, { recursive: true } );

for ( const [ name, payload ] of Object.entries( manifest ) ) {
	const svg = await QRCode.toString( payload, qrOptions );
	await writeFile( join( qrDirectory, `${ name }.svg` ), svg );
}
