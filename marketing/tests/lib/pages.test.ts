import { describe, expect, it } from 'vitest';

import { getPageId, splitBlocks } from '../../src/lib/pages';
import type { Block } from '../../src/lib/schema';

describe('getPageId', () => {
  it('joins collection and slug with a double hyphen', () => {
    expect(getPageId('icps', 'morador-sp')).toBe('icps--morador-sp');
  });

  it('is deterministic', () => {
    const a = getPageId('pages', 'home');
    const b = getPageId('pages', 'home');
    expect(a).toBe(b);
  });
});

describe('splitBlocks', () => {
  it('reports no body RichText when none is present', () => {
    const blocks: Block[] = [
      {
        type: 'Hero',
        headline: 'h',
        cta: { label: 'l', href: '#' },
      },
    ];
    const result = splitBlocks(blocks);
    expect(result.hasBodyRichText).toBe(false);
    expect(result.bodyRichTextIndex).toBe(-1);
  });

  it('finds the first body-sourced RichText block', () => {
    const blocks: Block[] = [
      {
        type: 'Hero',
        headline: 'h',
        cta: { label: 'l', href: '#' },
      },
      { type: 'RichText', source: 'body' },
      {
        type: 'CTA',
        cta: { label: 'l', href: '#' },
      },
    ];
    const result = splitBlocks(blocks);
    expect(result.hasBodyRichText).toBe(true);
    expect(result.bodyRichTextIndex).toBe(1);
  });
});
