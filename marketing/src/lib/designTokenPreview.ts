/**
 * Declarative list of design tokens for `/design-system` previews.
 * When you add a token in `design-tokens.css`, add a row here so it appears in the UI.
 * (Values always come from CSS `var(...)` — this file only drives labels and grouping.)
 */

export interface ColorTokenRow {
  cssVar: `--${string}`;
  label: string;
  /** Contrast hint for small label text on the swatch */
  labelOn?: 'light' | 'dark';
}

export interface NamedVarRow {
  cssVar: `--${string}`;
  label: string;
  hint?: string;
  /** For alias swatches on dark `--color-*` values */
  chipText?: 'light' | 'dark';
}

export const dsCoreColors: ColorTokenRow[] = [
  { cssVar: '--ds-charcoal', label: 'Charcoal', labelOn: 'light' },
  { cssVar: '--ds-offwhite', label: 'Off-white', labelOn: 'dark' },
  { cssVar: '--ds-gray', label: 'Gray', labelOn: 'light' },
  { cssVar: '--ds-white', label: 'White', labelOn: 'dark' },
];

export const dsBrandGreens: ColorTokenRow[] = [
  { cssVar: '--ds-green', label: 'Green · primary', labelOn: 'dark' },
  { cssVar: '--ds-green-vivid', label: 'Green vivid · CTA', labelOn: 'dark' },
];

export const dsSemanticLight: ColorTokenRow[] = [
  { cssVar: '--ds-sem-success', label: 'success', labelOn: 'dark' },
  { cssVar: '--ds-sem-warning', label: 'warning', labelOn: 'dark' },
  { cssVar: '--ds-sem-error', label: 'error', labelOn: 'dark' },
  { cssVar: '--ds-sem-info', label: 'info', labelOn: 'dark' },
];

export const dsSemanticVivid: ColorTokenRow[] = [
  { cssVar: '--ds-sem-success-vivid', label: 'success-vivid', labelOn: 'dark' },
  { cssVar: '--ds-sem-warning-vivid', label: 'warning-vivid', labelOn: 'dark' },
  { cssVar: '--ds-sem-error-vivid', label: 'error-vivid', labelOn: 'dark' },
  { cssVar: '--ds-sem-info-vivid', label: 'info-vivid', labelOn: 'dark' },
];

export const dsStructure: NamedVarRow[] = [
  { cssVar: '--ds-border-width', label: 'border-width', hint: 'used in border shorthand' },
  { cssVar: '--ds-shadow-sm', label: 'shadow-sm', hint: '3×3 offset' },
  { cssVar: '--ds-shadow-md', label: 'shadow-md', hint: '5×5 offset' },
  { cssVar: '--ds-shadow-accent', label: 'shadow-accent', hint: '5×5 on charcoal' },
];

export const dsRadii: NamedVarRow[] = [
  { cssVar: '--ds-radius-sm', label: 'radius-sm', hint: '6px' },
  { cssVar: '--ds-radius-md', label: 'radius-md', hint: '10px' },
  { cssVar: '--ds-radius-lg', label: 'radius-lg', hint: '12px' },
  { cssVar: '--ds-radius-card', label: 'radius-card', hint: '18px' },
  { cssVar: '--ds-radius-pill', label: 'radius-pill', hint: '100px' },
];

export const dsTracking: NamedVarRow[] = [
  { cssVar: '--ds-tracking-display', label: 'tracking-display', hint: 'display headings' },
  { cssVar: '--ds-tracking-tight', label: 'tracking-tight', hint: 'H2 / tight headings' },
];

export const dsSpacing: NamedVarRow[] = [
  { cssVar: '--ds-space-1', label: 'space-1', hint: '4px' },
  { cssVar: '--ds-space-2', label: 'space-2', hint: '8px' },
  { cssVar: '--ds-space-3', label: 'space-3', hint: '12px' },
  { cssVar: '--ds-space-4', label: 'space-4', hint: '16px' },
  { cssVar: '--ds-space-6', label: 'space-6', hint: '24px' },
  { cssVar: '--ds-space-8', label: 'space-8', hint: '32px' },
];

export const dsFonts: { cssVar: `--${string}`; label: string; sample: string }[] = [
  { cssVar: '--ds-font-display', label: 'font-display', sample: 'Epilogue · display' },
  { cssVar: '--ds-font-body', label: 'font-body', sample: 'Outfit · body UI' },
];

/** Maps to `tokenOverrides` / `src/lib/tokens.ts` — same physical values as many `--ds-*`. */
export const contentColorAliases: NamedVarRow[] = [
  { cssVar: '--color-bg', label: 'color-bg' },
  { cssVar: '--color-surface', label: 'color-surface' },
  { cssVar: '--color-fg', label: 'color-fg', chipText: 'light' },
  { cssVar: '--color-muted', label: 'color-muted' },
  { cssVar: '--color-border', label: 'color-border', chipText: 'light' },
  { cssVar: '--color-cta-bg', label: 'color-cta-bg' },
  { cssVar: '--color-cta-fg', label: 'color-cta-fg' },
  { cssVar: '--color-accent', label: 'color-accent' },
  { cssVar: '--color-focus', label: 'color-focus' },
];

/** Every `--ds-*` and `--color-*` token that must appear in the preview (audit list). */
export function allRegisteredPreviewVars(): string[] {
  return [
    ...dsCoreColors.map((r) => r.cssVar),
    ...dsBrandGreens.map((r) => r.cssVar),
    ...dsSemanticLight.map((r) => r.cssVar),
    ...dsSemanticVivid.map((r) => r.cssVar),
    ...dsStructure.map((r) => r.cssVar),
    ...dsRadii.map((r) => r.cssVar),
    ...dsTracking.map((r) => r.cssVar),
    ...dsSpacing.map((r) => r.cssVar),
    ...dsFonts.map((r) => r.cssVar),
    ...contentColorAliases.map((r) => r.cssVar),
  ];
}
