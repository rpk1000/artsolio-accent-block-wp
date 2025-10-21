<?php
/**
 * Plugin Name:  Artsolio Accent Block
 * Description:  Position decorative accent images responsively with container-based sizing. Core/Kadence compatible.
 * Version:      1.0.0
 * Requires PHP: 8.0
 * Requires at least: 6.6
 * Author:       Artsolio
 * License:      GPL-2.0-or-later
 * Text Domain:  artsolio-accent
 */

defined('ABSPATH') || exit;

const ARTSOLIO_ACCENT_VERSION = '1.0.0';
const ARTSOLIO_ACCENT_SLUG    = 'artsolio-accent-block';

/**
 * Allow developers to disable the Core Group variation via code.
 * Define in wp-config.php or a must-use plugin BEFORE this plugin loads:
 *
 *   define( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION', false );
 */
if ( ! defined( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION' ) ) {
	define( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION', true );
}

/**
 * Default size and offset presets (filterable).
 */
function artsolio_accent_get_default_presets() : array {
	$size = array(
		'XS' => 'clamp(56px, 7cqi, 96px)',
		'S'  => 'clamp(64px, 9cqi, 120px)',
		'M'  => 'clamp(80px, 12cqi, 160px)',
		'L'  => 'clamp(96px, 15cqi, 200px)',
		'XL' => 'clamp(112px, 18cqi, 240px)',
	);
	$offset = array(
		'XS' => '0.25rem',
		'S'  => '0.5rem',
		'M'  => '0.75rem',
		'L'  => '1rem',
		'XL' => '1.5rem',
	);

	$size   = apply_filters( 'artsolio_accent_size_presets', $size );
	$offset = apply_filters( 'artsolio_accent_offset_presets', $offset );

	return array(
		'size'   => $size,
		'offset' => $offset,
	);
}

/**
 * Register a tiny editor config script (handle only) so block.json can list it by handle.
 * We then inject preset data and the variation flag via inline script before it runs.
 */
function artsolio_accent_register_editor_config_script() {
	$handle = 'artsolio-accent-editor-config';
	wp_register_script( $handle, '', array(), ARTSOLIO_ACCENT_VERSION, true );

	$presets = artsolio_accent_get_default_presets();

	$config = array(
		'size'                     => $presets['size'],
		'offset'                   => $presets['offset'],
		'enableCoreGroupVariation' => (bool) ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION,
	);

	$inline = 'window.artsolioAccentPresetConfig = ' . wp_json_encode(
		$config,
		JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
	) . ';';

	wp_add_inline_script( $handle, $inline, 'before' );
}
add_action( 'init', 'artsolio_accent_register_editor_config_script' );

/**
 * Register the block from metadata.
 */
function artsolio_accent_register_block() {
	register_block_type( __DIR__ . '/blocks/accent' );
}
add_action( 'init', 'artsolio_accent_register_block' );