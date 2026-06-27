import { useCallback, useEffect, useRef, useState } from 'react'
import type { TimingData } from '../types'

interface UseAudioAnalyzerReturn {
  isReady: boolean
  isButtonPressed: boolean
  amplitude: number
  waveformData: number[]
  timing: TimingData
  startAnalyzer: () => Promise<boolean>
  stopAnalyzer: () => void
  onButtonPress: () => void
  onButtonRelease: () => void
  resetTiming: () => void
  getTiming: () => TimingData
}

const EMPTY_TIMING: TimingData = {
  buttonPressStart: null,
  buttonPressEnd: null,
  voiceStart: null,
  voiceEnd: null,
  responseDelay: null,
  holdMismatch: 0,
  voiceDuration: null,
}

const VOICE_THRESHOLD = 0.08
const SILENCE_FRAMES = 8

export function useAudioAnalyzer(): UseAudioAnalyzerReturn {
  const [isReady, setIsReady] = useState(false)
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const [amplitude, setAmplitude] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(0))
  const [timing, setTiming] = useState<TimingData>({ ...EMPTY_TIMING })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)
  const timingRef = useRef<TimingData>({ ...EMPTY_TIMING })
  const isButtonPressedRef = useRef(false)
  const voiceActiveRef = useRef(false)
  const silenceCountRef = useRef(0)
  const sessionStartRef = useRef<number>(0)

  const computeHoldMismatch = useCallback(() => {
    const t = timingRef.current
    if (!t.buttonPressStart || !t.voiceStart || !t.voiceEnd || !t.buttonPressEnd) return 0

    const pressBeforeVoice = Math.max(0, (t.voiceStart - t.buttonPressStart) / 1000)
    const holdAfterVoice = Math.max(0, (t.buttonPressEnd - t.voiceEnd) / 1000)
    return pressBeforeVoice + holdAfterVoice
  }, [])

  const analyze = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    let sum = 0
    const bars: number[] = []
    const barCount = 32
    const step = Math.floor(bufferLength / barCount)

    for (let i = 0; i < barCount; i++) {
      let barSum = 0
      for (let j = 0; j < step; j++) {
        barSum += dataArray[i * step + j]
      }
      const normalized = barSum / step / 255
      bars.push(normalized)
      sum += normalized
    }

    const avg = sum / barCount
    setAmplitude(avg)
    setWaveformData(bars)

    const now = Date.now()
    const isVoice = avg > VOICE_THRESHOLD

    if (isVoice) {
      silenceCountRef.current = 0
      if (!voiceActiveRef.current) {
        voiceActiveRef.current = true
        timingRef.current.voiceStart = now

        if (timingRef.current.buttonPressStart) {
          timingRef.current.responseDelay =
            (now - timingRef.current.buttonPressStart) / 1000
        }
      }
      timingRef.current.voiceEnd = now
    } else if (voiceActiveRef.current) {
      silenceCountRef.current++
      if (silenceCountRef.current >= SILENCE_FRAMES) {
        voiceActiveRef.current = false
        if (timingRef.current.voiceStart && timingRef.current.voiceEnd) {
          timingRef.current.voiceDuration =
            (timingRef.current.voiceEnd - timingRef.current.voiceStart) / 1000
        }
        timingRef.current.holdMismatch = computeHoldMismatch()
        setTiming({ ...timingRef.current })
      }
    }

    animationRef.current = requestAnimationFrame(analyze)
  }, [computeHoldMismatch])

  const startAnalyzer = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      const ctx = new AudioContext()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.4
      source.connect(analyser)
      analyserRef.current = analyser

      sessionStartRef.current = Date.now()
      setIsReady(true)
      analyze()
      return true
    } catch {
      setIsReady(false)
      return false
    }
  }, [analyze])

  const stopAnalyzer = useCallback(() => {
    cancelAnimationFrame(animationRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    setIsReady(false)
  }, [])

  const onButtonPress = useCallback(() => {
    const now = Date.now()
    isButtonPressedRef.current = true
    setIsButtonPressed(true)
    timingRef.current.buttonPressStart = now
    voiceActiveRef.current = false
    silenceCountRef.current = 0
    timingRef.current.voiceStart = null
    timingRef.current.voiceEnd = null
    timingRef.current.voiceDuration = null
    timingRef.current.responseDelay = null
    timingRef.current.holdMismatch = 0
  }, [])

  const onButtonRelease = useCallback(() => {
    const now = Date.now()
    isButtonPressedRef.current = false
    setIsButtonPressed(false)
    timingRef.current.buttonPressEnd = now

    if (timingRef.current.voiceStart && timingRef.current.voiceEnd) {
      timingRef.current.voiceDuration =
        (timingRef.current.voiceEnd - timingRef.current.voiceStart) / 1000
    }
    timingRef.current.holdMismatch = computeHoldMismatch()
    setTiming({ ...timingRef.current })
  }, [computeHoldMismatch])

  const resetTiming = useCallback(() => {
    timingRef.current = { ...EMPTY_TIMING }
    voiceActiveRef.current = false
    silenceCountRef.current = 0
    setTiming({ ...EMPTY_TIMING })
  }, [])

  useEffect(() => {
    return () => {
      stopAnalyzer()
    }
  }, [stopAnalyzer])

  const getTiming = useCallback(() => ({ ...timingRef.current }), [])

  return {
    isReady,
    isButtonPressed,
    amplitude,
    waveformData,
    timing,
    startAnalyzer,
    stopAnalyzer,
    onButtonPress,
    onButtonRelease,
    resetTiming,
    getTiming,
  }
}
