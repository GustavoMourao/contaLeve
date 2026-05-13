import { describe, expect, it } from 'vitest';

import { designSystemNavItems, previewTopNavItems } from '../../src/lib/previewNav';

describe('previewNav', () => {
  it('top nav lists three preview areas with unique hrefs', () => {
    const hrefs = previewTopNavItems.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(3);
    expect(previewTopNavItems.map((i) => i.area)).toEqual(['campaigns', 'design-system', 'docs']);
  });

  it('design system nav uses unique section ids', () => {
    const ids = designSystemNavItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('tokens');
    expect(ids).toContain('overview');
  });
});
