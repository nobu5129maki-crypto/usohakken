import { useState } from 'react'
import { useCountdown } from '../hooks/useCountdown'

interface QuestionStepProps {
  question: string
  questionIndex: number
  totalQuestions: number
  onComplete: () => void
  onButtonPress: () => void
  onButtonRelease: () => void
  isButtonPressed: boolean
  waveformData: number[]
}

export function QuestionStep({
  question,
  questionIndex,
  totalQuestions,
  onComplete,
  onButtonPress,
  onButtonRelease,
  isButtonPressed,
  waveformData,
}: QuestionStepProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [answered, setAnswered] = useState(false)

  const countdown = useCountdown(3, true, () => {
    setShowAnswer(true)
  })

  const handleRelease = () => {
    onButtonRelease()
    if (showAnswer && !answered) {
      setAnswered(true)
      setTimeout(() => onComplete(), 600)
    }
  }

  return (
    <div className="step step-alert">
      <div className="alert-pulse" />
      <header className="step-header step-header-alert">
        <span className="icon-bolt">⚡️</span>
        <h1>TARGET QUESTION {questionIndex + 1} / {totalQuestions}</h1>
      </header>

      <div className="content-box content-box-alert">
        <div className="target-question">
          <p className="question-label">『</p>
          <p className="question-text">{question}</p>
          <p className="question-label">』</p>
        </div>

        {showAnswer ? (
          <>
            <div className="answer-now">
              <span className="answer-now-icon">🚨</span>
              <span className="answer-now-text">ANSWER NOW !!</span>
            </div>

            <div className="waveform-container waveform-alert">
              <div className="waveform">
                {waveformData.map((v, i) => (
                  <div
                    key={i}
                    className="wave-bar wave-bar-alert"
                    style={{
                      height: `${Math.max(4, v * 120)}%`,
                      opacity: isButtonPressed ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className={`btn-measure btn-alert ${isButtonPressed ? 'pressed' : ''}`}
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
              <span className="btn-measure-icon">🔴</span>
              <span>測定ボタンを押しっぱなしにして声で回答してください</span>
            </button>
          </>
        ) : (
          <div className="countdown-display countdown-alert">
            <span className="countdown-label">🚨 ANSWER NOW !!</span>
            <span className="countdown-number countdown-number-alert">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
