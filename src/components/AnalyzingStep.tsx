import { useEffect, useState } from 'react'
import type { AnalysisResult } from '../types'

interface AnalyzingStepProps {
  result: AnalysisResult
  questionIndex: number
  totalQuestions: number
  onComplete: () => void
}

const ANALYSIS_LINES = [
  { text: '基準値データとの照合中...', delay: 800 },
  { text: '声の周波数のブレ（微細振動）を検出中...', delay: 1800 },
  { text: null, delay: 2800 },
  { text: '嘘の確率を算出しています。あと5秒お待ちください…', delay: 3800 },
]

export function AnalyzingStep({
  result,
  questionIndex,
  totalQuestions,
  onComplete,
}: AnalyzingStepProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [waitSeconds, setWaitSeconds] = useState(5)

  useEffect(() => {
    const timers = ANALYSIS_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay),
    )

    const waitTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setWaitSeconds((s) => {
          if (s <= 1) {
            clearInterval(interval)
            onComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }, 3800)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(waitTimer)
    }
  }, [onComplete])

  const responseDelayText = result.responseDelay.toFixed(2)

  return (
    <div className="step step-cyber">
      <div className="scan-line" />
      <header className="step-header">
        <span className="icon-brain">🧠</span>
        <h1>Q{questionIndex + 1}/{totalQuestions} 解析中...</h1>
      </header>

      <div className="content-box">
        <div className="analysis-lines">
          {visibleLines >= 1 && (
            <div className="analysis-line">
              <span className="analysis-text">基準値データとの照合中...</span>
              <span className="analysis-ok">[OK]</span>
            </div>
          )}
          {visibleLines >= 2 && (
            <div className="analysis-line">
              <span className="analysis-text">声の周波数のブレ（微細振動）を検出中...</span>
              <span className="analysis-ok">[OK]</span>
            </div>
          )}
          {visibleLines >= 3 && (
            <div className="analysis-line">
              <span className="analysis-text">
                回答までのタイムラグ：{responseDelayText}秒 を検出...
              </span>
              <span className="analysis-ok">[OK]</span>
            </div>
          )}
          {visibleLines >= 4 && (
            <div className="analysis-line analysis-line-wait">
              <span className="analysis-text-wait">
                嘘の確率を算出しています。あと{waitSeconds}秒お待ちください…
              </span>
            </div>
          )}
        </div>

        <div className="analysis-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring spinner-ring-2" />
        </div>
      </div>
    </div>
  )
}
