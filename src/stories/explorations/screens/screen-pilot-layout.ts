import { useEffect, useRef, useState } from 'react'

export function screenPilotLayout(width: number) {
  const desktop = width >= 1024
  const hasOuterGutters = width >= 640
  const frameWidth = Math.min(1400, width - (hasOuterGutters ? 48 : 0))
  return {
    desktop,
    hasOuterGutters,
    frameWidth,
    destinationCount: frameWidth >= 1200 ? 4 : frameWidth >= 1024 ? 2 : 1,
    hasSupport: frameWidth - 2 - (desktop ? 73 : 0) >= 1249,
  }
}

export function useScreenPilotViewport() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(1440)
  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(() =>
      setViewportWidth(element.getBoundingClientRect().width)
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { viewportRef, viewportWidth, ...screenPilotLayout(viewportWidth) }
}
