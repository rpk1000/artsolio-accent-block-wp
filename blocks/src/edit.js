import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
	MediaReplaceFlow,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	ToolbarGroup,
	Button,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { Fragment, useMemo, useCallback } from '@wordpress/element';
import { useSelect, dispatch } from '@wordpress/data';

const CORNERS = [
	{ label: __('Top Left', 'artsolio-accent'), value: 'top-left' },
	{ label: __('Top Right', 'artsolio-accent'), value: 'top-right' },
	{ label: __('Bottom Left', 'artsolio-accent'), value: 'bottom-left' },
	{ label: __('Bottom Right', 'artsolio-accent'), value: 'bottom-right' },
];

const getPresetsFromWindow = () => {
	if ( window.artsolioAccentPresetConfig ) return window.artsolioAccentPresetConfig;
	return {
		size:   { XS:'clamp(56px, 7cqi, 96px)', S:'clamp(64px, 9cqi, 120px)', M:'clamp(80px, 12cqi, 160px)', L:'clamp(96px, 15cqi, 200px)', XL:'clamp(112px, 18cqi, 240px)' },
		offset: { XS:'0.25rem', S:'0.5rem', M:'0.75rem', L:'1rem', XL:'1.5rem' },
	};
};

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		id, url, alt,
		corner,
		sizeMode, sizePreset, sizeCustom, sizeResolved,
		offsetSplit, offsetMode, offsetPreset, offsetCustom, offsetResolved,
		offsetXCustom, offsetYCustom, offsetXResolved, offsetYResolved,
		hideOnMobile,
		markParent,
	} = attributes;

	const presets = useMemo( getPresetsFromWindow, [] );
	const sizePresetOptions = useMemo(
		() => Object.keys( presets.size ).map( k => ( { label: k, value: k } ) ),
		[ presets ]
	);
	const offsetPresetOptions = useMemo(
		() => Object.keys( presets.offset ).map( k => ( { label: k, value: k } ) ),
		[ presets ]
	);

	// Parent info
	const { immediateParentId, parentAttrs } = useSelect( ( sel ) => {
		const parents = sel( 'core/block-editor' ).getBlockParents( clientId, true ) || [];
		const parentId = parents.length ? parents[0] : null;
		const attrs = parentId ? sel( 'core/block-editor' ).getBlockAttributes( parentId ) : null;
		return { immediateParentId: parentId, parentAttrs: attrs };
	}, [ clientId ] );

	// Add/remove only anchor flags on the parent
	const updateParentAnchor = useCallback( ( addAnchor ) => {
		if ( ! immediateParentId ) return;
		const cls = ( parentAttrs?.className || '' ).split( /\s+/ ).filter( Boolean );
		const add = ( name ) => { if ( ! cls.includes( name ) ) cls.push( name ); };
		const remove = ( name ) => { const i = cls.indexOf( name ); if ( i !== -1 ) cls.splice( i, 1 ); };

		['is-accent-anchor', 'artsolio_is-accent-anchor'].forEach( addAnchor ? add : remove );

		dispatch( 'core/block-editor' ).updateBlockAttributes( immediateParentId, { className: cls.join( ' ' ) } );
	}, [ immediateParentId, parentAttrs ] );

	const onToggleParentAnchor = ( v ) => {
		setAttributes( { markParent: v } );
		updateParentAnchor( v );
	};

	// Resolve presets -> concrete strings
	const onChangeSizePreset = ( v ) => {
		const resolved = presets.size?.[ v ] || '';
		setAttributes( { sizePreset: v, sizeResolved: resolved } );
	};
	const onChangeOffsetPreset = ( v ) => {
		const resolved = presets.offset?.[ v ] || '';
		setAttributes( { offsetPreset: v, offsetResolved: resolved } );
	};

	// Inline styles
	const cssSize   = sizeMode === 'custom' ? ( sizeCustom || '' ) : ( sizeResolved || '' );
	let cssVars = {};
	if ( offsetSplit ) {
		const ox = offsetXCustom || offsetXResolved || '';
		const oy = offsetYCustom || offsetYResolved || '';
		if ( ox ) cssVars['--artsolio_offset_x'] = ox;
		if ( oy ) cssVars['--artsolio_offset_y'] = oy;
	} else {
		const o = offsetMode === 'custom' ? ( offsetCustom || '' ) : ( offsetResolved || '' );
		if ( o ) cssVars['--artsolio_accent_offset'] = o;
	}

	const blockProps = useBlockProps( {
		className: [
			`is-${ corner }`,      // classes now match the UI/intent
			hideOnMobile ? 'is-hidden-mobile' : '',
		].join( ' ' ),
		style: {
			...( cssSize ? { '--artsolio_accent_size': cssSize } : {} ),
			...cssVars
		}
	} );

	return (
		<Fragment>
			<BlockControls>
				<ToolbarGroup>
					<MediaReplaceFlow
						mediaId={ id }
						mediaURL={ url }
						accept="image/*"
						onSelect={ ( media ) => setAttributes( { id: media.id, url: media.url } ) }
						onSelectURL={ ( newURL ) => setAttributes( { id: undefined, url: newURL } ) }
						name={ __('Replace', 'artsolio-accent') }
					/>
					{ url && (
						<Button variant="secondary" onClick={ () => setAttributes( { id: undefined, url: undefined } ) }>
							{ __('Remove', 'artsolio-accent') }
						</Button>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __('Placement', 'artsolio-accent') } initialOpen={ true }>
					<SelectControl
						label={ __('Corner', 'artsolio-accent') }
						value={ corner }
						options={ CORNERS }
						onChange={ ( v ) => setAttributes( { corner: v } ) }
					/>
					<ToggleControl
						label={ __('Hide on Mobile (≤ 781px)', 'artsolio-accent') }
						checked={ !! hideOnMobile }
						onChange={ ( v ) => setAttributes( { hideOnMobile: v } ) }
					/>
					<ToggleControl
						label={ __('Mark parent as Accent Anchor', 'artsolio-accent') }
						checked={ !! markParent }
						onChange={ onToggleParentAnchor }
					/>
				</PanelBody>

				<PanelBody title={ __('Size', 'artsolio-accent') } initialOpen={ false }>
					<SelectControl
						label={ __('Mode', 'artsolio-accent') }
						value={ sizeMode }
						options={[
						{ label: __('Preset', 'artsolio-accent'), value: 'preset' },
						{ label: __('Custom', 'artsolio-accent'), value: 'custom' },
						]}
						onChange={ ( v ) => setAttributes( { sizeMode: v } ) }
					/>

					{ sizeMode === 'preset' && (
						<SelectControl
						label={ __('Preset', 'artsolio-accent') }
						value={ sizePreset }
						options={ sizePresetOptions }
						onChange={ onChangeSizePreset }
						/>
					) }

					{ sizeMode === 'custom' && (
						<>
						<ToggleControl
							label={ __('Advanced CSS input (clamp/calc)', 'artsolio-accent') }
							checked={ !! attributes.sizeCustomAdvanced }
							onChange={ ( v ) => {
							// Ensure we’re in Custom mode when Advanced is enabled
							setAttributes( { sizeCustomAdvanced: v, sizeMode: 'custom' } );
							} }
							help={ __('Turn off to use a simple number + unit picker.', 'artsolio-accent') }
						/>

						{ !attributes.sizeCustomAdvanced && (
							<UnitControl
							label={ __('Custom Size', 'artsolio-accent') }
							value={ attributes.sizeCustom || '' }
							onChange={ ( v ) => setAttributes( { sizeCustom: v?.toString().trim() || '' } ) }
							units={[
								{ value: 'px',  label: 'px',  default: 120 },
								{ value: 'rem', label: 'rem' },
								{ value: 'em',  label: 'em'  },
								{ value: 'vw',  label: 'vw'  },
								{ value: 'cqi', label: 'cqi' }
							]}
							__unstableInputWidth="100%"
							help={ __('Numeric value with unit (e.g., 120px, 10rem, 12cqi).', 'artsolio-accent') }
							/>
						) }

						{ attributes.sizeCustomAdvanced && (
							<TextControl
							label={ __('Custom Size (e.g., clamp(80px,10cqi,160px))', 'artsolio-accent') }
							value={ attributes.sizeCustom || '' }
							onChange={ ( raw ) => {
								const v = (raw || '').trim();

								// Live validation: only commit if CSS accepts it as a width value.
								const probe = document.createElement('div');
								probe.style.width = '';
								probe.style.width = v;
								if (v && probe.style.width) {
								setAttributes( { sizeCustom: v } );
								} else {
								// keep the UI field editable, but don’t poison attributes with an invalid value
								setAttributes( { sizeCustom: '' } );
								}
							} }
							help={ __('Accepts any valid CSS length/function (clamp, calc, min/max).', 'artsolio-accent') }
							/>
						) }
						</>
					) }
					</PanelBody>

				<PanelBody title={ __('Offset', 'artsolio-accent') } initialOpen={ false }>
					<ToggleControl
						label={ __('Use separate X/Y offsets', 'artsolio-accent') }
						checked={ !! offsetSplit }
						onChange={ ( v ) => setAttributes( { offsetSplit: v } ) }
					/>
					{ ! offsetSplit && (
						<>
							<SelectControl
								label={ __('Mode', 'artsolio-accent') }
								value={ offsetMode }
								options={[
									{ label: __('Preset', 'artsolio-accent'), value: 'preset' },
									{ label: __('Custom (CSS length)', 'artsolio-accent'), value: 'custom' },
								]}
								onChange={ ( v ) => setAttributes( { offsetMode: v } ) }
							/>
							{ offsetMode === 'preset' && (
								<SelectControl
									label={ __('Offset', 'artsolio-accent') }
									value={ offsetPreset }
									options={ offsetPresetOptions }
									onChange={ ( v ) => {
										const resolved = presets.offset?.[ v ] || '';
										setAttributes( { offsetPreset: v, offsetResolved: resolved } );
									} }
								/>
							) }
							{ offsetMode === 'custom' && (
								<UnitControl
									label={ __('Offset', 'artsolio-accent') }
									value={ offsetCustom || '' }
									onChange={ ( v ) => setAttributes( { offsetCustom: v } ) }
									units={[
										{ value: 'px', label: 'px', default: 16 },
										{ value: 'rem', label: 'rem' },
										{ value: 'em',  label: 'em'  }
									]}
								/>
							) }
						</>
					) }
					{ offsetSplit && (
						<>
							<UnitControl
								label={ __('Offset X (horizontal)', 'artsolio-accent') }
								value={ offsetXCustom || '' }
								onChange={ ( v ) => setAttributes( { offsetXCustom: v, offsetXResolved: v } ) }
								units={[
									{ value: 'px', label: 'px', default: 16 },
									{ value: 'rem', label: 'rem' },
									{ value: 'em',  label: 'em'  }
								]}
							/>
							<UnitControl
								label={ __('Offset Y (vertical)', 'artsolio-accent') }
								value={ offsetYCustom || '' }
								onChange={ ( v ) => setAttributes( { offsetYCustom: v, offsetYResolved: v } ) }
								units={[
									{ value: 'px', label: 'px', default: 16 },
									{ value: 'rem', label: 'rem' },
									{ value: 'em',  label: 'em'  }
								]}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody title={ __('Accessibility', 'artsolio-accent') } initialOpen={ false }>
					<TextControl
						label={ __('Alternative text', 'artsolio-accent') }
						value={ alt || '' }
						onChange={ ( v ) => setAttributes( { alt: v } ) }
						help={ __('Leave empty if this image is decorative.', 'artsolio-accent') }
					/>
				</PanelBody>
			</InspectorControls>

			<figure { ...useBlockProps( blockProps ) } role={ alt ? undefined : 'presentation' }>
				{ url ? (
					<img src={ url } alt={ alt || '' } />
				) : (
					<MediaPlaceholder
						icon="format-image"
						onSelect={ ( media ) => setAttributes( { id: media.id, url: media.url } ) }
						onSelectURL={ ( newURL ) => setAttributes( { id: undefined, url: newURL } ) }
						accept="image/*"
						labels={ { title: __('Accent Image', 'artsolio-accent') } }
					/>
				) }
			</figure>
		</Fragment>
	);
}