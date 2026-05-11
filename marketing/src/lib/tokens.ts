import type { TokenOverrideKey } from './schema';

/**
 * Maps a frontmatter token-override key (e.g. "color.cta.bg") to the matching
 * CSS custom property defined in `src/styles/global.css` (e.g. "--color-cta-bg").
 *
 * Mapping rule: dots become hyphens, prefixed with `--`. Kept as a static map
 * (rather than computed) so changes are explicit and reviewable.
 */
const KEY_TO_CSS_VAR: Record<TokenOverrideKey, string> = {
  'color.bg': '--color-bg',
  'color.fg': '--color-fg',
  'color.cta.bg': '--color-cta-bg',
  'color.cta.fg': '--color-cta-fg',
  'color.accent': '--color-accent',
};

export interface BuildTokenOverrideStyleInput {
  pageId: string;
  overrides: Partial<Record<TokenOverrideKey, string>> | undefined;
}

/**
 * Returns a CSS rule string scoped to `[data-page-id="<pageId>"]` redefining the
 * given tokens. Returns an empty string when there are no overrides — the layout
 * can simply skip emitting the <style> block in that case.
 *
 * Pure function: deterministic, no I/O, easy to unit-test.
 */
export function buildTokenOverrideStyle({
  pageId,
  overrides,
}: BuildTokenOverrideStyleInput): string {
  if (!overrides) return '';
  const entries = Object.entries(overrides).filter(
    (entry): entry is [TokenOverrideKey, string] =>
      typeof entry[1] === 'string' && entry[1].length > 0,
  );
  if (entries.length === 0) return '';

  const declarations = entries
    .map(([key, value]) => `  ${KEY_TO_CSS_VAR[key]}: ${value};`)
    .join('\n');

  return `[data-page-id="${pageId}"] {\n${declarations}\n}`;
}
