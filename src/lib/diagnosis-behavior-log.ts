/**
 * 診断結果行（recordId）に紐づく行動ログを非同期送信する。
 * 失敗しても UI や診断フローを止めない。
 */

export interface DiagnosisBehaviorLogPayload {
  recordId: string;
  clicked_ai_button?: string;
  clicked_prompt_copy?: boolean;
  clicked_share?: boolean;
  ai_execution_feedback?: "good" | "meh" | "bad";
  task_type?: "writing" | "coding" | "research" | "idea" | "other";
  /** true のとき API 側で visited_at を現在時刻に更新する */
  markVisited?: boolean;
}

/**
 * バックグラウンドで POST する（await しない）
 */
export function enqueueDiagnosisBehaviorLog(
  payload: DiagnosisBehaviorLogPayload
): void {
  const id = payload.recordId.trim();
  if (id === "") {
    return;
  }
  void (async () => {
    try {
      await fetch("/api/diagnosis/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: id,
          clicked_ai_button: payload.clicked_ai_button,
          clicked_prompt_copy: payload.clicked_prompt_copy,
          clicked_share: payload.clicked_share,
          ai_execution_feedback: payload.ai_execution_feedback,
          task_type: payload.task_type,
          visited_at: payload.markVisited === true,
        }),
      });
    } catch {
      // 診断体験に影響させない
    }
  })();
}
