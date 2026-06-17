import { useEffect, useRef, useState } from 'react'

const setChangedBoolean =
  (setter: (updater: (current: boolean) => boolean) => void) =>
  (next: boolean) => {
    setter((current) => (current === next ? current : next))
  }

const setChangedNumber =
  (setter: (updater: (current: number) => number) => void) =>
  (next: number) => {
    setter((current) => (current === next ? current : next))
  }

export type AssetTickerTransitionState = 'idle' | 'exiting' | 'entering'

export const useHighlightedCardVisibility = <T extends HTMLElement>(
  isDesktop: boolean
) => {
  const cardRef = useRef<T>(null)
  const [isAssetTickerVisible, setIsAssetTickerVisible] = useState(false)
  const [isCardInView, setIsCardInView] = useState(false)

  useEffect(() => {
    const setTickerVisible = setChangedBoolean(setIsAssetTickerVisible)
    const setCardInView = setChangedBoolean(setIsCardInView)

    if (isDesktop) {
      setTickerVisible(false)
      setCardInView(false)
      return
    }

    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isMostlyInView = entry.intersectionRatio >= 0.85
        setTickerVisible(isMostlyInView)
        setCardInView(isMostlyInView)
      },
      { threshold: [0, 0.85] }
    )

    observer.observe(card)

    return () => observer.disconnect()
  }, [isDesktop])

  return {
    cardRef,
    isAssetTickerVisible,
    isCardInView,
  }
}

export const useAssetTickerTransition = <TValue>({
  enterMs,
  exitMs,
  value,
  versionKey,
}: {
  enterMs: number
  exitMs: number
  value: TValue
  versionKey: string
}) => {
  const [displayedValue, setDisplayedValue] = useState(value)
  const [displayedVersionKey, setDisplayedVersionKey] = useState(versionKey)
  const [transitionState, setTransitionState] =
    useState<AssetTickerTransitionState>('idle')
  const previousVersionKeyRef = useRef(versionKey)

  useEffect(() => {
    if (previousVersionKeyRef.current === versionKey) return

    previousVersionKeyRef.current = versionKey
    setTransitionState('exiting')

    const swapTimeout = window.setTimeout(() => {
      setDisplayedValue(value)
      setDisplayedVersionKey(versionKey)
      setTransitionState('entering')
    }, exitMs)

    const settleTimeout = window.setTimeout(() => {
      setTransitionState('idle')
    }, exitMs + enterMs)

    return () => {
      window.clearTimeout(swapTimeout)
      window.clearTimeout(settleTimeout)
    }
  }, [enterMs, exitMs, value, versionKey])

  return {
    displayedValue,
    displayedVersionKey,
    transitionState,
  }
}

export const useTranscriptPlayback = ({
  active,
  enabled,
  wordCount,
  wordDelayMs,
}: {
  active: boolean
  enabled: boolean
  wordCount: number
  wordDelayMs: number
}) => {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [highlightedWords, setHighlightedWords] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const shouldPlay = enabled && active

  useEffect(() => {
    const setScrollOffsetIfChanged = setChangedNumber(setScrollOffset)

    if (!shouldPlay) {
      setHighlightedWords(0)
      setScrollOffsetIfChanged(0)
      return
    }

    setHighlightedWords(0)
    const interval = window.setInterval(() => {
      setHighlightedWords((count) => Math.min(count + 1, wordCount))
    }, wordDelayMs)

    return () => window.clearInterval(interval)
  }, [shouldPlay, wordCount, wordDelayMs])

  useEffect(() => {
    const setScrollOffsetIfChanged = setChangedNumber(setScrollOffset)

    if (!shouldPlay || highlightedWords === 0) {
      setScrollOffsetIfChanged(0)
      return
    }

    const activeWord =
      wordRefs.current[Math.min(highlightedWords - 1, wordCount - 1)]

    if (!activeWord) return

    const rowTops = Array.from(
      new Set(
        wordRefs.current
          .filter(Boolean)
          .map((node) => Math.round(node!.offsetTop))
      )
    ).sort((a, b) => a - b)
    const activeTop = Math.round(activeWord.offsetTop)
    const activeRowIndex = rowTops.findIndex((top) => top === activeTop)

    if (activeRowIndex < 2) {
      setScrollOffsetIfChanged(0)
      return
    }

    setScrollOffsetIfChanged(rowTops[activeRowIndex - 1] ?? 0)
  }, [highlightedWords, shouldPlay, wordCount])

  return {
    highlightedWords,
    transcriptScrollOffset: scrollOffset,
    transcriptWordRefs: wordRefs,
  }
}

export const useHighlightedScrollMetrics = <
  TViewport extends HTMLElement,
  TTrack extends HTMLElement,
>({
  isLoading,
  itemCount,
  onScrollDistanceChange,
}: {
  isLoading: boolean
  itemCount: number
  onScrollDistanceChange?: (distance: number) => void
}) => {
  const viewportRef = useRef<TViewport>(null)
  const trackRef = useRef<TTrack>(null)
  const [scrollDistance, setScrollDistance] = useState(0)
  const lastReportedDistanceRef = useRef<number | null>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track || !onScrollDistanceChange) return

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
  }, [itemCount, isLoading, onScrollDistanceChange])

  return {
    scrollDistance,
    trackRef,
    viewportRef,
  }
}
