# 05 — Roadmap

A phased plan from "empty repo" to "two distinct LPs live on a real domain". Each phase is small, isolated, reviewable, and testable on its own. We follow the rule: **one step at a time — never solve a problem by changing several files in one shot.**

Owner annotations: **[M]** = Maickell, **[G]** = Gustavo, **[M+G]** = both. See [06 — Ownership](./06-ownership.md) for full role definitions.

---

## Phase 0 — Foundations (no UI yet)

**Goal:** an empty Astro app that builds successfully, with content schemas and pure-logic libraries in place.

| # | Task | Owner | Outcome |
|---|---|---|---|
| 0.1 | Bootstrap `marketing/` Astro app with TypeScript, MDX integration, Tailwind v4 | M | `npm run build` produces an empty site |
| 0.2 | Define zod schema for page frontmatter and block discriminated union | M+G | `src/content/config.ts` exists; build fails on invalid frontmatter |
| 0.3 | Implement `src/lib/content.ts` (`loadPage`, `resolveBlocks`) as pure functions | G | Vitest tests cover happy path + invalid block + missing fragment |
| 0.4 | Implement `src/lib/domains.ts` (`filterPagesForDomain`) | G | Vitest tests cover: match, multi-domain, wildcard, draft |
| 0.5 | Implement `src/lib/experiments.ts` (`pickVariant`) | G | Vitest tests cover: equal weight, weighted, sticky |
| 0.6 | Set up `marketing/README.md` with local dev instructions | M | New contributor can `npm run dev` |

**Exit criteria:** Phase 0 is done when `npm run build`, `astro check`, and `vitest run` all pass on a clean clone. No pages exist yet.

---

## Phase 1 — Block library v1

**Goal:** the minimum block set to compose a real LP.

| # | Task | Owner | Outcome |
|---|---|---|---|
| 1.1 | Design tokens defined as CSS custom properties; `tokenOverrides` mechanism wired (scoped inline `<style>` per page) | M+G | Default tokens drive all styling; an override on a fixture page provably changes a token without touching components |
| 1.2 | Design system primitives: `Container`, `Section`, `Heading`, `Button`, `Image` wrapper, all reading tokens | M | Primitives match design; no hard-coded colors/spacing |
| 1.3 | `Hero` block | M | Renders headline, subhead, CTA, image with Astro Image |
| 1.4 | `Features` block | M | Grid renders icon + title + body items |
| 1.5 | `RichText` block (MDX body source) | M+G | MDX body inside a page renders inside this block |
| 1.6 | `FAQ` block (with optional fragment ref) | M | Accordion behavior via minimal client island |
| 1.7 | `Testimonials` block (with optional fragment ref) | M | Renders inline or from fragment |
| 1.8 | `CTA` block | M | Standalone call-to-action band |
| 1.9 | `BasicLP` layout (header, blocks slot, footer, SEO meta) | M+G | Layout consumes `PageData` and renders blocks via registry |

**Exit criteria:** A throwaway demo MDX file using all blocks renders correctly with Lighthouse ≥ 95 on mobile.

---

## Phase 2 — MVP: two distinct LPs

**Goal:** ship the MVP from [00 — Overview](./00-overview.md).

| # | Task | Owner | Outcome |
|---|---|---|---|
| 2.1 | Pick the first two ICPs and draft messaging for each | M | Brief docs in `docs/marketing/icps/` (created in this phase) |
| 2.2 | Author `src/content/icps/<icp-1>.mdx` end-to-end | M | Page builds and renders; Lighthouse ≥ 95 |
| 2.3 | Author `src/content/icps/<icp-2>.mdx` end-to-end | M | Page builds and renders; Lighthouse ≥ 95; uses same blocks, fully different content |
| 2.4 | Add `LeadForm` block: base fields, per-ICP `extraFields` schema, hidden origin metadata injection, integration with the destination Gustavo defines | M+G | Form submission delivers a complete payload (base + extra + metadata) to the chosen destination |
| 2.5 | Wire analytics provider with consent-aware loading | G | Pageview + form-submit events visible in dashboard |
| 2.6 | Per-domain config for the first real domain | M+G | `marketing/config/domains/<domain>.json` validated |
| 2.7 | Run `scripts/build-domain.mjs` locally for the real domain | G | `dist/<domain>/` is correct, robots/sitemap/canonicals match |

**Exit criteria:** the MVP checklist in [00 — Overview](./00-overview.md) is fully ticked, except deployment (Phase 3).

---

## Phase 3 — Ship to production

**Goal:** the first LP is live on its real domain. CI/CD is doing the publishing.

| # | Task | Owner | Outcome |
|---|---|---|---|
| 3.1 | Read & execute [07 — CI/CD Brief](./07-ci-cd-brief.md) | G | Pipeline drafted, host chosen, secrets stored |
| 3.2 | First production deploy of LP #1 | G | DNS resolves, HTTPS valid, page loads under 2s LCP on 4G |
| 3.3 | LP #2 deploys to a preview URL or its own domain | G | Same rigor as 3.2 |
| 3.4 | Add Lighthouse-CI gate to the pipeline | G | Failing Web Vitals blocks merges to `main` |
| 3.5 | Stand up the access-controlled debug/preview index (every LP under one URL) | G | Preview index serves all LPs with `noindex`, sandboxed forms, no analytics |

**Exit criteria:** every push to `main` that touches `marketing/` produces a deployed preview, and merges to `main` deploy production.

---

## Phase 4 — A/B framework

**Goal:** run the first experiment.

| # | Task | Owner | Outcome |
|---|---|---|---|
| 4.1 | Implement experiments folder loader + manifest emitter | G | `dist/_experiments.json` written on build |
| 4.2 | Implement edge picker (cookie + redirect) on the chosen host | G | First visit assigns sticky variant |
| 4.3 | Author first variant against an existing LP (recommended candidate: a CTA-color test using `tokenOverrides`, to validate the override path end-to-end) | M | Variant file ships, both URLs work, token override is visible |
| 4.4 | Verify variant attribution in analytics provider | M+G | Funnel by variant is queryable |
| 4.5 | Add `docs/marketing/active-experiments.md` log | M | First entry recorded |

**Exit criteria:** a real experiment is running, visitors are getting sticky assignments, and we can read results in the analytics dashboard.

---

## Phase 5 — Scale to many ICPs

**Goal:** ship LPs in volume without editing components.

| # | Task | Owner | Outcome |
|---|---|---|---|
| 5.1 | Document the "new ICP" authoring flow in `docs/marketing/authoring.md` | M | Step-by-step checklist Maickell can follow alone |
| 5.2 | Add any new blocks discovered to be repeatedly needed | M+G | Block library grows additively |
| 5.3 | Add second domain to the build matrix | G | Two domains deploying from one content tree |
| 5.4 | Decide whether to introduce a CMS adapter (Sanity/Tina/Decap) | M+G | Decision recorded in `docs/marketing/01-architecture.md` |

**Exit criteria:** Maickell can go from "new ICP idea" to "page live on the right domain" without writing or asking for code.

---

## Out of scope (for now)

- A custom CMS or visual editor.
- Internationalization. The site is and will remain pt-BR only.
- Real-user monitoring, error tracking, APM. Add once we have meaningful traffic.

## Dependencies & risks

- **Domain availability.** We need at least one purchased and DNS-controlled domain before Phase 3.
- **Analytics provider choice.** Blocks Phase 2.5; needs a decision early in Phase 2.
- **Lead destination & database.** Blocks Phase 2.4; Gustavo to decide and document in his hosting/CI brief.
- **Astro / @astrojs/mdx breaking changes.** Pin versions and bump deliberately.
