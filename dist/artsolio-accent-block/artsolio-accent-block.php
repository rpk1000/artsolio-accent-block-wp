<?php
/**
 * Plugin Name: Artsolio Accent Block
 * Description: Decorative, responsive accent images with corner placement and theme-agnostic anchoring.
 * Author: Artsolio
 * Version: 1.0.0
 * Requires at least: 6.6
 * Requires PHP: 7.4
 * Text Domain: artsolio-accent
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'init', function () {
	$block_dir = __DIR__ . '/blocks/accent';
	if ( file_exists( $block_dir . '/block.json' ) ) {
		register_block_type( $block_dir );
	}
} );

/**
 * Admin (top document) hardening for core media modals.
 * Keeps media modal above the editor iframe and popovers.
 */
add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( $hook !== 'post.php' && $hook !== 'post-new.php' && $hook !== 'site-editor.php' ) return;

	$css = <<<CSS
body.wp-admin .media-modal,
body.wp-admin .components-modal__frame,
body.wp-admin .components-modal__screen-overlay {
	z-index: 160000 !important;
	pointer-events: auto !important;
}
body.wp-admin.modal-open iframe[name="editor-canvas"],
body.wp-admin.modal-open .edit-post-visual-editor iframe,
body.wp-admin.modal-open .block-editor .editor-canvas__iframe {
	pointer-events: none !important;
	z-index: 1 !important;
}
body.wp-admin.modal-open .components-popover { z-index: 150000 !important; }
CSS;

	wp_register_style( 'artsolio-accent-admin-topdoc', false );
	wp_enqueue_style( 'artsolio-accent-admin-topdoc' );
	wp_add_inline_style( 'artsolio-accent-admin-topdoc', $css );
} );