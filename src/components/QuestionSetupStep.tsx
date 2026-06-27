interface QuestionSetupStepProps {
  questions: string[]
  onChange: (questions: string[]) => void
  onNext: () => void
}

export function QuestionSetupStep({
  questions,
  onChange,
  onNext,
}: QuestionSetupStepProps) {
  const validCount = questions.filter((q) => q.trim()).length

  const updateQuestion = (index: number, value: string) => {
    const next = [...questions]
    next[index] = value
    onChange(next)
  }

  const addQuestion = () => {
    if (questions.length >= 10) return
    onChange([...questions, ''])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return
    onChange(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="step step-cyber">
      <div className="scan-line" />
      <header className="step-header">
        <span className="icon-setup">📝</span>
        <h1>本番質問の設定</h1>
      </header>

      <div className="content-box">
        <div className="setup-notice">
          <span className="setup-notice-icon">👤</span>
          <p>
            ターゲットに渡す<strong>前に</strong>、聞きたい質問を入力してください。
            設定した質問が順番に表示されます。
          </p>
        </div>

        <p className="setup-count">
          現在 <strong>{validCount}</strong> 問 設定済み
        </p>

        <div className="setup-questions">
          {questions.map((q, i) => (
            <div key={i} className="setup-question-row">
              <label className="setup-q-label">Q{i + 1}</label>
              <textarea
                className="setup-q-input"
                value={q}
                onChange={(e) => updateQuestion(i, e.target.value)}
                rows={2}
                placeholder="例：あなたは今、嘘をついていますか？"
              />
              <button
                className="setup-remove-btn"
                onClick={() => removeQuestion(i)}
                disabled={questions.length <= 1}
                aria-label={`質問${i + 1}を削除`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn-add-question"
          onClick={addQuestion}
          disabled={questions.length >= 10}
        >
          ＋ 質問を追加（最大10問）
        </button>

        <button
          className="btn-primary btn-cyber"
          onClick={onNext}
          disabled={validCount === 0}
        >
          設定完了・次へ進む
        </button>
      </div>
    </div>
  )
}
