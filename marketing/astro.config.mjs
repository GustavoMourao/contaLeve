import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { visit } from 'unist-util-visit';

/** Rewrites `docs/marketing` cross-links `./NN-topic.md` → `/docs/NN-topic`. */
function rehypeMarketingHandbookLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.type !== 'element' || node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;
      const m = href.match(/^\.\/(\d{2}-[^#?\s]+\.md)((?:#)[^\s]*)?$/i);
      if (!m) return;
      const slug = m[1].replace(/\.md$/i, '');
      node.properties.href = `/docs/${slug}${m[2] ?? ''}`;
    });
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'http://localhost:4321',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeMarketingHandbookLinks],
  },
});
