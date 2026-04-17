"use client";

import { toast } from "sonner";
import { AI_THEME_COLORS } from "@/types/ai";

// タイプ別設定
const AI_CONFIG: Record<
  string,
  {
    label: string;
    url: string;
    color: string;
    prompt: string;
    subUrls?: { label: string; url: string }[];
  }
> = {
  claude: {
    label: "Claude",
    url: "https://claude.ai",
    color: AI_THEME_COLORS.claude,
    prompt:
      "あなたは私の思考整理のパートナーです。答えを出すより先に、私が何を感じているかを一緒に言語化してください。",
  },
  chatgpt: {
    label: "ChatGPT",
    url: "https://chatgpt.com",
    color: AI_THEME_COLORS.chatgpt,
    prompt:
      "以下の内容について、まず最速でアウトプットを出してください。精度より速度優先です。",
  },
  gemini: {
    label: "Gemini",
    url: "https://gemini.google.com",
    color: AI_THEME_COLORS.gemini,
    prompt:
      "今この瞬間の最新情報を教えてください。情報源も明示してください。",
  },
  perplexity: {
    label: "Perplexity",
    url: "https://perplexity.ai",
    color: AI_THEME_COLORS.perplexity,
    prompt:
      "以下の内容について、根拠・出典・反論の余地を含めて教えてください。",
  },
  copilot: {
    label: "Copilot",
    url: "https://copilot.microsoft.com",
    color: AI_THEME_COLORS.copilot,
    prompt:
      "以下の情報を構造化・整理してください。見やすい形式で出力してください。",
  },
  jiyujin: {
    label: "AI遊牧民",
    url: "",
    color: AI_THEME_COLORS.jiyujin,
    prompt:
      "あなたの得意な領域を教えてください。今日のタスクに合わせて使い方を変えます。",
    subUrls: [
      { label: "Claude", url: "https://claude.ai" },
      { label: "ChatGPT", url: "https://chatgpt.com" },
      { label: "Perplexity", url: "https://perplexity.ai" },
    ],
  },
};

interface OneClickAIButtonProps {
  typeId: string; // "claude" | "chatgpt" | "gemini" | "perplexity" | "copilot" | "jiyujin"
}

export function OneClickAIButton({ typeId }: OneClickAIButtonProps) {
  const config = AI_CONFIG[typeId];
  if (!config) return null;

  /**
   * モバイルブラウザのポップアップブロック回避のため a 要素で遷移する
   */
  const openUrlInNewTab = (url: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  // クリップボードコピー共通処理
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(config.prompt);
    toast.success("プロンプトをコピーしました。貼り付けてすぐ使えます ✓");
  };

  // 通常タイプ（1ボタン）
  if (typeId !== "jiyujin") {
    const handleClick = async () => {
      await copyPrompt();
      openUrlInNewTab(config.url);
    };

    return (
      <button
        onClick={handleClick}
        style={{ backgroundColor: config.color }}
        className="w-full rounded-xl px-6 py-4 text-white font-bold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
      >
        {config.label}を無料で試す →
      </button>
    );
  }

  // AI遊牧民（3ボタン並列）
  return (
    <div className="w-full space-y-2">
      <p className="text-center text-sm text-gray-500 mb-1">
        今日のタスクに合わせて選ぶ
      </p>
      <div className="flex gap-2">
        {config.subUrls!.map(({ label, url }) => (
          <button
            key={label}
            onClick={async () => {
              await copyPrompt();
              openUrlInNewTab(url);
            }}
            style={{ backgroundColor: config.color }}
            className="flex-1 rounded-xl px-3 py-3 text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            {label}を無料で試す →
          </button>
        ))}
      </div>
    </div>
  );
}
