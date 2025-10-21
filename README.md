Here’s an updated, drop-in **README.md** that reflects everything we’ve built and the latest changes (no “Accent Gutter,” UI labels match output classes, independent X/Y offsets, advanced `clamp()` mode, build/zip instructions, and the Core Group variation flag).

---

# Artsolio Accent Block

Decorative, responsive accent images using container-based sizing and CSS variables. Works in **Core** and **Kadence** sections (and mixed environments). No frontend JS.

* **Block name:** `artsolio/accent`
* **CSS scope:** `.wp-block-artsolio-accent` (+ namespaced helpers: `artsolio_*`)
* **Output is static** (`save()`), styles provided via `block.json` enqueues

## Contents

1. Features
2. Requirements
3. Install & Build
4. How to Use
5. Controls (UI reference)
6. Presets (PHP filters)
7. Optional: Core Group Variation
8. CSS Reference
9. Accessibility
10. Performance & Security
11. Troubleshooting
12. Release workflow
13. Changelog

---

## 1) Features

* **Corner placement** with intuitive classes that match the UI:

  * `is-top-left`, `is-top-right`, `is-bottom-left`, `is-bottom-right`
* **Size**

  * **Presets** (XS–XL), or **Custom**
  * Custom supports **Simple unit picker** (px/rem/em/vw/cqi) and **Advanced** free-text (`clamp()/calc()` etc.)
* **Offset**

  * **Uniform** (one value) or **Split X/Y** (independent horizontal/vertical)
  * Positive values move **inward** from the chosen corner (consistent mental model)
* **Hide on mobile** (≤ 781px)
* **Parent anchoring**: one-toggle helper to mark the parent container as an anchor
* **No frontend JS**; editor convenience only
* **Cross-compatible** with Core/Kadence containers (Group/Row/Columns)

> Removed: “Add Accent Gutter to parent” feature (and related classes). Keep your layout spacing in theme styles or per-section CSS.

---

## 2) Requirements

* WordPress 6.6+ (Gutenberg included)
* Node 18+ (LTS recommended)
* PHP 7.4+ (PHP 8.x compatible)

---

## 3) Install & Build

From the plugin root:

```powershell
npm install
npm run build
```

Install/activate in WP Admin → **Plugins**.

### Create a distributable ZIP

```powershell
npm run zip
```

This creates: `dist/artsolio-accent-block-1.0.0.zip` (version based on `package.json` and plugin header).

---

## 4) How to Use

1. Insert a **Core Group/Columns** (or any section wrapper).
2. Insert **Accent Image** inside that container.
3. In **Placement**:

   * Choose **Corner** (the figure’s class matches the label, e.g., `is-top-right`).
   * Optionally **Hide on Mobile**.
4. In **Size**:

   * Choose a **Preset** (XS–XL), or **Custom**.
   * For **Custom**:

     * **Simple**: numeric + unit (px/rem/em/vw/cqi), or
     * **Advanced**: paste a valid CSS value, e.g. `clamp(96px, 15cqi, 200px)`.
5. In **Offset**:

   * Leave **Use separate X/Y** OFF for a single offset.
   * Turn it ON to control **Offset X** (left/right) and **Offset Y** (top/bottom) independently.
6. **Parent anchoring**:

   * Toggle **Mark parent as Accent Anchor** to position relative to the container.
7. **Accessibility**:

   * If decorative, leave **Alt text** empty (the block outputs `alt=""` + `role="presentation"`).
   * If informative, supply meaningful alt.

---

## 5) Controls (UI reference)

* **Corner** → adds one of: `is-top-left`, `is-top-right`, `is-bottom-left`, `is-bottom-right`
* **Size**

  * Preset (XS–XL) → resolves to a concrete string (e.g., `clamp(112px, 18cqi, 240px)`)
  * Custom (Simple) → writes a value like `180px`, `10rem`, `12cqi`
  * Custom (Advanced) → validates and writes a CSS string (`clamp`, `calc`, `min`, `max`)
* **Offset**

  * Uniform → sets `--artsolio_accent_offset`
  * Split X/Y → sets `--artsolio_offset_x` and `--artsolio_offset_y`
* **Hide on Mobile** → adds `is-hidden-mobile`
* **Mark parent as Accent Anchor** → adds to parent: `is-accent-anchor artsolio_is-accent-anchor`

---

## 6) Presets (PHP filters)

Override globally without changing JS:

```php
// functions.php or an mu-plugin:

add_filter( 'artsolio_accent_size_presets', function ( $sizes ) {
    // Keys are labels shown in the UI (XS,S,M,L,XL,...)
    $sizes['M']  = 'clamp(84px, 11cqi, 172px)';
    $sizes['XL'] = 'clamp(128px, 22cqi, 320px)';
    return $sizes;
});

add_filter( 'artsolio_accent_offset_presets', function ( $offsets ) {
    $offsets['M'] = '0.875rem';
    $offsets['XL'] = '1.5rem';
    return $offsets;
});
```

These values are injected into the editor via a small config handle and saved as **resolved strings** in block attributes so the editor and frontend match.

---

## 7) Optional: Core Group Variation

A convenience variation of **Core → Group** named **“Accent Section (WP Core)”** that pre-marks the container as an anchor.

* Where: Inserter → **Group** → Variations
* What it does: adds `is-accent-anchor artsolio_is-accent-anchor` on insert

### Enable/Disable (developer setting)

This is a **code-based** switch (no UI), read at plugin init and mirrored into the editor.

* **Default:** enabled
* Disable (e.g., in `wp-config.php` or an mu-plugin), **before** the plugin loads:

```php
define( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION', false );
```

