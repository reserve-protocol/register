import { useEffect, useRef, useState, type RefObject } from 'react'
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

/**
 * Drives a continuous animation by calling `onFrame(elapsedMs)` on every frame
 * WITHOUT going through React state — the consumer applies the values straight
 * to the DOM via refs. This avoids a full React re-render per frame.
 *
 * The loop is gated so it does no per-frame work when it can't be seen:
 * - skipped entirely (single static frame) under `prefers-reduced-motion`
 * - paused while the document is hidden (background tab)
 * - paused while `containerRef` is outside the viewport
 *
 * The elapsed clock keeps advancing in real time while paused, so whenever the
 * animation is visible its phase matches an always-running animation.
 */
export const usePackingAnimationFrame = (
  onFrame: (elapsedMs: number) => void,
  containerRef: RefObject<HTMLElement | null>
) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const onFrameRef = useRef(onFrame)

  useEffect(() => {
    onFrameRef.current = onFrame
  })

  useEffect(() => {
    if (prefersReducedMotion) {
      onFrameRef.current(0)
      return
    }

    let raf = 0
    let start = 0
    let isVisible = true

    const el = containerRef.current
    const observer =
      el && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry.isIntersecting
            },
            { threshold: 0 }
          )
        : undefined
    if (observer && el) observer.observe(el)

    const tick = (timestamp: number) => {
      if (!start) start = timestamp
      if (isVisible && !document.hidden) {
        onFrameRef.current(timestamp - start)
      }
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [prefersReducedMotion, containerRef])
}
