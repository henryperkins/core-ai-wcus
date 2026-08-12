import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import './editor.scss';

const updateItem = ( items, index, key, value ) =>
	items.map( ( item, itemIndex ) =>
		itemIndex === index ? { ...item, [ key ]: value } : item
	);

export default function Edit( { attributes, setAttributes } ) {
	const {
		eyebrow,
		title,
		intro,
		prompt,
		inactivityTimeout,
		offlineEnabled,
		projects,
		scenarios,
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'core-ai-map-editor',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Experience', 'core-ai-map' ) }>
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
						label={ __( 'Attract prompt', 'core-ai-map' ) }
						value={ prompt }
						onChange={ ( value ) =>
							setAttributes( { prompt: value } )
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
						min={ 20 }
						max={ 180 }
						step={ 5 }
					/>
					<ToggleControl
						label={ __( 'Enable offline caching', 'core-ai-map' ) }
						checked={ offlineEnabled }
						onChange={ ( value ) =>
							setAttributes( { offlineEnabled: value } )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Projects', 'core-ai-map' ) }
					initialOpen={ false }
				>
					{ projects.map( ( project, index ) => (
						<div
							className="core-ai-map-editor__settings"
							key={ project.id }
						>
							<h3>{ project.name }</h3>
							<TextControl
								label={ __( 'Name', 'core-ai-map' ) }
								value={ project.name }
								onChange={ ( value ) =>
									setAttributes( {
										projects: updateItem(
											projects,
											index,
											'name',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Short label', 'core-ai-map' ) }
								value={ project.kicker }
								onChange={ ( value ) =>
									setAttributes( {
										projects: updateItem(
											projects,
											index,
											'kicker',
											value
										),
									} )
								}
							/>
							<TextareaControl
								label={ __(
									'Plain-language description',
									'core-ai-map'
								) }
								value={ project.description }
								onChange={ ( value ) =>
									setAttributes( {
										projects: updateItem(
											projects,
											index,
											'description',
											value
										),
									} )
								}
							/>
							<TextareaControl
								label={ __(
									'Technical detail',
									'core-ai-map'
								) }
								value={ project.technical }
								onChange={ ( value ) =>
									setAttributes( {
										projects: updateItem(
											projects,
											index,
											'technical',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Status', 'core-ai-map' ) }
								value={ project.status }
								onChange={ ( value ) =>
									setAttributes( {
										projects: updateItem(
											projects,
											index,
											'status',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Learn more URL', 'core-ai-map' ) }
								type="url"
								value={ project.href }
								onChange={ ( value ) =>
									setAttributes( {
										projects: updateItem(
											projects,
											index,
											'href',
											value
										),
									} )
								}
							/>
						</div>
					) ) }
				</PanelBody>
				<PanelBody
					title={ __( 'Scenario paths', 'core-ai-map' ) }
					initialOpen={ false }
				>
					{ scenarios.map( ( scenario, index ) => (
						<div
							className="core-ai-map-editor__settings"
							key={ scenario.id }
						>
							<h3>{ scenario.label }</h3>
							<TextControl
								label={ __( 'Label', 'core-ai-map' ) }
								value={ scenario.label }
								onChange={ ( value ) =>
									setAttributes( {
										scenarios: updateItem(
											scenarios,
											index,
											'label',
											value
										),
									} )
								}
							/>
							<TextareaControl
								label={ __( 'Description', 'core-ai-map' ) }
								value={ scenario.description }
								onChange={ ( value ) =>
									setAttributes( {
										scenarios: updateItem(
											scenarios,
											index,
											'description',
											value
										),
									} )
								}
							/>
							<TextControl
								label={ __( 'Project IDs', 'core-ai-map' ) }
								help={ __(
									'Comma-separated IDs: abilities, skills, client, plugin, mcp, bench.',
									'core-ai-map'
								) }
								value={ scenario.projects.join( ', ' ) }
								onChange={ ( value ) =>
									setAttributes( {
										scenarios: updateItem(
											scenarios,
											index,
											'projects',
											value
												.split( ',' )
												.map( ( id ) => id.trim() )
												.filter( Boolean )
										),
									} )
								}
							/>
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
				<div className="core-ai-map-editor__projects">
					{ projects.map( ( project, index ) => (
						<article key={ project.id }>
							<span>
								{ sprintf(
									/* translators: %d: Project number. */
									__( '0%d', 'core-ai-map' ),
									index + 1
								) }
							</span>
							<strong>{ project.name }</strong>
							<small>{ project.kicker }</small>
						</article>
					) ) }
				</div>
				<p className="core-ai-map-editor__note">
					{ __(
						'Interactive animation, detail cards, and inactivity reset appear on the published page.',
						'core-ai-map'
					) }
				</p>
			</section>
		</>
	);
}
