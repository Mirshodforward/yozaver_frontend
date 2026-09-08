import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://yozaver.uz", changeFrequency: "weekly", priority: 1 },
    {
      url: "https://yozaver.uz/leaderboard",
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: "https://yozaver.uz/analytics",
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
