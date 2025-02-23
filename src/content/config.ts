import { defineCollection, z } from "astro:content";

const projectCollection = defineCollection({
  type: "content",
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
  type: "content",
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
