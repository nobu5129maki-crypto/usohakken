import { useEffect, useRef, useState } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import { HoldButton } from './HoldButton'

interface QuestionStepProps {
  question: string
  questionIndex: number
  totalQuestions: number
  onComplete: (answer?: string) => void
  onButtonPress: () => void
  onButtonRelease: () => void
  isButtonPressed: boolean
  waveformData: number[]
  textMode?: boolean
  onTextTiming?: (elapsedSeconds: number) => void
  hasVoice?: () => boolean
  onUseText?: () => void
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
  textMode = false,
  onTextTiming,
  hasVoice,
  onUseText,
}: QuestionStepProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState('')
  const shownAt = useRef(0)
  const answeredRef = useRef(false)

  const countdown = useCountdown(3, true, () => {
    shownAt.current = Date.now()
    setShowAnswer(true)
  })

  useEffect(() => {
    if (showAnswer && shownAt.current === 0) shownAt.current = Date.now()
  }, [showAnswer])

  const handleRelease = () => {
    onButtonRelease()
    if (!showAnswer || answeredRef.current) return
    if (!hasVoice?.()) {
      setHint('声が検出できませんでした。ボタンを押したまま、はっきり話してください。')
      return
    }
    setHint('')
    answeredRef.current = true
    setAnswered(true)
    setTimeout(() => onComplete(), 600)
  }

  const submitText = () => {
    const value = draft.trim()
    if (!showAnswer || answeredRef.current || !value) return
    const elapsed = Math.max(0.05, (Date.now() - (shownAt.current || Date.now())) / 1000)
    onTextTiming?.(elapsed)
    answeredRef.current = true
    setAnswered(true)
    setTimeout(() => onComplete(value), 300)
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

            {textMode ? null : (
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
            )}

            {textMode ? (
              <div className="text-answer-box">
                <p className="text-answer-note">マイクを使えないので、文字で回答します。</p>
                <textarea
                  className="text-answer"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="はい / いいえ"
                  aria-label="文字での回答"
                />
                <button type="button" className="btn-primary btn-start" onClick={submitText} disabled={!draft.trim() || answered}>
                  文字で回答する
                </button>
              </div>
            ) : (
            <>
            {hint ? <p className="voice-hint" role="alert">{hint}</p> : null}
            <HoldButton
              className={`btn-measure btn-alert ${isButtonPressed ? 'pressed' : ''}`}
              onPress={onButtonPress}
              onRelease={handleRelease}
            >
              <span className="btn-measure-icon">🔴</span>
              <span>測定ボタンを押しっぱなしにして声で回答してください</span>
            </HoldButton>
            <button type="button" className="btn-text-fallback" onClick={onUseText}>
              マイクを使わず文字で回答する
            </button>
            </>
            )}
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
