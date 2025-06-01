import { forCollection, type GetImageOptions } from "@utils/opengraph";

const getImageOptions: GetImageOptions = (_path: string, page: any) => ({
  title: page.title,
  logo: {
    path: `./src/img/profile.jpg`,
    size: [128, 128],
  },
  bgGradient: [
    [91, 20, 21],
    [59, 20, 91],
  ],
});

export const { getStaticPaths, GET } = await forCollection(
  "route",
  "posts",
  getImageOptions
);
