import { describe, expect, it } from 'vitest';

import { buildTokenOverrideStyle } from '../../src/lib/tokens';

describe('buildTokenOverrideStyle', () => {
  it('returns an empty string when no overrides are provided', () => {
    expect(
      buildTokenOverrideStyle({ pageId: 'icps--morador-sp', overrides: undefined }),
    ).toBe('');
  });

  it('returns an empty string when overrides is an empty object', () => {
    expect(
      buildTokenOverrideStyle({ pageId: 'icps--morador-sp', overrides: {} }),
    ).toBe('');
  });

  it('emits a scoped rule for a single override', () => {
    const css = buildTokenOverrideStyle({
      pageId: 'icps--morador-sp',
      overrides: { 'color.cta.bg': '#16a34a' },
    });

    expect(css).toContain('[data-page-id="icps--morador-sp"]');
    expect(css).toContain('--color-cta-bg: #16a34a;');
  });

  it('emits all declarations under a single selector', () => {
    const css = buildTokenOverrideStyle({
      pageId: 'icps--morador-sp',
      overrides: {
        'color.cta.bg': '#16a34a',
        'color.accent': '#16a34a',
      },
    });

    const selectorMatches = css.match(/\[data-page-id=/g) ?? [];
    expect(selectorMatches.length).toBe(1);
    expect(css).toContain('--color-cta-bg: #16a34a;');
    expect(css).toContain('--color-accent: #16a34a;');
  });
});
