import type { QuestionResult } from '../types'

interface ResultStepProps {
  results: QuestionResult[]
  isComplete: boolean
  totalQuestions: number
  onNextQuestion: () => void
  onReset: () => void
}

function VerdictBadge({ result }: { result: QuestionResult['result'] }) {
  const verdictClass =
    result.verdict === 'lie'
      ? 'verdict-lie'
      : result.verdict === 'suspicious'
        ? 'verdict-suspicious'
        : 'verdict-truth'

  return (
    <div className={`result-card-verdict ${verdictClass}`}>
      <span className="result-card-probability">{result.lieProbability}%</span>
      <span className="result-card-label">{result.verdictLabel}</span>
    </div>
  )
}

function SingleResult({ item }: { item: QuestionResult }) {
  const verdictClass =
    item.result.verdict === 'lie'
      ? 'verdict-lie'
      : item.result.verdict === 'suspicious'
        ? 'verdict-suspicious'
        : 'verdict-truth'

  return (
    <>
      <p className="result-question-label">質問</p>
      <p className="result-question">{item.question}</p>

      <div className="result-probability">
        <div className="probability-ring">
          <span className="probability-value">{item.result.lieProbability}</span>
          <span className="probability-unit">%</span>
        </div>
        <p className="probability-label">嘘の確率</p>
      </div>

      <div className={`verdict-badge ${verdictClass}`}>
        {item.result.verdictLabel}
      </div>

      <div className="result-details">
        <div className="detail-row">
          <span>応答遅延</span>
          <span>{item.result.responseDelay.toFixed(2)}秒</span>
        </div>
        <div className="detail-row">
          <span>ホールド不一致</span>
          <span>{item.result.holdMismatch.toFixed(2)}秒</span>
        </div>
      </div>
    </>
  )
}

export function ResultStep({
  results,
  isComplete,
  totalQuestions,
  onNextQuestion,
  onReset,
}: ResultStepProps) {
  const latest = results[results.length - 1]
  const highestLie = results.reduce((max, r) =>
    r.result.lieProbability > max.result.lieProbability ? r : max,
  )

  const overallClass =
    highestLie.result.verdict === 'lie'
      ? 'verdict-lie'
      : highestLie.result.verdict === 'suspicious'
        ? 'verdict-suspicious'
        : 'verdict-truth'

  if (!isComplete && latest) {
    const verdictClass =
      latest.result.verdict === 'lie'
        ? 'verdict-lie'
        : latest.result.verdict === 'suspicious'
          ? 'verdict-suspicious'
          : 'verdict-truth'

    return (
      <div className={`step step-result ${verdictClass}`}>
        <header className="step-header step-header-result">
          <h1>
            解析結果（{results.length} / {totalQuestions}）
          </h1>
        </header>

        <div className="content-box">
          <SingleResult item={latest} />

          <button className="btn-primary btn-start" onClick={onNextQuestion}>
            次の質問へ →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`step step-result ${overallClass}`}>
      <header className="step-header step-header-result">
        <h1>総合解析結果</h1>
      </header>

      <div className="content-box">
        <p className="result-summary-label">
          全 {results.length} 問の解析が完了しました
        </p>

        <div className="result-list">
          {results.map((item, i) => (
            <div
              key={i}
              className={`result-card ${
                item.result.lieProbability === highestLie.result.lieProbability
                  ? 'result-card-highlight'
                  : ''
              }`}
            >
              <div className="result-card-header">
                <span className="result-card-num">Q{i + 1}</span>
                <p className="result-card-question">{item.question}</p>
              </div>
              <VerdictBadge result={item.result} />
              <div className="result-card-details">
                <span>応答 {item.result.responseDelay.toFixed(2)}秒</span>
                <span>不一致 {item.result.holdMismatch.toFixed(2)}秒</span>
              </div>
            </div>
          ))}
        </div>

        <div className="result-overall">
          <p className="result-overall-label">最高嘘確率</p>
          <p className="result-overall-value">
            {highestLie.result.lieProbability}%
          </p>
          <p className="result-overall-question">{highestLie.question}</p>
        </div>

        <button className="btn-primary btn-cyber" onClick={onReset}>
          もう一度測定する
        </button>
      </div>
    </div>
  )
}
