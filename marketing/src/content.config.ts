import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

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

export const collections = { icps };
