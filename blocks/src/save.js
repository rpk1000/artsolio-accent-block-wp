import { useBlockProps } from '@wordpress/block-editor';

const pickImage = (attrs = {}) => {
	const url    = attrs?.image?.url || attrs?.url || '';
	const alt    = attrs?.image?.alt ?? attrs?.alt ?? '';
	const width  = attrs?.image?.width  ?? attrs?.width;
	const height = attrs?.image?.height ?? attrs?.height;
	const srcSet = attrs?.image?.srcset ?? attrs?.srcset;
	const sizes  = attrs?.image?.sizes  ?? attrs?.sizes;
	return { url, alt, width, height, srcSet, sizes };
};

export default function save( { attributes } ) {
	const {
		corner = 'bottom-left',
		hideOnMobile = false,
		sizeValue = '',
		offsetUniform = '',
		offsetX = '',
		offsetY = '',
		image,
		url,
	} = attributes;

	const ox = String( offsetX !== '' ? offsetX : ( offsetUniform !== '' ? offsetUniform : 0 ) );
	const oy = String( offsetY !== '' ? offsetY : ( offsetUniform !== '' ? offsetUniform : 0 ) );

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
		<figure {...useBlockProps.save({ className, style })}>
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
					/* Force the image to follow the figure’s inline-size */
					style={{
					display: 'block',
					width: '100%',
					maxWidth: '100%',
					height: 'auto'
					}}
				/>
			) : null}
		</figure>
	);
}