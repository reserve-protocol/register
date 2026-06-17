import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

const STATS_HIDE_SCROLL_THRESHOLD = 48
const SCROLLER_ID = 'app-container'

const setChangedNumber =
  (setter: (updater: (current: number) => number) => void) =>
  (next: number) => {
    setter((current) => (current === next ? current : next))
  }

export const useHomepageHeroScroll = (isWideDesktop: boolean) => {
  const stageRef = useRef<HTMLDivElement>(null)
  const scrollDistanceRef = useRef(0)
  const [scrollDistance, setScrollDistance] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [mobileScrollOffset, setMobileScrollOffset] = useState(0)

  const setDesktopOffset = useMemo(() => setChangedNumber(setScrollOffset), [])
  const setMobileOffset = useMemo(
    () => setChangedNumber(setMobileScrollOffset),
    []
  )

  const updateDesktopScrollOffset = useCallback(() => {
    if (!isWideDesktop) {
      setDesktopOffset(0)
      return
    }

    const scroller = document.getElementById(SCROLLER_ID)
    const stage = stageRef.current
    if (!scroller || !stage) return

    const scrollerTop = scroller.getBoundingClientRect().top
    const stageTop = stage.getBoundingClientRect().top
    const progress = scrollerTop - stageTop
    const nextOffset = Math.max(
      0,
      Math.min(scrollDistanceRef.current, progress)
    )

    setDesktopOffset(nextOffset)
  }, [isWideDesktop, setDesktopOffset])

  useEffect(() => {
    if (!isWideDesktop) {
      setDesktopOffset(0)
      return
    }

    const scroller = document.getElementById(SCROLLER_ID)
    if (!scroller) return

    let rafId = 0
    const scheduleUpdate = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        updateDesktopScrollOffset()
      })
    }

    scheduleUpdate()
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      scroller.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [isWideDesktop, setDesktopOffset, updateDesktopScrollOffset])

  useEffect(() => {
    if (isWideDesktop) updateDesktopScrollOffset()
  }, [isWideDesktop, scrollDistance, updateDesktopScrollOffset])

  useEffect(() => {
    if (isWideDesktop) {
      setMobileOffset(0)
      return
    }

    const scroller = document.getElementById(SCROLLER_ID)
    if (!scroller) return

    let rafId = 0
    const update = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        setMobileOffset(scroller.scrollTop)
      })
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      scroller.removeEventListener('scroll', update)
    }
  }, [isWideDesktop, setMobileOffset])

  const handleScrollDistanceChange = useCallback((distance: number) => {
    scrollDistanceRef.current = distance
    setScrollDistance((currentDistance) =>
      currentDistance === distance ? currentDistance : distance
    )
  }, [])

  const stageStyle = useMemo(
    () =>
      ({
        '--highlighted-scroll-distance': `${scrollDistance}px`,
      }) as CSSProperties,
    [scrollDistance]
  )

  const isStatsHidden = isWideDesktop
    ? scrollOffset > STATS_HIDE_SCROLL_THRESHOLD
    : mobileScrollOffset > STATS_HIDE_SCROLL_THRESHOLD

  return {
    stageRef,
    scrollOffset,
    stageStyle,
    isStatsHidden,
    handleScrollDistanceChange,
  }
}
