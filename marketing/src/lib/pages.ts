import type { Block } from './schema';

/**
 * A stable, URL-safe identifier for a page that is also valid as a `data-page-id`
 * attribute. Used to scope inline token-override styles.
 *
 * Pure function: same inputs always produce the same output.
 */
export function getPageId(collection: string, slug: string): string {
  return `${collection}--${slug}`;
}

export interface SplitBlocksResult {
  /** Blocks that render purely from their props. */
  propBlocks: Block[];
  /**
   * Whether the page declares a `RichText` block whose source is the MDX body.
   * The route uses this to decide whether to call `render(entry)` and inject the
   * compiled MDX inside a RichText slot.
   */
  hasBodyRichText: boolean;
  /**
   * Index (within the original `blocks` array) of the body-sourced RichText block,
   * or `-1` if absent. Lets the layout slot the rendered body in the right place.
   */
  bodyRichTextIndex: number;
}

/**
 * Splits a page's blocks into prop-only blocks plus information about the optional
 * body-sourced `RichText` block. Validation of the schema happens upstream in zod;
 * this function only does structural separation.
 *
 * Pure function: deterministic, no I/O.
 */
export function splitBlocks(blocks: Block[]): SplitBlocksResult {
  const bodyRichTextIndex = blocks.findIndex(
    (block) => block.type === 'RichText' && block.source === 'body',
  );
  return {
    propBlocks: blocks,
    hasBodyRichText: bodyRichTextIndex >= 0,
    bodyRichTextIndex,
  };
}
