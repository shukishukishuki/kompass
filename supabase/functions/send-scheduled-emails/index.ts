// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ScheduledUser = {
  id: string;
  email: string;
  ai_type: string | null;
  layer_completed: number | null;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async () => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 3日後メール対象（created_atが3日前・email_2_sent_atがnull）
  const { data: day3Users, error: day3Error } = await supabase
    .from("users")
    .select("id,email,ai_type,layer_completed")
    .lte("created_at", threeDaysAgo.toISOString())
    .is("email_2_sent_at", null)
    .not("email", "is", null);

  if (day3Error !== null) {
    console.error("[send-scheduled-emails] day3 query error", day3Error);
  }

  for (const user of day3Users ?? []) {
    await sendEmail(user as ScheduledUser, 2);
    await supabase
      .from("users")
      .update({ email_2_sent_at: now.toISOString() })
      .eq("id", user.id);
  }

  // 7日後メール対象（created_atが7日前・email_3_sent_atがnull・layer_completed < 4）
  const { data: day7Users, error: day7Error } = await supabase
    .from("users")
    .select("id,email,ai_type,layer_completed")
    .lte("created_at", sevenDaysAgo.toISOString())
    .is("email_3_sent_at", null)
    .neq("layer_completed", 4)
    .not("email", "is", null);

  if (day7Error !== null) {
    console.error("[send-scheduled-emails] day7 query error", day7Error);
  }

  for (const user of day7Users ?? []) {
    await sendEmail(user as ScheduledUser, 3);
    await supabase
      .from("users")
      .update({ email_3_sent_at: now.toISOString() })
      .eq("id", user.id);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});

async function sendEmail(user: ScheduledUser, emailNumber: number) {
  const subject = getSubject(user.ai_type ?? "", emailNumber);
  const html = getBody(user.ai_type ?? "", user.layer_completed ?? 1, emailNumber);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: user.email,
      subject,
      html,
    }),
  });
}

function getSubject(aiType: string, num: number): string {
  const subjects: Record<number, string> = {
    2: "【Kompass】NGな使い方と、正しい使い方",
    3: "【Kompass】もっと深く使いこなすために",
  };
  return subjects[num] ?? "【Kompass】AIをもっと活用しよう";
}

function getBody(aiType: string, layerCompleted: number, num: number): string {
  if (num === 2) {
    return `<p>AIを使っていて、こんな経験はありませんか？</p>
<p>実は、あなたのタイプには「やりがちなNG使い方」があります。</p>
<p>詳しい結果はこちら：<a href="https://kompass-rosy.vercel.app/ja/diagnosis/result">診断結果を見る</a></p>`;
  }
  return `<p>診断から1週間。AIは使えていますか？</p>
<p>もっと深く知りたい方は、続きの診断もお試しください。</p>
<p><a href="https://kompass-rosy.vercel.app/ja/diagnosis/result">続きを診断する</a></p>`;
}
