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

/** Register the block from block.json */
add_action( 'init', function () {
	$block_dir = __DIR__ . '/blocks/accent';
	if ( file_exists( $block_dir . '/block.json' ) ) {
		register_block_type( $block_dir );
	}
} );

/**
 * Editor hardening (inside the iframe)
 * - Keep the floating accent non-interactive; block UI clickable.
 * - When the inline MEDIA PLACEHOLDER is visible, raise it above Kadence stacks
 *   and prevent clipping/overlays from stealing clicks (neutralize known wrappers).
 * - Keep Gutenberg modals on top (harmless if not present).
 */
add_action( 'enqueue_block_editor_assets', function () {
	$css = <<<CSS
/* === Artsolio Accent — Editor-only (iframe) === */

/* Only the floating accent figure should be non-interactive; block UI stays clickable */
.editor-styles-wrapper .wp-block-artsolio-accent .artsolio-accent,
.editor-styles-wrapper .wp-block-artsolio-accent .artsolio-accent * {
  pointer-events: none !important;
}
.editor-styles-wrapper .wp-block-artsolio-accent { pointer-events: auto !important; }

/* Ensure anchor containers behave in editor */
.editor-styles-wrapper .artsolio_is-accent-anchor,
.editor-styles-wrapper .is-accent-anchor {
  position: relative !important;
}

/* ---------- Inline placeholder visible: raise it and unclip surroundings ---------- */

/* 0) Create a high stacking context on our block WHILE the placeholder exists */
.editor-styles-wrapper .wp-block-artsolio-accent:has(.block-editor-media-placeholder) {
  position: relative !important;
  isolation: isolate;
  z-index: 120000 !important;
  overflow: visible !important;
}

/* 1) The actual placeholder UI should sit above everything and be clickable */
.editor-styles-wrapper .wp-block-artsolio-accent .block-editor-media-placeholder {
  position: relative !important;
  z-index: 120010 !important;
  pointer-events: auto !important;
}

/* 2) Prevent clipping on common editor roots while the placeholder is visible */
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder),
.block-editor-block-list__layout:has(.wp-block-artsolio-accent .block-editor-media-placeholder),
.block-editor-writing-flow:has(.wp-block-artsolio-accent .block-editor-media-placeholder),
.is-root-container:has(.wp-block-artsolio-accent .block-editor-media-placeholder) {
  overflow: visible !important;
}

/* 3) Neutralize Kadence wrappers ONLY while the placeholder is present.
      These classnames match your DOM: .kadence-inner-column-inner, kt-animation-wrap, etc. */
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kadence-inner-column-inner,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kt-animation-wrap,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kadence-inner-column-direction-vertical,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kadence-inner-column-direction-vertical-reverse,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kb-row-layout-wrap,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kt-row-column-wrap,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kt-inside-inner-col,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kt-row-layout-inner,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kt-row-layout-overlay,
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .kb-row-layout-overlay {
  transform: none !important;
  filter: none !important;
  -webkit-backface-visibility: visible !important;
  backface-visibility: visible !important;
  /* Drop their z-index below our placeholder during selection/upload */
  z-index: 0 !important;
}

/* 4) Sometimes the outer block wrapper (block-list__block) gets raised.
      Push siblings below ONLY while the placeholder is visible. */
.editor-styles-wrapper:has(.wp-block-artsolio-accent .block-editor-media-placeholder) .block-editor-block-list__block {
  z-index: 0 !important;
}

/* Keep Gutenberg modals on top inside the editor iframe (safe no-op when none) */
.block-editor-page .components-modal__frame,
.block-editor-page .components-modal__screen-overlay {
  z-index: 200000 !important;
}
CSS;

	if ( wp_style_is( 'wp-edit-blocks', 'registered' ) ) {
		wp_add_inline_style( 'wp-edit-blocks', $css );
	} else {
		wp_add_inline_style( 'wp-block-library', $css );
	}
} );

/**
 * Admin (top document) hardening — unchanged
 */
add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( $hook !== 'post.php' && $hook !== 'post-new.php' && $hook !== 'site-editor.php' ) return;

	$css = <<<CSS
/* --- Artsolio Accent — Admin (top document) --- */
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