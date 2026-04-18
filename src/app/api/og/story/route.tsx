import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { loadNotoSansJpForText } from "../load-noto-sans-jp";
import {
  STORY_BACKGROUND_GRADIENT,
  TYPE_DATA,
  TYPE_ID_MAP,
  type OgTypeKey,
} from "../type-data";

export const runtime = "edge";

const TEXT = "#1a1a2e";
const SUB_TEXT = "rgba(26,26,46,0.55)";

/** Google Fonts text= に渡す文字（表示文言の和集合） */
const FONT_SUBSET_TEXT = [
  ...Object.values(TYPE_DATA).flatMap((d) => [
    d.ja.label,
    d.en.label,
    String(d.percent),
    d.ai,
  ]),
  "0123456789%",
  "全体の",
  "Overall",
  "あなたに合ったAIが見つかりました",
  "We found the right AI for you.",
  "AIタイプ診断サービス",
  "AI type diagnosis",
  "🧭KOMPASS ",
  "RECOMMENDED AI",
  "BASE AI",
  "SUB AI",
  "Perplexity / ChatGPT",
].join("");

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) {
    return `rgba(26,26,46,${alpha})`;
  }
  const n = Number.parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function resolveTypeKey(raw: string): OgTypeKey {
  const mapped = TYPE_ID_MAP[raw];
  if (mapped !== undefined) {
    return mapped;
  }
  if (raw in TYPE_DATA) {
    return raw as OgTypeKey;
  }
  return "empath";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawType = searchParams.get("type") ?? "empath";
  const lang = searchParams.get("lang") === "en" ? "en" : "ja";

  const typeKey = resolveTypeKey(rawType);
  const data = TYPE_DATA[typeKey];
  const bgGradient = STORY_BACKGROUND_GRADIENT[typeKey];

  const primaryName = lang === "ja" ? data.ja.label : data.en.label;
  const secondaryName = lang === "ja" ? data.en.label : data.ja.label;

  const serviceLine =
    lang === "ja" ? "AIタイプ診断サービス" : "AI type diagnosis";
  const percentLine1 = lang === "ja" ? "全体の" : "Overall";
  const foundLine =
    lang === "ja"
      ? "あなたに合ったAIが見つかりました"
      : "We found the right AI for you.";

  const watermark = data.en.label.toUpperCase();

  const charImgSrc = `https://kompass-rosy.vercel.app${data.charImg}`;

  const fonts = await loadNotoSansJpForText(FONT_SUBSET_TEXT);

  const accentSoft = hexToRgba(data.accent, 0.14);
  const radialAccent = hexToRgba(data.accent, 0.3);
  const watermarkColor = hexToRgba(data.accent, 0.07);

  const isNomad = typeKey === "nomad";

  const response = new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          fontFamily: '"Noto Sans JP", sans-serif',
          color: TEXT,
          background: bgGradient,
        }}
      >
        {/* 右上：放射状グラデーション */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -80,
            width: 720,
            height: 560,
            background: `radial-gradient(ellipse 70% 65% at 65% 75%, ${radialAccent} 0%, transparent 72%)`,
            display: "flex",
          }}
        />

        {/* 背景：英語タイプ名（大文字・薄） */}
        <div
          style={{
            position: "absolute",
            left: -20,
            bottom: 120,
            fontSize: 140,
            fontWeight: 700,
            lineHeight: 0.85,
            letterSpacing: -4,
            color: watermarkColor,
            textTransform: "uppercase",
            maxWidth: 1100,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {watermark}
        </div>

        {/* 上段：ロゴ + 割合 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "44px 48px 0",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              🧭 KOMPASS
            </div>
            <div
              style={{
                fontSize: 13,
                color: SUB_TEXT,
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              {serviceLine}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 15, color: SUB_TEXT, fontWeight: 500 }}>
              {percentLine1}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>
              {data.percent}%
            </div>
          </div>
        </div>

        {/* 中央：タイプ名 + キャラ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            paddingTop: 36,
            zIndex: 2,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                textAlign: "center",
                maxWidth: 960,
                lineHeight: 1.15,
              }}
            >
              {primaryName}
            </div>
            <div
              style={{
                fontSize: 14,
                color: SUB_TEXT,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {secondaryName}
            </div>
          </div>

          <div
            style={{
              width: 400,
              height: 400,
              borderRadius: "50%",
              backgroundColor: `${data.accent}40`,
              border: `5px solid ${data.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={charImgSrc}
              width={360}
              height={360}
              style={{ objectFit: "contain" }}
              alt=""
            />
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 14,
              color: SUB_TEXT,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {foundLine}
          </div>
        </div>

        {/* 下部 AI ブロック */}
        <div
          style={{
            margin: "0 40px 56px",
            padding: "28px 32px 32px",
            borderRadius: 20,
            backgroundColor: accentSoft,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          {isNomad ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: SUB_TEXT,
                }}
              >
                BASE AI
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Claude</div>
              <div
                style={{
                  width: "72%",
                  height: 1,
                  backgroundColor: "rgba(26,26,46,0.15)",
                  margin: "6px 0",
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: SUB_TEXT,
                }}
              >
                SUB AI
              </div>
              <div style={{ fontSize: 12, color: SUB_TEXT, fontWeight: 500 }}>
                Perplexity / ChatGPT
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: SUB_TEXT,
                }}
              >
                RECOMMENDED AI
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{data.ai}</div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts,
    }
  );

  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  response.headers.set("Content-Type", "image/png");
  return response;
}
