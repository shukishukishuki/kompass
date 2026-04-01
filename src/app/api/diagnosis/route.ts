import { NextResponse } from "next/server";
import { generateDiagnosisTexts, getAiLabelJa } from "@/lib/claude";
import { saveDiagnosisResult } from "@/lib/supabase";
import { AI_KINDS, type AiKind } from "@/types/ai";
import type { DiagnosisResult } from "@/types/diagnosis";
import type { ClaudeGeneratedText } from "@/types/claude";
import type { LayerCompleted } from "@/types/layer-completed";
import type { ScoringResult, UserLayer } from "@/types/scoring";

/** タイプ名（診断の6タイプ）— AiKind 主軸で決定 */
const PERSONALITY_BY_AI: Record<
  AiKind,
  { type: string; typeEn: string }
> = {
  claude: { type: "相談相手タイプ", typeEn: "The Confidant" },
  chatgpt: { type: "万能助手タイプ", typeEn: "The Generalist" },
  gemini: { type: "情報通タイプ", typeEn: "The Scout" },
  perplexity: { type: "研究者タイプ", typeEn: "The Analyst" },
  copilot: { type: "秘書タイプ", typeEn: "The Executive" },
  jiyujin: { type: "自由人タイプ", typeEn: "The Orchestrator" },
};

/**
 * AiKind かどうか
 */
function isAiKind(value: unknown): value is AiKind {
  return (
    typeof value === "string" &&
    (AI_KINDS as readonly string[]).includes(value)
  );
}

/**
 * scoresByAi の形か（6AIすべて数値）
 */
function isScoresByAi(value: unknown): value is ScoringResult["scoresByAi"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  for (const k of AI_KINDS) {
    if (typeof o[k] !== "number" || Number.isNaN(o[k])) {
      return false;
    }
  }
  return true;
}

/**
 * ScoringResult 全体の検証
 */
function isScoringResult(value: unknown): value is ScoringResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (!isScoresByAi(o.scoresByAi)) {
    return false;
  }
  if (!Array.isArray(o.ranking)) {
    return false;
  }
  if (!o.ranking.every(isAiKind)) {
    return false;
  }
  if (!isAiKind(o.first)) {
    return false;
  }
  if (o.second !== null && !isAiKind(o.second)) {
    return false;
  }
  if (typeof o.scoreDiff !== "number" || Number.isNaN(o.scoreDiff)) {
    return false;
  }
  if (
    o.displayMode !== "definitive" &&
    o.displayMode !== "borderline" &&
    o.displayMode !== "mixed"
  ) {
    return false;
  }
  if (o.userLayer !== "general" && o.userLayer !== "advanced") {
    return false;
  }
  if (!isAiKind(o.displayPrimaryAi)) {
    return false;
  }
  if (
    o.primaryAiPivotNoteJa !== null &&
    typeof o.primaryAiPivotNoteJa !== "string"
  ) {
    return false;
  }
  if (o.primaryAiPivotNoteJa === undefined) {
    return false;
  }
  if (!isLayerCompletedValue(o.layerCompleted)) {
    return false;
  }
  return true;
}

function isUserLayer(value: unknown): value is UserLayer {
  return value === "general" || value === "advanced";
}

function isLayerCompletedValue(value: unknown): value is LayerCompleted {
  return value === 1 || value === 2 || value === 3;
}

/**
 * 診断APIのリクエストボディ検証
 */
function isDiagnosisRequestBody(
  value: unknown
): value is { scoringResult: ScoringResult; userLayer: UserLayer } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (!isScoringResult(o.scoringResult)) {
    return false;
  }
  if (!isUserLayer(o.userLayer)) {
    return false;
  }
  return true;
}

/**
 * 上級者向けサブAIブロック（表示用ベースAIと役割が重ならないよう分岐）
 */
