/**
 * Claude API による診断コピー生成の出力型
 */

/** 診断画面・API で利用する生成テキスト */
export interface ClaudeGeneratedText {
  /** ベースAIの推薦理由（一般・上級者とも2文想定） */
  reason: string;
  /** 最初にやること（1文想定） */
  setup: string;
  /** 上級者層のみ：メイン＋サブの具体的な使い分け（1文想定） */
  expertView?: string;
}
