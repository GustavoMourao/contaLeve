/**
 * Centralized lead-form contract.
 *
 * Everything that needs to know "what fields a lead has" or "what the submit
 * payload looks like" reads from this module. Keeping it framework-free makes
 * it trivially testable and reusable from the platform side later.
 */

export type BaseLeadFieldType = 'text' | 'email' | 'phone';

export interface BaseLeadField {
  readonly key: string;
  readonly label: string;
  readonly type: BaseLeadFieldType;
  readonly required: boolean;
  readonly placeholder?: string;
}

/**
 * The base set is defined in code (not MDX). Every form on the site collects
 * these. Changes here ripple to every form — that's intentional, per the
 * "centralized" requirement.
 */
export const BASE_LEAD_FIELDS: ReadonlyArray<BaseLeadField> = [
  {
    key: 'name',
    label: 'Nome',
    type: 'text',
    required: true,
    placeholder: 'Seu nome completo',
  },
  {
    key: 'email',
    label: 'E-mail',
    type: 'email',
    required: true,
    placeholder: 'voce@email.com.br',
  },
  {
    key: 'phone',
    label: 'WhatsApp',
    type: 'phone',
    required: true,
    placeholder: '(11) 99999-9999',
  },
];

/**
 * Keys that authors cannot use for `extraFields[].key` because they would
 * collide with base fields, hidden metadata, or the form's own bookkeeping.
 *
 * When the schema gains its `superRefine` validator (see `02-content-model.md`
 * authoring rules), it will check authored extra-field keys against this set.
 */
export const RESERVED_FIELD_KEYS: ReadonlySet<string> = new Set<string>([
  ...BASE_LEAD_FIELDS.map((field) => field.key),
  // bookkeeping
  'formId',
  // hidden metadata (kept in sync with mountHiddenMetadata in LeadForm.astro)
  'pageSlug',
  'collection',
  'domain',
  'url',
  'referrer',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
  'submittedAt',
  'userAgent',
]);

/**
 * Predicate used by upstream validators (and the LeadForm component) to reject
 * an authored extra-field key that would collide with reserved keys.
 */
export function isReservedFieldKey(key: string): boolean {
  return RESERVED_FIELD_KEYS.has(key);
}
