import { AI_KINDS, type AiKind } from "@/types/ai";
import type { DiagnosisDisplayMode } from "@/types/diagnosis";
import type {
  QuestionAnswer,
  ScoringEngineOptions,
  ScoringEngineResult,
  UserLayer,
} from "@/types/scoring";
import { SCORING_MATRIX } from "@/lib/scoring-matrix";

// Re-export options type defined next to defaults for discoverability
export type { ScoringEngineOptions } from "@/types/scoring";

/** 自由人出現の目安（集団シミュレーション用の定数。単一回の計算では閾値で調整） */
export const JIYUJIN_TARGET_MAX_RATE = 0.2;

/**
 * pivot 注記用の製品名（Claude 連携と同じ表記に揃える。scoringEngine は claude に依存しない）
 */
const PIVOT_NOTE_AI_NAME: Record<AiKind, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  copilot: "Microsoft Copilot",
  jiyujin: "複数のAIの使い分け",
};

const DEFAULT_OPTIONS: ScoringEngineOptions = {
  mixedFallbackMaxScoreCeiling: 5,
  claudeMaxScore: 28,
};

/**
 * 既定のスコアリングオプション（mixed 閾値・Claude上限）
 */
export function getDefaultScoringOptions(): ScoringEngineOptions {
  return { ...DEFAULT_OPTIONS };
}

/**
 * 全AIのスコアを 0 で初期化する
 */
function createEmptyScores(): Record<AiKind, number> {
  const out = {} as Record<AiKind, number>;
  for (const k of AI_KINDS) {
    out[k] = 0;
  }
  return out;
}

/**
 * 同一設問に複数行がある場合は最後の値を採用する
 */
function getLastAnswerValue(
  answers: QuestionAnswer[],
  questionId: number
): string | undefined {
  const matched = answers.filter((a) => a.questionId === questionId);
  if (matched.length === 0) {
    return undefined;
  }
  return matched[matched.length - 1].value.trim();
}

/**
 * UI からの回答値をマトリクス参照用キー（A〜E）に正規化する
 * Q14 は旧実装互換で google / microsoft も受け付ける（Kompass_Scoring の A/B に対応）
 */
function normalizeChoiceKey(
  questionId: number,
  valueRaw: string
): string | undefined {
  const trimmed = valueRaw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const upper = trimmed.toUpperCase();
  if (upper.length === 1 && "ABCDE".includes(upper)) {
    return upper;
  }
  if (questionId === 14) {
    const lower = trimmed.toLowerCase();
    if (lower === "google") {
      return "A";
    }
    if (lower === "microsoft") {
      return "B";
    }
  }
  return undefined;
}

/**
 * Kompass_Scoring.md の配点表から、設問・選択肢に対応する加点を取得する
 */
function deltaFromMatrix(
  questionId: number,
  valueRaw: string
): Partial<Record<AiKind, number>> {
  const key = normalizeChoiceKey(questionId, valueRaw);
  if (key === undefined) {
    return {};
  }
  const forQuestion = SCORING_MATRIX[questionId];
  if (forQuestion === undefined) {
    return {};
  }
  const row = forQuestion[key];
  if (row === undefined) {
    return {};
  }
  return { ...row };
}

/**
 * Kompass_Logic_v1.2: Claude 偏重防止キャップ（上級者層のみ適用。一般層はキャップ不要）
 */
function applyClaudeCap(
  scores: Record<AiKind, number>,
  cap: number,
  applyCap: boolean
): void {
  if (!applyCap) {
    return;
  }
  scores.claude = Math.min(scores.claude, cap);
}

/**
 * Kompass_Scoring.md「一般層 / 上級者層の判定」
 * - Q9 で E または Q6 で E → 一般層（Q9 の「ほとんど使っていない」は選択肢 E）
 * - Layer1 のみ完了（回答に questionId > 10 が含まれない）→ 一般層
 * - 上記以外かつ Layer2 以降に回答がある → 上級者層
 */
function resolveUserLayer(answers: QuestionAnswer[]): "general" | "advanced" {
  const q9 = getLastAnswerValue(answers, 9);
  const q6 = getLastAnswerValue(answers, 6);
  if (q9 === "E" || q6 === "E") {
    return "general";
  }
  const hasLayer2Or3 = answers.some((a) => a.questionId > 10);
  if (!hasLayer2Or3) {
    return "general";
  }
  return "advanced";
}

/**
 * スコア降順。同点時は AI_KINDS の定義順を優先（決定性のため）
 */
function sortByScores(scores: Record<AiKind, number>): AiKind[] {
  return [...AI_KINDS].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) {
      return diff;
    }
    return AI_KINDS.indexOf(a) - AI_KINDS.indexOf(b);
  });
}

/**
 * 全AIの最高スコアが閾値以下か（自由人フォールバック判定）
 */
function isAllScoresLow(
  scores: Record<AiKind, number>,
  ceiling: number
): boolean {
  const maxScore = Math.max(...AI_KINDS.map((k) => scores[k]));
  return maxScore <= ceiling;
}