function buildSubAiEntries(
  scoring: ScoringResult,
  userLayer: UserLayer,
  mainLabel: string
): DiagnosisResult["subAI"] {
  if (userLayer !== "advanced") {
    return [];
  }
  const secondKind = scoring.second;
  if (secondKind === null) {
    return [];
  }
  const subLabel = getAiLabelJa(secondKind);

  if (scoring.displayMode === "mixed") {
    return [
      {
        name: getAiLabelJa("jiyujin"),
        usage: `${getAiLabelJa("chatgpt")}を起点に、用途に応じて複数のAIを使い分けるとよいでしょう。`,
      },
    ];
  }

  if (scoring.first === "jiyujin" && scoring.displayPrimaryAi !== "jiyujin") {
    return [
      {
        name: getAiLabelJa("jiyujin"),
        usage: `${mainLabel}を軸にしつつ、場面に応じて他のAIも併用するスタイルが合います。`,
      },
    ];
  }

  return [
    {
      name: subLabel,
      usage: `${subLabel}は${mainLabel}と役割を分け、調整・調査・別案出しなど補助的に使うと効果的です。`,
    },
  ];
}

/**
 * スコアリング結果と生成テキストから DiagnosisResult を組み立てる
 */
function buildDiagnosisResult(
  scoring: ScoringResult,
  userLayer: UserLayer,
  texts: ClaudeGeneratedText
): DiagnosisResult {
  const personalityKind = scoring.first;
  const personality = PERSONALITY_BY_AI[personalityKind];

  const displayKind = scoring.displayPrimaryAi;
  const mainLabel = getAiLabelJa(displayKind);
  const mainScore = scoring.scoresByAi[displayKind];

  const expertViewText =
    userLayer === "advanced" && texts.expertView !== undefined
      ? texts.expertView
      : "";

  const subEntries = buildSubAiEntries(scoring, userLayer, mainLabel);

  const baseAI: DiagnosisResult["baseAI"] = {
    name: mainLabel,
    score: mainScore,
    reason: texts.reason,
    setup: texts.setup,
  };
  if (
    scoring.primaryAiPivotNoteJa !== null &&
    scoring.primaryAiPivotNoteJa.trim() !== ""
  ) {
    baseAI.note = scoring.primaryAiPivotNoteJa;
  }

  return {
    baseAI,
    subAI: subEntries,
    expertView: expertViewText,
    type: personality.type,
    typeEn: personality.typeEn,
    scoreDiff: scoring.scoreDiff,
    displayMode: scoring.displayMode,
    layerCompleted: scoring.layerCompleted,
  };
}

/**
 * POST: スコアリング結果から診断コピーを生成し、可能なら DB に保存、常に DiagnosisResult を返す
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    let parsed: unknown;
    try {
      parsed = await request.json();
    } catch {
      return NextResponse.json(
        { error: "JSON の解析に失敗しました" },
        { status: 400 }
      );
    }

    if (!isDiagnosisRequestBody(parsed)) {
      return NextResponse.json(
        {
          error:
            "scoringResult（ScoringResult）と userLayer（general | advanced）が必要です",
        },
        { status: 400 }
      );
    }

    const { scoringResult, userLayer } = parsed;

    const texts = await generateDiagnosisTexts(scoringResult, userLayer);
    const diagnosis = buildDiagnosisResult(
      scoringResult,
      userLayer,
      texts
    );

    const savedId = await saveDiagnosisResult(diagnosis);
    if (savedId === null) {
      // Supabase 未設定などで保存できない開発環境でも、診断本文は返す
      console.warn(
        "[API /api/diagnosis] 診断結果の保存をスキップしました（DB 未接続の可能性）"
      );
    }

    return NextResponse.json(diagnosis);
  } catch (e) {
    console.error("[API /api/diagnosis] 処理中にエラーが発生しました:", e);
    return NextResponse.json(
      { error: "サーバーでエラーが発生しました" },
      { status: 500 }
    );
  }
}
