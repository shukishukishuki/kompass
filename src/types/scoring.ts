import type { AiKind } from "./ai";
import type { DiagnosisDisplayMode } from "./diagnosis";
import type { LayerCompleted } from "./layer-completed";

export type { LayerCompleted };

/**
 * 診断スコアリング：回答1件と集計結果の型
 */

/** 1問分の回答（質問IDと選択値） */
export interface QuestionAnswer {
  questionId: number;
  /** 選択肢の値（例: A, B, C） */
  value: string;
}

/** ユーザー層（一般 / 上級者） */
export type UserLayer = "general" | "advanced";

/**
 * スコアリングの調整パラメータ
 * mixed 判定の「全AI低スコア」閾値を下げるとフォールバックが起きにくくなり、自由人相当の割合を抑えやすい
 */
export interface ScoringEngineOptions {
  /** 全AIの最高スコアがこの値以下のとき mixed（既定: 5） */
  mixedFallbackMaxScoreCeiling: number;
  /** Claude の合計スコア上限（既定: 28） */
  claudeMaxScore: number;
}

/** エンジン素出力（layerCompleted は /api/scoring で付与） */
export type ScoringEngineResult = Omit<ScoringResult, "layerCompleted">;

/** スコアリングの集計結果（API 応答・保存用。layerCompleted を含む） */
export interface ScoringResult {
  /** 各AIへの加算後スコア */
  scoresByAi: Record<AiKind, number>;
  /** スコアの降順で並べたAI（同率時は実装側の安定ソートルールに従う） */
  ranking: AiKind[];
  /** タイプ判定・推薦の主軸となるAI（mixed 時は jiyujin に正規化） */
  first: AiKind;
  /** 次点のAI（不存在時は null） */
  second: AiKind | null;
  /** 1位と2位のスコア差（mixed 時は 0） */
  scoreDiff: number;
  /** 断定 / 僅差 / 自由人フォールバック */
  displayMode: DiagnosisDisplayMode;
  /** Q4・Q6 に基づく層 */
  userLayer: UserLayer;
  /**
   * 画面・コピー上の「メインに推すAI」（自由人が素点1位のときは2位のAI、mixed 時は ChatGPT）
   */
  displayPrimaryAi: AiKind;
  /**
   * 自由人が1位かつ2位を軸に表示するときの注記（日本語）。それ以外は null
   */
  primaryAiPivotNoteJa: string | null;
  /** Layer1 のみ / Layer2 まで / 全30問 のいずれで結果化したか */
  layerCompleted: LayerCompleted;
}
