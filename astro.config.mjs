import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import { unified } from "@astrojs/markdown-remark";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.mrkirby153.com",

  // Preserve the Astro v6 HTML whitespace behavior. The v7 default is
  // `compressHTML: 'jsx'`, which strips whitespace between inline elements.
  compressHTML: true,

  integrations: [
    expressiveCode({
      plugins: [pluginLineNumbers()],
      defaultProps: {
        showLineNumbers: false,
      },
    }),
    // The MDX integration inherits the markdown config below (unified
    // processor + remark/rehype plugins), so no per-integration plugins needed.
    mdx(),
    react(),
  ],

  markdown: {
    // Keep the remark/rehype plugin pipeline (remark-math, remark-toc,
    // rehype-katex, rehype-accessible-emojis) by using the Unified processor.
    processor: unified({
      remarkPlugins: [remarkMath, remarkToc],
      rehypePlugins: [rehypeKatex, rehypeAccessibleEmojis],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    layout: "constrained",
    domains: ["media.mrkirby153.com", "localhost"],
  },
});
