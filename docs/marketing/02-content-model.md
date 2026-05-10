# 02 — Content Model

This doc defines the *contract* between content (MDX files) and the rendering engine (blocks). It is the single most important doc to read before authoring or modifying a block.

## Content language

**All user-facing strings are written in Brazilian Portuguese (pt-BR).** This includes every value of every frontmatter field that is rendered to a visitor: titles, headlines, subheads, CTA labels, FAQ questions and answers, form field labels and placeholders, error messages, OG metadata, alt text. Field *names* (frontmatter keys) and any contributor-facing strings remain en-US.

If you find yourself adding an en-US string to MDX, stop — that string belongs in a component or a constant, not in content. If you find yourself adding a pt-BR string to a component, stop — that string belongs in MDX.

## Principles

1. **Structure in frontmatter, narrative in body.** Composition, ordering, and props live in YAML frontmatter. Long-form prose and SEO copy live in the MDX body.
2. **Schemas are enforced.** Every collection has a zod schema in `src/content/config.ts`. A bad MDX file fails the build with a readable error. There is no "just render whatever".
3. **Blocks are dumb.** A block accepts typed props and renders markup. It never fetches, computes business logic, or reads global state.
4. **No hardcoded copy.** If a string ends up on screen, it came from MDX. Components contain layout and design, never user-facing text.
5. **Additive evolution.** New block? Add a new entry to the discriminated union schema and a new component. Existing pages keep working.
6. **Tokens are theming, not content.** Design-token overrides may live in frontmatter, but only by key (e.g. `color.cta.bg`). Free-form CSS in content is forbidden.

## Collections

Defined under `src/content/`:

| Collection | Path | Purpose |
|---|---|---|
| `pages` | `src/content/pages/*.mdx` | Generic / brand pages (e.g. home, about) |
| `icps` | `src/content/icps/*.mdx` | One LP per Ideal Customer Profile |
| `experiments` | `src/content/experiments/*.mdx` | A/B variants tied to a base page |
| `fragments` | `src/content/fragments/*.{mdx,yaml}` | Reusable snippets referenced by id from any page |

All collections share the same **page schema** described below, except `fragments`, which uses block-shaped or list-shaped schemas depending on type.

## Page frontmatter schema (conceptual)

The schema is defined in zod inside `src/content/config.ts`. Conceptually:

```yaml
# Required
slug: "homeowner-sp"                    # unique within its collection; drives URL
title: "Pague menos na conta de luz"    # <title> + default OG title
description: "Compare planos em 30s."   # <meta name="description"> + default OG description
layout: "BasicLP"                       # which layout component wraps the blocks

# Multi-domain (see 04-multi-domain.md)
domains: ["luzbarata-sp.com.br"]        # which domain builds include this page

# A/B testing (see 03-ab-testing.md)
experiment:                             # optional
  id: "hero-copy-test-2026-q2"
  variant: "A"

# SEO / social (all optional, sensible defaults)
seo:
  ogImage: "./images/og.png"            # processed by Astro Image
  canonical: "https://luzbarata-sp.com.br/"
  noIndex: false

# Design-token overrides (optional, scoped to this page only)
tokenOverrides:
  color.cta.bg: "#16a34a"
  color.cta.fg: "#ffffff"

# The page composition
blocks:
  - type: "Hero"
    headline: "..."
    subhead: "..."
    cta: { label: "...", href: "..." }
    image: "./images/hero.jpg"
  - type: "Features"
    items: [...]
  - type: "RichText"
    source: "body"                      # "body" means: render the MDX body here
  - type: "FAQ"
    fragmentId: "faq.energy-basics"     # references src/content/fragments/faq.energy-basics.yaml
  - type: "CTA"
    label: "..."
    href: "..."
```

The `blocks` array is a **discriminated union** keyed on `type`. Each block has its own zod sub-schema declaring its required and optional props. Adding a new block means adding one new sub-schema entry and one new component.

## MDX body usage

The MDX body is treated as the content of exactly one block, addressed via `source: "body"` on a `RichText` block. This keeps the model uniform: every block has a defined source, no special-casing required at render time.

Authoring rules for the body:

