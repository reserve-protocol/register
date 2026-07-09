import { useEffect, useRef, useState } from 'react'

type UseMeasuredMarqueeOptions = {
  active: boolean
  easeInSeconds: number
  itemCount: number
  pixelsPerSecond: number
}

export const useMeasuredMarquee = ({
  active,
  easeInSeconds,
  itemCount,
  pixelsPerSecond,
}: UseMeasuredMarqueeOptions) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const sequenceRef = useRef<HTMLDivElement>(null)
  const [repeatCount, setRepeatCount] = useState(2)

  useEffect(() => {
    if (!active) return

    let frame = 0
    let startTime = 0
    let sequenceWidth = 0
    let ro: ResizeObserver | undefined

    const measure = () => {
      const viewport = viewportRef.current
      const sequence = sequenceRef.current
      if (!viewport || !sequence) return false

      sequenceWidth = sequence.scrollWidth
      const viewportWidth = viewport.clientWidth

      if (!sequenceWidth || !viewportWidth) return false

      const nextRepeatCount = Math.max(
        2,
        Math.ceil(viewportWidth / sequenceWidth) + 2
      )

      setRepeatCount((current) =>
        current === nextRepeatCount ? current : nextRepeatCount
      )
      viewport.scrollLeft = 0

      if (!ro) {
        ro = new ResizeObserver(() => {
          measure()
          startTime = performance.now()
        })
        ro.observe(viewport)
        ro.observe(sequence)
      }

      return true
    }

    const tick = (time: number) => {
      const viewport = viewportRef.current

      if (!viewport || (!sequenceWidth && !measure())) {
        frame = window.requestAnimationFrame(tick)
        return
      }

      if (!startTime) startTime = time

      const elapsedSeconds = (time - startTime) / 1000
      const easeSeconds = Math.min(elapsedSeconds, easeInSeconds)
      const fullSpeedSeconds = Math.max(0, elapsedSeconds - easeInSeconds)
      const easeProgress = easeSeconds / easeInSeconds
      const easedDistance =
        pixelsPerSecond *
        easeInSeconds *
        ((easeProgress * easeProgress * easeProgress) / 3)
      const fullSpeedDistance = fullSpeedSeconds * pixelsPerSecond

      viewport.scrollLeft = (easedDistance + fullSpeedDistance) % sequenceWidth

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
      ro?.disconnect()
    }
  }, [active, easeInSeconds, itemCount, pixelsPerSecond])

  return {
    repeatCount,
    sequenceRef,
    viewportRef,
  }
}
