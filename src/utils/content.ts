import { getCollection } from "astro:content";

export async function getFeaturedProjects() {
  const allProjects = await getCollection("projects");
  const featuredProjects = allProjects.filter(
    (project) => project.data.featured
  );
  featuredProjects.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
  return featuredProjects;
}

export async function getFeaturedPosts() {
  const allPosts = await getCollection("posts");
  allPosts.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
  return allPosts.slice(0, Math.min(allPosts.length, 5));
}

export async function getPosts() {
  const allPosts = await getCollection("posts");
  allPosts.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
  return allPosts;
}
