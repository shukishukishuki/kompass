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
}

/** users への INSERT に使うカラム（created_at はDB任せ） */
export interface UsersInsertPayload {
  email: string;
  diagnosis_type: string;
}
