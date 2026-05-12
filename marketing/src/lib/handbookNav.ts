/**
 * Navigation labels for repo markdown under `docs/marketing/`.
 * Slug = filename without `.md` (Astro content `id` from the glob loader).
 */
export const HANDBOOK_TITLE_BY_SLUG: Record<string, string> = {
  '00-overview': '00 — Marketing overview',
  '01-architecture': '01 — Architecture',
  '02-content-model': '02 — Content model',
  '03-ab-testing': '03 — A/B testing',
  '04-multi-domain': '04 — Multi-domain',
  '05-roadmap': '05 — Roadmap',
  '06-ownership': '06 — Ownership',
  '07-ci-cd-brief': '07 — CI/CD brief',
  '08-design-system': '08 — Design system',
};

export function handbookNavTitle(slug: string): string {
  return HANDBOOK_TITLE_BY_SLUG[slug] ?? slug;
}
