"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  applyMBTICorrection,
  normalizeMBTI,
  type MBTIType,
} from "@/lib/mbti-correction";
import { buildScoringResultFromAggregatedScores } from "@/lib/scoringEngine";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import type { DiagnosisResult } from "@/types/diagnosis";
import type { DiagnosisFlowCopy } from "@/types/diagnosis-messages";
import type { MessagesFile } from "@/types/diagnosis-messages";
import type { LayerCompleted } from "@/types/layer-completed";
import type { QuestionAnswer, ScoringResult } from "@/types/scoring";

/** sessionStorage に保存するキー（結果ページと共有） */
export const DIAGNOSIS_RESULT_STORAGE_KEY = "kompass_diagnosis_result";

/** スコアリング結果（MBTI 補正などで再利用） */
export const DIAGNOSIS_SCORING_STORAGE_KEY = "kompass_diagnosis_scoring";
export const DIAGNOSIS_RESUME_FROM_LAYER_KEY = "resumeFromLayer";
export const DIAGNOSIS_MBTI_STORAGE_KEY = "kompass_mbti";

const messagesByLocale: Record<string, MessagesFile> = {
  ja: jaMessages as MessagesFile,
  en: enMessages as MessagesFile,
};

/** flow 未定義時の日本語フォールバック */
const FALLBACK_FLOW: DiagnosisFlowCopy = {
  mbtiInvalid: "有効なMBTIタイプ（4文字）を入力するか、空のままにしてください",
  layer1Heading: "診断完了。",
  layer1Sub: "あなたのAIタイプが判明しました。",
  layer1Continue: "さらに精度を上げる →",
  layer1ResultNow: "結果を見る",
  layer2Heading: "精度が上がりました。",
  layer2Sub: "より詳しい結果が出ました。",
  layer2Continue: "最終チューニングへ →",
  layer2ResultNow: "ここで結果を見る",
  backQuit: "診断をやめる",
  backPrevious: "前の問題に戻る",
};

type Phase =
  | "quiz"
  | "layer1-break"
  | "layer2-break"
  | "loading";

/**
 * ベースAI診断：1問ずつ回答 → Layer 区切り → 結果
 */
