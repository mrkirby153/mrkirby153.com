import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projectCollection = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    link: z.string(),
    summary: z.string(),
    featured: z.optional(z.boolean()),
    date: z.date(),
    updated: z.optional(z.date()),
    draft: z.optional(z.boolean()).default(false),
  }),
});

const postCollection = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
    draft: z.optional(z.boolean()).default(false),
  }),
});

export const collections = {
  projects: projectCollection,
  posts: postCollection,
};
