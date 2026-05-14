# Design system (marketing → product)

This document defines the architecture of the shared visual system between the marketing site (Astro) and, in the future, the product (app / logged-in area). The commercial name and logo may still change; **tokens and structure** are the stable source of truth.

## Sources of truth

| Layer | Where | Responsibility |
|--------|------|------------------|
| CSS tokens | `marketing/src/styles/design-tokens.css` | Colors, typography, radii, shadows, minimal scale. **`--ds-*`** prefix for canonical values. |
| Token preview (UI) | `marketing/src/lib/designTokenPreview.ts` + `marketing/src/components/preview/DesignTokenPreview.astro` | List and groups shown at `/design-system`; values always via `var(...)` from `:root`. |
| Content aliases | Same file (`--color-*`) | Keys allowed in `tokenOverrides` in frontmatter (see `src/lib/schema.ts` and `src/lib/tokens.ts`). |
| Tailwind | `marketing/src/styles/global.css` (`@theme`) | Utilities (`bg-ds-green`, `shadow-ds-md`, `rounded-card`, `font-display`, …). |
| Form field classes | `marketing/src/lib/fieldStyles.ts` | Pure functions that return class strings — easy to test and reuse in blocks and in the product. |

## Scope by surface

Three categories guide where each UI piece should live. The goal is to avoid unnecessary duplication without forcing the same component where context (SEO, narrative, data density) differs.

### 1. Marketing-only (`marketing/src/components/blocks/`)

Composite blocks for landing pages: `Hero`, `Features`, `FAQ`, `LeadForm`, `CTA`, `RichText`. They may use primitives and tokens freely; copy and layout are tuned for conversion and quick reading.

### 2. System / product (future)

Dense components, complex tables, persistent navigation, account states. **They do not exist in this repository yet**; when they are added, they should consume the same `--ds-*` / `fieldStyles` whenever the look must stay aligned with the brand.

### 3. Shared (`marketing/src/components/primitives/` + `fieldStyles.ts`)

Reusable atomic elements: `Button`, `Heading`, `Section`, `Container`, `Input`, `Textarea`, `Badge`, `Alert`. Natural candidates to extract into an internal package (`@conta-leve/ui`) or copy into the app monorepo, **without** changing the core tokens.

**Variants:** the same primitive can expose `variant` / `tone` (e.g. `Button` `vivid` vs `primary`; `Alert` `success` vs `error`) instead of duplicating components.

## Visual rules (summary)

- Strong contrast; brand backgrounds **off-white** or **charcoal**; **white** cards with charcoal border.
- **No** blurred shadows; fixed offset only (`shadow-ds-sm` / `shadow-ds-md`).
- Default UI border: solid **2.5px** charcoal.
- Brand green in **two** steps only (`green`, `green-vivid`); do not introduce a “pastel” scale.
- Semantics: success / warning / error (pink) / info (teal), with **vivid** variants for text on dark backgrounds — see comments in `design-tokens.css` and the HTML reference cheat sheet.
- Typography: **Epilogue** (display / strong data), **Outfit** (body and UI). Icons: Lucide, ~2px monoline stroke (inline SVG where there is no package yet).

## Preview navigation (unified hub)

**Preview-only** pages (`/`, `/design-system`, `/docs`) share the same chrome:

- **Horizontal bar at the top** (`PreviewTopNav`): switches between Campaigns (LP index), Design system, and Handbook. File: `marketing/src/components/preview/PreviewTopNav.astro`; data in `marketing/src/lib/previewNav.ts`.
- **Handbook** (`/docs/*`): sidebar with the list of Markdown files (layout `DocsLayout.astro`).
- **Design system** (`/design-system`): sidebar with **in-page anchors** (component `DesignSystemSidebar.astro`; id list in `previewNav.ts` → `designSystemNavItems`). On narrow screens, the same targets appear as horizontal **chips** below the top bar.

Real landing pages (`BasicLP`, `/{slug}` routes) **do not** include this chrome — they stay clean for the campaign domain.

## Visual reference page

- Local URL: `/design-system`
- Files: `marketing/src/pages/design-system.astro` (component grid), `marketing/src/components/preview/DesignTokenPreview.astro` (**token** grid with values via `var(...)`), `marketing/src/lib/designTokenPreview.ts` (list of variables shown in the preview).
- Purpose: quick validation of tokens and primitives (bento-style layout); it does not replace written documentation.

## Keep documentation aligned (required in PRs)

Whenever you change the visual system, update **together** the places where it is recorded — avoids drift between code, preview, and handbook.

| Change | What to update |
|-----------|-----------------|
| New or renamed **token** in `design-tokens.css` | `src/lib/designTokenPreview.ts` (so the preview lists the token), and if applicable `src/styles/global.css` (`@theme`), `src/lib/schema.ts` / `src/lib/tokens.ts` for `tokenOverrides`. |
| New **Tailwind utility** tied to tokens | `global.css` (`@theme`) and, if relevant, this doc in the “Sources of truth” table. |
| New **primitive** (`Button`, `Input`, …) or new **variant** | Example in `design-system.astro` (or the preview that represents it) and, if architecture changes, the “Shared” / “Scope” sections in this file. |
| New landing **block** | Describe in `02-content-model.md` if the content model changes; optionally a line here if it is a design-system decision. |

Simple rule: **a PR that introduces a visible token or component should include the preview and/or this `.md` update in the same delivery.** Reviews should reject deliberate omissions (unless there is an explicit follow-up with an issue).

## Legacy and evolution

- Existing block components already consume updated tokens and primitives.
- **Legacy** (older product components or ad-hoc styles outside `design-tokens.css`) is out of scope for this phase; when migrated, they should stop defining hardcoded colors in favor of `--ds-*` or `@theme` utilities.

## Cross-references

- Content model and `tokenOverrides`: `02-content-model.md`
- General marketing architecture: `01-architecture.md`
