import { NextResponse } from "next/server";
import { scoreDiagnosisAnswers } from "@/lib/scoringEngine";
import type { LayerCompleted } from "@/types/layer-completed";
import type { QuestionAnswer } from "@/types/scoring";

/**
 * リクエストボディが { answers: QuestionAnswer[] } か検証する
 */
function isQuestionAnswer(value: unknown): value is QuestionAnswer {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.questionId === "number" && typeof o.value === "string";
}

function isLayerCompletedValue(value: unknown): value is LayerCompleted {
  return value === 1 || value === 2 || value === 3;
}

function isAnswersPayload(
  body: unknown
): body is { answers: QuestionAnswer[]; layerCompleted?: LayerCompleted } {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const o = body as Record<string, unknown>;
  if (!Array.isArray(o.answers)) {
    return false;
  }
  if (!o.answers.every(isQuestionAnswer)) {
    return false;
  }
  if (
    "layerCompleted" in o &&
    o.layerCompleted !== undefined &&
    !isLayerCompletedValue(o.layerCompleted)
  ) {
    return false;
  }
  return true;
}

/**
 * POST: 30問相当の回答配列を受け取り、スコアリング結果を返す
 */
export async function POST(request: Request): Promise<NextResponse> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON の解析に失敗しました" },
      { status: 400 }
    );
  }

  if (!isAnswersPayload(parsed)) {
    return NextResponse.json(
      { error: "answers は QuestionAnswer の配列で指定してください" },
      { status: 400 }
    );
  }

  const result = scoreDiagnosisAnswers(parsed.answers);
  const layerCompleted: LayerCompleted = parsed.layerCompleted ?? 3;
  return NextResponse.json({ ...result, layerCompleted });
}
