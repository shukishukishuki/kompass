import { GUIDE_DETAILS } from "@/lib/guide-details";
import { AI_KIND_TO_GUIDE } from "@/lib/type-id-map";
import { TYPE_CHARACTERS, type TypeId } from "@/lib/type-characters";

export interface FollowupEmailTemplate {
  subject: string;
  html: string;
}

function resolveTypeId(aiType: string): TypeId | null {
  const raw = aiType.trim();
  if (raw === "") {
    return null;
  }
  const lower = raw.toLowerCase();
  if (
    lower === "empath" ||
    lower === "generalist" ||
    lower === "scout" ||
    lower === "analyst" ||
    lower === "executive" ||
    lower === "orchestrator"
  ) {
    return lower;
  }
  const mapped = AI_KIND_TO_GUIDE[lower];
  if (mapped !== undefined) {
    return mapped as TypeId;
  }
  const byCharacter = TYPE_CHARACTERS.find(
    (item) =>
      item.typeJa === raw ||
      item.characterName === raw ||
      item.typeEn.toLowerCase() === lower
  );
  return byCharacter?.typeId ?? null;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * タイプ別×Layer別のフォローアップメール本文を作成する
 */
export function buildFollowupEmailTemplate(
  aiType: string,
  layerCompleted: number
): FollowupEmailTemplate {
  const typeId = resolveTypeId(aiType) ?? "generalist";
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  const content = GUIDE_DETAILS[typeId];
  const typeLabel = character?.characterName ?? "AIタイプ";
  const safeLayer =
    Number.isFinite(layerCompleted) && layerCompleted > 0
      ? Math.min(4, Math.floor(layerCompleted))
      : 1;
  const prompts = content.prompts.slice(0, 3).map((p) => escapeHtml(p));
  const subject = `【Kompass】${typeLabel}のあなたへ：今すぐ使えるプロンプト`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.75; padding: 16px;">
      <h1 style="font-size: 20px; margin: 0 0 14px;">${escapeHtml(subject)}</h1>
      <p style="margin: 0 0 10px;">${escapeHtml(typeLabel)}診断、お疲れ様でした。</p>
      <p style="margin: 0 0 16px; color: #4b5563;">Layer ${safeLayer}までの回答内容をもとに、今すぐ使えるプロンプトを3つお届けします。</p>
      <h2 style="font-size: 16px; margin: 0 0 10px;">今すぐ使えるプロンプト3つ</h2>
      <ol style="margin: 0 0 16px; padding-left: 20px;">
        ${prompts
          .map(
            (prompt) =>
              `<li style="margin-bottom: 10px;"><span style="background: #f3f4f6; border-radius: 8px; display: inline-block; padding: 8px 10px;">${prompt}</span></li>`
          )
          .join("")}
      </ol>
      <p style="margin: 0 0 16px;">
        結果ページ: <a href="https://kompass-rosy.vercel.app/ja/diagnosis/result">https://kompass-rosy.vercel.app/ja/diagnosis/result</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 18px 0;" />
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        配信停止はこちら:
        <a href="mailto:noreply@kompass-rosy.vercel.app?subject=unsubscribe">メール配信を停止する</a>
      </p>
    </div>
  `;

  return { subject, html };
}
