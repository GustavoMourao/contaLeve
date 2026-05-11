# contaLeve — Project Documentation

This folder is the source of truth for non-code decisions on the **marketing workstream**: architecture choices, roadmaps, conventions, and task briefs.

## Language conventions

| Surface | Language |
|---|---|
| Source code, identifiers, comments | **English (en-US)** |
| Documentation (this folder) | **English (en-US)** |
| Commit messages, PR descriptions, issue titles | **English (en-US)** |
| User-facing content (MDX copy, images, alt text, OG metadata, form labels, error messages) | **Brazilian Portuguese (pt-BR)** |

This project targets a Brazilian audience exclusively. There is no internationalization (i18n) layer: there is only one content language, and it is **pt-BR**. Anything a visitor reads is pt-BR; anything a contributor reads in the codebase or docs is en-US.

## Index

### Marketing

| # | Document | Purpose |
|---|----------|---------|
| 00 | [Overview](./marketing/00-overview.md) | What we're building, why, MVP definition |
| 01 | [Architecture](./marketing/01-architecture.md) | Stack (Astro + MDX), folder structure, page model |
| 02 | [Content Model](./marketing/02-content-model.md) | Frontmatter schema, block library, authoring rules |
| 03 | [A/B Testing](./marketing/03-ab-testing.md) | Build-time variants strategy |
| 04 | [Multi-domain Builds](./marketing/04-multi-domain.md) | One content tree, N domain artifacts |
| 05 | [Roadmap](./marketing/05-roadmap.md) | Phased delivery plan, starting with the 2-LP MVP |
| 06 | [Ownership](./marketing/06-ownership.md) | Roles & boundaries between Maickell and Gustavo |
| 07 | [CI/CD — Brief for Gustavo](./marketing/07-ci-cd-brief.md) | Task brief: deployment & build pipeline |

## Conventions

- Each doc is numbered to suggest reading order, but every doc must stand alone.
- Decisions go in the relevant doc with a short **Decision** block stating *what* and *why*.
- Open questions go in an **Open questions** section at the bottom of the doc, not in code.
- When a decision changes, update the doc in the same PR as the code change.
