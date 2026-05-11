# 07 — CI/CD Brief (for Gustavo)

> **Owner:** Gustavo
> **Status:** to be designed
> **Reviewer:** Maickell

This is a **task brief**, not a finished design. Maickell wrote it to capture intent and constraints. Gustavo will turn it into a real pipeline and document the chosen design back into this folder (or split it into more specific docs).

---

## Goal

Every push to `main` that affects `marketing/` results in:

1. The relevant **per-domain static artifact(s)** being built.
2. Each artifact being **deployed to its target host** under the correct domain.
3. A **preview URL** being published for any pull request that touches `marketing/`.
4. A **performance gate** preventing regressions on Web Vitals.

---

## Scope

In scope:

- Build pipeline for `marketing/` (Astro static output).
- Multi-domain build matrix (one job per domain — see [04 — Multi-domain](./04-multi-domain.md)).
- Deployment to chosen static host(s).
- DNS / TLS configuration documented and reproducible.
- Preview deploys for PRs.
- The **access-controlled debug/preview index** — single URL that exposes every LP and every A/B variant (see [04 — Multi-domain](./04-multi-domain.md)). `noindex`, sandboxed forms, no analytics.
- **Lead destination & lead database**: the receiving endpoint for `LeadForm` submissions, where the leads are stored, and how that storage is secured. Including but not limited to: provider choice (managed service vs self-hosted DB), encryption at rest, access controls, retention policy, LGPD posture, backups.
- Lighthouse-CI gate on Performance / A11y / Best Practices / SEO.
- Secret management for analytics keys, lead-capture provider keys, host tokens, lead database credentials.

Out of scope:

- Anything outside `marketing/`.

---

## Constraints & preferences

- **Static-first**: Astro is built with `output: "static"`. Any host with static-site support works; no Node runtime needed in production except for the A/B edge picker and the lead-capture endpoint (see below).
- **Edge or function runtime needed** for two specific concerns:
  - The **A/B picker** (cookie-based variant assignment + redirect).
  - The **lead-capture endpoint** that receives form submissions and writes to the lead database. May be a function on the same host or a separate service — Gustavo's call.
- **Cheap to run**: target free or near-free tiers at our current traffic.
- **One repo, multiple domains**: the pipeline must be able to build and deploy multiple domains from the same `main` branch with no manual steps.
- **No secrets in the repo**: `marketing/config/domains/*.json` may contain *public* values only. Secret values come from CI environment.
- **Reproducible**: any deploy can be rebuilt from a commit SHA + a domain name, deterministically.
- **Friendly to Maickell's workflow**: pushing a content-only change (MDX edits, image swaps) must trigger only the necessary builds and deploy without manual steps.

---

## Recommended host candidates (Gustavo to evaluate)

These are not decisions — they are starting points. We may end up with **a static host for the LPs and a separate runtime host for the lead endpoint and database** if that's cleaner.

**Static + edge candidates** (LP hosting):

- **Cloudflare Pages + Workers**: best free tier, Workers gives clean edge logic, multi-domain via separate Pages projects or one project with custom domains. Strong DNS integration if domains are on Cloudflare.
- **Netlify**: strong DX, Edge Functions, easy preview URLs, multi-domain via separate sites.
- **Vercel**: excellent DX, Edge Middleware, preview URLs, but free-tier limits can bite at LP scale.

**Runtime + DB candidates** (lead capture endpoint and database):

- **Railway**: good fit if Gustavo wants a small Node/Python service plus a managed Postgres in the same place, with simple env-var management and predictable pricing. Strong candidate for the lead backend.
- **Fly.io / Render**: similar profile to Railway; consider if regional placement or cold-start behavior matters.
- **Managed serverless DB (Supabase, Neon, Turso)** paired with a function on the same host as the LPs: avoids running a service, but couples the LP host to the lead path.

**It is acceptable — and likely simpler — to use one host for LPs and a different host (e.g. Railway) for the lead service.** They are separate concerns.

**Decision criteria** to weigh:

- Free-tier headroom for ≥ 5 domains and modest traffic.
- Edge-function or runtime ergonomics (TypeScript, cookies, redirects, DB connections).
- Per-domain isolation (so a deploy to domain A cannot affect domain B).
- DNS & TLS workflow.
- CI integration (GitHub Actions or built-in CI).
- For the lead path specifically: managed Postgres availability, encryption-at-rest defaults, backup/restore story, log retention, ease of meeting LGPD requirements.

Document the choice and the rejected alternatives in a new doc `docs/marketing/08-hosting.md` once decided. If LPs and lead service end up on different hosts, document both there.

---

## Required pipeline behaviors

### On pull request that touches `marketing/`

1. Run `astro check` (type & content schema validation).
2. Run `vitest run` over `marketing/tests/`.
3. Build for **one canonical preview domain** (e.g. `preview.<random>.marketing.contaleve.dev` or host-provided preview URL).
4. Publish preview URL as a PR comment.
5. Run Lighthouse-CI against the preview URL on a fixed set of representative pages (one per ICP). Fail the check if any score drops below the configured budget.

### On merge to `main` that touches `marketing/`

1. Run the same checks as above.
2. **Determine which domains need rebuilding** based on which content files changed. (A simple safe default: rebuild all domains. An optimization: diff `domains` arrays of changed pages and rebuild only affected hosts. Start with the safe default.)
3. For each affected domain, run `scripts/build-domain.mjs` with `DOMAIN=<host>`.
4. Deploy each `dist/<domain>/` to its target host under that domain.
5. Smoke-test each deployed domain (HTTP 200 on `/`, valid TLS, expected `Content-Type`).
6. Post a deployment summary (domain → URL → commit SHA) somewhere visible (PR comment on the merge commit, Slack, or a deployments log).

