import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: "https://flex-studio-ten.vercel.app",
      lastModified: new Date(),
    },
  ];
}
