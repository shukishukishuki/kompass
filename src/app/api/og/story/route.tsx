import { ImageResponse } from "next/og";
import { Buffer } from "node:buffer";

const TYPE_DATA: Record<string, {
  nameJa: string; nameEn: string; catch: string;
  ai: string; percent: number; accent: string;
  bg: string; charImg: string;
}> = {
  empath: { nameJa: "共感ジャンキー", nameEn: "The Confidant", catch: "答えじゃなくて、わかってほしかっただけ。", ai: "Claude", percent: 24, accent: "#52B788", bg: "linear-gradient(175deg, #c8eeda 0%, #e8f7ef 45%, #f5fcf8 75%, #ffffff 100%)", charImg: "https://kompass-rosy.vercel.app/images/kompass_char_01_empath.png" },
  executor: { nameJa: "整理の鬼", nameEn: "The Executive", catch: "整理されてないと、息ができない。", ai: "Copilot", percent: 19, accent: "#4A7FC1", bg: "linear-gradient(175deg, #b8d0f0 0%, #e8f0fb 45%, #f5f8ff 75%, #ffffff 100%)", charImg: "https://kompass-rosy.vercel.app/images/kompass_char_02_executor.png" },
  analyst: { nameJa: "裏取りマニア", nameEn: "The Analyst", catch: "「たぶん」で動くの、無理かも。", ai: "Perplexity", percent: 13, accent: "#9B4DCA", bg: "linear-gradient(175deg, #e8d8f8 0%, #f5eeff 45%, #fdfaff 75%, #ffffff 100%)", charImg: "https://kompass-rosy.vercel.app/images/kompass_char_03_analyst.png" },
  generalist: { nameJa: "丸投げ屋", nameEn: "The Generalist", catch: "考えるより、投げた方が早い。", ai: "ChatGPT", percent: 28, accent: "#E8A020", bg: "linear-gradient(175deg, #fde8a8 0%, #fef8e8 45%, #fffdf5 75%, #ffffff 100%)", charImg: "https://kompass-rosy.vercel.app/images/kompass_char_04_generalist.png" },
  scout: { nameJa: "情報スナイパー", nameEn: "The Scout", catch: "いらない情報、本当にいらない。", ai: "Gemini", percent: 9, accent: "#F07C2A", bg: "linear-gradient(175deg, #fdd0a8 0%, #fef2e8 45%, #fffaf5 75%, #ffffff 100%)", charImg: "https://kompass-rosy.vercel.app/images/kompass_char_05_scout.png" },
  nomad: { nameJa: "AI遊牧民", nameEn: "The Orchestrator", catch: "1つのAIで満足できたことが、ない。", ai: "Multi-AI", percent: 7, accent: "#C9A84C", bg: "linear-gradient(175deg, #f0e8c8 0%, #f8f2e0 45%, #fdfaf2 75%, #ffffff 100%)", charImg: "https://kompass-rosy.vercel.app/images/kompass_char_06_nomad.png" },
};

const TYPE_ID_MAP: Record<string, string> = {
  claude: "empath", copilot: "executor", perplexity: "analyst",
  chatgpt: "generalist", gemini: "scout", jiyujin: "nomad",
  empath: "empath", executor: "executor", analyst: "analyst",
  generalist: "generalist", scout: "scout", nomad: "nomad",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type") ?? "empath";
  const typeKey = TYPE_ID_MAP[typeParam] ?? "empath";
  const d = TYPE_DATA[typeKey];

  const charImgRes = await fetch(d.charImg);
  const charImgBuf = await charImgRes.arrayBuffer();
  const charImgBase64 = Buffer.from(charImgBuf).toString("base64");
  const charImgSrc = `data:image/png;base64,${charImgBase64}`;

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1920,
        background: d.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "80px 60px 100px",
        fontFamily: "sans-serif", color: "#1a1a2e",
      }}>
        {/* ヘッダー */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 700 }}>🧭 KOMPASS</span>
            <span style={{ fontSize: 22, opacity: 0.55, marginTop: 6 }}>AIタイプ診断サービス</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 22, opacity: 0.5 }}>全体の</span>
            <span style={{ fontSize: 48, fontWeight: 700, color: d.accent, lineHeight: 1.1 }}>{d.percent}%</span>
          </div>
        </div>

        {/* タイプ名 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 96, fontWeight: 700, color: d.accent, letterSpacing: "-2px" }}>{d.nameJa}</span>
          <span style={{ fontSize: 32, opacity: 0.45, marginTop: 8 }}>{d.nameEn}</span>
        </div>

        {/* キャラ画像 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 720, height: 720, borderRadius: "50%",
          background: d.accent + "33",
        }}>
          <img src={charImgSrc} width={740} height={740} style={{ objectFit: "contain" }} />
        </div>

        {/* あなたに合ったAI */}
        <div style={{ fontSize: 36, opacity: 0.6, textAlign: "center" }}>
          あなたに合ったAIが見つかりました
        </div>

        {/* AIブロック */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          background: d.accent + "22", borderRadius: 32,
          padding: "48px 120px", width: "100%",
        }}>
          {typeKey === "nomad" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 24, opacity: 0.5 }}>BASE AI</span>
              <span style={{ fontSize: 72, fontWeight: 700, color: d.accent, marginTop: 8 }}>Claude</span>
              <div style={{ width: 160, height: 2, background: d.accent + "44", margin: "20px 0" }} />
              <span style={{ fontSize: 22, opacity: 0.4 }}>SUB AI</span>
              <span style={{ fontSize: 32, marginTop: 8, opacity: 0.7 }}>Perplexity / ChatGPT</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 24, opacity: 0.5, letterSpacing: "0.1em" }}>RECOMMENDED AI</span>
              <span style={{ fontSize: 80, fontWeight: 700, color: d.accent, marginTop: 12 }}>{d.ai}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
