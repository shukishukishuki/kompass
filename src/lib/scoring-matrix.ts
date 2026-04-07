import type { AiKind } from "@/types/ai";

/**
 * Kompass_Scoring.md Part 2（v1.2）に基づく配点マトリクス
 * 列 C/Ch/G/P/Co/F は claude / chatgpt / gemini / perplexity / copilot / jiyujin に対応
 *
 * 選択肢キーは UI からの値（主に "A"〜"E"）。設問ごとに選択肢数が異なる。
 *
 * Q1〜Q8 は A〜D。Q9 は A〜E（一般層フラグは E）。Q10 は A〜E。
 * 文言を差し替える場合は Kompass_Scoring.md の行順と整合させること。
 */

export type ScoringMatrixRow = Partial<Record<AiKind, number>>;

/** questionId → 選択肢キー → 各AI加点 */
export const SCORING_MATRIX: Readonly<
  Record<number, Readonly<Record<string, ScoringMatrixRow>>>
> = {
  1: {
    A: { claude: 2, perplexity: 1 },
    B: { chatgpt: 2, gemini: 1 },
    C: { gemini: 1, perplexity: 2, jiyujin: 1 },
    D: { chatgpt: 1, copilot: 2, jiyujin: 2 },
  },
  2: {
    A: { claude: 2 },
    B: { chatgpt: 2, copilot: 1 },
    C: { gemini: 1, perplexity: 2 },
    D: { claude: 1, copilot: 1, jiyujin: 2 },
  },
  3: {
    A: { claude: 2 },
    B: { chatgpt: 2, copilot: 1 },
    C: { gemini: 1, perplexity: 2 },
    D: { jiyujin: 2 },
  },
  4: {
    A: { claude: 2 },
    B: { chatgpt: 2 },
    C: { gemini: 1, perplexity: 2, copilot: 1 },
    D: { chatgpt: 1, jiyujin: 2 },
  },
  5: {
    A: { claude: 1, perplexity: 1, copilot: 2 },
    B: { chatgpt: 2, gemini: 1, jiyujin: 2 },
    C: { claude: 1, chatgpt: 1, copilot: 1, jiyujin: 2 },
    D: { claude: 2, perplexity: 1 },
  },
  6: {
    A: { perplexity: 2, copilot: 2 },
    B: { chatgpt: 2, gemini: 1, jiyujin: 1 },
    C: { claude: 2, perplexity: 1 },
    D: { chatgpt: 2, jiyujin: 2 },
  },
  7: {
    A: { perplexity: 2, copilot: 1 },
    B: { claude: 2 },
    C: { chatgpt: 1, gemini: 1, copilot: 2 },
    D: { chatgpt: 2, jiyujin: 2 },
  },
  8: {
    A: { claude: 2, copilot: 1 },
    B: { claude: 1, chatgpt: 1, gemini: 1, copilot: 1 },
    C: { chatgpt: 1, gemini: 1, perplexity: 2 },
    D: { chatgpt: 1, copilot: 1, jiyujin: 2 },
  },
  9: {
    A: { claude: 2 },
    B: { chatgpt: 1, gemini: 2, perplexity: 1 },
    C: { claude: 1, chatgpt: 2, jiyujin: 1 },
    D: { copilot: 2 },
    /** 「ほとんど使っていない」— 一般層フラグ＋ jiyujin 加点 */
    E: { jiyujin: 2 },
  },
  10: {
    A: { gemini: 5 },
    B: { copilot: 5 },
    C: { chatgpt: 1 },
    D: { gemini: 2, copilot: 2, jiyujin: 2 },
    E: { claude: 1, chatgpt: 1, perplexity: 1 },
  },
  11: {
    A: { claude: 1, chatgpt: 1 },
    B: { chatgpt: 1, copilot: 2, jiyujin: 1 },
    C: { gemini: 1, perplexity: 2 },
    D: { chatgpt: 2, jiyujin: 2 },
  },
  12: {
    A: { claude: 2 },
    B: { chatgpt: 1, copilot: 2 },
    C: { gemini: 1, perplexity: 2 },
    D: { chatgpt: 2, jiyujin: 1 },
  },
  13: {
    A: { gemini: 2, perplexity: 1 },
    B: { gemini: 1, perplexity: 2 },
    C: { claude: 1, chatgpt: 1 },
    D: { chatgpt: 1, jiyujin: 2 },
  },
  14: {
    A: { gemini: 5 },
    B: { copilot: 5 },
    C: { gemini: 2, copilot: 2, jiyujin: 2 },
    D: { claude: 1, chatgpt: 1, perplexity: 1 },
  },
  15: {
    A: { claude: 2, copilot: 1 },
    B: { claude: 1, chatgpt: 1, copilot: 1 },
    C: { chatgpt: 2, gemini: 1, perplexity: 1, jiyujin: 1 },
    D: { copilot: 2 },
  },
  16: {
    A: { claude: 1, chatgpt: 1, gemini: 1 },
    B: { claude: 1, chatgpt: 1, gemini: 1, perplexity: 1 },
    C: { chatgpt: 1, perplexity: 1, copilot: 1, jiyujin: 2 },
    D: { chatgpt: 1, perplexity: 1, copilot: 1, jiyujin: 2 },
  },
  17: {
    A: { claude: 2, gemini: 1, perplexity: 1 },
    B: { claude: 1, chatgpt: 1, perplexity: 1, copilot: 1 },
    C: { chatgpt: 2, gemini: 1, copilot: 1, jiyujin: 1 },
    D: { claude: 1, perplexity: 2, copilot: 1 },
  },
  18: {
    A: { chatgpt: 2, jiyujin: 1 },
    B: { claude: 1, chatgpt: 1, gemini: 1 },
    C: { chatgpt: 1, gemini: 1, jiyujin: 2 },
    D: { claude: 1, perplexity: 2, copilot: 1 },
  },
  19: {
    A: { chatgpt: 2, gemini: 1 },
    B: { gemini: 1, perplexity: 2 },
    C: { perplexity: 1, copilot: 2 },
    D: { claude: 2, chatgpt: 1, jiyujin: 1 },
  },
  20: {
    A: { claude: 1, chatgpt: 1, gemini: 1, copilot: 1, jiyujin: 2 },
    B: { claude: 1, chatgpt: 1, gemini: 1, perplexity: 1 },
    C: { chatgpt: 1, perplexity: 2, copilot: 1 },
    D: { claude: 1, chatgpt: 1, gemini: 1 },
  },
  21: {
    A: { claude: 1, chatgpt: 1, gemini: 1, copilot: 2 },
    B: { chatgpt: 1, perplexity: 1, copilot: 1, jiyujin: 2 },
    C: { claude: 2, chatgpt: 1, perplexity: 1, jiyujin: 1 },
    D: { claude: 1, chatgpt: 1, gemini: 1, perplexity: 2 },
  },
  22: {
    A: { claude: 1, chatgpt: 1, gemini: 1, perplexity: 1, copilot: 1, jiyujin: 2 },
    B: { claude: 1, chatgpt: 1, gemini: 1 },
    C: { claude: 1, chatgpt: 1, gemini: 1, copilot: 1 },
    D: { claude: 2, chatgpt: 1, perplexity: 1 },
  },
  23: {
    A: { chatgpt: 1, copilot: 1, jiyujin: 2 },
    B: { chatgpt: 1, gemini: 1, copilot: 1, jiyujin: 1 },
    C: { claude: 2, chatgpt: 1, perplexity: 1 },
    D: { claude: 1, chatgpt: 1, perplexity: 2 },
  },
  24: {
    A: { copilot: 2, jiyujin: 1 },
    B: { chatgpt: 2, gemini: 1 },
    C: { claude: 2, perplexity: 1, copilot: 1 },
    D: { claude: 1, chatgpt: 1, gemini: 1 },
  },
  25: {
    A: { claude: 2, chatgpt: 1, jiyujin: 1 },
    B: { chatgpt: 1, jiyujin: 2 },
    C: { chatgpt: 1, gemini: 1, copilot: 2 },
    D: { chatgpt: 1, gemini: 1, perplexity: 2 },
  },
  26: {
    A: { chatgpt: 1, copilot: 1, jiyujin: 2 },
    B: { chatgpt: 1, gemini: 1, copilot: 1, jiyujin: 1 },
    C: { claude: 1, chatgpt: 1, gemini: 1, copilot: 1 },
    D: { claude: 2, perplexity: 1 },
  },
  27: {
    A: { claude: 1, chatgpt: 1, gemini: 1 },
    B: { claude: 1, chatgpt: 1, gemini: 1, perplexity: 1 },
    C: { chatgpt: 1, perplexity: 1, copilot: 1, jiyujin: 2 },
    D: { perplexity: 1, copilot: 1, jiyujin: 2 },
  },
  28: {
    A: { chatgpt: 1, copilot: 1, jiyujin: 2 },
    B: { chatgpt: 1, gemini: 1, copilot: 1, jiyujin: 1 },
    C: { claude: 2, chatgpt: 1, gemini: 1, perplexity: 1 },
    D: { claude: 1, chatgpt: 1, perplexity: 2 },
  },
  29: {
    A: { claude: 2, copilot: 1 },
    B: { gemini: 1, perplexity: 2 },
    C: { chatgpt: 1, gemini: 1, copilot: 2 },
    D: { chatgpt: 1, jiyujin: 2 },
  },
  30: {
    A: { claude: 1, copilot: 1, jiyujin: 1 },
    B: {
      claude: 1,
      chatgpt: 1,
      gemini: 1,
      perplexity: 1,
      copilot: 1,
      jiyujin: 1,
    },
    C: { chatgpt: 1, gemini: 1, perplexity: 2, jiyujin: 1 },
    D: { claude: 1, chatgpt: 1, gemini: 1 },
  },
} as const;
