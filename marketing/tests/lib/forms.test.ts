import { describe, expect, it } from 'vitest';

import {
  BASE_LEAD_FIELDS,
  RESERVED_FIELD_KEYS,
  isReservedFieldKey,
} from '../../src/lib/forms';

describe('BASE_LEAD_FIELDS', () => {
  it('exposes name, email, phone in this order', () => {
    expect(BASE_LEAD_FIELDS.map((f) => f.key)).toEqual(['name', 'email', 'phone']);
  });

  it('marks every base field as required (the platform contract)', () => {
    for (const field of BASE_LEAD_FIELDS) {
      expect(field.required).toBe(true);
    }
  });

  it('uses pt-BR labels (visitor-facing)', () => {
    const labels = BASE_LEAD_FIELDS.map((f) => f.label);
    expect(labels).toContain('Nome');
    expect(labels).toContain('E-mail');
    expect(labels).toContain('WhatsApp');
  });
});

describe('RESERVED_FIELD_KEYS', () => {
  it('reserves every base field key', () => {
    for (const field of BASE_LEAD_FIELDS) {
      expect(RESERVED_FIELD_KEYS.has(field.key)).toBe(true);
    }
  });

  it('reserves hidden metadata keys', () => {
    for (const key of [
      'pageSlug',
      'collection',
      'domain',
      'url',
      'referrer',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'submittedAt',
      'userAgent',
    ]) {
      expect(RESERVED_FIELD_KEYS.has(key)).toBe(true);
    }
  });
});

describe('isReservedFieldKey', () => {
  it('returns true for a reserved key', () => {
    expect(isReservedFieldKey('email')).toBe(true);
    expect(isReservedFieldKey('utmSource')).toBe(true);
  });

  it('returns false for an unrelated key', () => {
    expect(isReservedFieldKey('companyName')).toBe(false);
    expect(isReservedFieldKey('monthlyBill')).toBe(false);
  });
});
