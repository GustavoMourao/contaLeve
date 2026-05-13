# marketing

Astro-based engine that renders multiple pt-BR landing pages from MDX content.

The architecture, content model, and roadmap live in `../docs/marketing/`. **Read those before changing anything substantive.** While developing, you can also browse the same files rendered at **`/docs`** (English handbook, `noindex`). The most important ones to start with:

- [`../docs/marketing/01-architecture.md`](../docs/marketing/01-architecture.md) — stack, folders, page model
- [`../docs/marketing/02-content-model.md`](../docs/marketing/02-content-model.md) — frontmatter schema, blocks, authoring rules
- [`../docs/marketing/06-ownership.md`](../docs/marketing/06-ownership.md) — who owns what

## Language

- **Code, comments, identifiers, this README**: English (en-US).
- **All content in `src/content/`**: Brazilian Portuguese (pt-BR).

## Requirements

- Node 22+
- npm (other package managers should work but aren't tested)

## Setup

```bash
cd marketing
npm install
```

## Common scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with HMR at `http://localhost:4321` (`/`, `/docs`, `/design-system`, LP slugs) |
| `npm run build` | Static site build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | TypeScript + Astro content schema check |
| `npm test` | Vitest unit tests for pure libs (`src/lib/*`) |
| `npm run test:watch` | Vitest in watch mode |

> Astro's anonymous telemetry tries to write to a directory outside the project. If you don't want that prompt or the write, set `ASTRO_TELEMETRY_DISABLED=1` in your environment (or run the commands prefixed by it).

## Project layout

```
marketing/
├── astro.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── src/
│   ├── content.config.ts             # zod-backed content collections
│   ├── content/
│   │   └── icps/                     # one MDX per ICP-targeted LP
│   ├── components/
│   │   ├── blocks/                   # Hero, Features, RichText, CTA
│   │   ├── layouts/                  # BasicLP, DocsLayout (preview handbook)
│   │   ├── preview/                  # DesignTokenPreview (tokens UI for /design-system)
│   │   └── primitives/               # Container, Section, Heading, Button
│   ├── lib/                          # pure logic (no Astro/JSX imports)
│   │   ├── schema.ts                 # zod schemas + token override keys
│   │   ├── tokens.ts                 # scoped token override CSS builder
│   │   ├── pages.ts                  # page id, block split helpers
│   │   ├── handbookNav.ts            # sidebar titles for /docs handbook
│   │   └── designTokenPreview.ts     # token list for /design-system preview
│   ├── pages/
│   │   ├── index.astro               # local browse-all index (noindex)
│   │   ├── design-system.astro       # token + primitive gallery (noindex)
│   │   ├── docs/
│   │   │   ├── index.astro           # handbook index (noindex)
│   │   │   └── [slug].astro          # renders ../docs/marketing/*.md
│   │   └── [...slug].astro           # generic catch-all renderer
│   └── styles/
│       ├── global.css                # Tailwind v4 + design tokens
│       └── docs-markdown.css         # scoped prose for handbook pages
└── tests/
    └── lib/                          # vitest unit tests for pure libs
```

## Adding a new landing page

1. Create `src/content/icps/<slug>.mdx`.
2. Fill the frontmatter following the schema in `src/lib/schema.ts`. Required: `slug`, `title`, `description`, `layoutName`, `blocks`.
3. Compose the page with available blocks: `Hero`, `Features`, `RichText`, `CTA`.
4. (Optional) Add design-token overrides under `tokenOverrides`. Allowed keys are listed in `TOKEN_OVERRIDE_KEYS` in `src/lib/schema.ts`.
5. (Optional) Use the MDX body for long-form copy, then add `- type: RichText` with `source: body` to the block list to slot it in.
6. Run `npm run check` to validate the schema and `npm run dev` to preview at `http://localhost:4321/<slug>`.

Two real examples are already authored:

- `src/content/icps/pequena-empresa.mdx` — uses default tokens.
- `src/content/icps/morador-sp.mdx` — overrides `color.cta.bg` and `color.accent` to a green hue, demonstrating the override mechanism end-to-end.

## What is intentionally not here yet

These are documented in `../docs/marketing/` but not implemented in this MVP. They depend on Gustavo's hosting/lead-platform decisions or are explicitly post-MVP:

- `LeadForm` block and lead destination integration (see `02-content-model.md` and `07-ci-cd-brief.md`)
- A/B variant picker, edge logic, experiments folder
- Multi-domain build script (`scripts/build-domain.mjs`) and per-domain config
- Debug/preview index host
- CI/CD pipeline, Lighthouse-CI gate
- Fragments collection, additional blocks (Testimonials, FAQ, Pricing, etc.)

The architecture is designed so each of those can be added without touching the existing block/content/route code.

## Conventions

- Pure logic goes in `src/lib/` with no Astro or framework imports — that's the only code reachable by Vitest. Anything in `src/components/` is presentation only.
- Components read tokens (e.g. `var(--color-cta-bg)`), never hard-coded values. Token overrides flow through automatically.
- **Design system**: new or renamed tokens require updates to `src/lib/designTokenPreview.ts` (and `@theme` in `global.css` when exposing utilities); new primitives need examples on `/design-system`. See `docs/marketing/08-design-system.md` for the full PR checklist.
- Frontmatter validation errors fail the build with a readable message — that's the contract. If you find yourself working around the schema, change the schema, don't bypass it.
- Adding a block is additive: extend the discriminated union in `schema.ts`, add a component in `components/blocks/`, add a branch in `[...slug].astro`. No existing pages should break.
