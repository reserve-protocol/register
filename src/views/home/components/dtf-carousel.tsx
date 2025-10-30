import { useCallback, useEffect, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import DTFHomeCardFixed from './dtf-home-card-fixed'

// Custom hooks
import { useCarouselState } from './hooks/use-carousel-state'
import { useLenisScroll } from './hooks/use-lenis-scroll'
import {
  useCarouselActivation,
  shouldActivateCarousel,
  shouldDeactivateCarousel,
  scrollToCarousel
} from './hooks/use-carousel-activation'
import { useScrollbarDetection } from './hooks/use-scrollbar-detection'

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  // Layout
  HEADER_HEIGHT: 72,
  CARD_HEIGHT: 720,
  CARD_OFFSET: 20,          // Vertical spacing between stacked cards
  SCALE_FACTOR: 0.05,        // Scale reduction per card in stack
  MAX_STACK_DEPTH: 3,        // Maximum visible cards in stack

  // Interaction
  SCROLL_THRESHOLD: 50,      // Scroll amount needed to trigger navigation
  TRANSITION_DURATION: 500,  // Card animation duration

  // Activation zones
  TOP_THRESHOLD: 200,        // Distance from top to trigger activation
  BOTTOM_THRESHOLD: 100,     // Distance from bottom to trigger activation
  EXIT_DEAD_ZONE: 200,       // Dead zone after exit to prevent pull-back
} as const

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================
const MemoizedCard = memo(DTFHomeCardFixed, (prev, next) =>
  prev.dtf.address === next.dtf.address
)

