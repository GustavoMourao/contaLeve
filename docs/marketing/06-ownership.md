# 06 — Ownership

This is a two-person project. Clear boundaries keep us shipping without stepping on each other.

## People

- **Maickell** — Designer & frontend. **Marketing lead.** Drives messaging, design system, page composition, and authoring.
- **Gustavo** — Software Engineer, Electrical Engineer, Data Scientist. **Technical backbone.** Owns backend, infra, CI/CD, and complex frontend logic that supports Maickell.

## Operating principle

> Maickell ships pages. Gustavo ships the platform that lets Maickell ship pages.

## Ownership matrix

| Area | Owner | Reviewer | Notes |
|---|---|---|---|
| Marketing strategy, ICP selection, messaging | **M** | G (sanity check) | Maickell decides what to test and why |
| Visual design, design tokens, brand system | **M** | — | Final say on look & feel |
| Block authoring (component visuals & markup) | **M** | G (code review) | Static, prop-driven blocks |
| Block logic (interactivity, data shaping) | **G** | M | Hydration, accordions, form behavior |
| MDX page authoring | **M** | — | New ICPs, copy edits, image swaps |
| Content schemas (`src/content/config.ts`) | **G** | M | Schema changes are platform changes |
| Pure-logic libraries (`src/lib/*`) | **G** | M | Loaders, registries, pickers, filters |
| Astro config, build scripts | **G** | M | `astro.config.mjs`, `scripts/build-domain.mjs` |
| Tests under `tests/lib/` | **G** | M | Vitest unit tests for pure logic |
| Per-domain config files | **M+G** | each other | Maickell drafts, Gustavo validates secrets/infra |
| CI/CD pipeline | **G** | M | See [07 — CI/CD Brief](./07-ci-cd-brief.md) |
| Hosting, DNS, certificates | **G** | M | Maickell can request; Gustavo executes |
| Analytics provider setup | **G** | M | Maickell decides what to measure; Gustavo wires it |
| Lead-capture integration & lead database | **G** | M | Maickell defines fields and labels in MDX; Gustavo decides destination, storage, and security |
| A/B variant authoring | **M** | — | Variants are MDX, not code |
| A/B picker / edge logic | **G** | M | Runs on the host's edge runtime |
| Performance audits | **M** | G | Maickell runs Lighthouse; Gustavo fixes infra causes |
| Documentation in `docs/marketing/` | **M+G** | each other | Whoever made the decision documents it |

"Reviewer" means the second pair of eyes on a PR before merge — not the approver. Both must agree on changes that affect the **interface between content and platform** (schemas, block prop shapes, frontmatter contracts).

## What Maickell can do alone

These should never require Gustavo's involvement once the platform is in place:

- Add a new ICP page (new MDX file in `src/content/icps/`).
- Change copy, images, or block ordering on any existing page.
- Add a fragment (FAQ list, testimonials).
- Add a new A/B variant (new MDX file in `src/content/experiments/`).
- Adjust Tailwind tokens within the design system.
- Open a PR and merge it after passing CI.

If something on this list requires touching `src/lib/` or `src/content/config.ts`, **the platform has a gap** — flag it for Gustavo as a platform task instead of working around it.

## What Gustavo owns end-to-end

These should never require Maickell's involvement, beyond reviewing the PR:

- Schema and registry changes.
- Build pipeline, deployment, secrets.
- Edge logic for A/B picking.
- Performance regressions caused by config or infra (e.g. CDN headers, image pipeline).
- Analytics SDK lifecycle, consent gating.
- Lead destination, lead database, retention, and security posture.
- The access-controlled debug/preview index.

## Communication norms

- **Decisions are documented** in `docs/marketing/` in the same PR as the change. Don't ship a schema change and a Slack message — ship a schema change and a doc update.
- **Open questions** at the bottom of each doc are ours to triage in our weekly syncs (cadence TBD between us).
- **Blocking dependencies** are surfaced early. If Maickell is waiting on Gustavo, Maickell opens a "platform request" issue with a one-paragraph description and the affected MDX file path.
- **Pair when crossing the boundary.** Schema changes that ripple into block prop shapes are best done in a short pair session rather than over async review.

## Definition of "platform-ready"

The platform is "ready" when **Maickell can author and ship a new LP, including a new domain, without writing TypeScript or touching infra config**. That's the bar Phase 5 of the roadmap is measured against.
