import { NextResponse } from "next/server";
import { patchDiagnosisResultBehavior } from "@/lib/supabase";
import type { DiagnosisResultsBehaviorPatch } from "@/types/supabase-db";

/**
 * ざっくり UUID 形式か（厳密なバージョン判定は不要）
 */
function looksLikeRecordId(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const t = value.trim();
  return (
    t.length >= 32 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  );
}

/**
 * POST: 診断1件の行動ログをマージ更新（失敗しても 200 を返しクライアントを止めない）
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: true });
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ ok: true });
    }
    const o = body as Record<string, unknown>;
    if (!looksLikeRecordId(o.recordId)) {
      return NextResponse.json({ ok: true });
    }
    const recordId = (o.recordId as string).trim();

    const patch: DiagnosisResultsBehaviorPatch = {};

    if (typeof o.clicked_ai_button === "string" && o.clicked_ai_button.trim() !== "") {
      patch.clicked_ai_button = o.clicked_ai_button.trim();
    }
    if (o.clicked_prompt_copy === true) {
      patch.clicked_prompt_copy = true;
    }
    if (o.clicked_share === true) {
      patch.clicked_share = true;
    }
    if (
      typeof o.ai_execution_feedback === "string" &&
      (o.ai_execution_feedback === "good" ||
        o.ai_execution_feedback === "meh" ||
        o.ai_execution_feedback === "bad")
    ) {
      patch.ai_execution_feedback = o.ai_execution_feedback;
    }
    if (
      typeof o.task_type === "string" &&
      (o.task_type === "writing" ||
        o.task_type === "coding" ||
        o.task_type === "research" ||
        o.task_type === "idea" ||
        o.task_type === "other")
    ) {
      patch.task_type = o.task_type;
    }
    if (o.visited_at === true) {
      patch.visited_at = new Date().toISOString();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true });
    }

    try {
      await patchDiagnosisResultBehavior(recordId, patch);
    } catch {
      // patch 内でも握りつぶすが、二重に保険
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[API /api/diagnosis/behavior] 処理中にエラーが発生しました:", e);
    return NextResponse.json({ ok: true });
  }
}