// ============================================================================
// INTERFACES
// ============================================================================
interface DTFCarouselProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// ============================================================================
// MAIN CAROUSEL COMPONENT
// ============================================================================
const DTFCarousel = ({ dtfs, isLoading }: DTFCarouselProps) => {
  // Core refs
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Lenis smooth scroll
  const lenisRef = useLenisScroll()

  // Carousel state management
  const {
    currentIndex,
    isActive,
    scrollDirection,
    currentIndexRef,
    isActiveRef,
    isTransitioning,
    setCurrentIndex,
    setIsActive,
    goToCard,
    handleScrollInput,
    resetScroll,
    cleanup: cleanupState
  } = useCarouselState({
    totalCards: dtfs.length,
    transitionDuration: CONFIG.TRANSITION_DURATION,
    scrollThreshold: CONFIG.SCROLL_THRESHOLD,
  })

  // Activation state management
  const activationState = useCarouselActivation({
    headerHeight: CONFIG.HEADER_HEIGHT,
    topThreshold: CONFIG.TOP_THRESHOLD,
    bottomThreshold: CONFIG.BOTTOM_THRESHOLD,
    exitDeadZone: CONFIG.EXIT_DEAD_ZONE,
  })

  // Boundary exit handling
  const boundaryExitTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTryingToExit = useRef(false)

  // Deactivate callback for scrollbar detection
  const handleDeactivate = useCallback(() => {
    setIsActive(false)
    activationState.isApproaching.current = false
    resetScroll()
  }, [setIsActive, activationState, resetScroll])

  // Scrollbar detection
  const { isScrollbarDragging, scrollbarReleaseIndex } = useScrollbarDetection(
    isActive,
    currentIndex,
    wrapperRef,
    lenisRef,
    handleDeactivate
  )

  // Viewport height management
  const [wrapperHeight, setWrapperHeight] = useState(0)

  // ============================================================================
  // SCROLL DETECTION - Entry/Exit Logic
  // ============================================================================
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current || isScrollbarDragging.current) return

      const rect = wrapperRef.current.getBoundingClientRect()

      if (!isActive && !activationState.isPositioning.current) {
        // Check if carousel should activate
        const { shouldActivate, approachDirection } = shouldActivateCarousel(
          rect,
          activationState,
          {
            headerHeight: CONFIG.HEADER_HEIGHT,
            topThreshold: CONFIG.TOP_THRESHOLD,
            bottomThreshold: CONFIG.BOTTOM_THRESHOLD,
            exitDeadZone: CONFIG.EXIT_DEAD_ZONE,
          }
        )

        // Special case: Check for scrollbar release re-engagement
        const hasScrollbarIndex = scrollbarReleaseIndex.current !== null

        if (shouldActivate || hasScrollbarIndex) {
          activationState.isApproaching.current = true
          activationState.isPositioning.current = true

          // Scroll to carousel position
          scrollToCarousel(rect, lenisRef, CONFIG.HEADER_HEIGHT)

          // Activate after scroll completes
          setTimeout(() => {
            setIsActive(true)
            activationState.isPositioning.current = false

            // Stop Lenis for carousel control
            if (lenisRef.current) {
              lenisRef.current.stop()
            }

            // Restore index based on entry method
            if (activationState.lastExitIndex.current !== null) {
              // Re-entering after exit
              setCurrentIndex(activationState.lastExitIndex.current)
              activationState.lastExitIndex.current = null
            } else if (scrollbarReleaseIndex.current !== null) {
              // Re-entering after scrollbar drag
              setCurrentIndex(scrollbarReleaseIndex.current)
              scrollbarReleaseIndex.current = null
            } else {
              // First time entry
              const initialIndex = approachDirection === 'bottom' ? dtfs.length - 1 : 0
              setCurrentIndex(initialIndex)
            }
          }, 400)
        }
      } else if (isActive) {
        // Check if carousel should deactivate
        const { shouldDeactivate, exitBoundary } = shouldDeactivateCarousel(
          rect,
          currentIndex,
          dtfs.length,
          {
            headerHeight: CONFIG.HEADER_HEIGHT,
            topThreshold: CONFIG.TOP_THRESHOLD,
            bottomThreshold: CONFIG.BOTTOM_THRESHOLD,
            exitDeadZone: CONFIG.EXIT_DEAD_ZONE,
          }
        )

        if (shouldDeactivate) {
          setIsActive(false)
          activationState.isApproaching.current = false
          resetScroll()

          // Save exit state for re-engagement logic
          activationState.lastExitIndex.current = currentIndex
          activationState.exitDirection.current = exitBoundary

          // Re-enable Lenis for normal scrolling
          if (lenisRef.current) {
            lenisRef.current.start()
          }
        }
      }

      // Clear approach flag if moved away
      const rect2 = wrapperRef.current.getBoundingClientRect()
      const isNear = Math.abs(rect2.top - CONFIG.HEADER_HEIGHT) < 300
      if (!isNear && !isActive) {
        activationState.isApproaching.current = false
      }
    }

    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      appContainer?.removeEventListener('scroll', handleScroll)
    }
  }, [
    isActive,
    currentIndex,
    dtfs.length,
    setIsActive,
    setCurrentIndex,
    resetScroll,
    lenisRef,
    activationState,
    scrollbarReleaseIndex,
  ])

  // ============================================================================
  // WHEEL HANDLING - Navigation within carousel
  // ============================================================================
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Block during positioning
      if (activationState.isPositioning.current) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      // Ignore if not active or scrollbar is being dragged
      if (!isActiveRef.current || isScrollbarDragging.current) {
        return
      }

      const isScrollingDown = e.deltaY > 0
      const isScrollingUp = e.deltaY < 0
      const atFirstCard = currentIndexRef.current === 0
      const atLastCard = currentIndexRef.current === dtfs.length - 1

      // Handle boundary exits
      if (atFirstCard && isScrollingUp) {
        // Delay exit from top to prevent accidental exit
        if (!isTryingToExit.current) {
          isTryingToExit.current = true
          e.preventDefault()
          e.stopPropagation()

          if (boundaryExitTimeout.current) {
            clearTimeout(boundaryExitTimeout.current)
          }

          boundaryExitTimeout.current = setTimeout(() => {
            isTryingToExit.current = false
            if (lenisRef.current) {
              lenisRef.current.start()
            }
          }, 500)
          return
        }
        return
      }

      if (atLastCard && isScrollingDown) {
        // Immediate exit from bottom
        if (lenisRef.current) {
          lenisRef.current.start()
        }
        return
      }

      // Clear exit attempt if scrolling away from boundary
      isTryingToExit.current = false
      if (boundaryExitTimeout.current) {
        clearTimeout(boundaryExitTimeout.current)
        boundaryExitTimeout.current = null
      }

      // Prevent default and handle navigation
      e.preventDefault()
      e.stopPropagation()

      // Process scroll input for navigation
      handleScrollInput(e.deltaY)
    }

    // Attach to both window and app container for maximum capture
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      appContainer?.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [dtfs.length, handleScrollInput, lenisRef, isScrollbarDragging, activationState])

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || isTransitioning.current) return

      if (e.key === 'ArrowDown' && currentIndex < dtfs.length - 1) {
        e.preventDefault()
        goToCard(currentIndex + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        goToCard(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, currentIndex, dtfs.length, goToCard, isTransitioning])

  // ============================================================================
  // VIEWPORT RESIZE HANDLING
  // ============================================================================
  useEffect(() => {
    const updateHeight = () => {
      const height = window.innerHeight - CONFIG.HEADER_HEIGHT
      setWrapperHeight(height)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // ============================================================================
  // CLEANUP
  // ============================================================================
  useEffect(() => {
    return () => {
      cleanupState()
      if (boundaryExitTimeout.current) {
        clearTimeout(boundaryExitTimeout.current)
      }
    }
  }, [cleanupState])

  // ============================================================================
  // RENDER
  // ============================================================================
  if (!dtfs || dtfs.length === 0) {
    return <div style={{ height: `${wrapperHeight || 800}px` }} />
  }

  return (
    <section ref={containerRef} className="relative">
      <div
        ref={wrapperRef}
        className="relative w-full bg-primary"
        style={{
          height: `${wrapperHeight || 800}px`,
          minHeight: `${wrapperHeight || 800}px`
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CONFIG.CARD_HEIGHT}px` }}
          >
            <div
              className="relative"
              style={{ width: '100%', height: `${CONFIG.CARD_HEIGHT}px` }}
            >
              {/* Card Stack */}
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0
                const isInStack = relativePosition >= 0 && relativePosition <= CONFIG.MAX_STACK_DEPTH
                const isPastStack = relativePosition > CONFIG.MAX_STACK_DEPTH

                // Calculate visual properties
                const yOffset = relativePosition < 0
                  ? 800  // Hidden above
                  : isPastStack
                    ? CONFIG.MAX_STACK_DEPTH * CONFIG.CARD_OFFSET
                    : relativePosition * CONFIG.CARD_OFFSET

                const scale = relativePosition < 0
                  ? 0.85  // Hidden cards are smaller
                  : isPastStack
                    ? 1 - CONFIG.MAX_STACK_DEPTH * CONFIG.SCALE_FACTOR
                    : 1 - relativePosition * CONFIG.SCALE_FACTOR

                const opacity = relativePosition < 0 || isPastStack ? 0 : 1
                const zIndex = dtfs.length - relativePosition

                return (
                  <motion.div
                    key={dtf.address}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      y: yOffset,
                      scale,
                      opacity,
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
                      willChange: 'transform, opacity',
                      zIndex,
                    }}
                  >
                    <MemoizedCard dtf={dtf} />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <AnimatePresence>
          {isActive && currentIndex === 0 && (
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

        {/* Navigation Dots */}
        {isActive && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
            {dtfs.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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

export default DTFCarousel