/**
 * Supabase diagnosis_results テーブル連携用の型（アプリ側定義）
 * 実DBと差異がある場合は `supabase gen types` の結果に合わせて更新すること
 */

/** diagnosis_results への INSERT に使うカラム（id / created_at はDB任せ） */
export interface DiagnosisResultsInsertPayload {
  type: string;
  type_en: string;
  base_ai_name: string;
  display_mode: string;
  /** 年代（例: 30代）。未回答時は null */
  age_range?: string | null;
  /** Layer1 Q10（インフラ系設問）の回答値 A–E など */
  infrastructure?: string | null;
}

/** 診断後の行動ログ用 PATCH（存在するカラムだけ更新） */
export interface DiagnosisResultsBehaviorPatch {
  clicked_ai_button?: string | null;
  clicked_prompt_copy?: boolean | null;
  clicked_share?: boolean | null;
  ai_execution_feedback?: string | null;
  task_type?: string | null;
  visited_at?: string | null;
}

/** users への INSERT に使うカラム（created_at はDB任せ） */
export interface UsersInsertPayload {
  email: string;
  diagnosis_type: string;
}