- Use it for SEO long-form sections (FAQ-rich text, regulatory disclaimers, narrative case studies).
- Embedded MDX components are allowed but limited to a small whitelist (`<Callout>`, `<Image>`, `<Quote>`). The whitelist lives in the same registry as blocks. **Do not import components ad-hoc inside MDX.**
- Heading hierarchy must start at `h2`. The page title is rendered by the layout/Hero, never duplicated as `h1` in the body.

## The block library — initial set (MVP)

The minimum to ship two distinct LPs. Each is implemented as a single Astro component under `src/components/blocks/`.

| Block | Purpose | Required props (sketch) |
|---|---|---|
| `Hero` | Above-the-fold introduction + primary CTA | `headline`, `subhead`, `cta`, `image` |
| `Features` | Grid of value props | `items[] { icon, title, body }` |
| `Testimonials` | Social proof | `items[] { quote, author, role, avatar? }` or `fragmentId` |
| `FAQ` | Accordion of Q&A | `items[] { question, answer }` or `fragmentId` |
| `RichText` | MDX body or referenced fragment | `source: "body" \| "fragment"`, optional `fragmentId` |
| `CTA` | Standalone call-to-action band | `headline?`, `label`, `href` |
| `LeadForm` | Lead capture form (see [LeadForm in detail](#leadform-in-detail)) | `formId`, `extraFields[]?`, `successMessage`, `submitLabel` |

Every block must:

- Be a pure presentational component.
- Accept only props (no global state, no fetch).
- Be accessible by default (proper landmarks, focus order, alt text required for images).
- Use `astro:assets` for any image prop.
- Not introduce client-side JavaScript unless the block fundamentally requires it (e.g. `LeadForm`, accordion `FAQ`). When JS is required, hydrate with `client:visible`.

## Blocks added later (post-MVP)

These will appear as the catalog grows. They are **not** in the MVP unless explicitly needed:

- `Pricing` — tiered pricing tables
- `Stats` — KPIs / numbers band
- `Logos` — "as seen in" logo cloud
- `StepByStep` — numbered process explanation
- `Comparison` — feature/competitor comparison table
- `VideoEmbed` — privacy-respecting video embeds (lazy YouTube facade or self-hosted)

Each addition is a small PR: new sub-schema in `config.ts`, new component, optional fragment example.

## LeadForm in detail

Lead capture is the most important block. Every LP carries at least one `LeadForm`. The block is designed to be a **single, well-tested component** that adapts to per-ICP needs through configuration — never through forking.

### Three sources of fields

A submission's payload is assembled from three layers:

1. **Base fields** — defined once in code (`src/content/forms/base.ts`). Every form has them. Initial set: `name`, `email`, `phone`. Changes here are platform changes (Gustavo).
2. **Extra fields** — declared per LP in frontmatter. ICP-specific (e.g. `monthlyBillRange`, `companySize`, `state`). Authored by Maickell. Any number, any order, validated against a small whitelist of allowed field types (`text`, `email`, `phone`, `select`, `radio`, `number`, `checkbox`).
3. **Hidden origin metadata** — collected automatically at submit time, never authored. Always present, always sent.

### Hidden origin metadata (always captured)

Every submission carries the following metadata so we can later answer "where did this lead come from?" without guessing:

| Key | Source |
|---|---|
| `pageSlug` | The slug of the LP that hosted the form |
| `icp` | The ICP id of the LP, if classified |
| `domain` | The host the visitor saw (e.g. `luzbarata-sp.com.br`) |
| `experimentId`, `variant` | Active A/B experiment, if any |
| `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm` | Parsed from the URL on first visit, persisted in a cookie |
| `referrer` | `document.referrer` at first visit |
| `firstVisitAt`, `submittedAt` | Timestamps |
| `buildSha` | Commit SHA of the build the visitor saw |
| `userAgent` | For bot filtering downstream |

This metadata is non-negotiable and authors do not configure it. The block injects it.

### Frontmatter shape (per-LP)

```yaml
- type: "LeadForm"
  formId: "main"                            # disambiguates if a page has more than one form
  submitLabel: "Quero economizar"
  successMessage: "Recebemos seu contato. Em breve entramos em contato."
  extraFields:
    - { key: "monthlyBillRange", type: "select", label: "Quanto você paga por mês?", required: true,
        options: ["Até R$ 200", "R$ 200–500", "R$ 500–1000", "Acima de R$ 1000"] }
    - { key: "state", type: "select", label: "Estado", required: true, options: ["SP", "RJ", "MG", "..."] }
    - { key: "consentMarketing", type: "checkbox", label: "Aceito receber comunicações.", required: false }
  destination:                              # optional override; defaults to a global config
    kind: "default"
```

Validation rules (enforced in the schema):

- `formId` is unique within a page.
- `extraFields[].key` must not collide with base-field keys or hidden-metadata keys.
- `extraFields[].type` must be from the supported whitelist.
- All visitor-visible labels (`submitLabel`, `successMessage`, `extraFields[].label`, options) must be pt-BR.

### Destination

The form block is **agnostic to the storage destination**. The actual lead destination — provider, database, encryption, retention — is owned by Gustavo and configured in the per-domain config or via env. See [07 — CI/CD Brief](./07-ci-cd-brief.md). The block calls a single internal endpoint (or provider URL) and trusts the platform to handle the rest.

### Behavior

- Hydrated as a client island (`client:visible`) — required for validation and submission.
- Submits as JSON to the configured destination.
- On success: shows `successMessage`, fires a `lead_submitted` analytics event including hidden metadata.
- On failure: shows a friendly pt-BR error and emits a `lead_submit_failed` event.
- Bot honeypot field included by default (invisible).
- Inline validation in pt-BR using the browser's native constraint validation API where possible to keep JS small.

### Accessibility

- Every field has a visible `<label>`.
- Required fields are announced via `aria-required` and visually marked.
- Error messages are associated via `aria-describedby`.
- The form is fully keyboard-navigable; the submit button is the last focusable element.

## Fragments

A fragment is a **named, reusable piece of content** addressable by id (e.g. `faq.energy-basics`, `testimonials.smb`). They live in `src/content/fragments/` and are loaded by `lib/content.ts` when a block references them.

Use fragments when:

- The same FAQ list appears on five LPs.
- The same testimonial block recurs across ICPs.
- Legal/disclaimer copy must stay identical everywhere.

Do **not** use fragments for content that is *almost* the same. Duplicate it instead and let it diverge — that's the point of per-ICP LPs.

## Image conventions

- All images are co-located with their MDX page when they are page-specific:
  ```
  src/content/icps/
    homeowner-sp.mdx
    homeowner-sp/
      hero.jpg
      og.png
  ```
- Shared imagery lives under `src/content/_assets/` (or per-fragment folders for fragment-owned media).
- Frontmatter image paths are **relative to the MDX file**. Astro Content Collections handle the resolution + processing.
- Every image must declare meaningful `alt` text in frontmatter. Decorative-only images use `alt: ""` explicitly — never omit the field.

## Authoring checklist (Maickell)

Before opening a PR for a new or changed LP, verify:

- [ ] `slug` is unique within its collection.
- [ ] `domains` lists every domain that should publish this page.
- [ ] Every block in `blocks[]` exists in the registry.
- [ ] Every required prop on every block is filled.
- [ ] Every image has `alt` text.
- [ ] `description` is between 70 and 160 characters.
- [ ] `title` is ≤ 60 characters.
- [ ] If using a fragment, the fragment id exists.
- [ ] If using `tokenOverrides`, every key matches the documented token namespace.
- [ ] All visitor-visible strings are in pt-BR.
- [ ] If a `LeadForm` is present, `extraFields[].key` doesn't collide with base or metadata keys.
- [ ] `astro check` passes locally (type and content schema validation).
- [ ] Lighthouse mobile preview ≥ 95 across the four scores.

## Open questions

- Do we want a `cta.tracking` field on all CTA-bearing blocks for analytics events, or do we attribute clicks via DOM data attributes? Lean toward the former — explicit, type-safe, easier to grep.
- Initial `extraFields` whitelist for `LeadForm` (`text`, `email`, `phone`, `select`, `radio`, `number`, `checkbox`) — anything missing for the first two ICPs?
