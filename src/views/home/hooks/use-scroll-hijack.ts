import { useCallback, useEffect, useRef, useState } from 'react'

interface UseScrollHijackOptions {
  threshold?: number // Scroll amount needed to trigger card change
  debounceTime?: number // Debounce scroll events
  onCardChange?: (index: number) => void
  totalCards: number
  enabled?: boolean
}

export const useScrollHijack = ({
  threshold = 100,
  debounceTime = 50,
  onCardChange,
  totalCards,
  enabled = true,
}: UseScrollHijackOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  const goToCard = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(index, totalCards - 1))
      setCurrentIndex(newIndex)
      onCardChange?.(newIndex)
      scrollAccumulator.current = 0
    },
    [totalCards, onCardChange]
  )

  const handleScroll = useCallback(
    (deltaY: number) => {
      if (!enabled || isScrolling) return

      const now = Date.now()
      if (now - lastScrollTime.current < debounceTime) return
      lastScrollTime.current = now

      scrollAccumulator.current += deltaY

      if (Math.abs(scrollAccumulator.current) >= threshold) {
        setIsScrolling(true)

        if (scrollAccumulator.current > 0 && currentIndex < totalCards - 1) {
          // Scrolling down - next card
          goToCard(currentIndex + 1)
        } else if (scrollAccumulator.current < 0 && currentIndex > 0) {
          // Scrolling up - previous card
          goToCard(currentIndex - 1)
        } else {
          scrollAccumulator.current = 0
        }

        // Reset scrolling state after animation
        clearTimeout(scrollTimeout.current)
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false)
        }, 600) // Match this to your animation duration
      }
    },
    [enabled, isScrolling, debounceTime, threshold, currentIndex, totalCards, goToCard]
  )

  // Handle wheel events
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current

    const handleWheel = (e: WheelEvent) => {
      // Always prevent default when scrolling on the container
      e.preventDefault()
      e.stopPropagation()
      handleScroll(e.deltaY)
    }

    // Add the listener directly to the container element
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      clearTimeout(scrollTimeout.current)
    }
  }, [enabled, handleScroll])

  // Handle touch events for mobile
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      touchEndY = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      if (touchStartY && touchEndY) {
        const deltaY = touchStartY - touchEndY
        if (Math.abs(deltaY) > 50) {
          // Minimum swipe distance
          handleScroll(deltaY > 0 ? threshold : -threshold)
        }
        touchStartY = 0
        touchEndY = 0
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleScroll, threshold])

  // Keyboard navigation
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < totalCards - 1) {
        e.preventDefault()
        goToCard(currentIndex + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        goToCard(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, currentIndex, totalCards, goToCard])

  return {
    currentIndex,
    setCurrentIndex: goToCard,
    isScrolling,
    containerRef,
    goToNext: () => goToCard(currentIndex + 1),
    goPrevious: () => goToCard(currentIndex - 1),
  }
}