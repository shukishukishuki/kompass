/**
 * 推奨AI・診断タイプに関する型とテーマ定数
 * UI・シェアカード・スコアリングで共通利用する
 */

/** スコアリング対象となるAIの識別子 */
export type AiKind =
  | "claude"
  | "chatgpt"
  | "gemini"
  | "perplexity"
  | "copilot"
  | "jiyujin";

/** 診断で出力する思考タイプ名（日本語・固定文言用） */
export type PersonalityTypeJa =
  | "相談相手タイプ"
  | "万能助手タイプ"
  | "情報通タイプ"
  | "研究者タイプ"
  | "秘書タイプ"
  | "自由人タイプ";

/** 診断で出力する思考タイプ名（英語・固定文言用） */
export type PersonalityTypeEn =
  | "The Confidant"
  | "The Generalist"
  | "The Scout"
  | "The Analyst"
  | "The Executive"
  | "The Orchestrator";

/** AI種別ごとのテーマ（プライマリ＋トーン）— empath / generalist / scout / analyst / executor / nomad に対応 */
export interface AiKindTheme {
  primary: string;
  cLight: string;
  cMid: string;
  cText: string;
}

export const AI_KIND_THEMES: Record<AiKind, AiKindTheme> = {
  claude: {
    primary: "#52B788",
    cLight: "#e8f7ef",
    cMid: "#b8e8cf",
    cText: "#1a7a4a",
  },
  chatgpt: {
    primary: "#E8A020",
    cLight: "#fef8e8",
    cMid: "#fde8a8",
    cText: "#8a5a00",
  },
  gemini: {
    primary: "#F07C2A",
    cLight: "#fef2e8",
    cMid: "#fdd0a8",
    cText: "#8a3a00",
  },
  perplexity: {
    primary: "#9B4DCA",
    cLight: "#f2e8fb",
    cMid: "#dab8f0",
    cText: "#5a1a8a",
  },
  copilot: {
    primary: "#4A7FC1",
    cLight: "#e8f0fb",
    cMid: "#b8d0f0",
    cText: "#1a4a8a",
  },
  jiyujin: {
    primary: "#C9A84C",
    cLight: "#fdf6e8",
    cMid: "#f0d898",
    cText: "#7a5800",
  },
};

/** AI種別ごとのブランド／アクセントカラー（HEX・プライマリ） */
export const AI_THEME_COLORS: Record<AiKind, string> = {
  claude: AI_KIND_THEMES.claude.primary,
  chatgpt: AI_KIND_THEMES.chatgpt.primary,
  gemini: AI_KIND_THEMES.gemini.primary,
  perplexity: AI_KIND_THEMES.perplexity.primary,
  copilot: AI_KIND_THEMES.copilot.primary,
  jiyujin: AI_KIND_THEMES.jiyujin.primary,
};

/** 全AI種別を列挙した配列（ループ・初期化用） */
export const AI_KINDS: readonly AiKind[] = [
  "claude",
  "chatgpt",
  "gemini",
  "perplexity",
  "copilot",
  "jiyujin",
] as const;
