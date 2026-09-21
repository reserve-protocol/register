import { useLayoutEffect, useState, type RefObject } from 'react'

export const AXIS_LABEL_GAP = 16
export const AXIS_TICK_MARGIN = 8
const MIN_AXIS_WIDTH = 32
const INITIAL_AXIS_WIDTH = 55

export function fitAxisWidth(
  labels: string[],
  measure: (label: string) => number
) {
  const widestLabel = Math.max(0, ...labels.map(measure))
  return Math.max(MIN_AXIS_WIDTH, Math.ceil(widestLabel + AXIS_LABEL_GAP))
}

export function measureDisplayedAxisWidth(root: ParentNode) {
  const widths = Array.from(
    root.querySelectorAll<SVGTextElement>('.recharts-yAxis text'),
    (label) => label.getBBox().width
  )
  return Math.max(
    MIN_AXIS_WIDTH,
    Math.ceil(Math.max(0, ...widths) + AXIS_LABEL_GAP)
  )
}

export function useAxisWidth(
  rootRef: RefObject<HTMLElement | null>,
  measurementKey: string
) {
  const [axisWidth, setAxisWidth] = useState(INITIAL_AXIS_WIDTH)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    let isCurrent = true
    let frame = 0
    const measure = () => {
      if (!isCurrent || !root.querySelector('.recharts-yAxis text')) return
      const nextWidth = measureDisplayedAxisWidth(root)
      setAxisWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth
      )
    }
    const scheduleMeasure = () => {
      if (!isCurrent) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(root)
    scheduleMeasure()
    void document.fonts.ready.then(scheduleMeasure)
    return () => {
      isCurrent = false
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [measurementKey, rootRef])

  return axisWidth
}
