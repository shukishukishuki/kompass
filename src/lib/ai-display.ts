import { AI_THEME_COLORS, type AiKind } from "@/types/ai";

/** クライアント・サーバー共通の製品表示名（Claude API 連携と同一表記） */
const AI_LABEL_JA: Record<AiKind, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  copilot: "Microsoft Copilot",
  jiyujin: "複数のAIの使い分け",
};

/**
 * AiKind から画面表示用の日本語ラベルを返す（クライアント向け。Anthropic SDK に依存しない）
 */
export function getAiLabelJaForKind(kind: AiKind): string {
  return AI_LABEL_JA[kind];
}

/**
 * 診断結果の baseAI.name（表示名）から AiKind を推定する
 * 未一致時は null（呼び出し側でデフォルト色を使う）
 */
export function resolveAiKindFromDisplayName(name: string): AiKind | null {
  const trimmed = name.trim();
  const map: Record<string, AiKind> = {
    Claude: "claude",
    ChatGPT: "chatgpt",
    Gemini: "gemini",
    Perplexity: "perplexity",
    "Microsoft Copilot": "copilot",
    Copilot: "copilot",
    "複数のAIの使い分け": "jiyujin",
  };
  const kind = map[trimmed];
  return kind ?? null;
}

/**
 * ベースAI表示名に対応するテーマカラー（HEX）
 */
export function getThemeColorForBaseAiName(name: string): string {
  const kind = resolveAiKindFromDisplayName(name);
  if (kind === null) {
    return "#52525b";
  }
  return AI_THEME_COLORS[kind];
}
