import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion'

export const useMeasuredElementWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const setMeasuredWidth = (nextWidth: number) => {
      setWidth((current) => (current === nextWidth ? current : nextWidth))
    }

    setMeasuredWidth(el.getBoundingClientRect().width)

    const ro = new ResizeObserver(([entry]) => {
      setMeasuredWidth(entry.contentRect.width)
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  return { ref, width }
}

export const useRafElapsedTime = () => {
  const [time, setTime] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setTime(0)
      return
    }

    let raf = 0
    let start = 0

    const tick = (timestamp: number) => {
      if (!start) start = timestamp
      setTime(timestamp - start)
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [prefersReducedMotion])

  return time
}
