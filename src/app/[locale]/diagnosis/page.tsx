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

/** Layer4（Q31〜Q40）の回答だけを抽出して API に渡す */
function buildLayer4Answers(
  allAnswers: QuestionAnswer[],
  questions: MessagesFile["diagnosis"]["questions"]
): Record<string, string> {
  const map = new Map<number, string>();
  for (const answer of allAnswers) {
    if (answer.questionId < 31 || answer.questionId > 40) {
      continue;
    }
    const question = questions.find((q) => q.id === answer.questionId);
    if (question === undefined) {
      continue;
    }
    const option = question.options.find((opt) => opt.value === answer.value);
    if (option === undefined) {
      continue;
    }
    map.set(answer.questionId, option.label);
  }
  const ordered = [...map.entries()].sort((a, b) => a[0] - b[0]);
  const out: Record<string, string> = {};
  for (const [questionId, label] of ordered) {
    out[`Q${questionId}`] = label;
  }
  return out;
}

/** flow 未定義時の日本語フォールバック */
const FALLBACK_FLOW: DiagnosisFlowCopy = {
  mbtiInvalid: "有効なMBTIタイプ（4文字）を入力するか、空のままにしてください",
  layer1Heading: "あなたのAIタイプが見えてきました",
  layer1Sub: "あと10問で、より精度の高い結果が出ます。続けますか？",
  layer1Continue: "続ける",
  layer1ResultNow: "ここで結果を見る",
  layer2Heading: "診断精度がグッと上がります",
  layer2Sub: "残り10問で、より詳しい診断になります。",
  layer2Continue: "続ける",
  layer2ResultNow: "ここで結果を見る",
  layer3Heading: "さらに精度を上げますか？",
  layer3Sub: "あと10問で、AI活用ワークフローまで提案できます。",
  layer3Continue: "続ける",
  layer3ResultNow: "ここで結果を見る",
  backQuit: "診断をやめる",
  backPrevious: "前の問題に戻る",
};

type Phase =
  | "intro"
  | "quiz"
  | "layer1-break"
  | "layer2-break"
  | "layer3-break"
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

  const [phase, setPhase] = useState<Phase>("intro");
  const [layer1MbtiDraft, setLayer1MbtiDraft] = useState("");
  const [layer1MbtiError, setLayer1MbtiError] = useState<string | null>(null);
  const [layer1MbtiNotice, setLayer1MbtiNotice] = useState<string | null>(null);
  const [hasStoredMbti, setHasStoredMbti] = useState(false);
  const [hasPrevResult, setHasPrevResult] = useState(false);
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
    setHasPrevResult(
      !!sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY)
    );
  }, []);

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
    if (resume === "1" || resume === "2" || resume === "3") {
      const defaultsCount =
        resume === "1" ? 10 : resume === "2" ? 20 : 30;
      if (defaultsCount >= questions.length) {
        sessionStorage.removeItem(DIAGNOSIS_RESUME_FROM_LAYER_KEY);
        setBootstrapped(true);
        return;
      }
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
          layer4Answers: buildLayer4Answers(finalAnswers, questions),
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
    [locale, mbtiValue, questions, router]
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
      if (answeredCount === 30 && total > 30) {
        setAnswers(nextAnswers);
        setPhase("layer3-break");
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
        const fullLayerDone: LayerCompleted = total > 30 ? 4 : 3;
        await submitAnswers(nextAnswers, fullLayerDone);
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
        if (layerDone === 1) {
          setPhase("layer1-break");
        } else if (layerDone === 2) {
          setPhase("layer2-break");
        } else {
          setPhase("layer3-break");
        }
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

  if (phase === "intro") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center gap-2 mb-4">
            {[
              { src: "/images/kompass_char_01_empath.png", color: "#CC785C" },
              { src: "/images/kompass_char_02_executor.png", color: "#0078D4" },
              { src: "/images/kompass_char_03_analyst.png", color: "#20B2AA" },
              { src: "/images/kompass_char_04_generalist.png", color: "#10A37F" },
              { src: "/images/kompass_char_05_scout.png", color: "#4285F4" },
              { src: "/images/kompass_char_06_nomad.png", color: "#7C3AED" },
            ].map((char, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full overflow-hidden"
                style={{ backgroundColor: `${char.color}33` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char.src}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              AI TYPE DIAGNOSIS
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              あなたのベースAIを
              <br />
              見つけよう
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              思考スタイルに合ったAIを使うと、
              <br />
              仕事も思考も驚くほどラクになる。
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-left">
            <p className="text-xs font-bold text-gray-700">診断について</p>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>✦ まず10問、深く知りたい人は最大40問</li>
              <li>✦ 登録不要・完全無料</li>
              <li>
                ✦ ChatGPT・Claude・Gemini・Perplexity・Copilotの中から最適な1つを提案
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setPhase("quiz")}
            className="w-full rounded-full bg-gray-900 py-4 text-sm font-bold text-white hover:bg-gray-700 transition-colors"
          >
            診断をはじめる →
          </button>
          {hasPrevResult ? (
            <a
              href={`/${locale}/diagnosis/result`}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              前回の結果を見る →
            </a>
          ) : null}

          <p className="text-xs text-gray-400">
            約1分〜 / 途中で結果を見ることもできます
          </p>
        </div>
      </main>
    );
  }

  if (phase === "layer1-break") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-8 text-center">
          <p className="text-xs font-bold text-gray-400 mb-2">25% 完了</p>
          <h2 className="text-xl font-semibold text-zinc-900">
            {flow.layer1Heading}
          </h2>
          <p className="text-xs text-gray-400">思考スタイルの基本パターンがわかりました</p>
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
                setErrorMessage(null);
                setPhase("quiz");
                setStep(10);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              {flow.layer1Continue}
            </button>
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
          <p className="text-xs font-bold text-gray-400 mb-2">50% 完了</p>
          <h2 className="text-xl font-semibold text-zinc-900">
            {flow.layer2Heading}
          </h2>
          <p className="text-xs text-gray-400">AIとの相性パターンが明確になりました</p>
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
              onClick={() => {
                setErrorMessage(null);
                setPhase("quiz");
                setStep(20);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              {flow.layer2Continue}
            </button>
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

  if (phase === "layer3-break") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-8 text-center">
          <p className="text-xs font-bold text-gray-400 mb-2">75% 完了</p>
          <h2 className="text-xl font-semibold text-zinc-900">
            {flow.layer3Heading}
          </h2>
          <p className="text-xs text-gray-400">あなたの詳細な活用スタイルが見えてきました</p>
          <p className="text-base leading-relaxed text-zinc-800">
            {flow.layer3Sub}
          </p>
          {errorMessage !== null ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setPhase("quiz");
                setStep(30);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              {flow.layer3Continue}
            </button>
            <button
              type="button"
              onClick={() => void runEarlyExit(3)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {flow.layer3ResultNow}
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

        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Q{step + 1}</span>
          <span>残り {total - step - 1} 問</span>
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

        <p className="mb-8 text-center text-lg font-bold leading-relaxed text-zinc-800">
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
