# Artsolio Accent Block

Decorative, responsive accent images using container-based sizing and CSS variables. Compatible with Core and Kadence sections.

* **Block name:** `artsolio/accent`
* **CSS scope:** `.wp-block-artsolio-accent` with namespaced helpers (`artsolio_…`)
* **No frontend JS** (static save). Parent helpers are class toggles on the wrapper.

## CONTENTS
1. Features
2. Installation
3. Use
4. Presets (PHP Filters)
5. Core Group Variation (enable/diable)
6. Accessibility
7. Performance & Security
8. Troubleshooting
9. Changelog

## Features

* Corner placement (Top/Right/Bottom/Left).
* **Size & Offset**: Presets (XS–XL) or **Custom** values (e.g., `clamp(80px,10cqi,160px)`).
* **Parent Anchoring** toggles: add/remove `is-accent-anchor artsolio_is-accent-anchor` and (optional) `has-accent-gutter artsolio_has-accent-gutter`.
* **Alt text helper**: “Leave empty if this image is decorative.”
* **Optional Core Group variation**: **“Accent Section (WP Core)”** (can be turned on/off by a PHP constant).

---

## Installation

1. Copy the `artsolio-accent-block/` folder into `wp-content/plugins/`.
2. In your terminal (from the plugin root), run:

   ```bash
   npm install
   npm run build
   ```
3. WP Admin → **Plugins** → activate **Artsolio Accent Block**.

---

## Using the Accent Image Block

1. Insert a **Core Group/Columns** or **Kadence Row/Section** for the section you’re decorating.
2. Insert **Accent Image** inside that section.
3. In the sidebar:

   * Choose **Corner**.
   * Set **Size**/**Offset** using **Presets** or **Custom** values.
   * Toggle **Parent Anchoring** (adds anchor/gutter classes to the immediate parent).
   * Optionally toggle **Hide on Mobile (≤ 781px)**.
   * **Alt text**: leave empty if decorative (recommended), or provide meaningful text if informative.

---

## Presets (PHP Filters)

Override presets globally without touching JS:

```php
// e.g., in functions.php or an mu-plugin:
add_filter( 'artsolio_accent_size_presets', function( $sizes ) {
    $sizes['M']  = 'clamp(84px, 11cqi, 172px)';
    $sizes['XXL'] = 'clamp(128px, 22cqi, 320px)';
    return $sizes;
});

add_filter( 'artsolio_accent_offset_presets', function( $offsets ) {
    $offsets['M'] = '0.875rem';
    return $offsets;
});
```

These values are passed into the editor automatically via a small config handle and used by the block’s controls.

---

## Core Group Variation: “Accent Section (WP Core)”

A convenience **variation of Core → Group** that’s preconfigured as an accent anchor.

* **What it adds:**
  `is-accent-anchor artsolio_is-accent-anchor has-accent-gutter artsolio_has-accent-gutter`
* **Where you’ll see it:** Inserter → Group variations → **Accent Section (WP Core)**.

### Enable/Disable the Variation (PHP Constant)

This setting is **code-based (developer-controlled)**—there is **no UI switch**. It’s read at plugin init and mirrored to the editor so the variation registers (or not).

**Default:** enabled.

**Disable globally** (add before the plugin loads, e.g., in `wp-config.php` or an mu-plugin):

```php
define( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION', false );
```

**Re-enable:**

```php
define( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION', true );
```

> **Notes**
>
> * If the constant is **undefined**, the plugin defaults to **enabled**.
> * This only affects the Core Group variation. The **Accent Image** block and **Parent Anchoring** toggles still work everywhere (Core, Kadence, mixed).

### Verify It’s Working

* **Enabled:** In the Inserter, search for **Accent Section (WP Core)** under Group → Variations.
* **Disabled:** That variation will **not** appear. Use any Group/Row and the **Parent Anchoring** toggles in the Accent block instead.

---

## Accessibility

* Decorative images: leave **Alt text** empty → the block outputs `alt=""` and `role="presentation"`.
* If the image conveys information, provide a short, meaningful **Alt text** and we’ll omit the `role`.

---

## Performance & Security

* **No frontend JS**; static `save()` markup; CSS variables drive sizing/offset.
* **Assets via `block.json`**: styles load only where the block is present.
* **Lazy-load images** with `loading="lazy"` and `decoding="async"`.
* Plugin bootstrap guards (`ABSPATH` check), minimal PHP surface, and JSON-encoded inline config.

---

## Troubleshooting

* **Parent not updating classes?** Ensure the Accent block is **inside** a Group/Row that supports the `className` attribute and isn’t template-locked. If locked, add classes manually in the parent’s **Advanced → Additional CSS Classes**.
* **Variation missing while enabled?** Confirm the constant is set **before** plugin load; clear caches and reload the editor.

---

## Changelog

**1.0.0**

* Initial release with Accent Image block, parent anchoring toggles, presets + custom values, a11y helper, and optional Core Group variation with code-based enable/disable.
