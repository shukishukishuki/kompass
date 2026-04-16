import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "AI診断をはじめる",
    description:
      "ChatGPT・Claude・Gemini・Perplexity・Copilotの中からあなたに合うAIを10問で診断。無料・登録不要。",
  };
}

export default function DiagnosisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
