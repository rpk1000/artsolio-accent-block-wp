import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		corner = 'bottom-left',
		hideOnMobile = false,
		sizeValue = '',
		offsetUniform = '',
		offsetX = '',
		offsetY = '',
	} = attributes;

	// image (best-effort keys; we’ll lock to your schema once you can dump attributes)
	const { image, url, imageUrl, imageURL, src, alt, srcset, sizes, width, height } = attributes;
	const imgUrl   = image?.url || url || imageUrl || imageURL || src || '';
	const imgAlt   = (image?.alt ?? alt ?? '') || '';
	const imgW     = image?.width  ?? width  ?? undefined;
	const imgH     = image?.height ?? height ?? undefined;
	const imgSet   = image?.srcset ?? srcset ?? undefined;
	const imgSizes = image?.sizes  ?? sizes  ?? undefined;

	let className = 'artsolio-accent';
	if ( corner ) className += ` is-${ corner }`;
	if ( hideOnMobile ) className += ' is-hidden-mobile';

	const ox = String( (offsetX !== '' ? offsetX : (offsetUniform !== '' ? offsetUniform : 0)) );
	const oy = String( (offsetY !== '' ? offsetY : (offsetUniform !== '' ? offsetUniform : 0)) );

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
		pointerEvents: 'none',
		...sides,
	};

	const imgProps = imgUrl ? {
		src: imgUrl, alt: imgAlt,
		decoding: 'async', loading: 'lazy', fetchpriority: 'low', draggable: 'false',
		width: imgW, height: imgH, srcSet: imgSet, sizes: imgSizes,
	} : null;

	return (
		<figure { ...useBlockProps.save( { className, style } ) }>
			{ imgProps && <img { ...imgProps } /> }
		</figure>
	);
}