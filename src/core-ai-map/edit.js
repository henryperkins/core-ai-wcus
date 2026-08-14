import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import metadata from './block.json';
import './editor.scss';
import { withCurrentDefaults } from './normalize';

const updateItem = ( items, index, key, value ) =>
	items.map( ( item, itemIndex ) =>
		itemIndex === index ? { ...item, [ key ]: value } : item
	);

export default function Edit( { attributes, setAttributes } ) {
	const {
		eyebrow,
		reviewedDate,
		title,
		intro,
		prompt,
		inactivityTimeout,
		offlineEnabled,
		recompose,
		shapes,
		blocks: savedBlocks,
		actors: savedActors,
		stories: savedStories,
		panels: savedPanels,
	} = attributes;
	const blocks = withCurrentDefaults( metadata, 'blocks', savedBlocks );
	const actors = withCurrentDefaults( metadata, 'actors', savedActors );
	const stories = withCurrentDefaults( metadata, 'stories', savedStories );
	const panels = withCurrentDefaults( metadata, 'panels', savedPanels );

	const blockProps = useBlockProps( {
		className: 'core-ai-map-editor',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Attract screen', 'core-ai-map' ) }>
					<TextControl
						label={ __( 'Eyebrow', 'core-ai-map' ) }
						value={ eyebrow }
						onChange={ ( value ) =>
							setAttributes( { eyebrow: value } )
						}
					/>
					<TextControl
						label={ __( 'Headline', 'core-ai-map' ) }
						value={ title }
						onChange={ ( value ) =>
							setAttributes( { title: value } )
						}
					/>
					<TextareaControl
						label={ __( 'Introduction', 'core-ai-map' ) }
						value={ intro }
						onChange={ ( value ) =>
							setAttributes( { intro: value } )
						}
					/>
					<TextControl
						label={ __( 'Call to action', 'core-ai-map' ) }
						value={ prompt }
						onChange={ ( value ) =>
							setAttributes( { prompt: value } )
						}
					/>
					<TextControl
						label={ __( 'Reviewed date', 'core-ai-map' ) }
						help={ __(
							'Shown in the About this exhibit panel so visitors know when the factual copy was reviewed.',
							'core-ai-map'
						) }
						value={ reviewedDate }
						onChange={ ( value ) =>
							setAttributes( { reviewedDate: value } )
						}
					/>
				</PanelBody>

				<PanelBody title={ __( 'Behavior', 'core-ai-map' ) }>
					<ToggleControl
						label={ __(
							'Stories recompose the map',
							'core-ai-map'
						) }
						help={ __(
							'On: members slide into a numbered workflow and everything else parks on a shelf. Off: blocks hold their positions and only the path lights up.',
							'core-ai-map'
						) }
						checked={ recompose }
						onChange={ ( value ) =>
							setAttributes( { recompose: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Blocks grow role shapes', 'core-ai-map' ) }
						help={ __(
							'Ports, sockets, routers, and meters appear when a block joins a story or opens.',
							'core-ai-map'
						) }
						checked={ shapes }
						onChange={ ( value ) =>
							setAttributes( { shapes: value } )
						}
					/>
					<RangeControl
						label={ __( 'Reset after inactivity', 'core-ai-map' ) }
						help={ __(
							'Seconds before the attract screen returns.',
							'core-ai-map'
						) }
						value={ inactivityTimeout }
						onChange={ ( value ) =>
							setAttributes( { inactivityTimeout: value } )
						}
						min={ 30 }
						max={ 180 }
						step={ 15 }
					/>
					<ToggleControl
						label={ __( 'Enable offline caching', 'core-ai-map' ) }
						help={ __(
							'Offline caching requires HTTPS (or localhost), is limited to the kiosk permalink, and stays disabled on a site homepage.',
							'core-ai-map'
						) }
						checked={ offlineEnabled }
						onChange={ ( value ) =>
							setAttributes( { offlineEnabled: value } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Blocks on the canvas', 'core-ai-map' ) }
					initialOpen={ false }
				>
					{ blocks.map( ( item, index ) => (
						<div
							className="core-ai-map-editor__settings"
							key={ item.id }
						>
							<h3>{ item.name }</h3>
							<TextControl
								label={ __( 'Name', 'core-ai-map' ) }
								value={ item.name }
								onChange={ ( value ) =>
									setAttributes( {
										blocks: updateItem(
											blocks,
											index,
											'name',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Tagline', 'core-ai-map' ) }
								value={ item.tagline }
								onChange={ ( value ) =>
									setAttributes( {
										blocks: updateItem(
											blocks,
											index,
											'tagline',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Status badge', 'core-ai-map' ) }
								value={ item.badge }
								disabled={ item.id === 'mcp' }
								help={
									item.id === 'mcp'
										? __(
												'Fixed to the reviewed WordPress project status.',
												'core-ai-map'
										  )
										: undefined
								}
								onChange={ ( value ) =>
									setAttributes( {
										blocks: updateItem(
											blocks,
											index,
											'badge',
											value
										),
									} )
								}
							/>
						</div>
					) ) }
				</PanelBody>

				<PanelBody
					title={ __( 'Off-canvas actors', 'core-ai-map' ) }
					initialOpen={ false }
				>
					{ actors.map( ( item, index ) => (
						<div
							className="core-ai-map-editor__settings"
							key={ item.id }
						>
							<h3>{ item.name }</h3>
							<TextControl
								label={ __( 'Name', 'core-ai-map' ) }
								value={ item.name }
								onChange={ ( value ) =>
									setAttributes( {
										actors: updateItem(
											actors,
											index,
											'name',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Tagline', 'core-ai-map' ) }
								value={ item.tagline }
								onChange={ ( value ) =>
									setAttributes( {
										actors: updateItem(
											actors,
											index,
											'tagline',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Eyebrow', 'core-ai-map' ) }
								value={ item.badge }
								onChange={ ( value ) =>
									setAttributes( {
										actors: updateItem(
											actors,
											index,
											'badge',
											value
										),
									} )
								}
							/>
						</div>
					) ) }
				</PanelBody>

				<PanelBody
					title={ __( 'Stories', 'core-ai-map' ) }
					initialOpen={ false }
				>
					<p className="core-ai-map-editor__note">
						{ __(
							'Which blocks take part in a story, and where they slide to, is fixed by the map geometry. Only the wording is editable here.',
							'core-ai-map'
						) }
					</p>
					{ stories.map( ( story, index ) => (
						<div
							className="core-ai-map-editor__settings"
							key={ story.id }
						>
							<h3>{ story.title }</h3>
							<TextControl
								label={ __( 'Title', 'core-ai-map' ) }
								value={ story.title }
								onChange={ ( value ) =>
									setAttributes( {
										stories: updateItem(
											stories,
											index,
											'title',
											value
										),
									} )
								}
							/>
							<TextareaControl
								label={ __( 'Caption', 'core-ai-map' ) }
								value={ story.copy }
								onChange={ ( value ) =>
									setAttributes( {
										stories: updateItem(
											stories,
											index,
											'copy',
											value
										),
									} )
								}
							/>
						</div>
					) ) }
				</PanelBody>

				<PanelBody
					title={ __( 'Detail panels', 'core-ai-map' ) }
					initialOpen={ false }
				>
					{ panels.map( ( panel, index ) => (
						<div
							className="core-ai-map-editor__settings"
							key={ panel.id }
						>
							<h3>{ panel.title }</h3>
							<TextareaControl
								label={ __(
									'Opening paragraph',
									'core-ai-map'
								) }
								value={ panel.lede }
								onChange={ ( value ) =>
									setAttributes( {
										panels: updateItem(
											panels,
											index,
											'lede',
											value
										),
									} )
								}
							/>
							<p className="core-ai-map-editor__note">
								{ __(
									'The verified destination and its local QR code ship together and are not independently editable.',
									'core-ai-map'
								) }
								<br />
								<code>{ panel.href }</code>
							</p>
						</div>
					) ) }
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="core-ai-map-editor__heading">
					<span>{ eyebrow }</span>
					<h2>{ title }</h2>
					<p>{ intro }</p>
				</div>
				<div className="core-ai-map-editor__prompt">{ prompt }</div>

				<div className="core-ai-map-editor__zones">
					<div className="core-ai-map-editor__zone">
						<span>{ __( 'Outside', 'core-ai-map' ) }</span>
						{ actors
							.filter( ( actor ) => actor.id !== 'provider' )
							.map( ( actor ) => (
								<article key={ actor.id }>
									<strong>{ actor.name }</strong>
									<small>{ actor.tagline }</small>
								</article>
							) ) }
					</div>
					<div className="core-ai-map-editor__zone core-ai-map-editor__zone--inside">
						<span>{ __( 'Inside WordPress', 'core-ai-map' ) }</span>
						{ blocks.map( ( item ) => (
							<article key={ item.id }>
								<strong>{ item.name }</strong>
								<small>{ item.tagline }</small>
							</article>
						) ) }
					</div>
					<div className="core-ai-map-editor__zone">
						<span>{ __( 'Outside', 'core-ai-map' ) }</span>
						{ actors
							.filter( ( actor ) => actor.id === 'provider' )
							.map( ( actor ) => (
								<article key={ actor.id }>
									<strong>{ actor.name }</strong>
									<small>{ actor.tagline }</small>
								</article>
							) ) }
					</div>
				</div>

				<div className="core-ai-map-editor__stories">
					{ stories.map( ( story ) => (
						<span key={ story.id }>{ story.title }</span>
					) ) }
				</div>

				<p className="core-ai-map-editor__note">
					{ __(
						'Recomposition, role shapes, the boundary rules, and the inactivity reset all appear on the published page.',
						'core-ai-map'
					) }
				</p>
			</section>
		</>
	);
}
