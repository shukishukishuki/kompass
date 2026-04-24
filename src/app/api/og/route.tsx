import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { TYPE_DATA, TYPE_ID_MAP } from "./type-data";

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
  const textColor = "#1f2937";
  const subColor = "rgba(31,41,55,0.68)";

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
            alignItems: "center",
            padding: "32px 48px",
          }}
        >
          <span
            style={{
              color: data.accent,
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              letterSpacing: "0.15em",
            }}
          >
            Kompass
          </span>
          <span
            style={{
              color: subColor,
              fontSize: 18,
              display: "flex",
              letterSpacing: "0.2em",
              fontWeight: 500,
            }}
          >
            AI TYPE DIAGNOSIS
          </span>
          <span style={{ color: subColor, fontSize: 18, display: "flex", fontWeight: 600 }}>
            全体の {data.percent}%
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            padding: "0 48px 48px",
            gap: "40px",
          }}
        >
          <div
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              backgroundColor: `${data.accent}33`,
              border: `4px solid ${data.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={charImgSrc}
              width={200}
              height={200}
              style={{ objectFit: "contain" }}
              alt=""
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "12px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: textColor,
                fontSize: 56,
                fontWeight: 900,
                display: "flex",
                lineHeight: 1.1,
              }}
            >
              {text.label}
            </div>
            <div
              style={{
                color: subColor,
                fontSize: 26,
                display: "flex",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              {lang === "en" ? data.ja.label : data.ai}
            </div>
            <div
              style={{
                color: textColor,
                fontSize: 24,
                display: "flex",
                marginTop: "8px",
                opacity: 0.85,
                fontWeight: 500,
              }}
            >
              {text.catch}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "10px",
              flexShrink: 0,
              width: "320px",
            }}
          >
            <div
              style={{
                color: subColor,
                fontSize: 15,
                display: "flex",
                letterSpacing: "0.2em",
                fontWeight: 600,
              }}
            >
              RECOMMENDED AI
            </div>
            <div
              style={{
                width: "72px",
                height: "6px",
                backgroundColor: data.accent,
                borderRadius: "3px",
                display: "flex",
              }}
            />
            <div
              style={{
                color: data.accent,
                fontSize: 92,
                fontWeight: 900,
                display: "flex",
                lineHeight: 1.05,
                textAlign: "right",
                letterSpacing: "-0.02em",
              }}
            >
              {data.ai}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 48,
            color: subColor,
            fontSize: 18,
            display: "flex",
            fontWeight: 600,
          }}
        >
          usekompass.com
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
