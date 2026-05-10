# 01 — Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 5** (latest) | Static-first, ships ~0 JS by default, content collections, file-based routing |
| Authoring | **MDX** via `@astrojs/mdx` | Frontmatter for structured data + body for rich content |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` | Already familiar; design-token friendly |
| Schema validation | **zod** via Astro Content Collections | Compile-time safety on every MDX file |
| Images | Astro `<Image>` / `astro:assets` | Automatic responsive variants, modern formats |
| Interactivity | Astro Islands (only when needed) | Hydrate per-component, not per-page |
| Tests | **Vitest** for pure logic | Pure functions stay fully testable |
| Analytics | TBD (see Overview) | — |
| Hosting | TBD per domain (see CI/CD brief) | — |

**No client-side router, no SPA, no global state library.** The site is HTML with islands of interactivity.

## Workspace placement

The marketing app is a **standalone workspace at the repo root**:

```
contaLeve/
├── marketing/        # this initiative
└── docs/             # this folder
```

Decision: **no monorepo tooling (pnpm workspaces, Turborepo) for now.** `marketing/` does not share code with anything else. Adding monorepo plumbing now would be premature and obscure the mental model. Revisit only if a real cross-workspace dependency emerges.

## Language

- **Code, file names, identifiers, comments, commit messages, docs**: English (en-US).
- **MDX content, copy, alt text, OG metadata, form labels, error messages**: Brazilian Portuguese (pt-BR).

The build is not internationalized. The HTML root carries `<html lang="pt-BR">` because every visitor reads pt-BR. There is no language switcher and no en-US fallback — no user-facing surface should ever render in any language other than pt-BR.

## Marketing app folder structure

```
marketing/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── public/                              # static assets served as-is (favicons, robots.txt)
├── src/
│   ├── content/                         # all MDX content (Astro Content Collections root)
│   │   ├── config.ts                    # zod schemas for collections
│   │   ├── pages/                       # generic / brand pages
│   │   │   └── home.mdx
│   │   ├── icps/                        # one MDX per ICP landing page
│   │   │   ├── homeowner-sp.mdx
│   │   │   └── small-business.mdx
│   │   ├── experiments/                 # A/B variants (see 03-ab-testing.md)
│   │   └── fragments/                   # reusable snippets (FAQ items, testimonials)
│   ├── components/
│   │   ├── blocks/                      # the block library (Hero, Features, FAQ, ...)
│   │   ├── layouts/                     # page-level layouts (BasicLP, LongFormLP)
│   │   └── primitives/                  # Button, Container, Section, Heading
│   ├── lib/                             # pure logic (testable, no Astro/React imports)
│   │   ├── content.ts                   # load + resolve a page from a slug
│   │   ├── blocks.ts                    # block registry helpers
│   │   ├── experiments.ts               # variant picker
│   │   └── domains.ts                   # filter content by target domain
│   ├── pages/
│   │   └── [...slug].astro              # generic catch-all renderer
│   ├── styles/
│   │   └── global.css                   # Tailwind base + design tokens
│   └── env.d.ts
├── scripts/
│   └── build-domain.mjs                 # filters content per DOMAIN env, runs astro build
├── tests/
│   └── lib/                             # unit tests for pure logic
└── README.md
```

### Folder responsibilities

- **`src/content/`** — *Data*. Only MDX and YAML-like frontmatter. No logic, no components.
- **`src/components/blocks/`** — *Dumb UI*. Each block accepts typed props, renders markup, ships minimal/zero JS.
- **`src/components/layouts/`** — *Page shells*. Header/footer/SEO/structured data wrappers around a sequence of blocks.
- **`src/components/primitives/`** — Buttons, containers, headings — the design system atoms.
- **`src/lib/`** — *Pure functions*. No Astro internals, no DOM, no React. Trivially unit-testable.
- **`src/pages/`** — Astro routing only. Glue between Content Collections and the page renderer.
- **`scripts/`** — Build orchestration (multi-domain).
- **`tests/`** — Vitest unit tests, mirroring `src/lib/` shape.

## Page model

Every landing page is described by a single MDX file. The frontmatter declares:

1. **Page metadata**: slug, title, SEO description, OG image, target domain(s).
2. **Layout choice**: which page shell to use.
3. **A composition of blocks**: an ordered list, each entry has a `type` plus the props that block needs.

The MDX **body** is optional. When present, it is treated as the content of one specific block — typically a `RichText` block referenced from the frontmatter.

This separation matters: **structure lives in frontmatter, narrative lives in MDX body.** It keeps page composition predictable, type-safe, and trivial to refactor (renaming a block, swapping props), while still giving you long-form authoring power where it matters.

The detailed schema and block catalog live in [02 — Content Model](./02-content-model.md).

## Rendering pipeline

Conceptually, generating a page is a four-step pure pipeline:

```
slug ──► loadPage(slug) ──► PageData
                                │
                                ▼
                         resolveBlocks(PageData) ──► ResolvedBlock[]
                                │
                                ▼
                         renderLayout(layout, blocks) ──► HTML
