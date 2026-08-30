import type { MetadataRoute } from "next";

const BASE_URL = "https://verusoperatingpartners.com";

const MARKETING_ROUTES = ["", "/what-we-do", "/the-assessment", "/builds", "/systems-and-support", "/case-studies", "/about", "/contact", "/scan"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return MARKETING_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
