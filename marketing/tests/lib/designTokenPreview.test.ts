import { describe, expect, it } from 'vitest';

import { allRegisteredPreviewVars } from '../../src/lib/designTokenPreview';

describe('designTokenPreview', () => {
  it('lists only valid CSS custom property names', () => {
    const vars = allRegisteredPreviewVars();
    expect(vars.length).toBeGreaterThan(10);
    for (const v of vars) {
      expect(v).toMatch(/^--(ds|color)-[a-z0-9-]+$/);
    }
  });

  it('has no duplicate token names in the audit list', () => {
    const vars = allRegisteredPreviewVars();
    const unique = new Set(vars);
    expect(unique.size).toBe(vars.length);
  });
});