```

Each step is a pure function that can be unit-tested in isolation:

- `loadPage(slug)` — reads the MDX file, validates frontmatter against the zod schema, returns a typed `PageData`.
- `resolveBlocks(pageData)` — walks the blocks array, validates per-block props, optionally hydrates fragment references (e.g. shared FAQ).
- `renderLayout(layout, blocks)` — Astro composition: picks the layout component, iterates blocks through the registry.

The Astro page (`src/pages/[...slug].astro`) is a **thin shell** that calls these three functions. No business logic lives in the route file.

## Routing

A single catch-all route handles every LP:

- `src/pages/[...slug].astro`
- `getStaticPaths()` reads the active content collections (filtered by `DOMAIN` env at build time — see [04 — Multi-domain](./04-multi-domain.md)) and emits one path per page.
- The page renders by delegating to the pipeline above.

There are intentionally **no per-LP `.astro` files**. New pages are added by creating MDX, never by adding routing code.

## Performance budget

These are non-negotiable for any LP that goes live:

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | ≥ 95 |
| LCP (mobile) | ≤ 2.0s |
| CLS | ≤ 0.05 |
| INP | ≤ 200ms |
| Total JS shipped (no islands) | ≤ 5KB gzipped |
| Largest image weight | ≤ 150KB after Astro processing |

Strategies baked into the architecture:

- Static HTML output (`output: 'static'` in `astro.config.mjs`).
- Astro Image for all media — required for any image used in a block.
- Self-hosted fonts with `font-display: swap`, preloaded only the weights actually used.
- No analytics or third-party scripts loaded eagerly. Defer to `idle` or after consent.
- Islands hydrate on `client:visible` or `client:idle` — never `client:load` unless justified in a comment.

## Design tokens

Visual identity is captured as a small, named set of tokens (color, type scale, spacing, radius, shadows). Tokens are the **single source of styling truth** — components and blocks read tokens, never hard-coded values.

### Default behavior

- Tokens are defined as **CSS custom properties** under `:root` in `src/styles/global.css`, exposed to Tailwind v4 via the `@theme` block.
- All LPs share the same default tokens. Consistency is the default; divergence is opt-in.

### Scoped overrides (must be possible from day one)

The token system must allow **scoped overrides** without forking components. The mechanism:

1. A page or A/B variant can declare a `tokenOverrides` map in its frontmatter (e.g. `{ "color.cta.bg": "#16a34a" }`).
2. The layout emits a small inline `<style>` block scoped to a unique `data-page-id` selector that redefines those custom properties.
3. Components are unaware — they continue reading the same custom property names. The scoped override transparently changes the resolved value.

Why this matters:

- **A/B tests on CTA color, button shape, or accent hue become content edits**, not code changes.
- **Per-LP brand variations** (if a future ICP-targeted domain has a different brand identity) become a config change, not a fork.

### Constraints

- Only **token overrides** are allowed via frontmatter. Arbitrary CSS injection from MDX is forbidden.
- Override keys must match the documented token namespace (`color.*`, `space.*`, etc.). Unknown keys fail the build via the schema.
- Token overrides are not a focus for the MVP. The MVP ships with a single token set. The override surface only needs to be wired enough to demonstrate it works (e.g. one experiment flips a CTA color).

The override surface is documented in detail in [02 — Content Model](./02-content-model.md) and exercised in [03 — A/B Testing](./03-ab-testing.md).

## Testability

Anything that can be a pure function should be. Specifically:

- Frontmatter parsing & validation
- Block resolution / fragment hydration
- Variant picking (A/B)
- Domain filtering

These all live under `src/lib/` with no Astro or framework imports, and have matching test files under `tests/lib/`. Components themselves are not unit-tested for visual output — they're verified via build success, type checks, and visual review on preview URLs.

## Open questions

- Will any block need framework-specific interactivity (e.g. an embedded calculator)? If yes, choose **one** islands framework (probably React, to match Maickell's existing skill set) and stick to it.
- Final token namespace and naming conventions — to be locked in Phase 0 alongside the schema.
