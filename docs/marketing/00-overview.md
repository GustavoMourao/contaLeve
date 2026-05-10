# 00 — Marketing Overview

## Why this exists

We need to **validate demand and capture leads** by publishing targeted landing pages aimed at clearly defined Ideal Customer Profiles (ICPs). The goal is to learn quickly what messaging, audience, and offer convert best, with a stack that is cheap to operate and easy for one designer/frontend (Maickell) to evolve without help on every change.

## Audience & language

This project targets a **Brazilian audience exclusively**. There is no i18n layer and there will not be one.

- **Code, documentation, and contributor-facing surfaces**: English (en-US).
- **All user-facing content** (copy in MDX, headlines, button labels, form fields, image alt text, OG metadata, success/error messages, legal text): **Brazilian Portuguese (pt-BR)**.

Treat this as a hard rule: a string in pt-BR never belongs in a component file, and a string in en-US never belongs in MDX content.

## What we're building

A standalone marketing site engine that:

1. Generates **multiple landing pages from MDX content**, each composed of generic, reusable blocks (Hero, Features, FAQ, CTA, RichText, LeadForm, etc.).
2. Supports **dozens of LPs targeted at different Ideal Customer Profiles (ICPs)** without code duplication.
3. Supports **build-time A/B variants** for copy, imagery, and layout experiments — including limited design-token overrides (e.g. CTA color) per variant.
4. Can be **built per domain**: one content tree → N independent static artifacts deployed to different domains.
5. Provides a **debug/preview index** where every published LP can be browsed under a single URL, regardless of its production domain. This is for QA and stakeholder review only and is not indexed.
6. Treats **lead capture as a first-class concern**: every LP has at least one form. Forms share a common base shape but allow per-ICP additions and hidden metadata about the page origin.
7. Optimizes for **Core Web Vitals**: minimal JavaScript, static HTML by default, image optimization, font strategy.

## What we are explicitly *not* building (yet)

- A CMS UI. Content lives in MDX in the repo. A CMS adapter can be added later if non-engineers need to author.
- A runtime A/B framework. We use build-time variants instead (see [03 — A/B Testing](./03-ab-testing.md)).
- An i18n layer. There will be only pt-BR content.
- Authentication, accounts, dashboards, or anything product-shaped.

## Lead capture principles

Forms are central to the marketing site. The architecture commits to:

- **One shared `LeadForm` block** with a common base of fields (e.g. name, email, phone) configurable from frontmatter.
- **Per-ICP extension**: any LP can add extra fields specific to its audience (e.g. company size, monthly bill range) via frontmatter, without component changes.
- **Hidden origin metadata** captured automatically on every submission: page slug, ICP, domain, A/B experiment id and variant, UTM parameters, referrer, and the commit SHA of the build the visitor saw. Authors do not configure these — the form block injects them on submit.
- **Storage and security of the lead database** is owned by Gustavo (see [07 — CI/CD Brief](./07-ci-cd-brief.md)). The form block is agnostic to the destination.

## Design tokens

Tokens (color, type scale, spacing, radius, shadows) are defined once and **shared across all LPs by default**. The architecture must allow **scoped overrides** — at minimum per A/B variant, ideally per page — so we can run experiments like "does a green CTA convert better than orange on this LP?" without forking components.

Token overrides are not a near-term focus, but the initial token system must not preclude them. See [01 — Architecture](./01-architecture.md) for the design-token approach and [03 — A/B Testing](./03-ab-testing.md) for the variant override surface.

## The MVP

> **Two distinct landing pages, sharing the same component library and structure, with completely different content (text and imagery), built and deployed from a single content tree.**

The MVP is reached when:

- [ ] Two MDX files exist in `marketing/src/content/pages/`, each describing a complete LP.
- [ ] Both LPs render correctly via the same generic page renderer and block library.
- [ ] No content text or image path is hardcoded inside any component — everything is sourced from MDX/frontmatter.
- [ ] Lighthouse mobile scores ≥ 95 on Performance, Accessibility, Best Practices, SEO for both pages.
- [ ] One LP is deployed to a real domain (the second can stay on a preview URL until its domain is ready).
- [ ] A working lead capture form on at least one of the LPs, posting to a chosen lead destination.

When that is true, we can start spinning up new ICP variations purely by adding MDX files.

## Stack decisions (locked)

| Decision | Choice |
|---|---|
| Site framework | **Astro** |
| Authoring format | **MDX** (frontmatter-driven blocks + optional rich body) |
| Styling | **Tailwind CSS v4** (matches existing tooling familiarity) |
| Multi-domain | **Build per domain** (one content tree, N static artifacts) |
| A/B testing | **Build-time variants** (separate MDX per variant) |
| Hosting | TBD (Cloudflare Pages, Netlify, Railway, or similar — Gustavo decides in CI/CD brief) |
| Analytics | TBD (likely PostHog Cloud — to be confirmed) |
| Lead capture destination | TBD — Gustavo's call, including the lead database and its security |

Rationale for Astro: zero JS by default, first-class MDX, type-safe content collections, file-based routing, image optimization built-in. Best-in-class Web Vitals for content sites with minimal effort.

## Open questions

- Which domains will be the first targets? Need at least one purchased and DNS-ready before the MVP can fully ship.
- Lead capture destination and database — Gustavo to define (see [07 — CI/CD Brief](./07-ci-cd-brief.md)).
- Analytics provider — PostHog (also gives feature flags) vs Plausible (lighter, privacy-first) vs Umami?
- Do we need an LGPD-compliant consent/cookie banner on day one?
