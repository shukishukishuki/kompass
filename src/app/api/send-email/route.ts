import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildFollowupEmailTemplate } from "@/lib/email-templates";

interface SendEmailBody {
  email?: unknown;
  ai_type?: unknown;
  layer_completed?: unknown;
}

function isEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * POST: Resendでフォローアップメール1通目を即時送信
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SendEmailBody;
    if (!isEmail(body.email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (typeof body.ai_type !== "string" || body.ai_type.trim() === "") {
      return NextResponse.json({ ok: false, error: "invalid_ai_type" }, { status: 400 });
    }
    if (typeof body.layer_completed !== "number" || Number.isNaN(body.layer_completed)) {
      return NextResponse.json(
        { ok: false, error: "invalid_layer_completed" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey === undefined || apiKey.trim() === "") {
      return NextResponse.json({ ok: false, error: "missing_resend_api_key" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { subject, html } = buildFollowupEmailTemplate(
      body.ai_type,
      body.layer_completed
    );

    await resend.emails.send({
      from: "noreply@kompass-rosy.vercel.app",
      to: body.email.trim(),
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API /api/send-email] メール送信処理でエラー:", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}
