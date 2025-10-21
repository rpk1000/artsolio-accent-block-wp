import { registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Be resilient: default to true if the flag isn't present yet.
const cfg = window.artsolioAccentPresetConfig || {};
const enabled = typeof cfg.enableCoreGroupVariation === 'boolean' ? cfg.enableCoreGroupVariation : true;

if ( enabled ) {
	registerBlockVariation( 'core/group', {
		name: 'artsolio-accent-section',
		title: __('Accent Section (WP Core)', 'artsolio-accent'),
		description: __('A Group preconfigured as an anchor for Accent Image blocks.', 'artsolio-accent'),
		icon: 'layout',
		attributes: {
			className: 'is-accent-anchor artsolio_is-accent-anchor has-accent-gutter artsolio_has-accent-gutter'
		},
		scope: [ 'inserter', 'transform' ],
	} );
}