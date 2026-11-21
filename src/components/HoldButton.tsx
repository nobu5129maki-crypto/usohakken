import { useRef, type ReactNode } from 'react'

interface HoldButtonProps {
  className: string
  onPress: () => void
  onRelease: () => void
  children: ReactNode
}

export function HoldButton({ className, onPress, onRelease, children }: HoldButtonProps) {
  const downRef = useRef(false)

  const release = (target: HTMLButtonElement, pointerId: number) => {
    if (!downRef.current) return
    downRef.current = false
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
    onRelease()
  }

  return (
    <button
      type="button"
      className={className}
      onPointerDown={(e) => {
        if (e.button !== 0 || downRef.current) return
        downRef.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        onPress()
      }}
      onPointerUp={(e) => release(e.currentTarget, e.pointerId)}
      onPointerCancel={(e) => release(e.currentTarget, e.pointerId)}
    >
      {children}
    </button>
  )
}
