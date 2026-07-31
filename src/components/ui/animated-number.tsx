import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 1200

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

// Tweens toward the new value on change (no animation on first render) and
// renders formatter(current). tabular-nums keeps digits from shifting layout.
export const AnimatedNumber = ({
  value,
  formatter = String,
  className,
}: {
  value: number
  formatter?: (value: number) => string
  className?: string
}) => {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    const from = fromRef.current
    if (from === value || !isFinite(value) || !isFinite(from)) {
      fromRef.current = value
      setDisplay(value)
      return
    }

    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1)
      if (progress < 1) {
        setDisplay(from + (value - from) * easeOutCubic(progress))
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(value)
        fromRef.current = value
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      fromRef.current = value
    }
  }, [value])

  return <span className={cn('tabular-nums', className)}>{formatter(display)}</span>
}

// String variant for exact on-chain amounts (drawer quotes): tweens a numeric
// approximation while animating, then snaps to the exact full-precision string
// so no precision is lost at rest.
//
// Animates ONLY a refreshed quote for the SAME input (background refetch).
// A quote for a new input — signalled by `isStale` (placeholderData) flipping
// through true — snaps immediately: skeleton/dim → value, no tween.
export const useAnimatedAmount = (value: string, isStale = false): string => {
  const [display, setDisplay] = useState(value)
  const prevValue = useRef(value)
  const prevStale = useRef(isStale)

  useEffect(() => {
    const from = Number(prevValue.current)
    const target = Number(value)
    const cameFromStale = prevStale.current && !isStale
    prevStale.current = isStale

    if (prevValue.current === value) return
    const previous = prevValue.current
    prevValue.current = value

    const shouldAnimate =
      !isStale &&
      !cameFromStale &&
      previous !== '' &&
      value !== '' &&
      isFinite(from) &&
      isFinite(target) &&
      from !== target

    if (!shouldAnimate) {
      setDisplay(value)
      return
    }

    // Keep the target's full decimal width during the tween — collapsing an
    // 18-decimal quote to fewer digits mid-animation reads as a glitch. The
    // tail digits are interpolation noise until the final exact-string snap.
    const decimals = value.split('.')[1]?.length ?? 0
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1)
      if (progress < 1) {
        setDisplay(
          (from + (target - from) * easeOutCubic(progress)).toFixed(decimals)
        )
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(value)
      }
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [value, isStale])

  return display
}
