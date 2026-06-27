import { useCallback, useEffect, useState } from 'react'
import { WarningStep } from './components/WarningStep'
import { CalibrationStep } from './components/CalibrationStep'
import { ReadyStep } from './components/ReadyStep'
import { QuestionStep } from './components/QuestionStep'
import { AnalyzingStep } from './components/AnalyzingStep'
import { ResultStep } from './components/ResultStep'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import {
  calculateLieProbability,
  DEFAULT_TARGET_QUESTION,
  type AnalysisResult,
  type Step,
} from './types'

function App() {
  const [step, setStep] = useState<Step>('warning')
  const [question, setQuestion] = useState(DEFAULT_TARGET_QUESTION)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [micError, setMicError] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const {
    isReady,
    isButtonPressed,
    waveformData,
    startAnalyzer,
    onButtonPress,
    onButtonRelease,
    resetTiming,
    getTiming,
  } = useAudioAnalyzer()

  useEffect(() => {
    if (step === 'calibration' && !isReady) {
      startAnalyzer().then((ok) => {
        if (!ok) setMicError(true)
      })
    }
  }, [step, isReady, startAnalyzer])

  const handleCalibrationComplete = useCallback(() => {
    setStep('ready')
  }, [])

  const handleQuestionStart = useCallback(() => {
    resetTiming()
    setStep('question')
  }, [resetTiming])

  const handleQuestionComplete = useCallback(() => {
    const analysisResult = calculateLieProbability(getTiming())
    setResult(analysisResult)
    setStep('analyzing')
  }, [getTiming])

  const handleAnalyzingComplete = useCallback(() => {
    setStep('result')
  }, [])

  const handleReset = useCallback(() => {
    resetTiming()
    setResult(null)
    setStep('warning')
    setShowSettings(false)
  }, [resetTiming])

  const handleWarningNext = useCallback(() => {
    setStep('calibration')
  }, [])

  if (micError) {
    return (
      <div className="app">
        <div className="step step-cyber">
          <div className="content-box">
            <h1>マイクへのアクセスが必要です</h1>
            <p className="intro-text">
              このアプリは音声解析を行うため、マイクの使用許可が必要です。
              ブラウザの設定からマイクを許可して、ページを再読み込みしてください。
            </p>
            <button className="btn-primary btn-cyber" onClick={() => window.location.reload()}>
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {step !== 'question' && step !== 'result' && (
        <button
          className="settings-toggle"
          onClick={() => setShowSettings((s) => !s)}
          aria-label="設定"
        >
          ⚙️
        </button>
      )}

      {showSettings && (
        <div className="settings-panel">
          <label className="settings-label">本番質問文</label>
          <textarea
            className="settings-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <button
            className="btn-primary btn-cyber btn-small"
            onClick={() => setShowSettings(false)}
          >
            閉じる
          </button>
        </div>
      )}

      {step === 'warning' && <WarningStep onNext={handleWarningNext} />}

      {step === 'calibration' && (
        <CalibrationStep
          onNext={handleCalibrationComplete}
          onButtonPress={onButtonPress}
          onButtonRelease={onButtonRelease}
          isButtonPressed={isButtonPressed}
          waveformData={waveformData}
        />
      )}

      {step === 'ready' && <ReadyStep onStart={handleQuestionStart} />}

      {step === 'question' && (
        <QuestionStep
          question={question}
          onComplete={handleQuestionComplete}
          onButtonPress={onButtonPress}
          onButtonRelease={onButtonRelease}
          isButtonPressed={isButtonPressed}
          waveformData={waveformData}
        />
      )}

      {step === 'analyzing' && result && (
        <AnalyzingStep result={result} onComplete={handleAnalyzingComplete} />
      )}

      {step === 'result' && result && (
        <ResultStep result={result} question={question} onReset={handleReset} />
      )}
    </div>
  )
}

export default App
