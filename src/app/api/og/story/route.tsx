import { ImageResponse } from "next/og";
import { Buffer } from "node:buffer";
import { readFileSync } from "fs";
import { join } from "path";
import {
  STORY_BACKGROUND_GRADIENT,
  TYPE_DATA,
  TYPE_ID_MAP,
  type OgTypeKey,
} from "../type-data";

const darkTextTypes = new Set<OgTypeKey>(["empath", "executor", "scout"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type") ?? "empath";
  const lang = searchParams.get("lang") === "en" ? "en" : "ja";
  const mappedType = TYPE_ID_MAP[typeParam];
  const typeKey: OgTypeKey =
    mappedType !== undefined ? mappedType : "empath";
  const d = TYPE_DATA[typeKey];
  const bgGradient = STORY_BACKGROUND_GRADIENT[typeKey];
  const textColor = darkTextTypes.has(typeKey) ? "#1a1a2e" : "#ffffff";
  const subTextColor = darkTextTypes.has(typeKey)
    ? "rgba(26, 26, 46, 0.62)"
    : "rgba(255, 255, 255, 0.78)";
  const backgroundTextColor = darkTextTypes.has(typeKey)
    ? "rgba(26, 26, 46, 0.075)"
    : "rgba(255, 255, 255, 0.075)";
  const charImgUrl = `https://kompass-rosy.vercel.app${d.charImg}`;

  const charImgRes = await fetch(charImgUrl);
  const charImgBuf = await charImgRes.arrayBuffer();
  const charImgBase64 = Buffer.from(charImgBuf).toString("base64");
  const charImgSrc = `data:image/png;base64,${charImgBase64}`;

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

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          background: bgGradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "88px 64px 92px",
          color: textColor,
          fontFamily: '"Noto Sans JP"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 420,
            left: 30,
            color: backgroundTextColor,
            fontSize: 170,
            fontWeight: 900,
            letterSpacing: "-1px",
            transform: "rotate(-90deg)",
            transformOrigin: "left bottom",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {d.en.label.toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "2.5px" }}>
              KOMPASS
            </span>
            <span
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "2.5px",
                color: subTextColor,
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
            <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>
              全体の
            </span>
            <span
              style={{
                fontSize: 78,
                fontWeight: 900,
                color: d.accent,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
              }}
            >
              {d.percent}%
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 20,
            position: "relative",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 114,
              fontWeight: 900,
              color: textColor,
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            {d.ja.label}
          </span>
          <span
            style={{
              fontSize: 37,
              marginTop: 12,
              fontWeight: 500,
              letterSpacing: "2.5px",
              color: subTextColor,
            }}
          >
            {d.en.label.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 760,
            height: 760,
            borderRadius: "50%",
            background: `${d.accent}33`,
            position: "relative",
            zIndex: 2,
          }}
        >
          <img
            src={charImgSrc}
            width={790}
            height={790}
            style={{ objectFit: "contain" }}
            alt=""
          />
        </div>

        <div
          style={{
            fontSize: 42,
            color: textColor,
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: "0.02em",
            position: "relative",
            zIndex: 2,
          }}
        >
          あなたに合ったAIが見つかりました
        </div>
        <div
          style={{
            marginTop: -18,
            fontSize: 30,
            color: subTextColor,
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: "0.01em",
            position: "relative",
            zIndex: 2,
          }}
        >
          {d[lang].catch}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: `${d.accent}22`,
            borderRadius: 32,
            padding: "44px 90px",
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          {typeKey === "nomad" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: subTextColor }}>BASE AI</span>
              <span
                style={{
                  fontSize: 74,
                  fontWeight: 900,
                  color: d.accent,
                  marginTop: 8,
                  letterSpacing: "-0.3px",
                }}
              >
                Claude
              </span>
              <div
                style={{
                  width: 240,
                  height: 2,
                  background: `${d.accent}66`,
                  margin: "24px 0 20px",
                }}
              />
              <span style={{ fontSize: 24, fontWeight: 700, color: subTextColor }}>SUB AI</span>
              <span
                style={{
                  fontSize: 36,
                  marginTop: 10,
                  color: textColor,
                  fontWeight: 900,
                  letterSpacing: "-0.3px",
                }}
              >
                Perplexity / ChatGPT
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 30,
                  color: subTextColor,
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                }}
              >
                RECOMMENDED AI
              </span>
              <span
                style={{
                  fontSize: 100,
                  fontWeight: 900,
                  color: d.accent,
                  marginTop: 12,
                  letterSpacing: "-0.3px",
                }}
              >
                {d.ai}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      ...(fontBoldArrayBuffer !== null
        ? {
            fonts: [
              {
                name: "Noto Sans JP",
                data: fontBoldArrayBuffer,
                weight: 500,
                style: "normal" as const,
              },
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
}
