/** OGP 用タイプ定義（横型 OGP 仕様の TYPE_DATA と同一） */
export const TYPE_DATA = {
  empath: {
    ja: { label: "共感ジャンキー", catch: "答えじゃなくて、わかってほしかっただけ。" },
    en: { label: "The Confidant", catch: "I don't need answers. I need to be heard." },
    ai: "Claude",
    percent: 24,
    bg: "#FDF3E3",
    accent: "#E8952A",
    charImg: "/images/kompass_char_01_empath.png",
    darkText: true,
  },
  executor: {
    ja: { label: "整理の鬼", catch: "整理されてないと、息ができない。" },
    en: { label: "The Executive", catch: "Chaos isn't a vibe. It's a problem." },
    ai: "Copilot",
    percent: 19,
    bg: "#F0F4F8",
    accent: "#0078D4",
    charImg: "/images/kompass_char_02_executor.png",
    darkText: true,
  },
  analyst: {
    ja: { label: "裏取りマニア", catch: "「たぶん」で動くの、無理なんだよな。" },
    en: { label: "The Analyst", catch: "I don't do 'probably'." },
    ai: "Perplexity",
    percent: 13,
    bg: "#0F1629",
    accent: "#20B2AA",
    charImg: "/images/kompass_char_03_analyst.png",
    darkText: false,
  },
  generalist: {
    ja: { label: "丸投げ屋", catch: "考えるより、投げた方が早い。" },
    en: { label: "The Generalist", catch: "Why think when you can delegate?" },
    ai: "ChatGPT",
    percent: 28,
    bg: "#111111",
    accent: "#10A37F",
    charImg: "/images/kompass_char_04_generalist.png",
    darkText: false,
  },
  scout: {
    ja: { label: "情報スナイパー", catch: "いらない情報、本当にいらない。" },
    en: { label: "The Scout", catch: "Just give me what I need. Nothing else." },
    ai: "Gemini",
    percent: 9,
    bg: "#FAFBFF",
    accent: "#4285F4",
    charImg: "/images/kompass_char_05_scout.png",
    darkText: true,
  },
  nomad: {
    ja: { label: "AI遊牧民", catch: "1つのAIで満足できたことが、ない。" },
    en: { label: "The Orchestrator", catch: "One AI was never going to be enough." },
    ai: "Multi-AI",
    percent: 7,
    bg: "#150828",
    accent: "#C9A84C",
    charImg: "/images/kompass_char_06_nomad.png",
    darkText: false,
  },
} as const;

export type OgTypeKey = keyof typeof TYPE_DATA;

/** claude タイプ ID 等との互換マップ */
export const TYPE_ID_MAP: Record<string, OgTypeKey> = {
  claude: "empath",
  chatgpt: "generalist",
  gemini: "scout",
  perplexity: "analyst",
  copilot: "executor",
  jiyujin: "nomad",
};

/** Instagram ストーリー用（明るい背景）のグラデーションのみ差し替え */
export const STORY_BACKGROUND_GRADIENT: Record<OgTypeKey, string> = {
  empath:
    "linear-gradient(175deg, #c8eeda 0%, #e8f7ef 45%, #f5fcf8 75%, #ffffff 100%)",
  executor:
    "linear-gradient(175deg, #b8d0f0 0%, #e8f0fb 45%, #f5f8ff 75%, #ffffff 100%)",
  analyst:
    "linear-gradient(175deg, #e8d8f8 0%, #f5eeff 45%, #fdfaff 75%, #ffffff 100%)",
  generalist:
    "linear-gradient(175deg, #fde8a8 0%, #fef8e8 45%, #fffdf5 75%, #ffffff 100%)",
  scout:
    "linear-gradient(175deg, #fdd0a8 0%, #fef2e8 45%, #fffaf5 75%, #ffffff 100%)",
  nomad:
    "linear-gradient(175deg, #f0e8c8 0%, #f8f2e0 45%, #fdfaf2 75%, #ffffff 100%)",
};
