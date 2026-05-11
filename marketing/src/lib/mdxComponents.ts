import FAQ from '../components/blocks/FAQ.astro';
import LeadForm from '../components/blocks/LeadForm.astro';

/**
 * Whitelist of components available inside any MDX body without explicit
 * imports. The route passes this object to `<Content components={...} />`.
 *
 * Adding a new entry here is the single, reviewable point that says
 * "authors may now use <NewComponent /> in MDX". Per 02-content-model.md,
 * MDX must NOT use ad-hoc per-file imports.
 *
 * Capitalized JSX names in MDX are matched against this map.
 */
export const mdxComponents = {
  FAQ,
  LeadForm,
} as const;

export type MdxComponentName = keyof typeof mdxComponents;
