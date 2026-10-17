import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import rehypeExternalLinks from "rehype-external-links";
import { unified } from "@astrojs/markdown-remark";

import tailwindcss from "@tailwindcss/vite";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

const isDev = import.meta.env.DEV;
const site = "https://www.mrkirby153.com";
const siteHost = new URL(site).hostname
  .replace(/^www\./, "")
  .replace(/\./g, "\\.");

// Links to the site or localdev is considered internal
const internalLinks = new RegExp(
  `^https?://(www\\.)?${siteHost}(?::|/|$)|^https?://(localhost|127\\.0\\.0\\.1)(?::|/|$)`,
);

// https://astro.build/config
export default defineConfig({
  site,

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
    processor: unified({
      remarkPlugins: [remarkMath, remarkToc],
      rehypePlugins: [
        rehypeKatex,
        rehypeAccessibleEmojis,
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: "noopener noreferrer",
            // Skip links matching an internal host (see `internalLinks` above).
            test: (node) =>
              !internalLinks.test(String(node.properties?.href ?? "")),
          },
        ],
      ],
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
