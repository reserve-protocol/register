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
  scrollToCarousel,
} from './hooks/use-carousel-activation'
import { useScrollbarDetection } from './hooks/use-scrollbar-detection'

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  // Layout
  HEADER_HEIGHT: 72,
  CARD_HEIGHT: 720,
  CARD_OFFSET: 6, // Vertical spacing between stacked cards (minimal peek)
  SCALE_FACTOR: 0.05, // Scale reduction per card in stack
  MAX_STACK_DEPTH: 2, // Maximum visible cards in stack (reduced from 3)

  // Interaction
  SCROLL_THRESHOLD: 50, // Scroll amount needed to trigger navigation
  TRANSITION_DURATION: 500, // Card animation duration

  // Activation zones
  TOP_THRESHOLD: 200, // Distance from top to trigger activation
  BOTTOM_THRESHOLD: 100, // Distance from bottom to trigger activation
  EXIT_DEAD_ZONE: 200, // Dead zone after exit to prevent pull-back
} as const

// ============================================================================
// SKELETON CARD COMPONENT - Pixel Perfect Based on Actual Measurements
// ============================================================================
const SkeletonCard = () => {
  return (
    <div
      className="w-full rounded-4xl max-w-[1400px] mx-auto bg-card border border-primary-foreground"
      style={{ height: '695px' }}
    >
      <div
        className="grid lg:grid-cols-[320px_1fr_1fr] xl:grid-cols-[380px_1fr_1fr] gap-0"
        style={{ height: '693px' }}
      >
        {/* Left Section - 363px cover + 306px zapper */}
        <div
          className="flex flex-col gap-2 border-r p-2"
          style={{ height: '693px' }}
        >
          {/* Cover Container - 363px height */}
          <div
            className="flex items-center justify-center"
            style={{ height: '363px' }}
          >
            <div style={{ width: '363px', height: '363px' }}>
              <Skeleton className="w-full h-full rounded-3xl" />
            </div>
          </div>

          {/* Zapper Container - 306px height - Single skeleton box */}
          <div className="bg-card rounded-3xl" style={{ height: '306px' }}>
            <Skeleton className="w-full h-full rounded-3xl" />
          </div>
        </div>

        {/* Middle Section - Info */}
        <div className="w-full flex flex-col" style={{ height: '693px' }}>
          {/* Logo Section - 72px */}
          <div
            className="flex items-center flex-shrink-0 p-6 pb-4"
            style={{ height: '72px' }}
          >
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          {/* Title Section - 88px */}
          <div className="px-6" style={{ height: '88px' }}>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Chart Container - 144px + padding */}
          <div className="p-6">
            <div style={{ height: '144px' }}>
              <Skeleton className="h-full w-full" />
            </div>
            {/* Time range buttons */}
            <div className="flex items-center justify-between w-full mt-4">
              {['1d', '7d', '1m', '3m', 'All'].map((label) => (
                <Skeleton key={label} className="h-4 w-8" />
              ))}
            </div>
          </div>

          {/* Market Cap Section - 78px */}
          <div
            className="flex items-center text-lg p-6 border-y"
            style={{ height: '78px' }}
          >
            <Skeleton className="h-5 w-24 mr-auto" />
            <Skeleton className="h-5 w-32" />
          </div>

          {/* About Section - 156px */}
          <div className="p-6" style={{ height: '156px' }}>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Right Section - Basket */}
        <div
          className="bg-primary/10 p-6 flex flex-col"
          style={{ height: '693px' }}
        >
          {/* Basket Header - 24px */}
          <div className="flex items-center mb-8" style={{ height: '24px' }}>
            <Skeleton className="h-6 w-6 mr-auto" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Basket Title - 24px */}
          <div className="mb-4" style={{ height: '24px' }}>
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Token List - 376px with 9 items */}
          <div
            className="flex flex-col gap-3 overflow-y-auto"
            style={{ height: '376px', maxHeight: '400px' }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex gap-2 items-center"
                style={{ height: '32px' }}
              >
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-24 mr-auto" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
            {/* "+X more" text */}
            <div className="text-center pt-2">
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================
const MemoizedCard = memo(
  DTFHomeCardFixed,
  (prev, next) => prev.dtf.address === next.dtf.address
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

  // Component swap protection
  const isSwappingComponents = useRef(false)
  const touchStateRef = useRef<{ pointerId: number | null; lastY: number }>({
    pointerId: null,
    lastY: 0,
  })

  // Determine if we have data or need skeleton
  const hasLoadedContent = !isLoading && dtfs.length > 0
  // Keep showing skeleton during entrance animation to prevent lag
  const showSkeleton = !hasLoadedContent || !animationComplete

  // Use skeleton count when loading, actual count when loaded
  const cardCount = showSkeleton ? 3 : dtfs.length
  const totalCards = cardCount

  const clampIndex = useCallback(
    (index: number) => {
      if (totalCards <= 0) {
        return 0
      }

      if (index < 0) {
        return 0
      }

      if (index >= totalCards) {
        return totalCards - 1
      }

      return index
    },
    [totalCards]
  )

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
    cleanup: cleanupState,
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
  const [cardScale, setCardScale] = useState(1)

  // Position correction function
  const correctCarouselPosition = useCallback(() => {
    if (!wrapperRef.current || !isActive) return

    // Check for blocking conditions
    if (
      isCorrectingPosition.current ||
      isTransitioning.current ||
      activationState.isPositioning.current ||
      isTryingToExit.current ||
      isSwappingComponents.current // Don't correct during skeleton→card swap
    ) {
      return
    }

    const rect = wrapperRef.current.getBoundingClientRect()
    const targetTop = CONFIG.HEADER_HEIGHT // Where wrapper should be (72px from top)
    const currentTop = rect.top // Where wrapper actually is
    const currentBottom = rect.bottom // Where wrapper bottom is
    const viewportHeight = window.innerHeight

    // The wrapper should start at HEADER_HEIGHT and extend to viewport bottom
    // This ensures blue background fills from header to bottom of viewport
    const drift = currentTop - targetTop

    // Only correct if drift exceeds tolerance (40px)
    if (Math.abs(drift) > 40) {
      isCorrectingPosition.current = true

      // Clear any existing correction timeout
      if (positionCorrectionTimeout.current) {
        clearTimeout(positionCorrectionTimeout.current)
      }

      // Smoothly scroll to correct position
      const appContainer = document.getElementById('app-container')
      if (appContainer) {
        const currentScrollTop = appContainer.scrollTop

        // Calculate correction needed:
        // drift = currentTop - targetTop
        // If currentTop > targetTop (carousel too far down): drift is POSITIVE
        //   → We need to scroll UP (reduce scrollTop) by drift amount
        // If currentTop < targetTop (carousel too far up): drift is NEGATIVE
        //   → We need to scroll DOWN (increase scrollTop) by |drift| amount
        const targetScrollPosition = currentScrollTop - drift

        // Safety check: ensure we're not scrolling to negative values
        const safeTargetScroll = Math.max(0, targetScrollPosition)

        // Special case: if already at top and carousel is still misplaced,
        // use absolute positioning based on carousel's actual document position
        if (currentScrollTop === 0 && targetScrollPosition < 0) {
          // Get carousel's absolute position in document
          const carouselRect = wrapperRef.current.getBoundingClientRect()
          const absoluteCarouselTop = carouselRect.top + window.scrollY
          const correctScrollPosition =
            absoluteCarouselTop - CONFIG.HEADER_HEIGHT

          if (lenisRef.current) {
            lenisRef.current.start()
            lenisRef.current.scrollTo(Math.max(0, correctScrollPosition), {
              duration: 0.4,
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
              onComplete: () => {
                // DON'T stop Lenis immediately - let it settle first
                setTimeout(() => {
                  if (isActive && lenisRef.current) {
                    lenisRef.current.stop()
                  }
                }, 200) // Give it 200ms to fully settle
              },
            })
          }

          positionCorrectionTimeout.current = setTimeout(() => {
            isCorrectingPosition.current = false
          }, 600)

          return
        }

        // Additional safety: abort if would scroll to top unexpectedly
        if (safeTargetScroll === 0 && currentScrollTop > 500) {
          isCorrectingPosition.current = false
          return
        }

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
              }
            },
          })
        } else {
          // Fallback to native scrolling
          appContainer.scrollTo({
            top: safeTargetScroll,
            behavior: 'smooth',
          })
        }
      }

      // Reset correction flag after animation completes
      positionCorrectionTimeout.current = setTimeout(() => {
        isCorrectingPosition.current = false
      }, 600)
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
      }, 500)
    }
  }, [hasEnteredView])

  // Handle animation completion and data swap
  useEffect(() => {
    if (hasLoadedContent && hasEnteredView && !animationComplete) {
      // Calculate remaining animation time
      const elapsed = Date.now() - animationStartTime.current
      const animationDuration = 700 // 600ms animation + 100ms buffer
      const remainingTime = Math.max(0, animationDuration - elapsed)

      const timeoutId = setTimeout(() => {
        // Store current position before swap if carousel is active
        let shouldCorrectAfterSwap = false
        if (isActive && wrapperRef.current) {
          const rectBeforeSwap = wrapperRef.current.getBoundingClientRect()
          const driftBeforeSwap = Math.abs(
            rectBeforeSwap.top - CONFIG.HEADER_HEIGHT
          )
          shouldCorrectAfterSwap = driftBeforeSwap < 50 // Only if we're close to correct position
        }

        isSwappingComponents.current = true

        // Lock scroll position during swap if carousel is active
        if (isActive && lenisRef.current) {
          const currentScroll = lenisRef.current.scroll
          // Stop Lenis to prevent any scrolling during swap
          lenisRef.current.stop()

          // Force scroll to stay at current position
          const appContainer = document.getElementById('app-container')
          if (appContainer) {
            appContainer.scrollTop = currentScroll
          }
        }

        setAnimationComplete(true)

        // Correct position after swap if carousel was active and positioned
        if (shouldCorrectAfterSwap) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (isActive && wrapperRef.current) {
                const rectAfterSwap = wrapperRef.current.getBoundingClientRect()
                const driftAfterSwap = Math.abs(
                  rectAfterSwap.top - CONFIG.HEADER_HEIGHT
                )

                if (driftAfterSwap > 30) {
                  correctCarouselPosition()
                }

                // Ensure Lenis is stopped again after correction (since carousel is active)
                if (lenisRef.current && !lenisRef.current.isStopped) {
                  lenisRef.current.stop()
                }
              }
              isSwappingComponents.current = false
            }, 100) // Small delay to let DOM settle
          })
        } else {
          // Reset swap flag even if no correction needed
          setTimeout(() => {
            isSwappingComponents.current = false
          }, 100)
        }
      }, remainingTime)

      return () => clearTimeout(timeoutId)
    }
  }, [
    hasLoadedContent,
    hasEnteredView,
    animationComplete,
    isActive,
    correctCarouselPosition,
  ])

  // ============================================================================
  // SCROLL DETECTION - Entry/Exit Logic
  // ============================================================================
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current || isScrollbarDragging.current) return

      // Prevent carousel activation if page is not ready or swapping components
      if (!pageReady || isSwappingComponents.current) {
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

          // Activate after scroll completes (wait for animation + buffer)
          setTimeout(() => {
            // Aggressive clear of any accumulated scroll momentum/events
            if (lenisRef.current) {
              // Force stop any ongoing animations
              lenisRef.current.stop()

              // Reset public scroll-related properties
              lenisRef.current.velocity = 0
              lenisRef.current.direction = 0

              // Clear any pending wheel events from the browser queue
              const wheelHandler = (e: WheelEvent) => {
                e.preventDefault()
                e.stopPropagation()
              }

              window.addEventListener('wheel', wheelHandler, {
                passive: false,
                capture: true,
              })

              // Remove the blocker after a brief moment
              setTimeout(() => {
                window.removeEventListener('wheel', wheelHandler, {
                  capture: true,
                })
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
                    correctCarouselPosition()
                  }
                }
              }, 100)
            })

            // Restore index based on entry method
            if (activationState.lastExitIndex.current !== null) {
              // Re-entering after exit
              const clampedIndex = clampIndex(
                activationState.lastExitIndex.current
              )
              setCurrentIndex(clampedIndex)
              activationState.lastExitIndex.current = null
            } else if (scrollbarReleaseIndex.current !== null) {
              // Re-entering after scrollbar drag
              const clampedIndex = clampIndex(scrollbarReleaseIndex.current)
              setCurrentIndex(clampedIndex)
              scrollbarReleaseIndex.current = null
            } else {
              // First time entry
              const initialIndex =
                approachDirection === 'bottom' ? clampIndex(totalCards - 1) : 0
              setCurrentIndex(initialIndex)
            }
          }, 400)
        }
      } else if (isActive) {
        // Don't constantly monitor position in scroll handler
        // Let the other observers handle it

        // Check if carousel should deactivate
        const { shouldDeactivate, exitBoundary } = shouldDeactivateCarousel(
          rect,
          currentIndex,
          totalCards,
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
          activationState.lastExitIndex.current = clampIndex(currentIndex)
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
    totalCards,
    setIsActive,
    setCurrentIndex,
    resetScroll,
    lenisRef,
    activationState,
    scrollbarReleaseIndex,
    correctCarouselPosition,
    isTransitioning,
    pageReady,
    clampIndex,
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
      const atLastCard = currentIndexRef.current === totalCards - 1

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
    window.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    })

    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      appContainer?.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [
    totalCards,
    handleScrollInput,
    lenisRef,
    isScrollbarDragging,
    activationState,
  ])

  // ============================================================================
  // TOUCH HANDLING - Touch and pointer navigation
  // ============================================================================
  useEffect(() => {
    const wrapperElement = wrapperRef.current
    if (!wrapperElement) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return
      }

      if (!isActiveRef.current || isTransitioning.current) {
        return
      }

      touchStateRef.current.pointerId = event.pointerId
      touchStateRef.current.lastY = event.clientY
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return
      }

      if (touchStateRef.current.pointerId !== event.pointerId) {
        return
      }

      if (!isActiveRef.current || isTransitioning.current) {
        return
      }

      const deltaY = touchStateRef.current.lastY - event.clientY
      touchStateRef.current.lastY = event.clientY

      if (deltaY === 0) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      handleScrollInput(deltaY)
    }

    const handlePointerEnd = (event: PointerEvent) => {
      if (touchStateRef.current.pointerId !== event.pointerId) {
        return
      }

      touchStateRef.current.pointerId = null
      touchStateRef.current.lastY = 0
    }

    wrapperElement.addEventListener('pointerdown', handlePointerDown, {
      passive: false,
    })
    wrapperElement.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    })
    wrapperElement.addEventListener('pointerup', handlePointerEnd)
    wrapperElement.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      wrapperElement.removeEventListener('pointerdown', handlePointerDown)
      wrapperElement.removeEventListener('pointermove', handlePointerMove)
      wrapperElement.removeEventListener('pointerup', handlePointerEnd)
      wrapperElement.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [handleScrollInput, isTransitioning])

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || isTransitioning.current) return

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
  }, [isActive, currentIndex, totalCards, goToCard, isTransitioning])

  // ============================================================================
  // VIEWPORT RESIZE HANDLING
  // ============================================================================
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight
      const availableHeight = viewportHeight - CONFIG.HEADER_HEIGHT

      // Calculate scale for cards to fit with breathing room
      const IDEAL_CARD_HEIGHT = CONFIG.CARD_HEIGHT // 720px
      const BREATHING_ROOM = 50 // Top/bottom padding
      const MIN_SCALE = 0.75 // Never scale below 75% for readability

      const requiredHeight = IDEAL_CARD_HEIGHT + BREATHING_ROOM
      const calculatedScale = availableHeight / requiredHeight

      // Clamp scale between MIN_SCALE and 1.0
      const scale = Math.max(MIN_SCALE, Math.min(1, calculatedScale))

      setCardScale(scale)
      setWrapperHeight(availableHeight)

      // Correct position if carousel is active during resize
      if (isActive) {
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
    if (!wrapperRef.current || !isActive) return

    const resizeObserver = new ResizeObserver(() => {
      // Simple correction on resize
      if (!isCorrectingPosition.current && isActive) {
        setTimeout(() => {
          correctCarouselPosition()
        }, 100)
      }
    })

    resizeObserver.observe(wrapperRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isActive, correctCarouselPosition])

  // Removed mutation observer - it was causing too many corrections

  // Removed interval check - relying on event-based corrections only

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
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        style={{
          height: `${wrapperHeight || 800}px`,
          minHeight: `${wrapperHeight || 800}px`,
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CONFIG.CARD_HEIGHT}px` }}
          >
            <div
              className="relative"
              style={{
                width: '100%',
                height: `${CONFIG.CARD_HEIGHT}px`,
                transform: `scale(${cardScale})`,
                transformOrigin: 'center',
              }}
            >
              {/* Real cards - always rendered behind */}
              {!showSkeleton &&
                dtfs.map((dtf, index) => {
                  const relativePosition = index - currentIndex
                  const isTopCard = relativePosition === 0
                  const isInStack =
                    relativePosition >= 0 &&
                    relativePosition <= CONFIG.MAX_STACK_DEPTH
                  const isPastStack = relativePosition > CONFIG.MAX_STACK_DEPTH

                  // Calculate visual properties
                  const yOffset =
                    relativePosition < 0
                      ? -800 // Hidden above (negative to go up, not positive)
                      : isPastStack
                        ? CONFIG.MAX_STACK_DEPTH * CONFIG.CARD_OFFSET
                        : relativePosition * CONFIG.CARD_OFFSET

                  const scale =
                    relativePosition < 0
                      ? 0.85 // Hidden cards are smaller
                      : isPastStack
                        ? 1 - CONFIG.MAX_STACK_DEPTH * CONFIG.SCALE_FACTOR
                        : 1 - relativePosition * CONFIG.SCALE_FACTOR

                  // Opacity: hidden = 0, last card in stack = 0.5, others = 1
                  const opacity =
                    relativePosition < 0 || isPastStack
                      ? 0
                      : relativePosition === CONFIG.MAX_STACK_DEPTH
                        ? 0.5 // Last card in stack: 50% opacity
                        : 1 // Current and middle cards: full opacity
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

              {/* Skeleton overlay - fades out when real cards are ready */}
              <AnimatePresence>
                {showSkeleton && (
                  <motion.div
                    key="skeleton-overlay"
                    className="absolute inset-0"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{ zIndex: 9999 }}
                  >
                    {[...Array(3)].map((_, index) => {
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
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
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
      </motion.div>
    </section>
  )
}

export default DTFCarousel
