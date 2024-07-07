import { getCollection } from "astro:content";

export async function getFeaturedProjects() {
  const allProjects = await getCollection("projects");
  const featuredProjects = allProjects.filter(
    (project) => project.data.featured
  );
  featuredProjects.sort((a, b) => {
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    return dateB.getTime() - dateA.getTime();
  });
  return featuredProjects;
}
