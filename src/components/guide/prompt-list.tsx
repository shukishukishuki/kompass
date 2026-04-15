"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PromptListProps {
  prompts: readonly string[];
}

/**
 * プロンプトを一覧表示し、各行でコピーできるUI
 */
export function PromptList({ prompts }: Readonly<PromptListProps>) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {prompts.map((prompt, index) => (
        <div
          key={`${index}-${prompt.slice(0, 12)}`}
          className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3"
        >
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
            {prompt}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                setCopiedIndex(index);
                setTimeout(() => {
                  setCopiedIndex((current) => (current === index ? null : current));
                }, 1200);
              } catch {
                // クリップボード非対応環境ではUIだけ保持して失敗を無視
              }
            }}
            className="shrink-0"
          >
            {copiedIndex === index ? "コピー済み" : "コピー"}
          </Button>
        </div>
      ))}
    </div>
  );
}