export default function DiagnosisPage() {
  const params = useParams();
  const router = useRouter();
  const locale =
    typeof params?.locale === "string" && params.locale.length > 0
      ? params.locale
      : "ja";

  const copy = messagesByLocale[locale] ?? messagesByLocale.ja;
  const questions = copy.diagnosis.questions;
  const total = questions.length;
  const flow = copy.diagnosis.flow ?? FALLBACK_FLOW;

  const [phase, setPhase] = useState<Phase>("quiz");
  const [layer1MbtiDraft, setLayer1MbtiDraft] = useState("");
  const [layer1MbtiError, setLayer1MbtiError] = useState<string | null>(null);
  const [layer1MbtiNotice, setLayer1MbtiNotice] = useState<string | null>(null);
  const [hasStoredMbti, setHasStoredMbti] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  /** 診断開始後に保持（未入力・スキップは null） */
  const [mbtiValue, setMbtiValue] = useState<MBTIType | null>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** 最終送信の連打防止 */
  const finalSubmitLockRef = useRef(false);
  const mbtiNoticeTimerRef = useRef<number | null>(null);

  const currentQuestion = questions[step];
  const progressRatio = total > 0 ? (step + 1) / total : 0;

  const title = useMemo(() => copy.diagnosis.title, [copy.diagnosis.title]);

  useEffect(() => {
    const storedMbtiRaw = sessionStorage.getItem(DIAGNOSIS_MBTI_STORAGE_KEY);
    const storedMbti =
      storedMbtiRaw !== null ? normalizeMBTI(storedMbtiRaw) : null;
    if (storedMbti !== null) {
      setMbtiValue(storedMbti);
      setHasStoredMbti(true);
    } else {
      setHasStoredMbti(false);
    }

    const resume = sessionStorage.getItem(DIAGNOSIS_RESUME_FROM_LAYER_KEY);
    if (resume === "1" || resume === "2") {
      const defaultsCount = resume === "1" ? 10 : 20;
      const defaultAnswers: QuestionAnswer[] = [];
      for (let i = 0; i < defaultsCount; i += 1) {
        const q = questions[i];
        if (q !== undefined) {
          defaultAnswers.push({ questionId: q.id, value: "A" });
        }
      }
      setAnswers(defaultAnswers);
      setStep(defaultsCount);
      setPhase("quiz");
      sessionStorage.removeItem(DIAGNOSIS_RESUME_FROM_LAYER_KEY);
    }
    setBootstrapped(true);
  }, [questions]);

  useEffect(() => {
    return () => {
      if (mbtiNoticeTimerRef.current !== null) {
        window.clearTimeout(mbtiNoticeTimerRef.current);
      }
    };
  }, []);

  const submitAnswers = useCallback(
    async (finalAnswers: QuestionAnswer[], layerDone: LayerCompleted) => {
      const scoringRes = await fetch("/api/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          layerCompleted: layerDone,
        }),
      });
      if (!scoringRes.ok) {
        throw new Error(`scoring: ${scoringRes.status}`);
      }
      let scoringResult: ScoringResult = await scoringRes.json();

      if (mbtiValue !== null) {
        const corrected = applyMBTICorrection(
          scoringResult.scoresByAi,
          mbtiValue
        );
        scoringResult = {
          ...buildScoringResultFromAggregatedScores(
            corrected,
            scoringResult.userLayer
          ),
          layerCompleted: scoringResult.layerCompleted,
        };
      }

      const diagnosisRes = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoringResult,
          userLayer: scoringResult.userLayer,
        }),
      });
      if (!diagnosisRes.ok) {
        throw new Error(`diagnosis: ${diagnosisRes.status}`);
      }
      const diagnosisResult: DiagnosisResult = await diagnosisRes.json();

      sessionStorage.setItem(
        DIAGNOSIS_RESULT_STORAGE_KEY,
        JSON.stringify(diagnosisResult)
      );
      sessionStorage.setItem(
        DIAGNOSIS_SCORING_STORAGE_KEY,
        JSON.stringify(scoringResult)
      );
      sessionStorage.removeItem(DIAGNOSIS_MBTI_STORAGE_KEY);
      router.push(`/${locale}/diagnosis/result`);
    },
    [locale, mbtiValue, router]
  );

  const handleBack = useCallback(() => {
    if (phase !== "quiz") {
      return;
    }
    if (step === 0) {
      router.push(`/${locale}`);
      return;
    }
    setErrorMessage(null);
    setAnswers((prev) => prev.slice(0, -1));
    setStep((s) => s - 1);
  }, [phase, step, router, locale]);

  const handleChoose = useCallback(
    async (value: string) => {
      const q = questions[step];
      if (q === undefined) {
        return;
      }

      setErrorMessage(null);

      const nextAnswers: QuestionAnswer[] = [
        ...answers,
        { questionId: q.id, value },
      ];

      const answeredCount = nextAnswers.length;

      if (answeredCount === 10) {
        setAnswers(nextAnswers);
        setPhase("layer1-break");
        return;
      }
      if (answeredCount === 20) {
        setAnswers(nextAnswers);
        setPhase("layer2-break");
        return;
      }

      if (step + 1 < total) {
        setAnswers(nextAnswers);
        setStep((s) => s + 1);
        return;
      }

      if (finalSubmitLockRef.current) {
        return;
      }
      finalSubmitLockRef.current = true;

      setAnswers(nextAnswers);
      setPhase("loading");

      try {
        await submitAnswers(nextAnswers, 3);
      } catch (e) {
        console.error("[診断] API 連携に失敗しました:", e);
        finalSubmitLockRef.current = false;
        setPhase("quiz");
        setAnswers(nextAnswers.slice(0, -1));
        setErrorMessage(copy.diagnosis.errorSubmit);
      }
    },
    [answers, copy.diagnosis.errorSubmit, questions, step, submitAnswers, total]
  );

  const runEarlyExit = useCallback(
    async (layerDone: LayerCompleted) => {
      if (finalSubmitLockRef.current) {
        return;
      }
      finalSubmitLockRef.current = true;
      setPhase("loading");
      try {
        await submitAnswers(answers, layerDone);
      } catch (e) {
        console.error("[診断] API 連携に失敗しました:", e);
        finalSubmitLockRef.current = false;
        setPhase(layerDone === 1 ? "layer1-break" : "layer2-break");
        setErrorMessage(copy.diagnosis.errorSubmit);
      }
    },
    [answers, copy.diagnosis.errorSubmit, submitAnswers]
  );

  const applyLayer1MbtiIfNeeded = useCallback((): boolean => {
    if (mbtiValue !== null) {
      return true;
    }
    const trimmed = layer1MbtiDraft.trim();
    if (trimmed === "") {
      setMbtiValue(null);
      setLayer1MbtiError(null);
      return true;
    }
    const normalized = normalizeMBTI(trimmed);
    if (normalized === null) {
      setLayer1MbtiError(flow.mbtiInvalid);
      return false;
    }
    setMbtiValue(normalized);
    sessionStorage.setItem(DIAGNOSIS_MBTI_STORAGE_KEY, normalized);
    setHasStoredMbti(true);
    setLayer1MbtiNotice(`✓ MBTI（${normalized}）を反映しました`);
    if (mbtiNoticeTimerRef.current !== null) {
      window.clearTimeout(mbtiNoticeTimerRef.current);
    }
    mbtiNoticeTimerRef.current = window.setTimeout(() => {
      setLayer1MbtiNotice(null);
    }, 1400);
    setLayer1MbtiError(null);
    return true;
  }, [flow.mbtiInvalid, layer1MbtiDraft, mbtiValue]);

  if (total === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-center text-sm text-zinc-600">
          {copy.diagnosis.errorNoQuestions}
        </p>
      </main>
    );
  }

  if (phase === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-base text-zinc-800">{copy.diagnosis.loadingLabel}</p>
        <div
          className="mt-6 h-2 w-48 overflow-hidden rounded-full bg-zinc-200"
          aria-hidden
        >
          <div className="h-full w-full rounded-full bg-zinc-800 transition-all" />
        </div>
      </main>
    );
  }

  if (!bootstrapped) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </main>
    );
  }

  if (phase === "layer1-break") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            {flow.layer1Heading}
          </h2>
          <p className="text-base leading-relaxed text-zinc-800">
            {flow.layer1Sub}
          </p>
          {errorMessage !== null ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {layer1MbtiNotice !== null ? (
            <p className="text-sm font-medium text-emerald-700">
              {layer1MbtiNotice}
            </p>
          ) : null}
          {mbtiValue === null && !hasStoredMbti ? (
            <div className="space-y-3 text-left">
              <h2 className="text-base font-semibold text-zinc-900">
                精度を上げますか？（任意）
              </h2>
              <p className="text-sm text-zinc-700">
                MBTIを入力すると、あなたの性格特性も考慮した診断になります
              </p>
              <input
                type="text"
                maxLength={4}
                autoCapitalize="characters"
                autoComplete="off"
                value={layer1MbtiDraft}
                onChange={(e) => {
                  const v = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 4);
                  setLayer1MbtiDraft(v);
                  setLayer1MbtiError(null);
                }}
                placeholder="INFJ"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-center text-sm font-medium tracking-widest text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {layer1MbtiError !== null ? (
                <p className="text-sm text-red-600" role="alert">
                  {layer1MbtiError}
                </p>
              ) : null}
              <p className="text-xs text-zinc-500">
                <a
                  href="https://www.16personalities.com/ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                >
                  MBTIって何？
                </a>
              </p>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                if (!applyLayer1MbtiIfNeeded()) {
                  return;
                }
                void runEarlyExit(1);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {flow.layer1ResultNow}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "layer2-break") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            {flow.layer2Heading}
          </h2>
          <p className="text-base leading-relaxed text-zinc-800">
            {flow.layer2Sub}
          </p>
          {errorMessage !== null ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => void runEarlyExit(2)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {flow.layer2ResultNow}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (currentQuestion === undefined) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <h1 className="mb-8 text-center text-xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>

        <div className="mb-2 text-center text-sm text-zinc-500">
          {step + 1} / {total}
        </div>
        <div
          className="mb-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="診断の進捗"
        >
          <div
            className="h-full rounded-full bg-zinc-800 transition-all"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
        <div className="mb-8 flex justify-start">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {step === 0 ? flow.backQuit : flow.backPrevious}
          </button>
        </div>

        <p className="mb-8 text-center text-base leading-relaxed text-zinc-800">
          {currentQuestion.prompt}
        </p>

        {errorMessage !== null ? (
          <p className="mb-4 text-center text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {currentQuestion.options.map((opt) => (
            <li key={`${currentQuestion.id}-${opt.value}`}>
              <button
                type="button"
                onClick={() => void handleChoose(opt.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
              >
                <span className="mr-2 font-semibold text-zinc-500">
                  {opt.value}.
                </span>
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
