import { useCallback, useEffect, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

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
  CARD_OFFSET: 6,           // Vertical spacing between stacked cards (minimal peek)
  SCALE_FACTOR: 0.05,        // Scale reduction per card in stack
  MAX_STACK_DEPTH: 2,        // Maximum visible cards in stack (reduced from 3)

  // Interaction
  SCROLL_THRESHOLD: 50,      // Scroll amount needed to trigger navigation
  TRANSITION_DURATION: 500,  // Card animation duration

  // Activation zones
  TOP_THRESHOLD: 200,        // Distance from top to trigger activation
  BOTTOM_THRESHOLD: 100,     // Distance from bottom to trigger activation
  EXIT_DEAD_ZONE: 200,       // Dead zone after exit to prevent pull-back
} as const

// ============================================================================
// SKELETON CARD COMPONENT
// ============================================================================
const SkeletonCard = () => {
  return (
    <div
      className="w-full rounded-4xl max-w-[1400px] mx-auto bg-card border border-primary-foreground"
      style={{ minHeight: '693px' }}
    >
      <div className="grid lg:grid-cols-[320px_1fr_1fr] xl:grid-cols-[380px_1fr_1fr] gap-0 h-full" style={{ minHeight: '693px' }}>
        {/* Left Card - Simplified */}
        <div className="flex flex-col gap-2 border-r p-2" style={{ minHeight: '693px' }}>
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="w-full aspect-square rounded-3xl" />
          </div>
          <div className="bg-card rounded-3xl p-4">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Middle Section - Simplified */}
        <div className="w-full p-6 flex flex-col" style={{ minHeight: '693px' }}>
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-5 w-40 mb-6" />
          <Skeleton className="h-36 w-full mb-8" />
          <Skeleton className="h-6 w-full mb-8" />
          <Skeleton className="h-20 w-full" />
          <div className="flex-1" />
        </div>

        {/* Right Section - Simplified */}
        <div className="bg-primary/10 p-6 flex flex-col" style={{ minHeight: '693px' }}>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  )
}

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

  // Entrance animation state
  const [hasEnteredView, setHasEnteredView] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const animationStartTime = useRef<number>(0)

  // Page load protection
  const [pageReady, setPageReady] = useState(false)

  // Determine if we have data or need skeleton
  const hasData = !isLoading && dtfs && dtfs.length > 0
  // Keep showing skeleton during entrance animation to prevent lag
  const showSkeleton = !hasData || !animationComplete

  // Use skeleton count when loading, actual count when loaded
  const cardCount = showSkeleton ? 3 : dtfs.length

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
    totalCards: cardCount,
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

  // Position correction
  const isCorrectingPosition = useRef(false)
  const positionCorrectionTimeout = useRef<NodeJS.Timeout | null>(null)

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

  // Position correction function
  const correctCarouselPosition = useCallback(() => {
    if (!wrapperRef.current || !isActive) return

    // Check for blocking conditions
    if (
      isCorrectingPosition.current ||
      isTransitioning.current ||
      activationState.isPositioning.current
    ) {
      console.log('🚫 Position correction blocked:', {
        isCorrectingPosition: isCorrectingPosition.current,
        isTransitioning: isTransitioning.current,
        isPositioning: activationState.isPositioning.current
      })
      return
    }

    const rect = wrapperRef.current.getBoundingClientRect()
    const targetTop = CONFIG.HEADER_HEIGHT
    const currentTop = rect.top
    const drift = currentTop - targetTop // Signed drift to see direction

    console.log('📍 Carousel position check:', {
      currentTop,
      targetTop,
      drift,
      absDrift: Math.abs(drift)
    })

    // Only correct if drift exceeds tolerance (30px) - increased tolerance
    // Also check that we're not trying to exit the carousel
    if (Math.abs(drift) > 30 && !isTryingToExit.current) {
      console.log('🔧 Correcting carousel position, drift:', drift)
      isCorrectingPosition.current = true

      // Clear any existing correction timeout
      if (positionCorrectionTimeout.current) {
        clearTimeout(positionCorrectionTimeout.current)
      }

      // Smoothly scroll to correct position
      const appContainer = document.getElementById('app-container')
      if (appContainer) {
        // Don't try to calculate relative scroll, instead calculate absolute position
        // The carousel should be at a fixed position relative to the viewport
        const carouselElement = wrapperRef.current
        const currentScrollTop = appContainer.scrollTop

        // Calculate where the carousel currently is in the document
        const carouselOffsetInDocument = carouselElement.offsetTop

        // Calculate the target scroll position to place carousel at HEADER_HEIGHT
        const targetScrollPosition = carouselOffsetInDocument - CONFIG.HEADER_HEIGHT

        // Safety check: ensure we're not scrolling to negative values
        const safeTargetScroll = Math.max(0, targetScrollPosition)

        console.log('🎯 Position correction:', {
          currentScrollTop,
          carouselOffsetInDocument,
          targetScrollPosition: safeTargetScroll,
          currentTop: rect.top,
          targetTop: CONFIG.HEADER_HEIGHT,
          drift
        })

        // Since Lenis is stopped when carousel is active, we need to temporarily start it
        // to perform the correction, then stop it again
        if (lenisRef.current) {
          // Temporarily start Lenis for correction
          lenisRef.current.start()

          lenisRef.current.scrollTo(safeTargetScroll, {
            duration: 0.4,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
            onComplete: () => {
              // Stop Lenis again after correction
              if (isActive && lenisRef.current) {
                lenisRef.current.stop()
                console.log('🛑 Lenis stopped again after correction')
              }
            }
          })
        } else {
          // Fallback to native scrolling
          appContainer.scrollTo({
            top: safeTargetScroll,
            behavior: 'smooth'
          })
        }
      }

      // Reset correction flag after animation completes
      positionCorrectionTimeout.current = setTimeout(() => {
        isCorrectingPosition.current = false
        console.log('✅ Position correction complete')
      }, 500)
    }
  }, [isActive, lenisRef, isTransitioning, activationState, isTryingToExit])

  // Handle entrance animation and page ready state
  useEffect(() => {
    if (!hasEnteredView) {
      setHasEnteredView(true)
      animationStartTime.current = Date.now()

      // Mark page as ready after a short delay to prevent early scroll issues
      setTimeout(() => {
        setPageReady(true)
        console.log('✅ Page ready for interactions')
      }, 500)
    }
  }, [hasEnteredView])

  // Handle animation completion and data swap
  useEffect(() => {
    if (hasData && hasEnteredView && !animationComplete) {
      // Calculate remaining animation time
      const elapsed = Date.now() - animationStartTime.current
      const animationDuration = 700 // 600ms animation + 100ms buffer
      const remainingTime = Math.max(0, animationDuration - elapsed)

      const timeoutId = setTimeout(() => {
        setAnimationComplete(true)
      }, remainingTime)

      return () => clearTimeout(timeoutId)
    }
  }, [hasData, hasEnteredView, animationComplete])

  // ============================================================================
  // SCROLL DETECTION - Entry/Exit Logic
  // ============================================================================
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current || isScrollbarDragging.current) return

      // Prevent carousel activation if page is not ready
      if (!pageReady) {
        console.log('⚠️ Scroll ignored - page not ready')
        return
      }

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
            // Aggressive clear of any accumulated scroll momentum/events
            if (lenisRef.current) {
              // Force stop any ongoing animations
              lenisRef.current.stop()

              // Reset all scroll-related properties
              lenisRef.current.velocity = 0
              lenisRef.current.direction = 0
              lenisRef.current.animate.to = lenisRef.current.scroll
              lenisRef.current.isScrolling = false
              lenisRef.current.isStopped = true

              console.log('🛑 Lenis stopped and scroll momentum forcefully cleared')

              // Clear any pending wheel events from the browser queue
              const wheelHandler = (e: WheelEvent) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🚫 Blocked accumulated wheel event')
              }

              window.addEventListener('wheel', wheelHandler, { passive: false, capture: true })

              // Remove the blocker after a brief moment
              setTimeout(() => {
                window.removeEventListener('wheel', wheelHandler, { capture: true })
                console.log('✅ Wheel event blocker removed')
              }, 100)
            }

            // Small delay to ensure everything is cleared
            requestAnimationFrame(() => {
              setIsActive(true)
              activationState.isPositioning.current = false

              // Ensure position is correct after activation
              setTimeout(() => {
                if (wrapperRef.current) {
                  const rect = wrapperRef.current.getBoundingClientRect()
                  const drift = Math.abs(rect.top - CONFIG.HEADER_HEIGHT)
                  if (drift > 30) {
                    console.log('🔧 Post-activation position correction needed:', drift)
                    correctCarouselPosition()
                  }
                }
              }, 100)
            })

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
        // Monitor position and auto-correct if needed
        const targetTop = CONFIG.HEADER_HEIGHT
        const currentTop = rect.top
        const drift = Math.abs(currentTop - targetTop)

        console.log('👀 Active carousel position:', {
          currentTop,
          targetTop,
          drift,
          isCorrectingPosition: isCorrectingPosition.current,
          isTransitioning: isTransitioning.current,
          isTryingToExit: isTryingToExit.current
        })

        // Check if position needs correction (not during other operations)
        // Also prevent correction if trying to exit boundaries
        // Increased tolerance to 30px to prevent over-correction
        if (
          drift > 30 &&
          !isCorrectingPosition.current &&
          !isTransitioning.current &&
          !isTryingToExit.current
        ) {
          console.log('🚨 Position drift detected, triggering correction')
          correctCarouselPosition()
        }

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
    appContainer?.addEventListener('scroll', handleScroll, { passive: false })

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
    correctCarouselPosition,
    isTransitioning,
    pageReady,
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

      // Correct position if carousel is active during resize
      if (isActive) {
        // Small delay to let layout settle
        setTimeout(() => {
          correctCarouselPosition()
        }, 100)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [isActive, correctCarouselPosition])

  // ============================================================================
  // RESIZE OBSERVER - Monitor layout changes
  // ============================================================================
  useEffect(() => {
    if (!wrapperRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      // Only correct position if carousel is active and not already correcting
      if (isActive && !isCorrectingPosition.current) {
        console.log('📐 ResizeObserver detected change')
        // Use RAF to debounce and optimize
        requestAnimationFrame(() => {
          correctCarouselPosition()
        })
      }
    })

    resizeObserver.observe(wrapperRef.current)

    // Also observe document body for any layout shifts
    resizeObserver.observe(document.body)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isActive, correctCarouselPosition])

  // ============================================================================
  // MUTATION OBSERVER - Detect DOM changes
  // ============================================================================
  useEffect(() => {
    if (!isActive) return

    const mutationObserver = new MutationObserver((mutations) => {
      // Check if any mutation might affect carousel position
      const shouldCheck = mutations.some(mutation =>
        mutation.type === 'childList' ||
        (mutation.type === 'attributes' && (
          mutation.attributeName === 'class' ||
          mutation.attributeName === 'style'
        ))
      )

      if (shouldCheck && !isCorrectingPosition.current) {
        console.log('🧬 MutationObserver detected DOM change')
        // Delay to let DOM settle
        setTimeout(() => {
          correctCarouselPosition()
        }, 50)
      }
    })

    // Observe entire document for changes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => {
      mutationObserver.disconnect()
    }
  }, [isActive, correctCarouselPosition])

  // ============================================================================
  // FAILSAFE POSITION MONITORING - Periodic check
  // ============================================================================
  useEffect(() => {
    if (!isActive) return

    const intervalId = setInterval(() => {
      if (wrapperRef.current && !isCorrectingPosition.current && !isTransitioning.current) {
        const rect = wrapperRef.current.getBoundingClientRect()
        const drift = Math.abs(rect.top - CONFIG.HEADER_HEIGHT)

        if (drift > 30) {
          console.log('⏰ Interval check found position drift:', drift)
          correctCarouselPosition()
        }
      }
    }, 500) // Check every 500ms

    return () => {
      clearInterval(intervalId)
    }
  }, [isActive, correctCarouselPosition, isTransitioning])

  // ============================================================================
  // CLEANUP
  // ============================================================================
  useEffect(() => {
    return () => {
      cleanupState()
      if (boundaryExitTimeout.current) {
        clearTimeout(boundaryExitTimeout.current)
      }
      if (positionCorrectionTimeout.current) {
        clearTimeout(positionCorrectionTimeout.current)
      }
    }
  }, [cleanupState])

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <section ref={containerRef} className="relative">
      <motion.div
        ref={wrapperRef}
        className="relative w-full bg-primary"
        initial={{ opacity: 0, y: 300 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }
        }}
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
              {/* Card Stack - Show skeleton or real cards */}
              {showSkeleton ? (
                // Skeleton cards while loading
                [...Array(3)].map((_, index) => {
                  const yOffset = index * CONFIG.CARD_OFFSET
                  const scale = 1 - index * CONFIG.SCALE_FACTOR
                  const opacity = index === 2 ? 0.5 : 1
                  const zIndex = 3 - index

                  return (
                    <div
                      key={`skeleton-${index}`}
                      className="absolute inset-0"
                      style={{
                        transform: `translate3d(0, ${yOffset}px, 0) scale(${scale})`,
                        transformOrigin: 'bottom center',
                        opacity,
                        zIndex,
                        pointerEvents: 'none',
                      }}
                    >
                      <SkeletonCard />
                    </div>
                  )
                })
              ) : (
                // Real cards when loaded
                dtfs.map((dtf, index) => {
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

                // Opacity: hidden = 0, last card in stack = 0.5, others = 1
                const opacity = relativePosition < 0 || isPastStack
                  ? 0
                  : relativePosition === CONFIG.MAX_STACK_DEPTH
                    ? 0.5     // Last card in stack: 50% opacity
                    : 1       // Current and middle cards: full opacity
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
                })
              )}
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
        {isActive && !showSkeleton && (
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
      </motion.div>
    </section>
  )
}

export default DTFCarousel