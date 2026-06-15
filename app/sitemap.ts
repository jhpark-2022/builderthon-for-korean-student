import type { MetadataRoute } from "next";

const SITE_URL = "https://builderthon-for-korean-student.vercel.app";

// Single-page marketing site → one entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
