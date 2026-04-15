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
          backgroundColor: config.color,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* ロゴ */}
        <div
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 28,
            marginBottom: 32,
            display: "flex",
          }}
        >
          Kompass | AI診断
        </div>

        {/* メインテキスト */}
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: "bold",
            marginBottom: 16,
            display: "flex",
          }}
        >
          {config.name}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 32,
            marginBottom: 48,
            display: "flex",
          }}
        >
          {config.enName}
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            padding: "16px 40px",
            color: "white",
            fontSize: 28,
            display: "flex",
          }}
        >
          {config.catch}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "rgba(255,255,255,0.6)",
            fontSize: 22,
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
