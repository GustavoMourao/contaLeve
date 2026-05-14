import { describe, expect, it } from 'vitest';

import { handbookNavTitle, HANDBOOK_TITLE_BY_SLUG } from '../../src/lib/handbookNav';

describe('handbookNav', () => {
  it('returns mapped title for known slugs', () => {
    expect(handbookNavTitle('00-overview')).toBe(HANDBOOK_TITLE_BY_SLUG['00-overview']);
    expect(handbookNavTitle('08-design-system')).toBe(HANDBOOK_TITLE_BY_SLUG['08-design-system']);
  });

  it('falls back to slug for unknown entries', () => {
    expect(handbookNavTitle('99-unknown')).toBe('99-unknown');
  });
});
