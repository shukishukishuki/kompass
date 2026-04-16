import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TYPE_DATA = {
  empath: {
    ja: { label: "共感ジャンキー", catch: "答えじゃなくて、わかってほしかっただけ。" },
    en: { label: "The Confidant", catch: "I don't need answers. I need to be heard." },
    ai: "Claude",
    percent: 24,
    bg: "#FDF3E3",
    accent: "#E8952A",
    charImg: "/images/kompass_char_01_empath.png",
    darkText: true,
  },
  executor: {
    ja: { label: "整理の鬼", catch: "整理されてないと、息ができない。" },
    en: { label: "The Executive", catch: "Chaos isn't a vibe. It's a problem." },
    ai: "Copilot",
    percent: 19,
    bg: "#F0F4F8",
    accent: "#0078D4",
    charImg: "/images/kompass_char_02_executor.png",
    darkText: true,
  },
  analyst: {
    ja: { label: "裏取りマニア", catch: "「たぶん」で動くの、無理なんだよな。" },
    en: { label: "The Analyst", catch: "I don't do 'probably'." },
    ai: "Perplexity",
    percent: 13,
    bg: "#0F1629",
    accent: "#20B2AA",
    charImg: "/images/kompass_char_03_analyst.png",
    darkText: false,
  },
  generalist: {
    ja: { label: "丸投げ屋", catch: "考えるより、投げた方が早い。" },
    en: { label: "The Generalist", catch: "Why think when you can delegate?" },
    ai: "ChatGPT",
    percent: 28,
    bg: "#111111",
    accent: "#10A37F",
    charImg: "/images/kompass_char_04_generalist.png",
    darkText: false,
  },
  scout: {
    ja: { label: "情報スナイパー", catch: "いらない情報、本当にいらない。" },
    en: { label: "The Scout", catch: "Just give me what I need. Nothing else." },
    ai: "Gemini",
    percent: 9,
    bg: "#FAFBFF",
    accent: "#4285F4",
    charImg: "/images/kompass_char_05_scout.png",
    darkText: true,
  },
  nomad: {
    ja: { label: "AI遊牧民", catch: "1つのAIで満足できたことが、ない。" },
    en: { label: "The Orchestrator", catch: "One AI was never going to be enough." },
    ai: "Multi-AI",
    percent: 7,
    bg: "#150828",
    accent: "#C9A84C",
    charImg: "/images/kompass_char_06_nomad.png",
    darkText: false,
  },
};

// claudeタイプIDとの互換マップ（既存コードが claude/chatgpt 等を渡す場合）
const TYPE_ID_MAP: Record<string, string> = {
  claude: "empath",
  chatgpt: "generalist",
  gemini: "scout",
  perplexity: "analyst",
  copilot: "executor",
  jiyujin: "nomad",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawType = searchParams.get("type") ?? "empath";
  const lang = searchParams.get("lang") === "en" ? "en" : "ja";

  // 旧IDと新IDの両方に対応
  const typeKey = TYPE_ID_MAP[rawType] ?? rawType;
  const data = TYPE_DATA[typeKey as keyof typeof TYPE_DATA] ?? TYPE_DATA.empath;

  const text = data[lang];
  const textColor = data.darkText ? "#1a1a2e" : "#ffffff";
  const subColor = data.darkText ? "rgba(26,26,46,0.6)" : "rgba(255,255,255,0.6)";

  // Edge runtimeでも安定して参照できるよう、画像は絶対URLを直接指定する
  const charImgSrc = `https://kompass-rosy.vercel.app${data.charImg}`;

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: data.bg,
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ヘッダー */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 48px",
        }}>
          <span style={{ color: data.accent, fontSize: 22, fontWeight: "bold", display: "flex", letterSpacing: "0.15em" }}>
            Kompass
          </span>
          <span style={{ color: subColor, fontSize: 18, display: "flex", letterSpacing: "0.2em" }}>
            AI TYPE DIAGNOSIS
          </span>
          <span style={{ color: subColor, fontSize: 18, display: "flex" }}>
            全体の {data.percent}%
          </span>
        </div>

        {/* メインコンテンツ */}
        <div style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          padding: "0 48px 48px",
          gap: "48px",
        }}>
          {/* 左：キャラ */}
          <div style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            backgroundColor: data.accent + "33",
            border: `4px solid ${data.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={charImgSrc}
              width={200}
              height={200}
              style={{ objectFit: "contain" }}
              alt=""
            />
          </div>

          {/* 中：テキスト */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: "12px",
          }}>
            <div style={{ color: textColor, fontSize: 72, fontWeight: "bold", display: "flex", lineHeight: 1.1 }}>
              {text.label}
            </div>
            <div style={{ color: subColor, fontSize: 26, display: "flex", letterSpacing: "0.1em" }}>
              {TYPE_DATA[typeKey as keyof typeof TYPE_DATA]?.ja.label !== text.label
                ? TYPE_DATA[typeKey as keyof typeof TYPE_DATA]?.ja.label
                : data.ai}
            </div>
            <div style={{
              color: textColor,
              fontSize: 24,
              display: "flex",
              marginTop: "8px",
              opacity: 0.85,
            }}>
              {text.catch}
            </div>
          </div>

          {/* 右：推奨AI */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}>
            <div style={{ color: subColor, fontSize: 16, display: "flex", letterSpacing: "0.15em" }}>
              RECOMMENDED AI
            </div>
            <div style={{
              width: "64px",
              height: "6px",
              backgroundColor: data.accent,
              borderRadius: "3px",
              display: "flex",
            }} />
            <div style={{ color: data.accent, fontSize: 48, fontWeight: "bold", display: "flex" }}>
              {data.ai}
            </div>
          </div>
        </div>

        {/* URL */}
        <div style={{
          position: "absolute",
          bottom: 28,
          right: 48,
          color: subColor,
          fontSize: 18,
          display: "flex",
        }}>
          kompass-rosy.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  response.headers.set("Content-Type", "image/png");
  return response;
}
