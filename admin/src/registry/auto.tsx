// admin/src/registry/auto.ts
// Auto-discovers React components and .svg files in ../icons

export type IconEntry = {
  slug: string;
  label: string;
  component?: React.ComponentType<any>;
};

// --- helpers ---
const fileBase = (p: string) => p.split('/').pop()!.replace(/\.[^.]+$/, '');
const toSlug = (name: string) => name.replace(/\.[^.]+$/, '');
const toLabel = (slugOrCamel: string) => {
  const spaced = slugOrCamel.includes('-')
    ? slugOrCamel.replace(/-/g, ' ')
    : slugOrCamel.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.trim().replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase());
};

// Eagerly import everything inside ../icons
// React components:
const compMods = import.meta.glob('../icons/*.{jsx,tsx}', { eager: true }) as Record<
  string,
  { default?: React.ComponentType<any> }
>;

// Raw SVGs as string:
const svgMods = import.meta.glob('../icons/*.svg', { eager: true, as: 'raw' }) as Record<
  string,
  string
>;

// Optional: sidecar labels (../icons/MyIcon.meta.json with {"label": "..."} )
const metaJson = import.meta.glob('../icons/*.meta.json', { eager: true }) as Record<
  string,
  { label?: string }
>;

const sidecarLabelFor = (pathBase: string) => {
  // pathBase = "MyIcon" (no extension)
  const entries = Object.entries(metaJson);
  const hit = entries.find(([p]) => fileBase(p).replace(/\.meta$/, '') === pathBase);
  return hit?.[1]?.label;
};

export function buildAutoIconOptions(): IconEntry[] {
  const map = new Map<string, IconEntry>();

  // Components first
  for (const [path, mod] of Object.entries(compMods)) {
    const base = fileBase(path);
    const slug = toSlug(base);
    const label = sidecarLabelFor(base) ?? toLabel(base);
    if (mod?.default) {
      map.set(slug, { slug, label, component: mod.default });
    }
  }

  // Raw svgs → wrap as a tiny component
  for (const [path, raw] of Object.entries(svgMods)) {
    const base = fileBase(path);
    const slug = toSlug(base);
    if (map.has(slug)) continue; // component wins over svg
    const label = sidecarLabelFor(base) ?? toLabel(base);

    // Create a minimal component from raw SVG
    const SvgCmp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: raw }}
        aria-hidden
        {...props}
      />
    );

    map.set(slug, { slug, label, component: SvgCmp });
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

// Merge manual overrides: same slug in overrides replaces auto
export function mergeIconOptions(
  auto: IconEntry[],
  overrides?: IconEntry[] | undefined
): IconEntry[] {
  if (!overrides?.length) return auto;
  const bySlug = new Map(auto.map((e) => [e.slug, e]));
  for (const o of overrides) bySlug.set(o.slug, { ...bySlug.get(o.slug), ...o });
  return Array.from(bySlug.values());
}
