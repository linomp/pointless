import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

// Markdown links to other sites open in a new tab, like the hand-written ones.
const externalLinksInNewTab = {
  name: 'external-links-in-new-tab',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      if (/^https?:/.test(node.properties?.href ?? '')) ctx.setProperty(node, 'target', '_blank');
    },
  },
};

export default defineConfig({
  site: 'https://pointless.xmp.systems',
  // Served next to the raw site until switchover, then back to '/'.
  base: '/v2',
  // music.html instead of music/index.html, so URLs stay the same as today.
  build: { format: 'file' },
  // Keep whitespace as written: compression drops spaces between text and inline tags ("Manta - <a>Ecuador</a>").
  compressHTML: false,
  markdown: {
    // Astro 7's default Markdown engine. Smart quotes off so text renders exactly as typed.
    processor: satteri({ hastPlugins: [externalLinksInNewTab], features: { smartPunctuation: false } }),
  },
  vite: {
    // Keep CSS as compatible as the raw site's: no modern-only syntax like @media (width>=640px).
    build: { cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'] },
  },
});