### On manual trigger

A workflow_dispatch (or equivalent) that can:

- Rebuild and redeploy a specific domain by name, on demand.
- Rebuild and redeploy *all* domains.
- Rebuild and redeploy the **debug/preview index** on demand.

---

## Lead capture & database (Gustavo's design space)

Maickell defines, in MDX, *what* fields exist on each form. Everything past the network boundary is yours to design. This section captures the contract, not the design.

### Contract the LeadForm block depends on

- A single endpoint URL per environment (production / preview / sandbox), provided to the build via env (`LEAD_ENDPOINT`).
- Accepts `POST` with JSON body of shape:
  ```
  {
    base: { name, email, phone, ...future },
    extra: { <ICP-defined keys> },
    metadata: { pageSlug, icp, domain, experimentId, variant, utm*, referrer, firstVisitAt, submittedAt, buildSha, userAgent }
  }
  ```
- Returns `2xx` on success, `4xx` on validation failure (with a human-readable pt-BR error string in `message`), `5xx` otherwise.
- CORS configured to allow every published domain.
- Idempotent enough that a double-submit due to a network blip does not create duplicate leads (suggest: client sends a request id; server dedupes within a small window).

### What you decide

- Where the endpoint runs (host's edge function, a Railway service, a Lambda, etc.).
- The lead store (managed Postgres, Firestore, Supabase, sheets — whatever fits the contract above and is durable).
- Encryption at rest, IP allow-listing for admin access, who can read leads.
- Backups and retention policy.
- LGPD posture: lawful basis recorded, consent audit trail, deletion path.
- Bot/abuse handling beyond the form's honeypot (rate limit, IP scoring, hCaptcha if needed).
- A simple way for Maickell to view recent leads (admin URL, exported sheet, anything appropriate).

### Preview safety

The contract requires that **preview / debug index builds use a sandbox endpoint** (`LEAD_ENDPOINT=https://.../sandbox`) which either no-ops or writes to a separate sandbox table. Production lead data must never receive a submission from the preview index.

---

## Secrets to plan for

(Names indicative — Gustavo decides final naming.)

| Secret | Used for |
|---|---|
| `ANALYTICS_KEY_<DOMAIN>` | Per-domain analytics public key (still kept out of repo for control) |
| `LEAD_ENDPOINT_PROD` / `LEAD_ENDPOINT_SANDBOX` | URL the LeadForm block POSTs to in production vs preview/debug builds |
| `LEAD_DB_URL` / `LEAD_DB_CREDENTIALS` | Connection string / credentials for the lead database (only on the lead service host, never in LP builds) |
| `LEAD_ADMIN_TOKEN` | Auth for the admin/inspection surface, if any |
| `HOST_DEPLOY_TOKEN` | CI → host authentication |
| `PREVIEW_INDEX_BASIC_AUTH` | Credentials gating the debug/preview index |
| `LIGHTHOUSE_CI_TOKEN` | Optional, if using a hosted Lighthouse-CI server |

All secrets configured via the CI provider's secret store, never written to disk by jobs that don't need them.

---

## Monitoring & alerting (initial scope)

For the MVP this can be lightweight:

- **Uptime check** per published domain (free tier of UptimeRobot, BetterStack, or the host's built-in checks).
- **Failed deploy** notifications to email / Slack.
- **Web Vitals regression** flagged by Lighthouse-CI on the next merge.

We are explicitly *not* setting up real-user-monitoring, error tracking, or APM until we have actual visitors.

---

## Deliverables expected from Gustavo

When this brief is executed, the following should exist:

- [ ] `docs/marketing/08-hosting.md` — chosen host(s) for LP and lead service, rationale, and account/domain setup steps.
- [ ] `docs/marketing/09-lead-platform.md` — lead endpoint contract implementation, database choice, security & LGPD posture, retention, admin/inspection surface.
- [ ] CI workflow file(s) implementing the behaviors above.
- [ ] `marketing/scripts/build-domain.mjs` (referenced in [04 — Multi-domain](./04-multi-domain.md)) actually implemented and used by CI.
- [ ] Lighthouse-CI config with explicit budgets matching the Performance section of [01 — Architecture](./01-architecture.md).
- [ ] The access-controlled debug/preview index, deployed and reachable, with sandbox `LEAD_ENDPOINT`.
- [ ] A short runbook in `docs/marketing/runbooks/deploy.md` covering: how to deploy manually, how to roll back, how to add a new domain, how to rotate a secret, how to inspect / export leads.

---

## Open questions for Gustavo

- Is GitHub Actions our CI of choice, or do we use the host's built-in CI?
- Do we want a single CI workflow that fans out per domain, or one workflow per domain? (Recommendation: matrix in a single workflow — simpler to maintain.)
- How do we handle a partially-failed multi-domain deploy (e.g. domain A succeeds, domain B fails)? Roll forward, or block until all green?
- Where does the A/B edge picker source its `_experiments.json` manifest? Bundled in each domain's `dist/`, or fetched at request time? (Recommendation: bundle.)
- DNS provider — Registro.br, Cloudflare, something else? Affects domain-add ergonomics.
- LP host vs lead service host — same place (e.g. Cloudflare Pages + Workers + a managed DB) or split (e.g. Cloudflare Pages for LPs + Railway for the lead service and Postgres)?
- LGPD: lawful basis (legitimate interest vs explicit consent) for lead capture? Affects the form's required consent checkbox shape.

When you've made these calls, please update this brief or supersede it with `08-hosting.md` and `09-lead-platform.md`.
