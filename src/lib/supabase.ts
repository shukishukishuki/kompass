import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DiagnosisResult } from "@/types/diagnosis";
import type {
  DiagnosisResultsBehaviorPatch,
  DiagnosisResultsInsertPayload,
  UsersInsertPayload,
} from "@/types/supabase-db";

/** ブラウザ用シングルトン */
let browserClient: SupabaseClient | null = null;

/**
 * クライアントサイド用の Supabase クライアントを返す
 * URL / anon キーは NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createSupabaseClient(): SupabaseClient {
  if (browserClient !== null) {
    return browserClient;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url === undefined || url.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL が設定されていません。`.env.local` を確認してください。"
    );
  }
  if (anonKey === undefined || anonKey.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。`.env.local` を確認してください。"
    );
  }
  browserClient = createClient(url, anonKey);
  return browserClient;
}

/**
 * INSERT 応答の単一行に id が含まれるか
 */
function isRowWithId(value: unknown): value is { id: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.id === "string";
}

/**
 * SELECT type 行の形か
 */
function isTypeRow(value: unknown): value is { type: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.type === "string";
}

/** 診断結果保存時の付帯メタ（スコアリング非依存） */
export interface SaveDiagnosisResultMeta {
  ageRange: string | null;
  infrastructure: string | null;
}

interface SaveFollowupMeta {
  aiType?: string | null;
  layerCompleted?: number | null;
}

/**
 * 診断結果を diagnosis_results に保存する
 * @returns 成功時は挿入行の id、失敗時は null
 */
export async function saveDiagnosisResult(
  result: DiagnosisResult,
  meta?: SaveDiagnosisResultMeta
): Promise<string | null> {
  try {
    const supabase = createSupabaseClient();
    const payload: DiagnosisResultsInsertPayload = {
      type: result.type,
      type_en: result.typeEn,
      base_ai_name: result.baseAI.name,
      display_mode: result.displayMode,
      age_range: meta?.ageRange ?? null,
      infrastructure: meta?.infrastructure ?? null,
    };

    const { data, error } = await supabase
      .from("diagnosis_results")
      .insert(payload)
      .select("id")
      .single();

    if (error !== null) {
      console.error(
        "[Supabase] 診断結果の保存に失敗しました:",
        error.message,
        error
      );
      return null;
    }

    if (!isRowWithId(data)) {
      console.error(
        "[Supabase] 診断結果の保存応答が不正です（id が取得できません）"
      );
      return null;
    }

    return data.id;
  } catch (e) {
    console.error("[Supabase] saveDiagnosisResult で例外が発生しました:", e);
    return null;
  }
}

/**
 * 診断1行に対する行動ログをマージ更新する（失敗しても呼び出し元は無視してよい）
 */
export async function patchDiagnosisResultBehavior(
  recordId: string,
  patch: DiagnosisResultsBehaviorPatch
): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("diagnosis_results")
      .update(patch)
      .eq("id", recordId);
    if (error !== null) {
      console.error(
        "[Supabase] 行動ログの更新に失敗しました:",
        error.message,
        error
      );
    }
  } catch (e) {
    console.error(
      "[Supabase] patchDiagnosisResultBehavior で例外が発生しました:",
      e
    );
  }
}

/** getDiagnosisStats の戻り値：タイプ名 → 件数 */
export type DiagnosisTypeStats = Record<string, number>;

/**
 * タイプ別の診断回数を集計する
 */
export async function getDiagnosisStats(): Promise<DiagnosisTypeStats> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("diagnosis_results")
      .select("type");

    if (error !== null) {
      console.error(
        "[Supabase] 診断統計の取得に失敗しました:",
        error.message,
        error
      );
      return {};
    }

    const stats: DiagnosisTypeStats = {};
    const rows = Array.isArray(data) ? data : [];
    for (const row of rows) {
      if (!isTypeRow(row)) {
        continue;
      }
      const t = row.type;
      stats[t] = (stats[t] ?? 0) + 1;
    }
    return stats;
  } catch (e) {
    console.error("[Supabase] getDiagnosisStats で例外が発生しました:", e);
    return {};
  }
}

/**
 * users テーブル未作成エラーかを判定する
 */
function isUsersTableMissingError(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  const code = o.code;
  const message = o.message;
  if (code === "42P01") {
    return true;
  }
  if (typeof message !== "string") {
    return false;
  }
  return message.includes('relation "users" does not exist');
}

/**
 * users テーブルに新カラムが未反映か（段階的移行中の互換対策）
 */
function isUsersColumnMissingError(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  const message = o.message;
  if (typeof message !== "string") {
    return false;
  }
  return (
    message.includes("column") &&
    (message.includes("ai_type") ||
      message.includes("layer_completed") ||
      message.includes("email_sent_at"))
  );
}

/**
 * フォローアップ用メールを users テーブルへ保存する
 * テーブルが未作成の場合のみ warn で握りつぶす
 */
export async function saveUserFollowupEmail(
  email: string,
  diagnosisType: string,
  meta?: SaveFollowupMeta
): Promise<boolean> {
  try {
    const supabase = createSupabaseClient();
    const basePayload: UsersInsertPayload = {
      email,
      diagnosis_type: diagnosisType,
    };

    const payloadWithMeta: UsersInsertPayload = {
      ...basePayload,
      ai_type: meta?.aiType ?? null,
      layer_completed: meta?.layerCompleted ?? null,
      email_sent_at: new Date().toISOString(),
    };

    let { error } = await supabase.from("users").insert(payloadWithMeta);
    if (error !== null && isUsersColumnMissingError(error)) {
      const retry = await supabase.from("users").insert(basePayload);
      error = retry.error;
    }

    if (error !== null) {
      if (isUsersTableMissingError(error)) {
        console.warn(
          "[Supabase] users テーブル未作成のため、メール登録をスキップしました。"
        );
        return false;
      }
      console.error(
        "[Supabase] メール登録に失敗しました:",
        error.message,
        error
      );
      return false;
    }

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ai_type: meta?.aiType ?? diagnosisType,
          layer_completed: meta?.layerCompleted ?? 1,
        }),
      });
    } catch {
      // メール送信失敗はUXを止めない
    }

    return true;
  } catch (e) {
    if (isUsersTableMissingError(e)) {
      console.warn(
        "[Supabase] users テーブル未作成のため、メール登録をスキップしました。"
      );
      return false;
    }
    console.error("[Supabase] saveUserFollowupEmail で例外が発生しました:", e);
    return false;
  }
}
