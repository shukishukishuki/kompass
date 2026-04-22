/**
 * 診断結果のJSON構造（API・画面で共有する契約型）
 * フィールド名および入れ子の形は変更しないこと
 */

import type { LayerCompleted } from "@/types/layer-completed";

/** 結果表示の断定度（スコア差・例外ルールから決定） */
export type DiagnosisDisplayMode = "definitive" | "borderline" | "mixed";

/** タイプ別の性格特性ブロック（結果画面・オプションの JSON 用） */
export interface PersonalityDescription {
  /** 結果画面上部に出すキャラ名（エンタメ寄せラベル） */
  characterName: string;
  catchCopy: string;
  supplement: string;
  whoYouAre: string;
  thinkingPattern: string;
  workStyle: string;
  aiCompatibility: string;
  firstStepText?: string;
  contraryCopy: string;
  strengths: string[];
  weaknesses: string[];
  oppositeType: {
    typeJa: string;
    aiName: string;
    description: string;
  };
  ngUsage: string;
  literacyAnalysis: string;
  shareText: string;
}

/** Claude API 等で生成した最終診断結果 */
/** サブAI（補助）の1件 */
export interface SubAiEntry {
  name: string;
  usage: string;
}

export interface DiagnosisResult {
  baseAI: {
    name: string;
    score: number;
    reason: string;
    setup: string;
    /** 自由人1位時など、ベース表示の補足（任意） */
    note?: string;
  };
  subAI: SubAiEntry[];
  expertView: string;
  type: string;
  typeEn: string;
  scoreDiff: number;
  displayMode: DiagnosisDisplayMode;
  /** 何 Layer まで回答して結果化したか（1〜3） */
  layerCompleted: LayerCompleted;
  /** 全診断ユーザー中、このタイプの割合（0–100）。クライアント表示用 */
  userPercentage?: number;
  /** レア度ラベル（例: よく見るタイプ）。クライアント表示用 */
  rarityLabel?: string;
  /** タイプ別の性格特性コピー。クライアント表示用 */
  personalityDescription?: PersonalityDescription;
  /** Layer4（Q31〜Q40）の回答（パーソナライズプロンプト生成用） */
  answers?: Record<string, string>;
  /** Supabase `diagnosis_results.id`（保存成功時のみ API が付与） */
  recordId?: string;
}
