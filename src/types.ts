export type Step = 'warning' | 'calibration' | 'questionSetup' | 'ready' | 'question' | 'analyzing' | 'result'

export interface TimingData {
  buttonPressStart: number | null
  buttonPressEnd: number | null
  voiceStart: number | null
  voiceEnd: number | null
  responseDelay: number | null
  holdMismatch: number
  voiceDuration: number | null
}

export interface AnalysisResult {
  lieProbability: number
  responseDelay: number
  holdMismatch: number
  verdict: 'truth' | 'lie' | 'suspicious'
  verdictLabel: string
}

export interface QuestionResult {
  question: string
  result: AnalysisResult
}

export const CALIBRATION_QUESTIONS = [
  'あなたは今、屋内にいますか？',
  '今日は {day} ですか？',
  'あなたの目の前にあるのはスマホですか？',
]

export const DEFAULT_TARGET_QUESTIONS = [
  'あなたは今、嘘をついていますか？',
  '今日、誰かに嘘をつきましたか？',
  '今の回答は全て本当ですか？',
]

export function getDayOfWeek(): string {
  const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  return days[new Date().getDay()]
}

export function calculateLieProbability(timing: TimingData): AnalysisResult {
  let probability = 15

  if (timing.responseDelay !== null) {
    if (timing.responseDelay > 1.5) probability += 35
    else if (timing.responseDelay > 0.8) probability += 25
    else if (timing.responseDelay > 0.4) probability += 10
    else if (timing.responseDelay < 0.1) probability += 15
  }

  if (timing.holdMismatch > 0.5) probability += 30
  else if (timing.holdMismatch > 0.3) probability += 20
  else if (timing.holdMismatch > 0.15) probability += 10

  if (timing.voiceDuration !== null) {
    if (timing.voiceDuration > 3) probability += 20
    else if (timing.voiceDuration > 2) probability += 10
    else if (timing.voiceDuration < 0.3) probability += 5
  }

  probability += Math.floor(Math.random() * 12)

  probability = Math.min(97, Math.max(8, probability))

  let verdict: AnalysisResult['verdict']
  let verdictLabel: string

  if (probability >= 65) {
    verdict = 'lie'
    verdictLabel = '嘘の可能性：高'
  } else if (probability >= 40) {
    verdict = 'suspicious'
    verdictLabel = '嘘の可能性：中'
  } else {
    verdict = 'truth'
    verdictLabel = '嘘の可能性：低'
  }

  return {
    lieProbability: probability,
    responseDelay: timing.responseDelay ?? 0.74,
    holdMismatch: timing.holdMismatch,
    verdict,
    verdictLabel,
  }
}
