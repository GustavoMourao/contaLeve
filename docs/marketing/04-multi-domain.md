# 04 — Multi-domain Builds

## Decision

**One content tree. N independent static artifacts. One artifact per domain.**

We do not run a single deployment that serves multiple domains via host-based routing. Each domain gets its own clean build, deployed to its own static host.

## Why

- **Operational simplicity.** Each domain's CDN/host serves a self-contained `dist/`. No host-based rewrites, no shared environment risk.
- **Independent rollback.** A bad deploy on `domain-a.com` does not endanger `domain-b.com`.
- **Per-domain customization.** Different analytics keys, OG defaults, robots.txt, sitemap, canonical hosts — all driven by environment, not code.
- **Trivial mental model.** "What's published on this domain?" is answered by listing the `dist/` of that domain's last build.
- **Cheap.** Static hosting per domain is essentially free at our volumes.

## Trade-off accepted

Building N times is slower than building once. At our scale (≤ a few dozen domains), this is not a concern. If the matrix grows beyond practical CI runtime, we revisit with caching or sharded builds.

## Content → domain mapping

The mapping lives **in content frontmatter**, not in code:

```yaml
domains: ["luzbarata-sp.com.br"]
```

Rules:

- A page with `domains: []` or no `domains` field is **not published anywhere**. It's a draft.
- A page can list multiple domains. The same page will be emitted into every matching domain's build.
- A page with `domains: ["*"]` is published everywhere. Use sparingly (legal pages, generic 404s).

## Build orchestration

A single script — `marketing/scripts/build-domain.mjs` — drives one domain build:

1. Read `DOMAIN` from environment (e.g. `DOMAIN=luzbarata-sp.com.br`).
2. Read `marketing/config/domains/<domain>.json` for that domain's settings (canonical URL, analytics id, OG defaults, robots policy).
3. Filter content collections to entries whose `domains` includes `DOMAIN` or `"*"`.
4. Set Astro build env: `SITE`, `BASE_URL`, `OG_DEFAULT_IMAGE`, etc.
5. Run `astro build` with the filtered set.
6. Output to `marketing/dist/<domain>/`.

The filtering is a pure function in `src/lib/domains.ts`:

```
filterPagesForDomain(pages: PageData[], domain: string): PageData[]
```

It is unit-tested with fixtures covering: exact match, multi-domain match, `"*"` wildcard, missing field, draft pages.

## Per-domain configuration

Each published domain has a JSON config file:

```
marketing/config/domains/
├── luzbarata-sp.com.br.json
└── _example.json
```

Conceptual shape:

```json
{
  "host": "luzbarata-sp.com.br",
  "siteUrl": "https://luzbarata-sp.com.br",
  "defaultOgImage": "/og/luzbarata-sp.png",
  "analytics": {
    "provider": "posthog",
    "publicKey": "phc_xxx"
  },
  "robots": {
    "allow": true
  },
  "legal": {
    "companyName": "...",
    "cnpj": "..."
  }
}
```

A zod schema validates these too. A missing or malformed config fails the build immediately.

**Secrets do not live in these files.** The JSON only contains *public* values that ship to the browser. Anything sensitive is read from environment variables in CI.

## Sitemap, robots, canonicals

Each domain produces its own:

- `sitemap.xml` listing only that domain's pages, with absolute URLs using its `siteUrl`.
- `robots.txt` reflecting that domain's `robots.allow` config and pointing to its sitemap.
- `<link rel="canonical">` on every page, computed from the domain's `siteUrl` + page slug.

Astro's `@astrojs/sitemap` integration is wired through the per-domain config so we never hand-edit XML.

## Local development

Local dev is **single-domain by default**. Dev mode reads `MARKETING_DEV_DOMAIN` (default `dev.local`) and behaves exactly like a build for that domain — same filtering, same canonicals, same analytics gating. This matches production behavior and avoids "works in dev, broken at build" surprises.

For multi-domain inspection during development, run separate `dev:domain` commands in parallel terminals; each binds a different port.

## Debug / preview index (single-URL view of everything)

In addition to the per-domain artifacts, the build pipeline produces a **debug index**: a single host where **every published LP (and every A/B variant) is browsable under one URL**, regardless of its production domain.

Why we want this:

- **QA**: review all LPs of a release in one place without juggling DNS or hosts.
- **Stakeholder review**: a single shareable link to walk Maickell or anyone else through every LP.
- **Cross-LP audits**: catch design drift, broken images, broken forms across the whole catalog at a glance.
- **Bug reports**: easy to point at a specific URL when an issue is reported.

How it works:

1. The pipeline produces an extra build with `DOMAIN=__preview__` (or similar internal flag).
2. The preview build **does not filter** by `domains` — it includes every page, regardless of which domain(s) own it.
3. Each page is namespaced in the URL by its production domain, e.g.:

   ```
   https://preview.<internal>/luzbarata-sp.com.br/homeowner-sp/
   https://preview.<internal>/luzbarata-sp.com.br/_v/B/homeowner-sp/
   https://preview.<internal>/<another-domain>/<another-slug>/
   ```

4. An auto-generated index page at `/` lists every LP grouped by domain, with badges for ICP, active experiment, and variant.

Constraints:

- **Always served with `X-Robots-Tag: noindex`** and `<meta name="robots" content="noindex">`. The preview must never appear in search results.
- **Access-controlled**: HTTP basic auth, IP allow-list, or host-provided access protection. No public preview.
- **Lead forms in preview submit to a sandboxed destination** (or a no-op) — never to the production lead database. The form block respects an env flag (`LEAD_DEST=sandbox`) emitted by the preview build.
- **Analytics is disabled in preview** so QA traffic does not pollute funnel data.

The preview index is part of the platform Gustavo owns. Implementation details belong in his hosting design doc; the contract documented here is what Maickell can rely on.

## Deployment

This doc describes the *build* side. The CI/CD pipeline that actually publishes each `dist/<domain>/` to its host is owned by Gustavo and specified in [07 — CI/CD Brief](./07-ci-cd-brief.md).

## Open questions

- Where do shared design tokens differ per domain (different brand identity per ICP-targeted domain)? If yes, add `theme` to the domain config and load it as CSS variables. Defer until we hit it.
- Do we want a top-level "marketing root" domain (e.g. `marketing.contaleve.com`) where everything is published as a preview before promoting to its real domain? Probably yes — Gustavo's CI/CD brief should consider it.
