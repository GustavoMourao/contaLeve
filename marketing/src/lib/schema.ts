import { z } from 'astro/zod';

import { isReservedFieldKey } from './forms';

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

/**
 * Hero image. `src` accepts a path served from `public/` (e.g. `/images/foo.jpg`)
 * or an absolute URL. Width/height are required so the browser can reserve the
 * box and avoid CLS — the schema enforces them when an image is provided.
 *
 * Co-located content-collection images via Astro's `image()` schema helper are
 * a documented upgrade path; this stringly-typed shape is intentional for the
 * MVP because it keeps `src/lib/schema.ts` framework-free and easy to test.
 */
const heroImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const heroBlockSchema = z.object({
  type: z.literal('Hero'),
  headline: z.string().min(1),
  subhead: z.string().optional(),
  cta: ctaSchema,
  image: heroImageSchema.optional(),
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

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const faqBlockSchema = z.object({
  type: z.literal('FAQ'),
  heading: z.string().optional(),
  /**
   * The MVP only supports inline items. Fragment-based FAQ (`fragmentId`)
   * is documented in 02-content-model.md and will be added with the
   * fragments collection.
   */
  items: z.array(faqItemSchema).min(1),
});

/**
 * LeadForm extra-field types. Mirror the whitelist documented in
 * 02-content-model.md → "LeadForm in detail".
 */
const fieldKeySchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: 'field key must start with a letter and contain only letters, digits or underscores',
  })
  .refine((key) => !isReservedFieldKey(key), {
    message:
      'field key collides with a base field or hidden-metadata key (see src/lib/forms.ts)',
  });

const leadFormFieldSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('email'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('phone'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('number'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  z.object({
    type: z.literal('select'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    options: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal('radio'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
    options: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal('checkbox'),
    key: fieldKeySchema,
    label: z.string().min(1),
    required: z.boolean().default(false),
  }),
]);

export type LeadFormField = z.infer<typeof leadFormFieldSchema>;

const leadFormBlockSchema = z.object({
  type: z.literal('LeadForm'),
  formId: z
    .string()
    .min(1)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
      message: 'formId must be kebab-case',
    })
    .default('main'),
  title: z.string().optional(),
  intro: z.string().optional(),
  submitLabel: z.string().min(1).default('Enviar'),
  successMessage: z
    .string()
    .min(1)
    .default('Recebemos seu contato. Em breve falaremos com você.'),
  extraFields: z.array(leadFormFieldSchema).optional(),
});

export const blockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  featuresBlockSchema,
  richTextBlockSchema,
  ctaBlockSchema,
  faqBlockSchema,
  leadFormBlockSchema,
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
  title: z.string().min(1).max(80),
  description: z.string().min(70).max(180),
  layoutName: z.literal('BasicLP'),
  tokenOverrides: tokenOverridesSchema,
  seo: seoSchema,
  blocks: z.array(blockSchema).min(1),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
