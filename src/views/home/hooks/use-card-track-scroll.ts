import { useEffect, useRef, useState } from 'react'

export const useCardTrackScroll = <
  TViewport extends HTMLElement,
  TTrack extends HTMLElement,
>(
  onScrollDistanceChange: (distance: number) => void
) => {
  const viewportRef = useRef<TViewport>(null)
  const trackRef = useRef<TTrack>(null)
  const [scrollDistance, setScrollDistance] = useState(0)
  const lastReportedDistanceRef = useRef<number | null>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    let rafId = 0
    const update = () => {
      const distance = Math.max(0, track.scrollHeight - viewport.clientHeight)
      setScrollDistance((current) =>
        current === distance ? current : distance
      )

      if (lastReportedDistanceRef.current !== distance) {
        lastReportedDistanceRef.current = distance
        onScrollDistanceChange(distance)
      }
    }
    const scheduleUpdate = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        update()
      })
    }

    update()

    const ro = new ResizeObserver(scheduleUpdate)
    ro.observe(viewport)
    ro.observe(track)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [onScrollDistanceChange])

  return { scrollDistance, trackRef, viewportRef }
}
