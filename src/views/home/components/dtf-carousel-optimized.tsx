import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Constants extracted for maintainability
const CAROUSEL_CONFIG = {
  HEADER_HEIGHT: 72,
  CARD_HEIGHT: 720,
  CARD_OFFSET: 20,
  SCALE_FACTOR: 0.05,
  SCROLL_THRESHOLD: 50,
  TRANSITION_DURATION: 500,
  APPROACH_DISTANCE: 300,
  DEACTIVATION_THRESHOLD: 150,
  SMOOTH_SCROLL_DURATION: 400,
  MAX_VISIBLE_CARDS: 3,
  BOUNDARY_RELEASE_DELAY: 500,
} as const

interface DTFCarouselOptimizedProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// Custom hook for carousel state management
const useCarouselState = () => {
  const stateRef = useRef({
    scrollAccumulator: 0,
    lastScrollTime: Date.now(),
    isScrollbarDragging: false,
    isTransitioning: false,
    isApproaching: false,
    isPositioning: false,
    isTryingToScrollPastBoundary: false,
    lockedScrollPosition: null as number | null,
  })

  const timeoutsRef = useRef({
    transition: null as NodeJS.Timeout | null,
    alignment: null as NodeJS.Timeout | null,
    boundaryRelease: null as NodeJS.Timeout | null,
  })

  // Cleanup function for all timeouts
  const cleanupTimeouts = useCallback(() => {
    Object.values(timeoutsRef.current).forEach((timeout) => {
      if (timeout) clearTimeout(timeout)
    })
  }, [])

  return { stateRef, timeoutsRef, cleanupTimeouts }
}

// Custom hook for app container reference (cached)
const useAppContainer = () => {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    containerRef.current = document.getElementById('app-container')
  }, [])

  return containerRef.current
}

// Custom hook for viewport height
const useViewportHeight = () => {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerHeight - CAROUSEL_CONFIG.HEADER_HEIGHT)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return height
}

