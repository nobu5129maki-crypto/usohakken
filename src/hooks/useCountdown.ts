import { useEffect, useRef, useState } from 'react'

export function useCountdown(
  initial: number,
  active: boolean,
  onComplete?: () => void,
): number {
  const [count, setCount] = useState(initial)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!active) {
      setCount(initial)
      return
    }

    setCount(initial)
    let current = initial
    const interval = setInterval(() => {
      current -= 1
      if (current <= 0) {
        clearInterval(interval)
        setCount(0)
        onCompleteRef.current?.()
      } else {
        setCount(current)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [active, initial])

  return count
}

export function useProgress(
  durationMs: number,
  active: boolean,
  onComplete?: () => void,
): number {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!active) {
      setProgress(0)
      return
    }

    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        onCompleteRef.current?.()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [active, durationMs])

  return progress
}