* Re-enable:

```php
define( 'ARTSOLIO_ACCENT_ENABLE_CORE_GROUP_VARIATION', true );
```

> If the constant is **undefined**, the variation defaults to **enabled**.

---

## 8) CSS Reference

**Anchor the parent** (added by the toggle or manually):

```css
.is-accent-anchor,
.artsolio_is-accent-anchor { position: relative !important; }
```

**Accent figure (absolute, floating, z-stacked):**

```css
.wp-block-artsolio-accent {
  position: absolute !important;
  inline-size: var(--artsolio_accent_size, clamp(96px, 15cqi, 200px));
  aspect-ratio: 1;
  pointer-events: none;
  z-index: 10;

  /* Reset old sides and theme centering helpers */
  top: auto !important; right: auto !important; bottom: auto !important; left: auto !important;
  margin: 0 !important; transform: none !important;
}

@media (max-width: 781px) {
  .wp-block-artsolio-accent.is-hidden-mobile { display: none !important; }
}

.wp-block-artsolio-accent img {
  display: block !important;
  width: 100% !important; height: auto !important;
  border-radius: var(--artsolio_accent_radius, 0);
}
```

**Corner mappings**
(If your theme/environment inverts vertical sides, you can swap the `top`/`bottom` pairs here only; markup stays intuitive.)

```css
/* top-left */
.is-accent-anchor  > .wp-block-artsolio-accent.is-top-left,
.artsolio_is-accent-anchor > .wp-block-artsolio-accent.is-top-left {
  /* If your stack flips vertical, change to bottom:left */
  top:  calc(var(--artsolio_offset_y, var(--artsolio_accent_offset, 0.75rem))) !important;
  left: calc(var(--artsolio_offset_x, var(--artsolio_accent_offset, 0.75rem))) !important;
}

/* top-right */
.is-accent-anchor  > .wp-block-artsolio-accent.is-top-right,
.artsolio_is-accent-anchor > .wp-block-artsolio-accent.is-top-right {
  top:   calc(var(--artsolio_offset_y, var(--artsolio_accent_offset, 0.75rem))) !important;
  right: calc(var(--artsolio_offset_x, var(--artsolio_accent_offset, 0.75rem))) !important;
}

/* bottom-left */
.is-accent-anchor  > .wp-block-artsolio-accent.is-bottom-left,
.artsolio_is-accent-anchor > .wp-block-artsolio-accent.is-bottom-left {
  bottom: calc(var(--artsolio_offset_y, var(--artsolio_accent_offset, 0.75rem))) !important;
  left:   calc(var(--artsolio_offset_x, var(--artsolio_accent_offset, 0.75rem))) !important;
}

/* bottom-right */
.is-accent-anchor  > .wp-block-artsolio-accent.is-bottom-right,
.artsolio_is-accent-anchor > .wp-block-artsolio-accent.is-bottom-right {
  bottom: calc(var(--artsolio_offset_y, var(--artsolio_accent_offset, 0.75rem))) !important;
  right:  calc(var(--artsolio_offset_x, var(--artsolio_accent_offset, 0.75rem))) !important;
}
```

**CSS variables you’ll see inline (per block):**

* `--artsolio_accent_size` → width (via `inline-size`)
* `--artsolio_accent_offset` → uniform offset (when split OFF)
* `--artsolio_offset_x`, `--artsolio_offset_y` → independent axes (when split ON)
* Optional: `--artsolio_accent_radius` → rounds the image

---

## 9) Accessibility

* **Decorative**: leave **Alt text** empty → `alt=""` + `role="presentation"`.
* **Informational**: provide concise alt; no extra ARIA needed.

---

## 10) Performance & Security

* **0 KB frontend JS**; static markup; CSS variables drive rendering.
* Styles enqueued via `block.json` → load only where used.
* Images include `loading="lazy"` and `decoding="async"`.
* PHP bootstrap guards (`ABSPATH` check), small attack surface, editor config passed safely.

---

## 11) Troubleshooting

* **Block doesn’t “float” in the editor**
  Hard refresh the Site Editor (Ctrl/Cmd+Shift+R). Ensure you didn’t paste global CSS that resets absolute positioning.
* **Accent positions relative to the page, not the section**
  Toggle **Mark parent as Accent Anchor**. Or manually add `is-accent-anchor artsolio_is-accent-anchor` to the container’s **Additional CSS classes**.
* **Corner appears inverted**
  Your theme might flip logical/physical sides. Adjust only the **Corner mappings** in `style.css` to swap `top`/`bottom` pairs as needed.
* **Advanced size (clamp/calc) not applying**
  Ensure **Size → Mode = Custom** and the value is valid CSS. The editor only saves valid values (live validation).

---

## 12) Release workflow

* Bump versions in `package.json` and plugin header.
* Build & zip:

  ```powershell
  npm run build
  npm run zip
  ```
* Tag & release (example):

  ```powershell
  git tag -a v1.0.0 -m "Stable: presets + X/Y offsets + anchor"
  git push origin v1.0.0
  ```
* Attach the ZIP in GitHub **Releases** (or distribute via wp-admin upload).

---

## 13) Changelog

**1.0.0**

* Accent Image block with:

  * Corner classes matching UI (`is-top-right`, etc.)
  * Size presets + Custom (Simple units or Advanced `clamp()/calc()`)
  * Offset presets + Custom (Uniform or independent X/Y)
  * Hide on mobile
  * Parent anchor toggle
* Optional **Core Group variation** (“Accent Section (WP Core)”) with code-based enable/disable
* Removed “Accent Gutter” feature (manage layout spacing in theme CSS)