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

/** AI種別ごとのブランド／アクセントカラー（HEX） */
export const AI_THEME_COLORS: Record<AiKind, string> = {
  claude: "#D97757",
  chatgpt: "#10A37F",
  gemini: "#4F46E5",
  perplexity: "#20808D",
  copilot: "#0078D4",
  jiyujin: "#6366F1",
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
