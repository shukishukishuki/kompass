"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DIAGNOSIS_RESULT_STORAGE_KEY } from "@/app/[locale]/diagnosis/page";
import { Button } from "@/components/ui/button";

interface PromptListProps {
  prompts: readonly string[];
}

/**
 * プロンプトを一覧表示し、各行でコピーできるUI
 */
export function PromptList({ prompts }: Readonly<PromptListProps>) {
  const params = useParams();
  const locale =
    typeof params?.locale === "string" && params.locale.length > 0
      ? params.locale
      : "ja";
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDiagnosed, setIsDiagnosed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    setIsDiagnosed(!!stored);
  }, []);

  return (
    <div className="relative">
      <div className={!isDiagnosed ? "pointer-events-none select-none blur-sm" : ""}>
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
                      setCopiedIndex((current) =>
                        current === index ? null : current
                      );
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
      </div>

      {!isDiagnosed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/10">
          <p className="px-4 text-center text-sm font-medium text-gray-600">
            診断を完了するとプロンプトが解放されます
          </p>
          <Link
            href={`/${locale}/diagnosis`}
            className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            診断する →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
