import { useCallback, useMemo, useState } from 'react'
import { WarningStep } from './components/WarningStep'
import { CalibrationStep } from './components/CalibrationStep'
import { QuestionSetupStep } from './components/QuestionSetupStep'
import { ReadyStep } from './components/ReadyStep'
import { QuestionStep } from './components/QuestionStep'
import { AnalyzingStep } from './components/AnalyzingStep'
import { ResultStep } from './components/ResultStep'
import { InstallPrompt } from './components/InstallPrompt'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import {
  calculateLieProbability,
  DEFAULT_TARGET_QUESTIONS,
  medianDelay,
  type QuestionResult,
  type Step,
} from './types'

function App() {
  const [step, setStep] = useState<Step>('warning')
  const [questions, setQuestions] = useState<string[]>(DEFAULT_TARGET_QUESTIONS)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [textMode, setTextMode] = useState(false)
  const [baselineDelays, setBaselineDelays] = useState<number[]>([])

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
    noteTextAnswer,
    stopAnalyzer,
  } = useAudioAnalyzer()

  const hasVoice = useCallback(() => getTiming().voiceStart != null, [getTiming])

  const captureBaseline = useCallback(() => {
    const delay = getTiming().responseDelay
    if (delay == null) return
    setBaselineDelays((prev) => [...prev, delay])
  }, [getTiming])

  const handleCalibrationComplete = useCallback(() => {
    setStep('questionSetup')
  }, [])

  const handleQuestionSetupComplete = useCallback(() => {
    setStep('ready')
  }, [])

  const handleQuestionStart = useCallback(() => {
    resetTiming()
    setCurrentQuestionIndex(0)
    setResults([])
    setStep('question')
  }, [resetTiming])

  const handleQuestionComplete = useCallback((answer?: string) => {
    const currentQuestion = activeQuestions[currentQuestionIndex]
    if (!currentQuestion) return

    const analysisResult = calculateLieProbability(
      getTiming(),
      textMode ? null : medianDelay(baselineDelays),
      textMode,
    )
    setResults((prev) => [
      ...prev,
      { question: currentQuestion, answer, result: analysisResult },
    ])
    setStep('analyzing')
  }, [activeQuestions, baselineDelays, currentQuestionIndex, getTiming, textMode])

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
    setBaselineDelays([])
    setCurrentQuestionIndex(0)
    setStep('warning')
  }, [resetTiming])

  const handleWarningNext = useCallback(() => {
    setStep('calibration')
    if (textMode || isReady) return
    void startAnalyzer().then((ok) => {
      if (!ok) setTextMode(true)
    })
  }, [isReady, startAnalyzer, textMode])

  const handleUseText = useCallback(() => {
    setTextMode(true)
    stopAnalyzer()
  }, [stopAnalyzer])

  const isLastQuestion = currentQuestionIndex >= activeQuestions.length - 1
  const currentQuestion = activeQuestions[currentQuestionIndex] ?? ''

  return (
    <div className="app">
      {step === 'warning' && <WarningStep onNext={handleWarningNext} />}

      {step === 'calibration' && (
        <CalibrationStep
          onNext={handleCalibrationComplete}
          onButtonPress={onButtonPress}
          onButtonRelease={onButtonRelease}
          isButtonPressed={isButtonPressed}
          waveformData={waveformData}
          textMode={textMode}
          micReady={isReady}
          onUseText={handleUseText}
          hasVoice={hasVoice}
          onCaptured={captureBaseline}
        />
      )}

      {step === 'questionSetup' && (
        <QuestionSetupStep
          questions={questions}
          onChange={setQuestions}
          onNext={handleQuestionSetupComplete}
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
          textMode={textMode}
          onTextTiming={noteTextAnswer}
          hasVoice={hasVoice}
          onUseText={handleUseText}
        />
      )}

      {step === 'analyzing' && results.length > 0 && (
        <AnalyzingStep
          result={results[results.length - 1].result}
          questionIndex={currentQuestionIndex}
          totalQuestions={activeQuestions.length}
          onComplete={handleAnalyzingComplete}
          textMode={textMode}
          hasBaseline={!textMode && baselineDelays.length > 0}
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
