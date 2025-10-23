import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	MediaReplaceFlow,
	MediaPlaceholder,
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
	{ label: 'Position A', value: 'top-left' },
	{ label: 'Position B', value: 'top-right' },
	{ label: 'Position C', value: 'bottom-left' },
	{ label: 'Position D', value: 'bottom-right' },
];

const LAYERS = [
	{ label: 'Auto', value: 0 },
	{ label: 'Lift', value: 1 },
	{ label: 'High', value: 2 },
	{ label: 'Higher', value: 3 },
	{ label: 'Max', value: 4 },
];

const CLASS_ANCHOR_A = 'is-accent-anchor';
const CLASS_ANCHOR_B = 'artsolio_is-accent-anchor';
const LAYER_CLASSES = ['artsolio-layer-0','artsolio-layer-1','artsolio-layer-2','artsolio-layer-3','artsolio-layer-4'];

const pickImage = (attrs = {}) => {
	const url    = attrs?.image?.url || attrs?.url || '';
	const alt    = attrs?.image?.alt ?? attrs?.alt ?? '';
	const width  = attrs?.image?.width  ?? attrs?.width;
	const height = attrs?.image?.height ?? attrs?.height;
	const srcSet = attrs?.image?.srcset ?? attrs?.srcset;
	const sizes  = attrs?.image?.sizes  ?? attrs?.sizes;
	return { url, alt, width, height, srcSet, sizes };
};

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		corner = 'bottom-left',
		hideOnMobile = false,
		sizeValue = '',
		offsetUniform = '',
		offsetX = '',
		offsetY = '',
		parentAnchoring = false,
		anchorLayer = 0,
		image,
		url,
	} = attributes;

	const { getBlockRootClientId, getBlock } =
		useSelect( ( select ) => select( 'core/block-editor' ), [] );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const parentId = getBlockRootClientId( clientId );

	const syncParentClasses = useCallback( (enable, layer) => {
		if ( ! parentId ) return;
		const parent = getBlock( parentId );
		if ( ! parent ) return;

		const existing = ( parent.attributes?.className || '' )
			.split(/\s+/).filter(Boolean);

		// remove any prior layer classes
		const withoutLayer = existing.filter( c => ! LAYER_CLASSES.includes(c) );
		let next = withoutLayer;

		if ( enable ) {
			next = Array.from( new Set(
				next.concat([ CLASS_ANCHOR_A, CLASS_ANCHOR_B, `artsolio-layer-${layer}` ])
			) );
		} else {
			// remove anchor classes when disabling
			next = withoutLayer.filter( c => c !== CLASS_ANCHOR_A && c !== CLASS_ANCHOR_B );
		}

		updateBlockAttributes( parentId, { className: next.join(' ') } );
	}, [ parentId, getBlock, updateBlockAttributes ] );

	// Keep parent in sync while toggle is on (and when layer changes)
	if ( parentAnchoring ) {
		syncParentClasses( true, anchorLayer );
	}

	// Resolve offsets as strings (accept clamp()/calc())
	const ox = String( offsetX !== '' ? offsetX : ( offsetUniform !== '' ? offsetUniform : 0 ) );
	const oy = String( offsetY !== '' ? offsetY : ( offsetUniform !== '' ? offsetUniform : 0 ) );

	// Corner → inline sides
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
		...sides,
	};

	const className = [
		'artsolio-accent',
		`is-${corner}`,
		hideOnMobile ? 'is-hidden-mobile' : '',
	].filter(Boolean).join(' ');

	const img = pickImage({ image, url });

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={ !!parentAnchoring }
						onClick={() => {
							const next = !parentAnchoring;
							setAttributes({ parentAnchoring: next });
							syncParentClasses( next, anchorLayer );
						}}
					>
						Anchor to parent
					</ToolbarButton>
					{ img.url && (
						<MediaReplaceFlow
							mediaId={attributes.id || attributes.imageId || attributes.mediaId}
							mediaURL={img.url}
							accept="image/*"
							onSelect={(media) => setAttributes({ image: media, url: media?.url })}
						/>
					) }
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
							syncParentClasses( !!v, anchorLayer );
						}}
					/>
				</PanelBody>

				<PanelBody title="Layer (Z-index)" initialOpen={false}>
					<SelectControl
						label="Lift over neighbors"
						value={String(anchorLayer)}
						options={LAYERS.map(o => ({ label: o.label, value: String(o.value) }))}
						onChange={(val) => {
							const layer = Number(val);
							setAttributes({ anchorLayer: layer });
							if ( parentAnchoring ) syncParentClasses( true, layer );
						}}
						help="Applies artsolio-layer-N to the parent (sets --artsolio_anchor_z). The accent renders at +1."
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
				{ img.url ? (
					<img
						src={img.url}
						alt={img.alt}
						decoding="async"
						loading="lazy"
						draggable="false"
						width={img.width}
						height={img.height}
						srcSet={img.srcSet}
						sizes={img.sizes}
						style={{ display:'block', width:'100%', maxWidth:'100%', height:'auto' }}
					/>
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