/**
 * displayMode をスコア差と低スコア帯から決定する
 */
function resolveDisplayMode(
  scoreDiff: number,
  allLow: boolean
): DiagnosisDisplayMode {
  if (allLow) {
    return "mixed";
  }
  if (scoreDiff >= 3) {
    return "definitive";
  }
  return "borderline";
}

/**
 * mixed 時の推奨順（PRD: 自由人＋ChatGPT起点）に並べ替え
 */
function rankingForMixedMode(rawRanking: AiKind[]): AiKind[] {
  const rest = rawRanking.filter((k) => k !== "jiyujin" && k !== "chatgpt");
  return ["jiyujin", "chatgpt", ...rest];
}

/**
 * Claude 上限適用済みのスコアから ranking / displayMode 等を決定する（内部共通）
 */
function finalizeScoringResult(
  scores: Record<AiKind, number>,
  userLayer: UserLayer,
  options: Partial<ScoringEngineOptions> = {}
): ScoringEngineResult {
  const merged: ScoringEngineOptions = { ...DEFAULT_OPTIONS, ...options };

  const rawRanking = sortByScores(scores);
  const rawFirst = rawRanking[0];
  const rawSecond = rawRanking[1] ?? null;
  const rawDiff =
    rawSecond !== null ? scores[rawFirst] - scores[rawSecond] : 0;

  const allLow = isAllScoresLow(
    scores,
    merged.mixedFallbackMaxScoreCeiling
  );
  const displayMode = resolveDisplayMode(rawDiff, allLow);

  let ranking: AiKind[];
  let first: AiKind;
  let second: AiKind | null;
  let scoreDiff: number;

  if (displayMode === "mixed") {
    ranking = rankingForMixedMode(rawRanking);
    first = "jiyujin";
    second = "chatgpt";
    scoreDiff = 0;
  } else {
    ranking = rawRanking;
    first = rawFirst;
    second = rawSecond;
    scoreDiff = rawDiff;
  }

  let displayPrimaryAi: AiKind;
  let primaryAiPivotNoteJa: string | null = null;

  if (displayMode === "mixed") {
    displayPrimaryAi = "chatgpt";
  } else if (rawFirst === "jiyujin" && rawSecond !== null) {
    displayPrimaryAi = rawSecond;
    primaryAiPivotNoteJa = `自由人タイプの中でも、あなたの軸になるのは ${PIVOT_NOTE_AI_NAME[rawSecond]} です`;
  } else {
    displayPrimaryAi = rawFirst;
  }

  return {
    scoresByAi: scores,
    ranking,
    first,
    second,
    scoreDiff,
    displayMode,
    userLayer,
    displayPrimaryAi,
    primaryAiPivotNoteJa,
  };
}

/**
 * マトリクス集計後のスコアに Claude 上限を適用してから ScoringResult を組み立てる（MBTI 補正後の再計算用）
 * 入力オブジェクトはミュテートしない。
 */
export function buildScoringResultFromAggregatedScores(
  aggregatedScores: Record<AiKind, number>,
  userLayer: UserLayer,
  options: Partial<ScoringEngineOptions> = {}
): ScoringEngineResult {
  const merged: ScoringEngineOptions = { ...DEFAULT_OPTIONS, ...options };
  const applyClaudeBiasCap = userLayer === "advanced";

  const scores = createEmptyScores();
  for (const k of AI_KINDS) {
    scores[k] = aggregatedScores[k];
  }
  applyClaudeCap(scores, merged.claudeMaxScore, applyClaudeBiasCap);

  return finalizeScoringResult(scores, userLayer, options);
}

/**
 * 30問分の回答を集計し ScoringResult を返す
 *
 * 配点は Kompass_Scoring.md v1.2 のマトリクスに準拠。
 * Q14 の Google 系 +5 / Microsoft 系 +5 はマトリクス上で Gemini / Copilot に反映済み。
 *
 * @param answers 診断回答（同一 questionId が複数ある場合は末尾を採用）
 * @param options mixed 判定の閾値・Claude 上限など（省略時は既定値）
 */
export function scoreDiagnosisAnswers(
  answers: QuestionAnswer[],
  options: Partial<ScoringEngineOptions> = {}
): ScoringEngineResult {
  const merged: ScoringEngineOptions = { ...DEFAULT_OPTIONS, ...options };
  const userLayer = resolveUserLayer(answers);
  const applyClaudeBiasCap = userLayer === "advanced";

  const scores = createEmptyScores();

  for (const row of answers) {
    const delta = deltaFromMatrix(row.questionId, row.value);
    for (const k of AI_KINDS) {
      const add = delta[k];
      if (add !== undefined) {
        scores[k] += add;
      }
    }
  }

  applyClaudeCap(scores, merged.claudeMaxScore, applyClaudeBiasCap);

  return finalizeScoringResult(scores, userLayer, options);
}
