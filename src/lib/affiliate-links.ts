import type { AiKind } from "@/types/ai";

/** アフィリエイトリンク定数（申請後に差し替え予定） */
export const AFFILIATE_LINKS: Record<AiKind, { url: string; label: string }> = {
  claude: { url: "https://claude.ai", label: "Claudeを無料で試す" },
  chatgpt: { url: "https://chatgpt.com", label: "ChatGPTを無料で試す" },
  gemini: { url: "https://gemini.google.com", label: "Geminiを無料で試す" },
  perplexity: { url: "https://perplexity.ai", label: "Perplexityを無料で試す" },
  copilot: { url: "https://copilot.microsoft.com", label: "Copilotを無料で試す" },
  jiyujin: { url: "https://claude.ai", label: "まずClaudeから試す" },
};
