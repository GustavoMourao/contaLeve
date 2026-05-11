import { z } from 'astro/zod';

/**
 * Allowed token-override keys. The list is intentionally narrow at the MVP stage:
 * adding a new overridable token is an explicit, reviewable change.
 */
export const TOKEN_OVERRIDE_KEYS = [
  'color.bg',
  'color.fg',
  'color.cta.bg',
  'color.cta.fg',
  'color.accent',
] as const;

export type TokenOverrideKey = (typeof TOKEN_OVERRIDE_KEYS)[number];

const tokenOverridesSchema = z
  .partialRecord(z.enum(TOKEN_OVERRIDE_KEYS), z.string())
  .optional();

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const heroBlockSchema = z.object({
  type: z.literal('Hero'),
  headline: z.string().min(1),
  subhead: z.string().optional(),
  cta: ctaSchema,
});

const featureItemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const featuresBlockSchema = z.object({
  type: z.literal('Features'),
  heading: z.string().optional(),
  items: z.array(featureItemSchema).min(1),
});

const richTextBlockSchema = z.object({
  type: z.literal('RichText'),
  /**
   * The MVP only supports rendering the page's own MDX body.
   * Fragment support is documented in 02-content-model.md and will be added later.
   */
  source: z.literal('body'),
});

const ctaBlockSchema = z.object({
  type: z.literal('CTA'),
  headline: z.string().optional(),
  cta: ctaSchema,
});

export const blockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  featuresBlockSchema,
  richTextBlockSchema,
  ctaBlockSchema,
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];

export const seoSchema = z
  .object({
    canonical: z.url().optional(),
    noIndex: z.boolean().optional(),
  })
  .optional();

/**
 * Page schema, shared by `pages` and `icps` collections.
 * Domain filtering (`domains`), experiments and fragments are part of the
 * documented model but not implemented yet — they're intentionally absent
 * here so that the MVP stays small. Adding them later is additive.
 */
export const pageFrontmatterSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
      message: 'slug must be kebab-case (a-z, 0-9, hyphens; no leading/trailing hyphen)',
    }),
  title: z.string().min(1).max(60),
  description: z.string().min(70).max(160),
  layoutName: z.literal('BasicLP'),
  tokenOverrides: tokenOverridesSchema,
  seo: seoSchema,
  blocks: z.array(blockSchema).min(1),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
