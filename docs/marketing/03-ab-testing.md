# 03 — A/B Testing (Build-time Variants)

## Decision

**A/B variants are full, separately-authored MDX files**, generated at build time. We do **not** ship a runtime experimentation framework in the marketing site.

## Why build-time variants

- **Web Vitals first.** No client-side library, no flicker, no flash-of-original-content.
- **Static-CDN friendly.** Each variant is plain HTML at a unique path. CDN caching stays trivial.
- **Crawler-friendly.** Both variants are real pages; we control indexing via `rel=canonical`.
- **Designer-friendly.** Maickell authors variants by copying an MDX file and editing it. No code, no flag system to learn.
- **Testable.** Variant assignment is a pure function. Trivial to unit test.

## What "experiment" means here

An **experiment** is a named test (e.g. `hero-copy-2026-q2`) that has **two or more variants**. A **variant** is a complete MDX file representing one possible page rendering. The picker decides which variant a visitor sees on their first visit and remembers that choice in a cookie (sticky assignment).

## File layout

```
src/content/
├── icps/
│   └── homeowner-sp.mdx                    # base / control
└── experiments/
    ├── homeowner-sp.hero-copy-2026-q2.A.mdx
    └── homeowner-sp.hero-copy-2026-q2.B.mdx
```

Naming convention: `<base-slug>.<experiment-id>.<variant-key>.mdx`

The base file (the "control") may either:

- **Be one of the variants** — declare itself with `experiment: { id, variant: "A" }` and skip the separate file. Simpler, fewer files.
- **Be neutral** — exist without an `experiment` block, used as fallback for non-experiment domains.

We default to **the base file is variant A**: the experiments folder only holds *additional* variants (B, C, ...).

## Frontmatter additions

Variants extend the standard page schema with one optional block:

```yaml
experiment:
  id: "hero-copy-2026-q2"
  variant: "B"
  weight: 0.5                  # optional, defaults to equal split among the experiment's variants
```

Validation rules (enforced in `config.ts`):

- All variants of an experiment must share the same `slug`, `domains`, and `layout`. They differ only in *content* and *theming*.
- Variant keys must be unique within an experiment.
- Weights, if provided, must sum to 1.0 across all variants of the experiment (with a small tolerance).

### What variants can change

A variant MDX file can differ from the control along any of these axes:

- **Copy** — headlines, subheads, CTA labels, body text.
- **Imagery** — hero images, feature icons, OG image.
- **Block composition** — different blocks present, different ordering.
- **Block props** — same blocks, different inputs.
- **Design-token overrides** via the page-level `tokenOverrides` map (see [01 — Architecture](./01-architecture.md) and [02 — Content Model](./02-content-model.md)). This is the right tool for "does a green CTA convert better than orange?" experiments. The variant simply declares:

  ```yaml
  tokenOverrides:
    color.cta.bg: "#16a34a"
  ```

  No component changes. No code in the variant file.

What variants cannot change: layout, slug, domain set, route shape. Those define the experiment's identity and must be invariant across its variants.

## Routing & assignment

For a given experiment with base slug `homeowner-sp`:

- The **canonical URL** is `/homeowner-sp/`.
- Each variant is also generated at `/homeowner-sp/_v/<variant-key>/` (a stable, indexable URL — useful for QA, manual sharing, and crawler hints).
- All variant URLs declare `<link rel="canonical" href="/homeowner-sp/" />` so search engines consolidate signals on the canonical.

Visitor assignment flow (the only piece that runs at the edge or in a tiny script):

1. Visitor lands on `/homeowner-sp/`.
2. A **lightweight edge function or `<script>` tag** checks for an `ab_<experiment-id>` cookie.
3. If absent, pick a variant via `pickVariant(experimentId, weights, randomSeed)` and set a 30-day cookie.
4. If the chosen variant is anything other than A (the canonical), do an HTTP redirect to `/homeowner-sp/_v/<variant-key>/` (or rewrite, depending on host).

`pickVariant` is a **pure function** in `src/lib/experiments.ts`. Tests cover:

- Equal-weight split converges to expected ratios over N samples with a seeded RNG.
- Weighted split honors the declared weights.
- Sticky cookie always returns the same variant on subsequent calls.

## Build-time generation

The build pipeline:

1. Reads all entries from `pages` and `icps` collections.
2. For each entry, finds matching variants under `experiments/` (by `slug` and `experiment.id`).
3. Emits:
   - The canonical path (`/<slug>/`) using the chosen control variant.
   - One `_v/<variant-key>/` path per non-canonical variant.
4. Generates a manifest at `dist/_experiments.json` listing experiments, variants, weights, and paths. The edge picker reads this manifest.

The manifest is the **only** artifact the picker depends on. New experiments work as soon as the build emits an updated manifest — no picker code changes needed.

## Measurement

To draw conclusions, we need to record which variant a visitor saw and which converted:

- The page injects a small `data-experiment` and `data-variant` attribute on `<body>`.
- The analytics provider (TBD — see Overview) is configured to capture those attributes on every event.
- Conversion events emit explicitly from `LeadForm` submission.

We are **not** building a custom dashboard for results. Use the analytics provider's funnel/experiment view.

## Operational rules

- One experiment per page at a time. Multivariate experiments multiply variants combinatorially and slow down learning. Run them sequentially.
- Minimum two weeks per experiment, or until the analytics provider's calculator declares significance — whichever is longer. Document the call in the relevant MDX as a comment block before retiring a variant.
- Promote a winner by **renaming the winning variant file to the base** and deleting the losing variant(s). This keeps the content tree clean.
- Never let an experiment run silently for months. Every active experiment must be listed in `docs/marketing/active-experiments.md` (created when the first experiment ships).

## Open questions

- Which host gives us the cleanest edge logic for cookie-based redirect? Cloudflare Pages + Workers is the leading candidate. Deferred to Gustavo's CI/CD brief.
- Do we want server-side bot filtering on assignment so crawlers always see the canonical? Lean yes — easy with a UA check at the edge.
