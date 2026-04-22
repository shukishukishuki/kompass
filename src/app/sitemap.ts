import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://usekompass.com";
  const locales = ["ja", "en"] as const;
  const guideTypeIds = [
    "empath",
    "executor",
    "analyst",
    "generalist",
    "scout",
    "orchestrator",
  ] as const;
  const lastModified = new Date();

  const localeTopPages = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      changeFrequency: "weekly" as const,
      priority: 1.0,
      lastModified,
    },
    {
      url: `${baseUrl}/${locale}/diagnosis`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      lastModified,
    },
    {
      url: `${baseUrl}/${locale}/types`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified,
    },
    {
      url: `${baseUrl}/${locale}/guide`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified,
    },
  ]);

  const guidePages = locales.flatMap((locale) =>
    guideTypeIds.map((typeId) => ({
      url: `${baseUrl}/${locale}/guide/${typeId}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified,
    }))
  );

  return [...localeTopPages, ...guidePages];
}
