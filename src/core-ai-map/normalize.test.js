import currentMetadata from './block.json';
import legacyMetadata from './fixtures/block-v0.2.json';
import { withCurrentDefaults } from './normalize';

describe( 'editor copy normalization', () => {
	it( 'upgrades untouched v0.2 defaults to the v3.1.1 editor copy', () => {
		const blocks = withCurrentDefaults(
			currentMetadata,
			'blocks',
			legacyMetadata.attributes.blocks.default
		);
		const stories = withCurrentDefaults(
			currentMetadata,
			'stories',
			legacyMetadata.attributes.stories.default
		);
		const panels = withCurrentDefaults(
			currentMetadata,
			'panels',
			legacyMetadata.attributes.panels.default
		);

		expect( blocks.find( ( item ) => item.id === 'bench' ) ).toMatchObject(
			{
				name: 'WP-Bench',
				tagline: 'See whether the code an agent writes actually runs',
			}
		);
		expect( stories.find( ( item ) => item.id === 'learns' ).copy ).toBe(
			'Agent Skills attaches current WordPress guidance to a coding agent, which then starts the task. All of this happens outside the site — nothing inside WordPress runs.'
		);
		expect( panels.find( ( item ) => item.id === 'bench' ) ).toMatchObject(
			{
				title: 'WP-Bench',
				lede: 'A test bench, not part of any live request. It measures whether the code an agent writes for WordPress actually runs.',
			}
		);
	} );

	it( 'restores new items and canonical product-owned fields', () => {
		const actors = withCurrentDefaults(
			currentMetadata,
			'actors',
			legacyMetadata.attributes.actors.default
		);
		const panels = withCurrentDefaults(
			currentMetadata,
			'panels',
			legacyMetadata.attributes.panels.default.map( ( panel ) => ( {
				...panel,
				href: 'https://legacy.example/',
				qr: '',
			} ) )
		);

		expect( actors.find( ( item ) => item.id === 'task' ) ).toMatchObject( {
			name: 'A WordPress task',
			tagline: 'Plugin or theme work',
		} );
		expect( panels.find( ( item ) => item.id === 'mcp' ) ).toMatchObject( {
			badge: 'WordPress plugin · not in Core',
			href: 'https://github.com/WordPress/mcp-adapter',
			qr: 'qr/mcp.svg',
		} );
	} );

	it( 'preserves visitor-authored copy that differs from the old default', () => {
		const customStories = legacyMetadata.attributes.stories.default.map(
			( story ) =>
				story.id === 'tests'
					? { ...story, copy: 'A custom kiosk explanation.' }
					: story
		);
		const stories = withCurrentDefaults(
			currentMetadata,
			'stories',
			customStories
		);

		expect( stories.find( ( item ) => item.id === 'tests' ).copy ).toBe(
			'A custom kiosk explanation.'
		);
	} );
} );
