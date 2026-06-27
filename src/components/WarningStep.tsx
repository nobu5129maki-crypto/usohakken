interface WarningStepProps {
  onNext: () => void
}

export function WarningStep({ onNext }: WarningStepProps) {
  return (
    <div className="step step-cyber">
      <div className="scan-line" />
      <header className="step-header">
        <span className="icon-warning">⚠️</span>
        <h1>測定前の重要なお願い</h1>
      </header>

      <div className="content-box">
        <p className="intro-text">
          本アプリは、高度な音声波形分析と、質問提示から回答までの
          <strong>応答速度（コンマ数秒単位の微細な遅延）</strong>
          を組み合わせて嘘を検出します。
        </p>
        <p className="intro-text">
          正確な解析を行うため、以下の<strong>【3つのルール】</strong>を厳守してください。
        </p>

        <div className="rules">
          <div className="rule-item">
            <span className="rule-badge">【即答する】</span>
            <p>質問が表示されたら、考える時間を置かずに答えてください。</p>
          </div>
          <div className="rule-item">
            <span className="rule-badge">【一言で答える】</span>
            <p>言い訳や長い説明はエラーになります。「はい」「いいえ」または単語のみで答えてください。</p>
          </div>
          <div className="rule-item">
            <span className="rule-badge">【ホールド操作】</span>
            <p>回答中、画面の<strong>【測定ボタン】</strong>を必ず指で押し続けてください。</p>
          </div>
        </div>
      </div>

      <button className="btn-primary btn-cyber" onClick={onNext}>
        了解して次へ進む
      </button>
    </div>
  )
}
