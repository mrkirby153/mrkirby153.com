import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "src/content/posts/**",
      entryLayout: "content",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Title" },
          slug: {
            label: "Slug",
            validation: {
              pattern: {
                regex: /^[0-9]{4}\/[0-9]{2}\/.*$/,
                message: "Slug must be in the format YYYY/MM/slug",
              },
            },
            generate: (title) => {
              const date = new Date();
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");

              const slug = title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

              return `${year}/${month}/${slug}`;
            },
          },
        }),
        date: fields.date({ label: "Date", defaultValue: { kind: "today" } }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: {
            isRequired: true,
          },
        }),
        draft: fields.checkbox({ label: "Draft", defaultValue: false }),
        hideToc: fields.checkbox({
          label: "Hide Table of Contents",
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: "Content",
          extension: "md",
          options: {
            image: {
              directory: "src/content/posts",
              publicPath: "../..",
            },
          },
        }),
      },
    }),
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "src/content/projects/*",
      entryLayout: "content",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Title" },
        }),
        link: fields.url({ label: "Link", validation: { isRequired: true } }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: {
            isRequired: true,
          },
        }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        date: fields.date({
          label: "Date",
          defaultValue: { kind: "today" },
          validation: { isRequired: true },
        }),
        updated: fields.date({ label: "Updated" }),
        draft: fields.checkbox({ label: "Draft", defaultValue: false }),
        content: fields.markdoc({
          label: "Content",
          extension: "md",
          options: {
            image: {
              directory: "src/content/projects",
              publicPath: "../..",
            },
          },
        }),
      },
    }),
  },
});
