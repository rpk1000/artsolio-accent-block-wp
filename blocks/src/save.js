import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		url, alt,
		corner,
		sizeMode, sizeCustom, sizeResolved,
		offsetSplit, offsetMode, offsetCustom, offsetResolved,
		offsetXCustom, offsetYCustom, offsetXResolved, offsetYResolved,
		hideOnMobile
	} = attributes;

	const classes = [
		'wp-block-artsolio-accent',
		`is-${ corner }`,                // classes now mirror UI
		hideOnMobile ? 'is-hidden-mobile' : '',
	].filter(Boolean).join(' ');

	const style = {};
	// Size
	if ( sizeMode === 'custom' && sizeCustom ) {
		style['--artsolio_accent_size'] = sizeCustom;
	} else if ( sizeResolved ) {
		style['--artsolio_accent_size'] = sizeResolved;
	}
	// Offset(s)
	if ( offsetSplit ) {
		const ox = offsetXCustom || offsetXResolved;
		const oy = offsetYCustom || offsetYResolved;
		if ( ox ) style['--artsolio_offset_x'] = ox;
		if ( oy ) style['--artsolio_offset_y'] = oy;
	} else {
		if ( offsetMode === 'custom' && offsetCustom ) {
			style['--artsolio_accent_offset'] = offsetCustom;
		} else if ( offsetResolved ) {
			style['--artsolio_accent_offset'] = offsetResolved;
		}
	}

	const blockProps = useBlockProps.save( { className: classes, style } );

	return (
		<figure { ...blockProps } role={ alt ? undefined : 'presentation' }>
			{ url && <img src={ url } alt={ alt || '' } loading="lazy" decoding="async" /> }
		</figure>
	);
}