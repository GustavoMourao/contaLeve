import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { pageFrontmatterSchema } from './lib/schema';

/**
 * The `pages` collection (generic / brand pages) is documented in
 * 02-content-model.md but intentionally absent from the MVP — we only have
 * ICP-targeted LPs right now. Add it back in `src/content/pages/` and
 * register it here when the first generic page lands.
 */
const icps = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/icps' }),
  schema: pageFrontmatterSchema,
});

/**
 * English markdown handbook from `docs/marketing/` (repo root).
 * Browsed only in the preview app (`/docs/*`), not shipped on public LP domains
 * when those builds exclude these routes (see docs/07-ci-cd-brief.md).
 */
const handbook = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../docs/marketing' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { icps, handbook };
