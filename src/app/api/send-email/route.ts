import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildFollowupEmailTemplate,
  buildResultSaveEmailTemplate,
} from "@/lib/email-templates";

type EmailType = "result_save" | "welcome";

interface SendEmailBody {
  email?: unknown;
  ai_type?: unknown;
  layer_completed?: unknown;
  emailType?: unknown;
}

function isEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function resolveEmailType(value: unknown): EmailType | null {
  if (value === undefined) {
    return "welcome";
  }
  if (value === "result_save" || value === "welcome") {
    return value;
  }
  return null;
}

/**
 * POST: Resendでフォローアップメール1通目を即時送信
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SendEmailBody;
    const emailType = resolveEmailType(body.emailType);
    if (!isEmail(body.email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (emailType === null) {
      return NextResponse.json({ ok: false, error: "invalid_email_type" }, { status: 400 });
    }
    if (
      emailType === "welcome" &&
      (typeof body.ai_type !== "string" || body.ai_type.trim() === "")
    ) {
      return NextResponse.json({ ok: false, error: "invalid_ai_type" }, { status: 400 });
    }
    if (
      emailType === "welcome" &&
      (typeof body.layer_completed !== "number" || Number.isNaN(body.layer_completed))
    ) {
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
    const template =
      emailType === "result_save"
        ? buildResultSaveEmailTemplate()
        : buildFollowupEmailTemplate(body.ai_type as string, body.layer_completed as number);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: body.email.trim(),
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API /api/send-email] メール送信処理でエラー:", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}
