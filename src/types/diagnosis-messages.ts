/**
 * messages/*.json の診断セクション用型（i18n）
 */

/** 1つの選択肢（値はスコアリング engine に渡す文字列、例: A） */
export interface DiagnosisChoiceOption {
  value: string;
  label: string;
}

/** 1問分の定義 */
export interface DiagnosisQuestionDef {
  id: number;
  prompt: string;
  options: DiagnosisChoiceOption[];
}

/** MBTI 前・Layer 区切り・戻るボタンなど */
export interface DiagnosisFlowCopy {
  mbtiInvalid: string;
  layer1Heading: string;
  layer1Sub: string;
  layer1Continue: string;
  layer1ResultNow: string;
  /** 2択カード「結果を見る」側の短い説明 */
  layerQuickDescription: string;
  /** カード左上タグ（デザイン用・QUICK） */
  layerTagQuick: string;
  /** カード左上タグ（デザイン用・DEEPER） */
  layerTagDeeper: string;
  layer2Heading: string;
  layer2Sub: string;
  layer2Continue: string;
  layer2ResultNow: string;
  layer3Heading: string;
  layer3Sub: string;
  layer3Continue: string;
  layer3ResultNow: string;
  backQuit: string;
  backPrevious: string;
}

/** 結果ページ：割合・レア度など */
export interface DiagnosisResultPageCopy {
  statsAggregating: string;
  /** `{percent}` を置換して表示 */
  statsPercentTemplate: string;
  rarityOften: string;
  rarityGeneral: string;
  rarityUnusual: string;
  rarityRare: string;
  /** スクショ用ゾーンの小さな固定コピー */
  screenshotTagline: string;
  /** ヒーロー下タブ（結果） */
  heroTabResult: string;
  /** ヒーロー下タブ（詳細） */
  heroTabDetail: string;
  /** ヒーロー下タブ（AI活用法） */
  heroTabAiUsage: string;
  shareOnX: string;
  redoDiagnosis: string;
  recommendedAi: string;
  detailTitle: string;
  strengths: string;
  weaknesses: string;
  contraryTitle: string;
  oppositeTitle: string;
  ngTitle: string;
  literacyTitle: string;
  statsTitle: string;
  nextStepTitle: string;
  subAiLabel: string;
  mbtiCardTitle: string;
  mbtiApply: string;
  mbtiPlaceholder: string;
  mbtiInvalid: string;
  mbtiNoScores: string;
  mbtiNoScoresHint: string;
  mbtiWhatLink: string;
  continueLayer1: string;
  continueLayer2: string;
  continueLayer3: string;
  setupOkTitle: string;
}

/** 診断フロー用の文言・設問一覧 */
export interface DiagnosisCopy {
  title: string;
  loadingLabel: string;
  /** 設問が空のとき */
  errorNoQuestions: string;
  /** API 送信失敗時 */
  errorSubmit: string;
  questions: DiagnosisQuestionDef[];
  /** 結果画面（オプション。無い場合はフォールバック文言を使う） */
  resultPage?: DiagnosisResultPageCopy;
  /** MBTI・Layer 区切り・戻る（オプション） */
  flow?: DiagnosisFlowCopy;
}

/** ja.json / en.json ルート（診断以外を増やす場合はここを拡張） */
export interface MessagesFile {
  diagnosis: DiagnosisCopy;
}
