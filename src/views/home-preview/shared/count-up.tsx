import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './use-reduced-motion'

const CountUp = ({
  value,
  format,
  duration = 1400,
}: {
  value: number
  format: (v: number) => string
  duration?: number
}) => {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced || !ref.current) {
      setShown(value)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          setShown(value * (1 - Math.pow(1 - t, 3)))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    io.observe(ref.current)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {format(shown)}
    </span>
  )
}

export default CountUp
