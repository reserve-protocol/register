import { useRef, useState, useCallback } from 'react'

interface CarouselConfig {
  totalCards: number
  transitionDuration: number
  scrollThreshold: number
}

/**
 * Manages carousel state and navigation logic
 * Handles index tracking, transitions, and scroll accumulation
 */
export function useCarouselState({ totalCards, transitionDuration, scrollThreshold }: CarouselConfig) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)

  // Refs for managing transition state
  const isTransitioning = useRef(false)
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(Date.now())

  // Refs for maintaining state across renders
  const currentIndexRef = useRef(0)
  const isActiveRef = useRef(false)

  // Update refs when state changes
  currentIndexRef.current = currentIndex
  isActiveRef.current = isActive

  /**
   * Navigate to a specific card with animation
   */
  const goToCard = useCallback((index: number) => {
    if (index < 0 || index >= totalCards || isTransitioning.current) {
      return false
    }

    isTransitioning.current = true
    setScrollDirection(index > currentIndexRef.current ? 'down' : 'up')
    setCurrentIndex(index)

    // Clear any existing timeout
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current)
    }

    // Reset after transition completes
    transitionTimeout.current = setTimeout(() => {
      isTransitioning.current = false
      setScrollDirection(null)
    }, transitionDuration)

    return true
  }, [totalCards, transitionDuration])

  /**
   * Process scroll input and trigger navigation
   */
  const handleScrollInput = useCallback((deltaY: number): boolean => {
    if (isTransitioning.current) return false

    // Reset accumulator if too much time has passed
    const currentTime = Date.now()
    if (currentTime - lastScrollTime.current > 500) {
      scrollAccumulator.current = 0
    }
    lastScrollTime.current = currentTime

    // Accumulate scroll
    scrollAccumulator.current += deltaY

    // Check if we've scrolled enough to trigger navigation
    if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
      const scrollingDown = scrollAccumulator.current > 0
      const newIndex = scrollingDown ? currentIndexRef.current + 1 : currentIndexRef.current - 1

      if (newIndex >= 0 && newIndex < totalCards) {
        // SET TRANSITION FLAG IMMEDIATELY to prevent race condition
        // This prevents multiple rapid events (touchpad) from triggering multiple navigations
        isTransitioning.current = true

        scrollAccumulator.current = 0
        setScrollDirection(scrollingDown ? 'down' : 'up')
        setCurrentIndex(newIndex)

        // Clear any existing timeout
        if (transitionTimeout.current) {
          clearTimeout(transitionTimeout.current)
        }

        // Reset after transition completes
        transitionTimeout.current = setTimeout(() => {
          isTransitioning.current = false
          setScrollDirection(null)
        }, transitionDuration)

        return true
      }
    }

    return false
  }, [scrollThreshold, totalCards, transitionDuration])

  /**
   * Reset scroll accumulator
   */
  const resetScroll = useCallback(() => {
    scrollAccumulator.current = 0
  }, [])

  /**
   * Cleanup function for unmount
   */
  const cleanup = useCallback(() => {
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current)
    }
  }, [])

  return {
    // State
    currentIndex,
    isActive,
    scrollDirection,

    // Refs for direct access
    currentIndexRef,
    isActiveRef,
    isTransitioning,

    // Actions
    setCurrentIndex,
    setIsActive,
    goToCard,
    handleScrollInput,
    resetScroll,
    cleanup,
  }
}