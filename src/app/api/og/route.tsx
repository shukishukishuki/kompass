import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { TYPE_DATA, TYPE_ID_MAP } from "./type-data";

export const runtime = "edge";

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

let notoSansJp500Promise: Promise<ArrayBuffer> | null = null;
let notoSansJp700Promise: Promise<ArrayBuffer> | null = null;
let notoSansJp900Promise: Promise<ArrayBuffer> | null = null;

/** Google Fonts から Noto Sans JP を取得 */
async function loadNotoSansJp(weight: 500 | 700 | 900): Promise<ArrayBuffer> {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&display=swap`;
  const cssResponse = await fetch(cssUrl, {
    signal: AbortSignal.timeout(3000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });
  if (!cssResponse.ok) {
    throw new Error("Noto Sans JP のCSS取得に失敗しました");
  }
  const cssText = await cssResponse.text();
  const match = cssText.match(/src: url\(([^)]+)\) format\('(woff2|woff|truetype|opentype)'\)/);
  if (!match?.[1]) {
    throw new Error("Noto Sans JP のフォントURL解析に失敗しました");
  }
  const fontResponse = await fetch(match[1], {
    signal: AbortSignal.timeout(3000),
  });
  if (!fontResponse.ok) {
    throw new Error("Noto Sans JP のフォント取得に失敗しました");
  }
  return fontResponse.arrayBuffer();
}

async function getNotoSansJpFonts(): Promise<{
  w500: ArrayBuffer;
  w700: ArrayBuffer;
  w900: ArrayBuffer;
}> {
  if (notoSansJp500Promise === null) {
    notoSansJp500Promise = loadNotoSansJp(500);
  }
  if (notoSansJp700Promise === null) {
    notoSansJp700Promise = loadNotoSansJp(700);
  }
  if (notoSansJp900Promise === null) {
    notoSansJp900Promise = loadNotoSansJp(900);
  }
  const [w500, w700, w900] = await Promise.all([
    notoSansJp500Promise,
    notoSansJp700Promise,
    notoSansJp900Promise,
  ]);
  return { w500, w700, w900 };
}

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
  let fonts:
    | {
        w500: ArrayBuffer;
        w700: ArrayBuffer;
        w900: ArrayBuffer;
      }
    | null = null;
  try {
    fonts = await getNotoSansJpFonts();
  } catch {
    // フォント取得失敗時はシステムフォントへフォールバック
    fonts = null;
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
      ...(fonts !== null
        ? {
            fonts: [
              { name: "Noto Sans JP", data: fonts.w500, weight: 500, style: "normal" as const },
              { name: "Noto Sans JP", data: fonts.w700, weight: 700, style: "normal" as const },
              { name: "Noto Sans JP", data: fonts.w900, weight: 900, style: "normal" as const },
            ],
          }
        : {}),
    }
  );
  response.headers.set("Content-Type", "image/png");
  return response;
}
