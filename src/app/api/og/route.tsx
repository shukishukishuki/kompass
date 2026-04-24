import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { TYPE_DATA, TYPE_ID_MAP } from "./type-data";

export const dynamic = "force-dynamic";

const OG_BACKGROUND_GRADIENT = {
  empath:
    "linear-gradient(160deg, #b8e8cf 0%, #e8f7ef 55%, #f8fffe 85%, #ffffff 100%)",
  executor:
    "linear-gradient(160deg, #b8d0f0 0%, #e8f0fb 55%, #f5f8ff 85%, #ffffff 100%)",
  analyst:
    "linear-gradient(160deg, #e8d8f8 0%, #f5eeff 55%, #fdfaff 85%, #ffffff 100%)",
  generalist:
    "linear-gradient(160deg, #fde8a8 0%, #fef8e8 55%, #fffdf5 85%, #ffffff 100%)",
  scout:
    "linear-gradient(160deg, #fdd0a8 0%, #fef2e8 55%, #fffaf5 85%, #ffffff 100%)",
  nomad:
    "linear-gradient(160deg, #f0e8c8 0%, #f8f2e0 55%, #fdfaf2 85%, #ffffff 100%)",
} as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawType = searchParams.get("type") ?? "empath";
  const lang = searchParams.get("lang") === "en" ? "en" : "ja";

  const typeKey = TYPE_ID_MAP[rawType] ?? rawType;
  const data =
    TYPE_DATA[typeKey as keyof typeof TYPE_DATA] ?? TYPE_DATA.empath;
  const bgGradient =
    OG_BACKGROUND_GRADIENT[typeKey as keyof typeof OG_BACKGROUND_GRADIENT] ??
    OG_BACKGROUND_GRADIENT.empath;

  const text = data[lang];
  const darkTextTypes = new Set(["empath", "executor", "scout"]);
  const isDarkText = darkTextTypes.has(
    typeKey as "empath" | "executor" | "analyst" | "generalist" | "scout" | "nomad"
  );
  const textColor = isDarkText ? "#1a1a2e" : "#ffffff";
  const subColor = isDarkText
    ? "rgba(26,26,46,0.68)"
    : "rgba(255,255,255,0.78)";

  const charImgSrc = `https://kompass-rosy.vercel.app${data.charImg}`;
  let fontBoldArrayBuffer: ArrayBuffer | null = null;
  try {
    const fontBold = readFileSync(
      join(process.cwd(), "public/fonts/NotoSansJP-Bold.otf")
    );
    fontBoldArrayBuffer = fontBold.buffer.slice(
      fontBold.byteOffset,
      fontBold.byteOffset + fontBold.byteLength
    );
  } catch {
    // フォント読み込み失敗時はシステムフォントへフォールバック
    fontBoldArrayBuffer = null;
  }
  const response = new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundImage: bgGradient,
          display: "flex",
          flexDirection: "column",
          fontFamily: '"Noto Sans JP"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            height: 60,
            padding: "8px 20px 0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", color: textColor }}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: "2.5px",
                lineHeight: 1.1,
              }}
            >
              KOMPASS
            </span>
            <span
              style={{
                marginTop: 3,
                fontSize: 12,
                fontWeight: 700,
                color: subColor,
              }}
            >
              AIタイプ診断サービス
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              color: textColor,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>
              全体の
            </span>
            <span
              style={{
                marginTop: 2,
                fontSize: 36,
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              {data.percent}%
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            width: "100%",
            paddingTop: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              width: "66.6667%",
              padding: 0,
            }}
          >
            <span
              style={{
                color: textColor,
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1px",
                textAlign: "center",
              }}
            >
              {data.ja.label}
            </span>
            <span
              style={{
                color: subColor,
                fontSize: 18,
                letterSpacing: "2.5px",
                fontWeight: 500,
                textTransform: "uppercase",
              }}
            >
              {data.en.label.toUpperCase()}
            </span>
            <div
              style={{
                width: 320,
                height: 320,
                borderRadius: "50%",
                backgroundColor: `${data.accent}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginTop: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={charImgSrc}
                width={320}
                height={320}
                style={{ objectFit: "contain" }}
                alt=""
              />
            </div>
            <span
              style={{
                color: textColor,
                fontSize: 16,
                opacity: 0.85,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {"「"}
              {text.catch}
              {"」"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "33.3333%",
              borderLeft: `0.5px solid ${data.accent}55`,
              padding: "0 14px",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: textColor,
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              あなたに合ったAIが見つかりました
            </div>
            <div
              style={{
                color: subColor,
                fontSize: 12,
                letterSpacing: "0.2em",
                fontWeight: 700,
              }}
            >
              RECOMMENDED AI
            </div>
            <div
              style={{
                width: "44px",
                height: "3px",
                backgroundColor: data.accent,
                borderRadius: "2px",
                marginTop: 8,
              }}
            />
            <span
              style={{
                color: data.accent,
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 1.1,
                marginTop: 10,
                textAlign: "center",
              }}
            >
              {data.ai}
            </span>
            <div
              style={{
                marginTop: 16,
                width: "100%",
                textAlign: "right",
                color: subColor,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              usekompass.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
      width: 1200,
      height: 630,
      ...(fontBoldArrayBuffer !== null
        ? {
            fonts: [
              {
                name: "Noto Sans JP",
                data: fontBoldArrayBuffer,
                weight: 700,
                style: "normal" as const,
              },
              {
                name: "Noto Sans JP",
                data: fontBoldArrayBuffer,
                weight: 900,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    }
  );
  response.headers.set("Content-Type", "image/png");
  return response;
}
