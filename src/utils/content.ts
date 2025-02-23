import { getCollection } from "astro:content";

export async function getFeaturedProjects(
  withDrafts = process.env.NODE_ENV === "development"
) {
  let allProjects = await getCollection("projects");
  allProjects = allProjects.filter((project) => {
    return withDrafts || !project.data.draft;
  });
  const featuredProjects = allProjects.filter(
    (project) => project.data.featured
  );
  featuredProjects.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
  return featuredProjects;
}

export async function getFeaturedPosts() {
  const allPosts = await getPosts();
  return allPosts.slice(0, Math.min(allPosts.length, 5));
}

export async function getPosts(
  withDrafts = process.env.NODE_ENV === "development"
) {
  let allPosts = await getCollection("posts");
  allPosts = allPosts.filter((post) => {
    return withDrafts || !post.data.draft;
  });
  allPosts.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
  return allPosts;
}
