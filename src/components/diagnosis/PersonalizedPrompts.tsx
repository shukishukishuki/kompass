"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Prompt {
  title: string;
  prompt: string;
}

interface PersonalizedPromptsProps {
  typeId: string;
  answers: Record<string, string>;
  accentColor: string;
}

export function PersonalizedPrompts({
  typeId,
  answers,
  accentColor,
}: PersonalizedPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/personalized-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeId, answers }),
      });
      const data = (await res.json()) as { prompts?: Prompt[] };
      setPrompts(Array.isArray(data.prompts) ? data.prompts : []);
    } catch {
      setError(true);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [answers, typeId]);

  useEffect(() => {
    void generate();
  }, [generate]);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("コピーしました。AIに貼り付けてすぐ使えます ✓");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto mt-8 max-w-md space-y-3">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          あなた専用プロンプト
        </p>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 animate-pulse"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-3/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && (prompts.length === 0 || error)) {
    return (
      <div className="mx-auto mt-8 max-w-md text-center space-y-2">
        <p className="text-xs text-gray-400">プロンプトの生成に失敗しました</p>
        <button
          type="button"
          onClick={() => {
            setError(false);
            setLoading(true);
            void generate();
          }}
          className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors"
        >
          再試行する
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md space-y-3">
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
        あなた専用プロンプト
      </p>
      {prompts.map((p, i) => (
        <div
          key={`${p.title}-${i}`}
          className="space-y-2 rounded-xl border border-gray-200 bg-white p-4"
        >
          <p className="text-xs font-bold" style={{ color: accentColor }}>
            {p.title}
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{p.prompt}</p>
          <button
            type="button"
            onClick={() => void handleCopy(p.prompt, i)}
            className={`text-xs transition-colors underline underline-offset-2 ${
              copiedIndex === i ? "text-green-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {copiedIndex === i ? "コピー済み ✓" : "コピーする"}
          </button>
        </div>
      ))}
    </div>
  );
}
