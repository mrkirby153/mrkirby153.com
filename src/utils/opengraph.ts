import { OGImageRoute } from "astro-og-canvas";
import { getCollection, type CollectionKey } from "astro:content";

type OGImageRouteConfig = Parameters<typeof OGImageRoute>[0];
export type GetImageOptions = OGImageRouteConfig["getImageOptions"];

export async function forCollection(
  param: string,
  collection: CollectionKey,
  getImageOptions?: GetImageOptions
) {
  const collectionEntries = await getCollection(collection);
  const pages = Object.fromEntries(
    collectionEntries.map(({ id, data }) => [id, data])
  );

  return OGImageRoute({
    param,
    pages,
    getImageOptions: (path: string, page: any) => {
      if (getImageOptions) {
        return getImageOptions(path, page);
      }
      return {
        title: page.title,
        description: page.description,
      };
    },
  });
}
