interface SettingsPanelProps {
  questions: string[]
  onChange: (questions: string[]) => void
  onClose: () => void
}

export function SettingsPanel({ questions, onChange, onClose }: SettingsPanelProps) {
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

  const validCount = questions.filter((q) => q.trim()).length

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">本番質問の設定</h2>
        <p className="settings-desc">
          ターゲットに順番に聞く質問を設定します（{validCount}問）
        </p>
      </div>

      <div className="settings-questions">
        {questions.map((q, i) => (
          <div key={i} className="settings-question-row">
            <label className="settings-q-label">Q{i + 1}</label>
            <textarea
              className="settings-input settings-q-input"
              value={q}
              onChange={(e) => updateQuestion(i, e.target.value)}
              rows={2}
              placeholder="質問文を入力..."
            />
            <button
              className="settings-remove-btn"
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
        ＋ 質問を追加
      </button>

      <button className="btn-primary btn-cyber btn-small" onClick={onClose}>
        閉じる
      </button>
    </div>
  )
}
