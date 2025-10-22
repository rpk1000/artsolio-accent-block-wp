# Artsolio Accent Block

Decorative, responsive accent images using container-based sizing and CSS variables. Works in **Core** and **Kadence** layouts (and mixed environments). **No frontend JS.**

* **Block name:** `artsolio/accent`
* **CSS scope:** `.wp-block-artsolio-accent` (+ helper classes prefixed `artsolio_`)
* **Render:** static markup via `save()`; styles enqueued from `block.json`

## Contents

1. Features
2. Requirements
3. Install & Build
4. Usage (best practices)
5. Block Controls
6. CSS & Variables
7. Accessibility
8. Performance & Security
9. Troubleshooting
10. Release workflow
11. Changelog

---

## 1) Features

* **Corner placement** with classes that match the UI:

  * `is-top-left`, `is-top-right`, `is-bottom-left`, `is-bottom-right`
* **Size**

  * Presets (XS–XL)
  * **Custom**: Simple units (px/rem/em/vw/cqi) or **Advanced** CSS (`clamp()`, `calc()`, etc.)
* **Offsets**

  * **Uniform** offset or **Split X/Y** (independent axes)
  * Positive values move **inward** from the chosen corner
* **Hide on mobile** (≤ 781px)
* **Anchor to parent** toggle: marks the immediate parent as the containing block and stacking context
* **Editor hardening**: upload placeholder reliably clickable in Kadence/Core editors

Removed in v1.0: **Accent Gutter** feature and the old **Core Group variation** (see Changelog).

---

## 2) Requirements

* WordPress **6.6+**
* Node **18+** (LTS)
* PHP **7.4+** (PHP 8.x OK)

---

## 3) Install & Build

From the plugin root:

```bash
npm install
npm run build
```

Optional distributable ZIP:

```bash
npm run zip
# dist/artsolio-accent-block-<version>.zip
```

Upload/activate in **Plugins**.

---

## 4) Usage (best practices)

1. Insert the **Accent Image** **inside the container you want to anchor to** (e.g., the same Group/Section/Column as your content).
   – Avoid empty, zero-height wrappers.
2. In the block sidebar:

   * Set **Corner** and **Offsets/Size** as needed.
   * Toggle **Anchor to parent container** ON (recommended).
     This adds `is-accent-anchor artsolio_is-accent-anchor` to the parent.
3. If you need the accent above heavy overlays, set on the parent’s “Additional CSS”:

   ```css
   --artsolio_anchor_z: 20000;
   ```

   The figure renders at `anchor_z + 1`.

> The stylesheet also includes a `:has(.artsolio-accent)` fallback that lifts common containers automatically. The toggle remains the **explicit, deterministic** anchor.

---

## 5) Block Controls

* **Placement → Corner**
  Adds one of: `is-top-left`, `is-top-right`, `is-bottom-left`, `is-bottom-right`.
* **Hide on mobile (≤781px)**
  Adds `is-hidden-mobile`.
* **Size**

  * **Preset** (XS–XL) → resolves to a concrete CSS value
  * **Custom**

    * **Simple** units (px/rem/em/vw/cqi)
    * **Advanced** free text (validated) e.g. `clamp(8rem, 10vw, 16rem)`
* **Offsets**

  * **Uniform** → single inward offset
  * **Split X/Y** → `Offset X` and `Offset Y` independently
* **Anchor to parent container**
  Adds `is-accent-anchor artsolio_is-accent-anchor` to the **immediate parent**.

---

## 6) CSS & Variables

**Figure inline styles (source of truth):**

* Sets `position:absolute`, `z-index: var(--artsolio_accent_z, 12000)`, and **sides inline** (`top/right/bottom/left`) based on Corner + Offsets.
* Width via `inline-size: var(--artsolio_accent_size)`.

**Anchor container (when toggle is ON, or via fallback):**

```css
.is-accent-anchor,
.artsolio_is-accent-anchor {
  position: relative !important;
  isolation: isolate;
  z-index: var(--artsolio_anchor_z, 12000) !important;
}
```

**Variables you’ll see:**

* `--artsolio_accent_size` → width (used by `inline-size`)
* `--artsolio_accent_offset` → uniform offset
* `--artsolio_offset_x`, `--artsolio_offset_y` → split axes
* `--artsolio_anchor_z` → per-instance stacking baseline for the **parent**
* Figure’s effective z-index is `calc(var(--artsolio_anchor_z, 12000) + 1)`

**Mobile:**

```css
@media (max-width: 781px) {
  .artsolio-accent.is-hidden-mobile,
  .wp-block-artsolio-accent.is-hidden-mobile { display: none !important; }
}
```

---

## 7) Accessibility

* **Decorative** image → leave **Alt** empty. Output is `alt=""` and treated as presentational.
* **Informational** image → provide concise **Alt** text. No extra ARIA needed.

---

## 8) Performance & Security

* **0 KB frontend JS**; static HTML + CSS vars.
* Styles load only where the block is used (via `block.json`).
* Images include `loading="lazy"` and `decoding="async"`.
* PHP bootstrap follows standard guarding and enqueues.

---

## 9) Troubleshooting

* **Upload placeholder appears but is unclickable in editor**
  Hard refresh (Ctrl/Cmd+Shift+R). Our editor stylesheet re-enables pointer events and raises the placeholder UI. If you still see an overlap, ensure no custom editor CSS sets `pointer-events:none` on the figure or parents.
* **Accent sits “under” neighbors**
  On the **parent container**, set `--artsolio_anchor_z: 20000;` (or higher).
  The figure renders at that value + 1.
* **Corners look inverted**
  Make sure the **anchor container has real height** (don’t anchor to an empty wrapper). The figure’s inline sides are authoritative; once anchored to the correct container, Top/Bottom map correctly.
* **Positions relative to the page**
  Use **Anchor to parent** or manually add `is-accent-anchor artsolio_is-accent-anchor` to the intended container.

---

## 10) Release workflow

* Bump versions in `package.json` and plugin header.
* Build/zip:

  ```bash
  npm run build
  npm run zip
  ```
* Tag and publish a GitHub Release with the ZIP.

---

## 11) Changelog

**1.0.0**

* Initial stable release:

  * Corner classes (`is-top-left`, etc.), Size presets + Custom (Simple/Advanced), Uniform/Split Offsets, Hide on mobile.
  * **Anchor to parent** toggle; theme-agnostic fallback via `:has(.artsolio-accent)`.
  * Editor hardening for inline upload placeholder in Core/Kadence editors.
* **Removed**: Accent Gutter, Core Group variation (fully deleted in v1.0).