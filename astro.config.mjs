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
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

const isDev = import.meta.env.DEV;

// https://astro.build/config
export default defineConfig({
  site: "https://www.mrkirby153.com",

  compressHTML: true,

  integrations: [
    expressiveCode({
      plugins: [pluginLineNumbers()],
      defaultProps: {
        showLineNumbers: false,
      },
    }),
    mdx(),
    react(),
    markdoc(),
    ...(isDev ? [keystatic()] : []),
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
