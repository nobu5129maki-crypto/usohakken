import { useState } from 'react'
import { CALIBRATION_QUESTIONS, getDayOfWeek } from '../types'
import { useProgress } from '../hooks/useCountdown'

interface CalibrationStepProps {
  onNext: () => void
  onButtonPress: () => void
  onButtonRelease: () => void
  isButtonPressed: boolean
  waveformData: number[]
}

export function CalibrationStep({
  onNext,
  onButtonPress,
  onButtonRelease,
  isButtonPressed,
  waveformData,
}: CalibrationStepProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [answered, setAnswered] = useState(false)

  const day = getDayOfWeek()
  const questions = CALIBRATION_QUESTIONS.map((q) =>
    q.replace('{day}', day),
  )

  const progress = useProgress(3000, analyzing, () => {
    onNext()
  })

  const handleRelease = () => {
    onButtonRelease()
    if (!answered) {
      setAnswered(true)
      if (currentQ < questions.length - 1) {
        setTimeout(() => {
          setCurrentQ((c) => c + 1)
          setAnswered(false)
        }, 800)
      } else {
        setAnalyzing(true)
      }
    }
  }

  return (
    <div className="step step-cyber">
      <div className="scan-line" />
      <header className="step-header">
        <span className="icon-gear">⚙️</span>
        <h1>平常時の基準値測定（キャリブレーション）</h1>
      </header>

      <div className="content-box">
        <p className="intro-text">
          あなたの平常時の精神状態と、音声の基本トーンを測定します。
          下記の「明らかな事実」について、
          <strong>【ボタンを押しながら、声を出して】</strong>お答えください。
        </p>

        <div className="question-list">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`calibration-q ${i === currentQ ? 'active' : ''} ${i < currentQ ? 'done' : ''}`}
            >
              <span className="q-num">Q{i + 1}.</span>
              <span className="q-text">{q}</span>
              {i < currentQ && <span className="q-check">✓</span>}
            </div>
          ))}
        </div>

        {analyzing ? (
          <div className="analyzing-mini">
            <p className="analyzing-text">
              ※基準値の解析が完了するまで、そのままお待ちください…
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-label">{Math.round(progress)}%</p>
          </div>
        ) : (
          <>
            <div className="waveform-container">
              <div className="waveform">
                {waveformData.map((v, i) => (
                  <div
                    key={i}
                    className="wave-bar wave-bar-cyber"
                    style={{
                      height: `${Math.max(4, v * 100)}%`,
                      opacity: isButtonPressed ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className={`btn-measure btn-cyber ${isButtonPressed ? 'pressed' : ''}`}
              onTouchStart={(e) => {
                e.preventDefault()
                onButtonPress()
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                handleRelease()
              }}
              onMouseDown={onButtonPress}
              onMouseUp={handleRelease}
              onMouseLeave={() => {
                if (isButtonPressed) handleRelease()
              }}
            >
              <span className="btn-measure-icon">🔵</span>
              <span>測定ボタン（押し続ける）</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
