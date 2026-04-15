import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface TypeOgConfig {
  name: string;
  enName: string;
  color: string;
  catch: string;
}

const TYPE_CONFIG: Record<string, TypeOgConfig> = {
  claude: {
    name: "共感ジャンキー",
    enName: "The Confidant",
    color: "#CC785C",
    catch: "感情を言語化する天才",
  },
  chatgpt: {
    name: "丸投げ屋",
    enName: "The Generalist",
    color: "#10A37F",
    catch: "とにかく早く答えを出す",
  },
  gemini: {
    name: "情報スナイパー",
    enName: "The Scout",
    color: "#4285F4",
    catch: "最新情報を即座に狙い撃つ",
  },
  perplexity: {
    name: "裏取りマニア",
    enName: "The Analyst",
    color: "#20B2AA",
    catch: "根拠なき情報は信じない",
  },
  copilot: {
    name: "整理の鬼",
    enName: "The Executive",
    color: "#0078D4",
    catch: "混沌を秩序に変える",
  },
  jiyujin: {
    name: "AI遊牧民",
    enName: "The Orchestrator",
    color: "#7C3AED",
    catch: "複数AIを使いこなす異端者",
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeId = searchParams.get("type") ?? "claude";
  const config = TYPE_CONFIG[typeId] ?? TYPE_CONFIG.claude;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}CC 60%, #1a1a2e 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 背景の白い光 */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

        {/* ロゴ */}
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 24,
            letterSpacing: "0.2em",
            marginBottom: 40,
            display: "flex",
          }}
        >
          KOMPASS
        </div>

        {/* タイプ名 */}
        <div
          style={{
            color: "white",
            fontSize: 80,
            fontWeight: "bold",
            marginBottom: 12,
            display: "flex",
            textShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          {config.name}
        </div>

        {/* 英語名 */}
        <div
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 28,
            letterSpacing: "0.15em",
            marginBottom: 48,
            display: "flex",
          }}
        >
          {config.enName}
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "100px",
            padding: "14px 44px",
            color: "rgba(255,255,255,0.9)",
            fontSize: 26,
            display: "flex",
          }}
        >
          {config.catch}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 48,
            color: "rgba(255,255,255,0.4)",
            fontSize: 20,
            display: "flex",
          }}
        >
          kompass-rosy.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
