import { defineCollection, z } from "astro:content";

const projectCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    link: z.string(),
    summary: z.string(),
    featured: z.optional(z.boolean()),
    date: z.date(),
  }),
});

const postCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
  }),
});

export const collections = {
  projects: projectCollection,
  posts: postCollection,
};
