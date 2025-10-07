# Strapi Plugin — Icon Picker (v5)

A zero-config **custom field** for Strapi v5 that lets editors pick an icon from files you drop in the plugin’s `admin/src/icons/` folder.  
Works with **React SVG components** (`.tsx/.jsx`) and **raw `.svg` files**, auto-discovers them, renders a visual dropdown, and stores the **icon name** (filename, unchanged) in your content.

> **Tip:** For best readability, set `stroke="currentColor"` and/or `fill="currentColor"` in your SVG React components. Icons inherit surrounding text color **only if your SVG uses `currentColor`** (or forwards `...props` so you can pass `color`). Otherwise, the SVG’s hard-coded color is used.

> **Note on bundled icons:** This plugin includes a small, curated subset of **Heroicons** as starter icons (MIT-licensed). You can add more anytime—see “Using Heroicons React components” below.

---

## Features

- 🔎 **Auto-discovery** of icons in `admin/src/icons/` (React components or `.svg` files)
- 🏷️ **Readable labels** derived from filenames (`BookableSpace` → “Bookable Space”)
- 🧩 **Manual overrides** supported (same slug wins)
- 🎛️ **Whitelist** per field via schema `options.iconList`
- 🧼 **CSS-only sizing**: icons are clamped to **20×20** to avoid overflow
- 🧑‍🦽 A11y: icons are `aria-hidden` within the select; labels remain visible

---

## Install (as a local plugin)

Add to your Strapi app’s `config/plugins.ts`:

```ts
export default () => ({
  'icon-picker': {
    enabled: true,
    resolve: './src/plugins/icon-picker',
  },
});
```

Rebuild the admin:

```bash
npm run build
npm run develop
```

When installed from npm, you only need:

```ts
export default () => ({
  'icon-picker': { enabled: true },
});
```

---

## Usage

Add a field to your content-type schema:

```json
{
  "attributes": {
    "icon": {
      "type": "customField",
      "customField": "plugin::icon-picker.icon",
      "options": {
        "iconList": ["ArrowRight", "Envelope"]
      }
    }
  }
}
```

The stored value is the exact filename (without extension), e.g. `"ArrowRight"`.  
The UI shows a prettified label (e.g. “Bookable Space”).

---

## Adding icons

Place files in the plugin at:

```
src/plugins/icon-picker/admin/src/icons/
```

### 1. React component (default export)

```tsx
// src/plugins/icon-picker/admin/src/icons/BookableSpace.tsx
const BookableSpace = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    {/* paths */}
  </svg>
);
export default BookableSpace;
```

**Best practice:** use `stroke="currentColor"` and/or `fill="currentColor"` (and optionally forward `...props`) so the icon can inherit color from CSS. Keep `fill="none"` for stroke-only icons.

### 2. Raw SVG

```
src/plugins/icon-picker/admin/src/icons/family-history.svg
```

The plugin wraps it and clamps size via CSS; no extra code needed.

### 3. Optional human label via sidecar meta

```json
// src/plugins/icon-picker/admin/src/icons/MyIcon.meta.json
{
  "label": "My Fancy Icon"
}
```

If both a React component and a `.svg` exist for the same basename, the component wins.

---

## Using Heroicons React components

We include a few Heroicons by default (e.g. `Home`, `Bell`, `User`).  
If you want more, install the library and add only the icons you need:


## License & attribution for bundled icons

The Heroicons set is released under the MIT license.  
If you add additional Heroicons in your project (via `@heroicons/react` or copying SVGs), keep the MIT license notice as required.

---

## Options

Per-field in schema:

```json
"options": {
  "iconList": ["ArrowRight", "Envelope"],
  "useOverridesOnly": false
}
```

---

## Styling & Size

Icons render inside a fixed 20×20 box. CSS applied by the field ensures scaling without overflow:

```css
.iconBox {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  line-height: 0;
}
.iconBox svg {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
```

To recolor via CSS, change the text color of the surrounding element — but this only works if your SVG uses `currentColor` (e.g. `stroke="currentColor"` or `fill="currentColor"`).  
If your SVG has fixed fills/strokes, those will remain.

---

## Accessibility

Icons are `aria-hidden` within the select; visible textual labels are used for clarity.  
Use meaningful filenames since they become the stored values.

---

## Development

```bash
# inside the plugin folder
npm run watch   # hot-rebuild the admin plugin while developing
```

---

## Roadmap

- Optional remote/CDN icon sources
- Size presets & theming

---

## License

MIT
