import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { TYPE_DATA, TYPE_ID_MAP } from "./type-data";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawType = searchParams.get("type") ?? "empath";
  const lang = searchParams.get("lang") === "en" ? "en" : "ja";

  const typeKey = TYPE_ID_MAP[rawType] ?? rawType;
  const data =
    TYPE_DATA[typeKey as keyof typeof TYPE_DATA] ?? TYPE_DATA.empath;

  const text = data[lang];
  const textColor = data.darkText ? "#1a1a2e" : "#ffffff";
  const subColor = data.darkText
    ? "rgba(26,26,46,0.6)"
    : "rgba(255,255,255,0.65)";

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
              fontWeight: "bold",
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
            }}
          >
            AI TYPE DIAGNOSIS
          </span>
          <span style={{ color: subColor, fontSize: 18, display: "flex" }}>
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
                fontWeight: "bold",
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
                fontWeight: "bold",
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
          }}
        >
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