const DTFCarouselOptimized = ({
  dtfs,
  isLoading,
}: DTFCarouselOptimizedProps) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCarouselActive, setIsCarouselActive] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  )

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { stateRef, timeoutsRef, cleanupTimeouts } = useCarouselState()
  const appContainer = useAppContainer()
  const viewportHeight = useViewportHeight()

  // Computed values
  const totalCards = dtfs.length

  // Create refs for current values to avoid stale closures
  const activeStateRef = useRef({ isCarouselActive, currentIndex })
  useEffect(() => {
    activeStateRef.current = { isCarouselActive, currentIndex }
  }, [isCarouselActive, currentIndex])

  // Track last scroll position for direction detection
  const lastScrollPositionRef = useRef(0)

  // Optimized scroll handler with asymmetric approach detection
  useEffect(() => {
    if (!appContainer) return

    const handleScroll = () => {
      if (!wrapperRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const state = stateRef.current
      const { isCarouselActive: isActive, currentIndex: currentIdx } =
        activeStateRef.current

      // Detect scroll direction
      const currentScrollTop = appContainer.scrollTop
      const isScrollingDown = currentScrollTop > lastScrollPositionRef.current
      const isScrollingUp = currentScrollTop < lastScrollPositionRef.current
      lastScrollPositionRef.current = currentScrollTop

      // Position checks
      const carouselIsBelowViewport = rect.top > CAROUSEL_CONFIG.HEADER_HEIGHT // Carousel is below current view
      const carouselIsAboveViewport = rect.bottom < 0 // Carousel is completely above the viewport

      // Different strategies for different approach directions
      const isNearingFromBottom =
        rect.bottom > window.innerHeight - CAROUSEL_CONFIG.APPROACH_DISTANCE &&
        rect.bottom < window.innerHeight + 100

      if (!isActive && !state.isPositioning) {
        // IMMEDIATE capture when scrolling down AND carousel is below current position
        if (
          carouselIsBelowViewport &&
          isScrollingDown &&
          !state.isApproaching
        ) {
          state.isApproaching = true
          state.isPositioning = true

          // Set index IMMEDIATELY to prevent flicker during transition
          setCurrentIndex(0)

          const perfectPosition =
            appContainer.scrollTop + (rect.top - CAROUSEL_CONFIG.HEADER_HEIGHT)

          // Lock position for scroll prevention
          state.lockedScrollPosition = perfectPosition

          // Disable scrolling completely during transition
          appContainer.style.overflow = 'hidden'
          document.body.style.overflow = 'hidden'

          // Cancel any ongoing scroll momentum
          appContainer.scrollTop = currentScrollTop

          // Use multiple rAF to ensure all scroll momentum is cancelled
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Re-enable scroll but keep it locked
              appContainer.style.overflow = ''

              // Now do smooth scroll after ensuring previous scroll is cancelled
              appContainer.scrollTo({
                top: perfectPosition,
                behavior: 'smooth',
              })

              setTimeout(() => {
                setIsCarouselActive(true)
                state.isPositioning = false
                document.body.style.overflow = ''
                // Index already set above, no need to set again
              }, CAROUSEL_CONFIG.SMOOTH_SCROLL_DURATION)
            })
          })
        }
        // THRESHOLD-based capture from bottom (existing behavior)
        else if (isNearingFromBottom && isScrollingUp && !state.isApproaching) {
          state.isApproaching = true
          state.isPositioning = true

          // Set index IMMEDIATELY to prevent flicker during transition
          setCurrentIndex(totalCards - 1)

          const perfectPosition =
            appContainer.scrollTop + (rect.top - CAROUSEL_CONFIG.HEADER_HEIGHT)
          state.lockedScrollPosition = perfectPosition

          // Disable scrolling completely during transition
          appContainer.style.overflow = 'hidden'
          document.body.style.overflow = 'hidden'

          // Cancel any ongoing scroll momentum
          appContainer.scrollTop = currentScrollTop

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Re-enable scroll but keep it locked
              appContainer.style.overflow = ''

              appContainer.scrollTo({
                top: perfectPosition,
                behavior: 'smooth',
              })

              setTimeout(() => {
                setIsCarouselActive(true)
                state.isPositioning = false
                document.body.style.overflow = ''
                // Index already set above, no need to set again
              }, CAROUSEL_CONFIG.SMOOTH_SCROLL_DURATION)
            })
          })
        }
      } else if (isActive) {
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        if (
          (atFirstCard &&
            rect.top >
              CAROUSEL_CONFIG.HEADER_HEIGHT +
                CAROUSEL_CONFIG.DEACTIVATION_THRESHOLD) ||
          (atLastCard &&
            rect.bottom <
              window.innerHeight - CAROUSEL_CONFIG.DEACTIVATION_THRESHOLD)
        ) {
          setIsCarouselActive(false)
          state.isApproaching = false
          state.lockedScrollPosition = null
          state.scrollAccumulator = 0
          document.body.style.overflow = ''
        }
      }

      // Reset approach flag if scrolled away
      if (
        (carouselIsAboveViewport ||
          (carouselIsBelowViewport && !isScrollingDown)) &&
        !isActive
      ) {
        state.isApproaching = false
      }
    }

    appContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => appContainer.removeEventListener('scroll', handleScroll)
  }, [appContainer, stateRef, totalCards])

  // Optimized scroll lock - more aggressive during carousel active state
  useEffect(() => {
    if (!appContainer) return

    const lockScroll = (e: Event) => {
      const state = stateRef.current

      // During positioning, completely prevent scroll
      if (state.isPositioning && state.lockedScrollPosition !== null) {
        appContainer.scrollTop = state.lockedScrollPosition
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (state.lockedScrollPosition === null) return

      const { isCarouselActive: isActive, currentIndex: currentIdx } =
        activeStateRef.current

      if (isActive && state.lockedScrollPosition !== null) {
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1
        const currentScroll = appContainer.scrollTop
        const isScrollingUp = currentScroll < state.lockedScrollPosition
        const isScrollingDown = currentScroll > state.lockedScrollPosition

        // Allow scrolling out of bounds
        if (
          (atFirstCard && isScrollingUp) ||
          (atLastCard && isScrollingDown)
        ) {
          return
        }

        // Lock to position for any other scroll attempts
        if (currentScroll !== state.lockedScrollPosition) {
          appContainer.scrollTop = state.lockedScrollPosition
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }

    // Use capture phase for earlier interception
    appContainer.addEventListener('scroll', lockScroll, { capture: true })
    return () => appContainer.removeEventListener('scroll', lockScroll, { capture: true })
  }, [appContainer, stateRef, totalCards])

  // Optimized wheel handler (single listener)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const state = stateRef.current
      const { isCarouselActive: isActive, currentIndex: currentIdx } =
        activeStateRef.current

      if (state.isPositioning) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (!isActive || state.isScrollbarDragging) return

      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0
      const atFirstCard = currentIdx === 0
      const atLastCard = currentIdx === totalCards - 1

      if ((atFirstCard && scrollingUp) || (atLastCard && scrollingDown)) {
        if (!state.isTryingToScrollPastBoundary) {
          state.isTryingToScrollPastBoundary = true
          e.preventDefault()
          e.stopPropagation()

          if (timeoutsRef.current.boundaryRelease) {
            clearTimeout(timeoutsRef.current.boundaryRelease)
          }
          timeoutsRef.current.boundaryRelease = setTimeout(() => {
            state.isTryingToScrollPastBoundary = false
          }, CAROUSEL_CONFIG.BOUNDARY_RELEASE_DELAY)
          return
        }
        return
      } else {
        state.isTryingToScrollPastBoundary = false
        if (timeoutsRef.current.boundaryRelease) {
          clearTimeout(timeoutsRef.current.boundaryRelease)
          timeoutsRef.current.boundaryRelease = null
        }
      }

      e.preventDefault()
      e.stopPropagation()

      const currentTime = Date.now()
      if (currentTime - state.lastScrollTime > 500) {
        state.scrollAccumulator = 0
      }
      state.lastScrollTime = currentTime

      if (!state.isTransitioning) {
        state.scrollAccumulator += e.deltaY

        if (
          Math.abs(state.scrollAccumulator) >= CAROUSEL_CONFIG.SCROLL_THRESHOLD
        ) {
          if (scrollingDown && currentIdx < totalCards - 1) {
            state.isTransitioning = true
            setScrollDirection('down')
            setCurrentIndex((prev) => prev + 1)
            state.scrollAccumulator = 0

            if (timeoutsRef.current.transition)
              clearTimeout(timeoutsRef.current.transition)
            timeoutsRef.current.transition = setTimeout(() => {
              state.isTransitioning = false
              setScrollDirection(null)
            }, CAROUSEL_CONFIG.TRANSITION_DURATION)
          } else if (scrollingUp && currentIdx > 0) {
            state.isTransitioning = true
            setScrollDirection('up')
            setCurrentIndex((prev) => prev - 1)
            state.scrollAccumulator = 0

            if (timeoutsRef.current.transition)
              clearTimeout(timeoutsRef.current.transition)
            timeoutsRef.current.transition = setTimeout(() => {
              state.isTransitioning = false
              setScrollDirection(null)
            }, CAROUSEL_CONFIG.TRANSITION_DURATION)
          }
        }
      }
    }

    window.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    })
    return () =>
      window.removeEventListener('wheel', handleWheel, { capture: true })
  }, [stateRef, timeoutsRef, totalCards])

  // Scrollbar detection
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const scrollbarWidth = windowWidth - document.documentElement.clientWidth

      if (e.clientX >= windowWidth - scrollbarWidth - 20) {
        stateRef.current.isScrollbarDragging = true
      }
    }

    const handleMouseUp = () => {
      stateRef.current.isScrollbarDragging = false
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [stateRef])

  // Manual navigation
  const goToCard = useCallback(
    (index: number) => {
      const state = stateRef.current
      if (index >= 0 && index < totalCards && !state.isTransitioning) {
        state.isTransitioning = true
        setScrollDirection(index > currentIndex ? 'down' : 'up')
        setCurrentIndex(index)

        if (timeoutsRef.current.transition)
          clearTimeout(timeoutsRef.current.transition)
        timeoutsRef.current.transition = setTimeout(() => {
          state.isTransitioning = false
          setScrollDirection(null)
        }, CAROUSEL_CONFIG.TRANSITION_DURATION)
      }
    },
    [currentIndex, stateRef, timeoutsRef, totalCards]
  )

  // Touch scrolling prevention during carousel active state
  useEffect(() => {
    if (!isCarouselActive) return

    const handleTouchMove = (e: TouchEvent) => {
      const state = stateRef.current
      const { currentIndex: currentIdx } = activeStateRef.current

      // During positioning or transitioning, prevent all touch scrolling
      if (state.isPositioning || state.isTransitioning) {
        e.preventDefault()
        return
      }

      // When carousel is active, only allow scrolling at boundaries
      const atFirstCard = currentIdx === 0
      const atLastCard = currentIdx === totalCards - 1

      // Get touch direction (simplified)
      const touch = e.touches[0]
      if (!touch) return

      // We could track touch start position for better direction detection
      // For now, just prevent touch scrolling when not at boundaries
      if (!atFirstCard && !atLastCard) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', handleTouchMove)
  }, [isCarouselActive, stateRef, totalCards])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselActive || stateRef.current.isTransitioning) return

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
  }, [isCarouselActive, currentIndex, totalCards, goToCard, stateRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimeouts()
      // Reset any overflow styles on unmount
      document.body.style.overflow = ''
      if (appContainer) {
        appContainer.style.overflow = ''
      }
    }
  }, [cleanupTimeouts, appContainer])

  // Preload images
  useEffect(() => {
    const images = dtfs
      .map((dtf) => dtf?.brand?.cover)
      .filter(Boolean)
      .map((src) => {
        const img = new Image()
        img.src = src
        return img
      })

    return () => {
      // Clear image references
      images.length = 0
    }
  }, [dtfs])

  // Memoized card render data
  const cardsRenderData = useMemo(() => {
    return dtfs.map((dtf, index) => {
      const relativePosition = index - currentIndex
      const isTopCard = relativePosition === 0
      const isInStack =
        relativePosition >= 0 &&
        relativePosition <= CAROUSEL_CONFIG.MAX_VISIBLE_CARDS
      const isPastStack = relativePosition > CAROUSEL_CONFIG.MAX_VISIBLE_CARDS

      const yOffset =
        relativePosition < 0
          ? 800
          : isPastStack
            ? CAROUSEL_CONFIG.MAX_VISIBLE_CARDS * CAROUSEL_CONFIG.CARD_OFFSET
            : relativePosition * CAROUSEL_CONFIG.CARD_OFFSET

      const scaleValue =
        relativePosition < 0
          ? 0.85
          : isPastStack
            ? 1 -
              CAROUSEL_CONFIG.MAX_VISIBLE_CARDS * CAROUSEL_CONFIG.SCALE_FACTOR
            : 1 - relativePosition * CAROUSEL_CONFIG.SCALE_FACTOR

      const zIndexValue = totalCards - relativePosition
      const opacityValue = relativePosition < 0 ? 0 : isPastStack ? 0 : 1

      return {
        dtf,
        key: dtf.address,
        isTopCard,
        yOffset,
        scaleValue,
        zIndexValue,
        opacityValue,
      }
    })
  }, [dtfs, currentIndex, totalCards])

  // Early return for empty state
  if (!dtfs || dtfs.length === 0) {
    return <div style={{ height: `${viewportHeight || 800}px` }} />
  }

  return (
    <section className="relative">
      <div
        ref={wrapperRef}
        className="relative w-full bg-primary"
        style={{
          height: `${viewportHeight || 800}px`,
          minHeight: `${viewportHeight || 800}px`,
          contain: 'layout style paint',
          willChange: isCarouselActive ? 'contents' : 'auto',
          isolation: 'isolate',
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{
              height: `${CAROUSEL_CONFIG.CARD_HEIGHT}px`,
              contain: 'layout',
            }}
          >
            <div
              className="relative"
              style={{
                width: '100%',
                height: `${CAROUSEL_CONFIG.CARD_HEIGHT}px`,
                contain: 'layout style',
              }}
            >
              {cardsRenderData.map(
                ({
                  dtf,
                  key,
                  isTopCard,
                  yOffset,
                  scaleValue,
                  zIndexValue,
                  opacityValue,
                }) => (
                  <motion.div
                    key={key}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      y: yOffset,
                      scale: scaleValue,
                      opacity: opacityValue,
                    }}
                    transition={{
                      y: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        mass: 1,
                      },
                      scale: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        mass: 1,
                      },
                      opacity: { duration: 0.2, ease: 'easeInOut' },
                    }}
                    style={{
                      transformOrigin: 'bottom center',
                      pointerEvents: isTopCard ? 'auto' : 'none',
                      willChange: isTopCard ? 'transform' : 'auto',
                      zIndex: zIndexValue,
                    }}
                  >
                    <DTFHomeCardFixed dtf={dtf} />
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {isCarouselActive && currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-50"
            >
              <div className="text-xs text-muted-foreground mb-2">
                Scroll to explore
              </div>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown size={20} className="text-muted-foreground" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation dots */}
        {isCarouselActive && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
            {dtfs.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default DTFCarouselOptimized
