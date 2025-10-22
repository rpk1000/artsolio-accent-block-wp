import {
	useBlockProps,
	InspectorControls,
	MediaReplaceFlow,
	MediaPlaceholder,
	BlockControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

const CORNERS = [
	{ label: 'Top Left', value: 'top-left' },
	{ label: 'Top Right', value: 'top-right' },
	{ label: 'Bottom Left', value: 'bottom-left' },
	{ label: 'Bottom Right', value: 'bottom-right' },
];

const CLASS_ANCHOR_A = 'is-accent-anchor';
const CLASS_ANCHOR_B = 'artsolio_is-accent-anchor';

function pickImage(attrs) {
	const url   = attrs?.image?.url || attrs?.url || attrs?.imageUrl || attrs?.imageURL || attrs?.src || '';
	const alt   = (attrs?.image?.alt ?? attrs?.alt ?? '') || '';
	const width = attrs?.image?.width  ?? attrs?.width;
	const height= attrs?.image?.height ?? attrs?.height;
	const srcSet= attrs?.image?.srcset ?? attrs?.srcset;
	const sizes = attrs?.image?.sizes  ?? attrs?.sizes;
	return { url, alt, width, height, srcSet, sizes };
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		corner = 'bottom-left',
		hideOnMobile = false,
		sizeValue = '',
		offsetUniform = '',
		offsetX = '',
		offsetY = '',
		parentAnchoring = false,
	} = attributes;

	const { getBlockRootClientId, getBlock } =
		useSelect( ( select ) => select( 'core/block-editor' ), [] );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const parentId = getBlockRootClientId( clientId );

	const applyParentAnchor = useCallback(
		(enable) => {
			if ( ! parentId ) return;
			const parent = getBlock( parentId );
			if ( ! parent ) return;

			const existing = ( parent.attributes?.className || '' ).split(/\s+/).filter(Boolean);
			const want = [ CLASS_ANCHOR_A, CLASS_ANCHOR_B ];
			const next = enable
				? Array.from( new Set( existing.concat( want ) ) ).join(' ')
				: existing.filter( c => ! want.includes( c ) ).join(' ');

			updateBlockAttributes( parentId, { className: next } );
		},
		[ parentId, getBlock, updateBlockAttributes ]
	);

	// Keep parent classes in sync with the toggle
	if ( parentAnchoring ) applyParentAnchor( true );

	// Resolve offsets
	const ox = String( (offsetX !== '' ? offsetX : (offsetUniform !== '' ? offsetUniform : 0)) );
	const oy = String( (offsetY !== '' ? offsetY : (offsetUniform !== '' ? offsetUniform : 0)) );

	// Authoritative inline sides
	const sides = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };
	switch (corner) {
		case 'top-left':     sides.top = oy;    sides.left = ox;   break;
		case 'top-right':    sides.top = oy;    sides.right = ox;  break;
		case 'bottom-left':  sides.bottom = oy; sides.left = ox;   break;
		default:             sides.bottom = oy; sides.right = ox;  break;
	}

	const style = {
		'--artsolio_accent_size': sizeValue || undefined,
		'--artsolio_accent_z': '12000',
		inlineSize: sizeValue || undefined,
		position: 'absolute',
		zIndex: 'var(--artsolio_accent_z, 12000)',
		// NOTE: no pointerEvents here (removed)
		...sides,
	};

	const className = [
		'artsolio-accent',
		`is-${corner}`,
		hideOnMobile ? 'is-hidden-mobile' : '',
	].filter(Boolean).join(' ');

	const { url, alt, width, height, srcSet, sizes } = pickImage(attributes);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={ !!parentAnchoring }
						onClick={() => {
							const next = !parentAnchoring;
							setAttributes({ parentAnchoring: next });
							applyParentAnchor( next );
						}}
					>
						Anchor to parent
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title="Placement">
					<SelectControl
						label="Corner"
						value={corner}
						options={CORNERS}
						onChange={(value) => setAttributes({ corner: value })}
					/>
					<ToggleControl
						label="Hide on mobile (≤781px)"
						checked={!!hideOnMobile}
						onChange={(v) => setAttributes({ hideOnMobile: !!v })}
					/>
					<ToggleControl
						label="Anchor to parent container"
						checked={!!parentAnchoring}
						onChange={(v) => {
							setAttributes({ parentAnchoring: !!v });
							applyParentAnchor( !!v );
						}}
					/>
				</PanelBody>

				<PanelBody title="Offsets" initialOpen={false}>
					<TextControl
						label="Uniform offset"
						help="Any CSS length (px, rem, em, vw, cqi, clamp(), calc())"
						value={offsetUniform}
						onChange={(value) => setAttributes({ offsetUniform: value })}
						placeholder="e.g. 16px or 1rem"
					/>
					<TextControl
						label="Offset X (overrides uniform)"
						value={offsetX}
						onChange={(value) => setAttributes({ offsetX: value })}
						placeholder="e.g. 16px"
					/>
					<TextControl
						label="Offset Y (overrides uniform)"
						value={offsetY}
						onChange={(value) => setAttributes({ offsetY: value })}
						placeholder="e.g. 16px"
					/>
				</PanelBody>

				<PanelBody title="Size" initialOpen={false}>
					<TextControl
						label="Inline size"
						help="CSS length or function (px/rem/em/vw/cqi/clamp()/calc())"
						value={sizeValue}
						onChange={(value) => setAttributes({ sizeValue: value })}
						placeholder="e.g. clamp(8rem, 10vw, 16rem)"
					/>
				</PanelBody>
			</InspectorControls>

			<figure {...useBlockProps({ className, style })}>
				{ url ? (
					<>
						<MediaReplaceFlow
							mediaId={attributes.id || attributes.imageId || attributes.mediaId}
							mediaURL={url}
							accept="image/*"
							onSelect={(media) => setAttributes({ image: media, url: media?.url })}
						/>
						<img
							src={url}
							alt={alt}
							decoding="async"
							loading="lazy"
							draggable="false"
							width={width}
							height={height}
							srcSet={srcSet}
							sizes={sizes}
						/>
					</>
				) : (
					<MediaPlaceholder
						icon="format-image"
						onSelect={(media) => setAttributes({ image: media, url: media?.url })}
						accept="image/*"
						allowedTypes={[ 'image' ]}
						labels={{ title: 'Accent image' }}
					/>
				)}
			</figure>
		</>
	);
}