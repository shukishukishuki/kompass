import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kompass-rosy.vercel.app";
  const resultTypeIds = [
    "claude",
    "chatgpt",
    "gemini",
    "perplexity",
    "copilot",
    "jiyujin",
  ];
  const guideTypeIds = [
    "empath",
    "generalist",
    "scout",
    "analyst",
    "executive",
    "orchestrator",
  ];

  const staticPages = [
    { url: `${baseUrl}/ja`, priority: 1.0 },
    { url: `${baseUrl}/ja/diagnosis`, priority: 0.9 },
    { url: `${baseUrl}/ja/types`, priority: 0.8 },
    { url: `${baseUrl}/ja/guide`, priority: 0.8 },
    { url: `${baseUrl}/ja/terms`, priority: 0.3 },
    { url: `${baseUrl}/ja/privacy`, priority: 0.3 },
  ];

  const typePages = resultTypeIds.map((id) => ({
    url: `${baseUrl}/ja/result/${id}`,
    priority: 0.7,
  }));

  const guidePages = guideTypeIds.map((id) => ({
    url: `${baseUrl}/ja/guide/${id}`,
    priority: 0.6,
  }));

  return [...staticPages, ...typePages, ...guidePages].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
  }));
}
