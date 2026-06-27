import type { AnalysisResult } from '../types'

interface ResultStepProps {
  result: AnalysisResult
  question: string
  onReset: () => void
}

export function ResultStep({ result, question, onReset }: ResultStepProps) {
  const verdictClass =
    result.verdict === 'lie'
      ? 'verdict-lie'
      : result.verdict === 'suspicious'
        ? 'verdict-suspicious'
        : 'verdict-truth'

  return (
    <div className={`step step-result ${verdictClass}`}>
      <header className="step-header step-header-result">
        <h1>解析結果</h1>
      </header>

      <div className="content-box">
        <p className="result-question-label">質問</p>
        <p className="result-question">{question}</p>

        <div className="result-probability">
          <div className="probability-ring">
            <span className="probability-value">{result.lieProbability}</span>
            <span className="probability-unit">%</span>
          </div>
          <p className="probability-label">嘘の確率</p>
        </div>

        <div className={`verdict-badge ${verdictClass}`}>
          {result.verdictLabel}
        </div>

        <div className="result-details">
          <div className="detail-row">
            <span>応答遅延</span>
            <span>{result.responseDelay.toFixed(2)}秒</span>
          </div>
          <div className="detail-row">
            <span>ホールド不一致</span>
            <span>{result.holdMismatch.toFixed(2)}秒</span>
          </div>
        </div>

        <button className="btn-primary btn-cyber" onClick={onReset}>
          もう一度測定する
        </button>
      </div>
    </div>
  )
}
