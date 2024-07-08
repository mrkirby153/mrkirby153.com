import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import type { APIContext } from "astro";
import invariant from "tiny-invariant";

const parser = new MarkdownIt();

export async function GET(context: APIContext) {
  invariant(
    context.site,
    "Astro site is missing. Set 'site' in astro.config.mjs"
  );
  const posts = await getCollection("posts");
  return rss({
    title: "mrkirby153.com",
    description: "mrkirby153's blog",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/post/${post.slug}`,
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
    })),
  });
}
