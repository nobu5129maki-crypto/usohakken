import { useState } from 'react'
import { useCountdown } from '../hooks/useCountdown'

interface ReadyStepProps {
  onStart: () => void
}

export function ReadyStep({ onStart }: ReadyStepProps) {
  const [counting, setCounting] = useState(false)

  const countdown = useCountdown(3, counting, () => {
    onStart()
  })

  const handleStart = () => {
    setCounting(true)
  }

  return (
    <div className="step step-cyber">
      <div className="scan-line" />
      <header className="step-header">
        <span className="icon-ready">🔴</span>
        <h1>嘘発見モード：準備完了</h1>
      </header>

      <div className="content-box">
        <div className="status-ok">
          <span className="status-dot" />
          ターゲットの基準値（ベースライン）の固定に成功しました。
        </div>

        <p className="intro-text">
          これより本番の質問を開始します。
          スマホをターゲットの正面に構え、ボタンを押しやすい位置に持たせてください。
        </p>

        <p className="intro-text highlight-cyber">
          準備ができたら、以下の「測定開始」をタップしてください。
          タップ直後、3秒間のカウントダウンの後に質問が表示されます。
        </p>

        {counting ? (
          <div className="countdown-display countdown-cyber">
            <span className="countdown-number">{countdown}</span>
          </div>
        ) : (
          <button className="btn-primary btn-start" onClick={handleStart}>
            🔴 測定開始
          </button>
        )}
      </div>
    </div>
  )
}
