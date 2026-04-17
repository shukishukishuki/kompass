"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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

/** コンパスSVG＋KOMPASS（絵文字は使わない） */
function KompassLogo({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className ?? ""}`}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-[#1a7a4a]"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 4l2.2 8L12 20l-2.2-8L12 4z"
          fill="currentColor"
        />
        <path
          d="M12 4l8 8h-8l-8-8h8z"
          fill="currentColor"
          opacity="0.25"
        />
      </svg>
      <span className="text-xl font-bold tracking-[0.25em] text-[#0a2e18]">
        KOMPASS
      </span>
    </div>
  );
}

/** Layer分岐用の円形プログレス（ストローク #52B788） */
function LayerProgressRing({
  percent,
  size = 168,
}: Readonly<{ percent: 25 | 50 | 75 | 100; size?: number }>) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - percent / 100);
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="block -rotate-90"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(82,183,136,0.2)"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#52B788"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tabular-nums text-[#0a2e18]">
          {percent}%
        </span>
        <span className="mt-0.5 text-[11px] font-bold tracking-[0.2em] text-[#52B788]">
          COMPLETE
        </span>
      </div>
    </div>
  );
}

const LAYER_BREAK_BG: CSSProperties = {
  background:
    "linear-gradient(160deg, #d4f0e2 0%, #eaf8f1 40%, #f5fcf8 100%)",
};

const LAYER_CARD_QUICK: CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  border: "1.5px solid rgba(82,183,136,0.3)",
};

const LAYER_CARD_DEEP: CSSProperties = {
  background: "rgba(82,183,136,0.22)",
  border: "1.5px solid rgba(82,183,136,0.3)",
};

/** sessionStorage に保存するキー（結果ページと共有） */
export const DIAGNOSIS_RESULT_STORAGE_KEY = "kompass_diagnosis_result";

/** スコアリング結果（MBTI 補正などで再利用） */
export const DIAGNOSIS_SCORING_STORAGE_KEY = "kompass_diagnosis_scoring";
export const DIAGNOSIS_RESUME_FROM_LAYER_KEY = "resumeFromLayer";
/** 続き診断で復元する、確定済みの回答一覧（結果保存時に書き込む） */
export const DIAGNOSIS_ANSWERS_STORAGE_KEY = "kompass_diagnosis_answers";
export const DIAGNOSIS_MBTI_STORAGE_KEY = "kompass_mbti";

/**
 * sessionStorage の結果 JSON から、続き診断に使う Layer 番号（1〜3）を読む
 */
function readResumeLayerFromResultStorage(): "1" | "2" | "3" | null {
  const raw = sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
  if (raw === null || raw === "") {
    return null;
  }
  try {
    const o: unknown = JSON.parse(raw);
    if (typeof o !== "object" || o === null) {
      return null;
    }
    const lc = (o as { layerCompleted?: unknown }).layerCompleted;
    if (lc === 1 || lc === 2 || lc === 3) {
      return String(lc) as "1" | "2" | "3";
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * 続き診断用：先頭 n 問分の回答が設問順と一致するか
 */
function isAnswersPrefixForResume(
  parsed: unknown,
  questionDefs: MessagesFile["diagnosis"]["questions"],
  expectedCount: number
): parsed is QuestionAnswer[] {
  if (!Array.isArray(parsed) || parsed.length !== expectedCount) {
    return false;
  }
  for (let i = 0; i < expectedCount; i += 1) {
    const row = parsed[i];
    if (typeof row !== "object" || row === null) {
      return false;
    }
    const r = row as Record<string, unknown>;
    if (typeof r.questionId !== "number" || typeof r.value !== "string") {
      return false;
    }
    const expectedId = questionDefs[i]?.id;
    if (expectedId === undefined || r.questionId !== expectedId) {
      return false;
    }
  }
  return true;
}

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
  layerQuickDescription: "今の回答だけで結果ページへ進みます。",
  layerTagQuick: "QUICK",
  layerTagDeeper: "DEEPER",
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
  const [starting, setStarting] = useState(false);
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
    if (phase === "intro") {
      document.title = "AI診断をはじめる | Kompass";
    } else if (phase === "quiz") {
      document.title = `Q${step + 1} | AI診断 | Kompass`;
    } else if (phase === "layer1-break") {
      document.title = "Layer 1 完了 | AI診断 | Kompass";
    } else if (phase === "layer2-break") {
      document.title = "Layer 2 完了 | AI診断 | Kompass";
    } else if (phase === "layer3-break") {
      document.title = "Layer 3 完了 | AI診断 | Kompass";
    }
  }, [phase, step]);

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

    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    let resumeLayerRaw = params.get("resumeFromLayer") ?? params.get("resumeFrom");
    if (
      resumeLayerRaw === null &&
      params.get("resume") === "true"
    ) {
      resumeLayerRaw = readResumeLayerFromResultStorage();
    }

    const storedResume = sessionStorage.getItem(DIAGNOSIS_RESUME_FROM_LAYER_KEY);
    const effectiveResume =
      resumeLayerRaw === "1" || resumeLayerRaw === "2" || resumeLayerRaw === "3"
        ? resumeLayerRaw
        : storedResume === "1" || storedResume === "2" || storedResume === "3"
          ? storedResume
          : null;

    if (effectiveResume !== null) {
      const answeredCount =
        effectiveResume === "1" ? 10 : effectiveResume === "2" ? 20 : 30;
      let resumed = false;
      if (answeredCount < questions.length) {
        const rawAnswers = sessionStorage.getItem(DIAGNOSIS_ANSWERS_STORAGE_KEY);
        if (rawAnswers !== null && rawAnswers !== "") {
          try {
            const parsed: unknown = JSON.parse(rawAnswers);
            if (
              isAnswersPrefixForResume(parsed, questions, answeredCount)
            ) {
              setAnswers(parsed);
              setStep(answeredCount);
              setPhase("quiz");
              resumed = true;
              window.history.replaceState(null, "", `/${locale}/diagnosis`);
            }
          } catch {
            // 続き診断の復元に失敗した場合はイントロへ
          }
        }
      }
      sessionStorage.removeItem(DIAGNOSIS_RESUME_FROM_LAYER_KEY);
      if (
        !resumed &&
        typeof window !== "undefined" &&
        (params.get("resumeFromLayer") !== null ||
          params.get("resumeFrom") !== null ||
          params.get("resume") === "true")
      ) {
        window.history.replaceState(null, "", `/${locale}/diagnosis`);
      }
    }

    setBootstrapped(true);
  }, [questions, locale]);

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
        DIAGNOSIS_ANSWERS_STORAGE_KEY,
        JSON.stringify(finalAnswers)
      );
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
      <main
        className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
        style={{
          background:
            "linear-gradient(160deg, #d4f0e2 0%, #eaf8f1 40%, #f5fcf8 100%)",
        }}
      >
        <div className="w-full max-w-md space-y-6 text-center">
          <KompassLogo className="mb-2" />

          <div className="flex items-center justify-center gap-3 text-sm font-medium text-[#1a7a4a]">
            <span>10問</span>
            <span
              className="h-4 w-px shrink-0 bg-[#52B788]/40"
              aria-hidden
            />
            <span>6タイプ</span>
            <span
              className="h-4 w-px shrink-0 bg-[#52B788]/40"
              aria-hidden
            />
            <span>無料</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold tracking-widest text-[#52B788] uppercase">
              AI TYPE DIAGNOSIS
            </p>
            <h1 className="text-2xl font-bold text-[#0a2e18]">
              あなたのベースAIを
              <br />
              見つけよう
            </h1>
            <p className="text-sm text-[#2d4a3e]/80 leading-relaxed">
              思考スタイルに合ったAIを使うと、
              <br />
              仕事も思考も驚くほどラクになる。
            </p>
          </div>

          <div className="rounded-xl border border-white/60 bg-white/50 p-4 space-y-2 text-left shadow-sm backdrop-blur-sm">
            <p className="text-xs font-bold text-[#0a2e18]">診断について</p>
            <ul className="space-y-1.5 text-xs text-[#2d4a3e]/90">
              <li>まず10問、深く知りたい人は最大40問</li>
              <li>登録不要・完全無料</li>
              <li>
                ChatGPT・Claude・Gemini・Perplexity・Copilotの中から最適な1つを提案
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(DIAGNOSIS_ANSWERS_STORAGE_KEY);
              sessionStorage.removeItem(DIAGNOSIS_RESUME_FROM_LAYER_KEY);
              setAnswers([]);
              setStep(0);
              setStarting(true);
              setTimeout(() => setPhase("quiz"), 300);
            }}
            disabled={starting}
            className="w-full text-sm font-bold transition-opacity disabled:opacity-70"
            style={{
              background: "#1a7a4a",
              color: "#fff",
              borderRadius: "14px",
              padding: "15px",
              boxShadow: "0 4px 20px rgba(26,122,74,0.28)",
            }}
          >
            {starting ? "読み込み中..." : "診断をはじめる →"}
          </button>
          {hasPrevResult ? (
            <a
              href={`/${locale}/diagnosis/result`}
              className="block text-xs text-[#2d4a3e]/70 hover:text-[#0a2e18] underline underline-offset-2 transition-colors"
            >
              前回の結果を見る →
            </a>
          ) : null}

          <p className="text-xs text-[#2d4a3e]/60">
            約1分〜 / 途中で結果を見ることもできます
          </p>
        </div>
      </main>
    );
  }

  if (phase === "layer1-break") {
    return (
      <main
        className="flex min-h-screen flex-col items-center px-4 py-10"
        style={LAYER_BREAK_BG}
      >
        <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
          <KompassLogo />
          <LayerProgressRing percent={25} />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#0a2e18]">
              {flow.layer1Heading}
            </h2>
            <p className="text-xs text-[#2d4a3e]/70">
              思考スタイルの基本パターンがわかりました
            </p>
            <p className="text-base leading-relaxed text-[#1a3328]">
              {flow.layer1Sub}
            </p>
          </div>
          {errorMessage !== null ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {layer1MbtiNotice !== null ? (
            <p className="text-sm font-medium text-emerald-800">
              {layer1MbtiNotice}
            </p>
          ) : null}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button
              type="button"
              style={LAYER_CARD_QUICK}
              onClick={() => {
                if (!applyLayer1MbtiIfNeeded()) {
                  return;
                }
                void runEarlyExit(1);
              }}
              className="flex flex-col gap-2 rounded-2xl p-5 text-left shadow-sm transition hover:brightness-[1.02] active:scale-[0.99]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#52B788]">
                {flow.layerTagQuick}
              </span>
              <span className="text-base font-semibold text-[#0a2e18]">
                {flow.layer1ResultNow}
              </span>
              <span className="text-sm leading-snug text-[#2d4a3e]/85">
                {flow.layerQuickDescription}
              </span>
            </button>
            <button
              type="button"
              style={LAYER_CARD_DEEP}
              onClick={() => {
                if (!applyLayer1MbtiIfNeeded()) {
                  return;
                }
                setErrorMessage(null);
                setPhase("quiz");
                setStep(10);
              }}
              className="flex flex-col gap-2 rounded-2xl p-5 text-left shadow-sm transition hover:brightness-[1.02] active:scale-[0.99]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#3d9a6e]">
                {flow.layerTagDeeper}
              </span>
              <span className="text-base font-semibold text-[#0a2e18]">
                {flow.layer1Continue}
              </span>
              <span className="text-sm leading-snug text-[#2d4a3e]/85">
                {flow.layer1Sub}
              </span>
            </button>
          </div>
          {mbtiValue === null && !hasStoredMbti ? (
            <div className="w-full space-y-2 rounded-2xl border border-white/60 bg-white/35 p-3.5 text-left shadow-sm backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-[#0a2e18]">
                精度を上げますか？（任意）
              </h3>
              <p className="text-xs text-[#1a3328]/85">
                MBTI入力で診断精度が上がります。わからなければスキップでOKです。
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
                placeholder="例：INFJ、ENTP..."
                className="w-full rounded-xl border border-[#52B788]/25 bg-white/90 px-4 py-2.5 text-center text-sm font-medium tracking-widest text-zinc-900 shadow-sm focus:border-[#52B788]/50 focus:outline-none focus:ring-2 focus:ring-[#52B788]/30"
              />
              {layer1MbtiError !== null ? (
                <p className="text-xs text-red-600" role="alert">
                  {layer1MbtiError}
                </p>
              ) : null}
              <p className="text-[11px] text-[#2d4a3e]/80">
                <a
                  href="https://www.16personalities.com/ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0a2e18] underline underline-offset-2 hover:text-[#52B788]"
                >
                  MBTIって何？
                </a>
              </p>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  if (phase === "layer2-break") {
    return (
      <main
        className="flex min-h-screen flex-col items-center px-4 py-10"
        style={LAYER_BREAK_BG}
      >
        <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
          <KompassLogo />
          <LayerProgressRing percent={50} />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#0a2e18]">
              {flow.layer2Heading}
            </h2>
            <p className="text-xs text-[#2d4a3e]/70">
              AIとの相性パターンが明確になりました
            </p>
            <p className="text-base leading-relaxed text-[#1a3328]">
              {flow.layer2Sub}
            </p>
          </div>
          {errorMessage !== null ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button
              type="button"
              style={LAYER_CARD_QUICK}
              onClick={() => void runEarlyExit(2)}
              className="flex flex-col gap-2 rounded-2xl p-5 text-left shadow-sm transition hover:brightness-[1.02] active:scale-[0.99]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#52B788]">
                {flow.layerTagQuick}
              </span>
              <span className="text-base font-semibold text-[#0a2e18]">
                {flow.layer2ResultNow}
              </span>
              <span className="text-sm leading-snug text-[#2d4a3e]/85">
                {flow.layerQuickDescription}
              </span>
            </button>
            <button
              type="button"
              style={LAYER_CARD_DEEP}
              onClick={() => {
                setErrorMessage(null);
                setPhase("quiz");
                setStep(20);
              }}
              className="flex flex-col gap-2 rounded-2xl p-5 text-left shadow-sm transition hover:brightness-[1.02] active:scale-[0.99]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#3d9a6e]">
                {flow.layerTagDeeper}
              </span>
              <span className="text-base font-semibold text-[#0a2e18]">
                {flow.layer2Continue}
              </span>
              <span className="text-sm leading-snug text-[#2d4a3e]/85">
                {flow.layer2Sub}
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "layer3-break") {
    return (
      <main
        className="flex min-h-screen flex-col items-center px-4 py-10"
        style={LAYER_BREAK_BG}
      >
        <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
          <KompassLogo />
          <LayerProgressRing percent={75} />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#0a2e18]">
              {flow.layer3Heading}
            </h2>
            <p className="text-xs text-[#2d4a3e]/70">
              あなたの詳細な活用スタイルが見えてきました
            </p>
            <p className="text-base leading-relaxed text-[#1a3328]">
              {flow.layer3Sub}
            </p>
          </div>
          {errorMessage !== null ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button
              type="button"
              style={LAYER_CARD_QUICK}
              onClick={() => void runEarlyExit(3)}
              className="flex flex-col gap-2 rounded-2xl p-5 text-left shadow-sm transition hover:brightness-[1.02] active:scale-[0.99]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#52B788]">
                {flow.layerTagQuick}
              </span>
              <span className="text-base font-semibold text-[#0a2e18]">
                {flow.layer3ResultNow}
              </span>
              <span className="text-sm leading-snug text-[#2d4a3e]/85">
                {flow.layerQuickDescription}
              </span>
            </button>
            <button
              type="button"
              style={LAYER_CARD_DEEP}
              onClick={() => {
                setErrorMessage(null);
                setPhase("quiz");
                setStep(30);
              }}
              className="flex flex-col gap-2 rounded-2xl p-5 text-left shadow-sm transition hover:brightness-[1.02] active:scale-[0.99]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#3d9a6e]">
                {flow.layerTagDeeper}
              </span>
              <span className="text-base font-semibold text-[#0a2e18]">
                {flow.layer3Continue}
              </span>
              <span className="text-sm leading-snug text-[#2d4a3e]/85">
                {flow.layer3Sub}
              </span>
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
    <main
      className="flex min-h-screen flex-col px-4 py-8"
      style={{
        background:
          "linear-gradient(160deg, #d4f0e2 0%, #eaf8f1 40%, #f5fcf8 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-6 flex shrink-0 justify-center">
          <KompassLogo />
        </div>

        <p className="sr-only">{title}</p>

        <div className="mb-1 flex justify-between text-xs text-[#2d4a3e]/70">
          <span>Q{step + 1}</span>
          <span>残り {total - step - 1} 問</span>
        </div>
        <div
          className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#e8f7ef]"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="診断の進捗"
        >
          <div
            className="h-1 rounded-full transition-all"
            style={{
              width: `${progressRatio * 100}%`,
              backgroundColor: "#52B788",
            }}
          />
        </div>
        <div className="mb-6 flex justify-start">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm font-medium text-[#2d4a3e] underline-offset-2 hover:text-[#0a2e18] hover:underline"
          >
            {step === 0 ? flow.backQuit : flow.backPrevious}
          </button>
        </div>

        <p
          className="mb-8 text-center leading-relaxed"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#0a2e18",
          }}
        >
          {currentQuestion.prompt}
        </p>

        {errorMessage !== null ? (
          <p className="mb-4 text-center text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <ul className="flex flex-1 flex-col gap-3">
          {currentQuestion.options.map((opt) => {
            const selected =
              answers.find((a) => a.questionId === currentQuestion.id)?.value ===
              opt.value;
            return (
              <li key={`${currentQuestion.id}-${opt.value}`}>
                <button
                  type="button"
                  onClick={() => {
                    void handleChoose(opt.value);
                  }}
                  className="w-full text-sm font-medium transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2"
                  style={
                    selected
                      ? {
                          background: "#52B788",
                          border: "1.5px solid #52B788",
                          color: "#fff",
                          borderRadius: "14px",
                          padding: "15px 18px",
                          textAlign: "center",
                          boxShadow: "0 4px 16px rgba(82,183,136,0.35)",
                        }
                      : {
                          background: "rgba(255,255,255,0.7)",
                          border: "1.5px solid rgba(82,183,136,0.25)",
                          borderRadius: "14px",
                          padding: "15px 18px",
                          textAlign: "center",
                          color: "#0a2e18",
                        }
                  }
                >
                  <span
                    className="mr-2 font-semibold"
                    style={{ color: selected ? "rgba(255,255,255,0.9)" : "#6b8a7a" }}
                  >
                    {opt.value}.
                  </span>
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
