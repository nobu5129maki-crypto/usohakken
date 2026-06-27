import { useCallback, useEffect, useMemo, useState } from 'react'
import { WarningStep } from './components/WarningStep'
import { CalibrationStep } from './components/CalibrationStep'
import { ReadyStep } from './components/ReadyStep'
import { QuestionStep } from './components/QuestionStep'
import { AnalyzingStep } from './components/AnalyzingStep'
import { ResultStep } from './components/ResultStep'
import { InstallPrompt } from './components/InstallPrompt'
import { SettingsPanel } from './components/SettingsPanel'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import {
  calculateLieProbability,
  DEFAULT_TARGET_QUESTIONS,
  type QuestionResult,
  type Step,
} from './types'

function App() {
  const [step, setStep] = useState<Step>('warning')
  const [questions, setQuestions] = useState<string[]>(DEFAULT_TARGET_QUESTIONS)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [micError, setMicError] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const activeQuestions = useMemo(
    () => questions.map((q) => q.trim()).filter(Boolean),
    [questions],
  )

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
    setCurrentQuestionIndex(0)
    setResults([])
    setStep('question')
  }, [resetTiming])

  const handleQuestionComplete = useCallback(() => {
    const currentQuestion = activeQuestions[currentQuestionIndex]
    if (!currentQuestion) return

    const analysisResult = calculateLieProbability(getTiming())
    setResults((prev) => [
      ...prev,
      { question: currentQuestion, result: analysisResult },
    ])
    setStep('analyzing')
  }, [activeQuestions, currentQuestionIndex, getTiming])

  const handleAnalyzingComplete = useCallback(() => {
    setStep('result')
  }, [])

  const handleNextQuestion = useCallback(() => {
    resetTiming()
    setCurrentQuestionIndex((i) => i + 1)
    setStep('question')
  }, [resetTiming])

  const handleReset = useCallback(() => {
    resetTiming()
    setResults([])
    setCurrentQuestionIndex(0)
    setStep('warning')
    setShowSettings(false)
  }, [resetTiming])

  const handleWarningNext = useCallback(() => {
    setStep('calibration')
  }, [])

  const isLastQuestion = currentQuestionIndex >= activeQuestions.length - 1
  const currentQuestion = activeQuestions[currentQuestionIndex] ?? ''

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
      {step !== 'question' && step !== 'result' && step !== 'analyzing' && (
        <button
          className="settings-toggle"
          onClick={() => setShowSettings((s) => !s)}
          aria-label="設定"
        >
          ⚙️
        </button>
      )}

      {showSettings && (
        <SettingsPanel
          questions={questions}
          onChange={setQuestions}
          onClose={() => setShowSettings(false)}
        />
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

      {step === 'ready' && (
        <ReadyStep
          questionCount={activeQuestions.length}
          onStart={handleQuestionStart}
        />
      )}

      {step === 'question' && currentQuestion && (
        <QuestionStep
          key={currentQuestionIndex}
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={activeQuestions.length}
          onComplete={handleQuestionComplete}
          onButtonPress={onButtonPress}
          onButtonRelease={onButtonRelease}
          isButtonPressed={isButtonPressed}
          waveformData={waveformData}
        />
      )}

      {step === 'analyzing' && results.length > 0 && (
        <AnalyzingStep
          result={results[results.length - 1].result}
          questionIndex={currentQuestionIndex}
          totalQuestions={activeQuestions.length}
          onComplete={handleAnalyzingComplete}
        />
      )}

      {step === 'result' && results.length > 0 && (
        <ResultStep
          results={results}
          isComplete={isLastQuestion}
          totalQuestions={activeQuestions.length}
          onNextQuestion={handleNextQuestion}
          onReset={handleReset}
        />
      )}

      <InstallPrompt />
    </div>
  )
}

export default App
