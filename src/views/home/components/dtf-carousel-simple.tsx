import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselSimpleProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselSimple = ({ dtfs, isLoading }: DTFCarouselSimpleProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCarouselActive, setIsCarouselActive] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const totalCards = dtfs.length

  // Mutable refs for scroll handling (avoid stale closures)
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const isScrollbarDragging = useRef(false)
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTransitioning = useRef(false)
  const alignmentTimeout = useRef<NodeJS.Timeout | null>(null)
  const boundaryReleaseTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTryingToScrollPastBoundary = useRef(false)

  // Configuration
  const HEADER_HEIGHT = 72 // Desktop header height
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 20 // Vertical spacing between stacked cards
  const SCALE_FACTOR = 0.05 // How much each card scales down
  const SCROLL_THRESHOLD = 50 // Pixels needed to trigger card change
  const TRANSITION_DURATION = 500 // ms for card transition
  const ALIGNMENT_THRESHOLD = 50 // px threshold for auto-alignment


  // Store scroll position when carousel becomes active
  const lockedScrollPosition = useRef<number | null>(null)

  // Simple scroll-based activation
  useEffect(() => {
    const checkVisibility = () => {
      if (!wrapperRef.current) return

      const appContainer = document.getElementById('app-container')
      if (!appContainer) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const currentIdx = currentIndexRef.current

      // Only check activation/deactivation based on position AND card index
      if (!isCarouselActive) {
        // Activate when wrapper is in position
        const shouldActivate =
          rect.top <= HEADER_HEIGHT + 50 &&
          rect.bottom > HEADER_HEIGHT + 100

        if (shouldActivate) {
          console.log('🟢 Activating carousel!')
          setIsCarouselActive(true)
          // Smoothly scroll to perfect position then lock
          const targetScroll = appContainer.scrollTop + (rect.top - HEADER_HEIGHT)
          appContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          })
          setTimeout(() => {
            lockedScrollPosition.current = targetScroll
          }, 100)
        }
      } else {
        // Only deactivate if we're at boundaries AND trying to scroll past
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        // Check if trying to scroll past boundaries
        const tryingToScrollUp = rect.top > HEADER_HEIGHT + 10
        const tryingToScrollDown = rect.bottom < window.innerHeight - 10

        if ((atFirstCard && tryingToScrollUp) || (atLastCard && tryingToScrollDown)) {
          console.log('🔴 Deactivating carousel - at boundary')
          setIsCarouselActive(false)
          lockedScrollPosition.current = null
          scrollAccumulator.current = 0
        }
      }
    }

    // Listen to scroll events on the app container
    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('scroll', checkVisibility, { passive: true })

    // Check on mount and resize
    checkVisibility()
    window.addEventListener('resize', checkVisibility)

    return () => {
      appContainer?.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [isCarouselActive, totalCards])

  // Separate effect to lock scroll when carousel is active
  useEffect(() => {
    if (!isCarouselActive || lockedScrollPosition.current === null) return

    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    let rafId: number | null = null

    const lockScroll = (e: Event) => {
      // Use RAF to smooth the lock
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (lockedScrollPosition.current !== null) {
          appContainer.scrollTop = lockedScrollPosition.current
        }
      })
    }

    // Add scroll listener to lock position
    appContainer.addEventListener('scroll', lockScroll, { passive: false })

    // Set initial locked position
    appContainer.scrollTop = lockedScrollPosition.current

    return () => {
      appContainer.removeEventListener('scroll', lockScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isCarouselActive])

  // Store active state in ref to avoid stale closure
  const isCarouselActiveRef = useRef(false)
  useEffect(() => {
    isCarouselActiveRef.current = isCarouselActive
  }, [isCarouselActive])

  const currentIndexRef = useRef(0)
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Wheel event handler - set up once and never remove
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if carousel is active using ref (avoids stale closure)
      if (!isCarouselActiveRef.current || isScrollbarDragging.current) {
        return
      }

      console.log('🎯 Intercepting wheel event!')

      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0
      const currentIdx = currentIndexRef.current

      // Check boundaries
      const atFirstCard = currentIdx === 0
      const atLastCard = currentIdx === totalCards - 1

      // Handle boundaries with delay to prevent flicker
      if ((atFirstCard && scrollingUp) || (atLastCard && scrollingDown)) {
        if (!isTryingToScrollPastBoundary.current) {
          // First attempt to scroll past boundary - block it but mark
          isTryingToScrollPastBoundary.current = true
          e.preventDefault()
          e.stopPropagation()

          // Set a timeout to release after persistent attempts
          if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
          boundaryReleaseTimeout.current = setTimeout(() => {
            isTryingToScrollPastBoundary.current = false
            // The deactivation will happen in the scroll check
          }, 500)
          return
        }
        // After delay, let the deactivation happen naturally
        return
      } else {
        // Not at boundary, clear the flag
        isTryingToScrollPastBoundary.current = false
        if (boundaryReleaseTimeout.current) {
          clearTimeout(boundaryReleaseTimeout.current)
          boundaryReleaseTimeout.current = null
        }
      }

      // ALWAYS prevent default scroll when in carousel and not at boundaries
      e.preventDefault()
      e.stopPropagation()

      // Reset accumulator if too much time has passed
      const currentTime = Date.now()
      if (currentTime - lastScrollTime.current > 500) {
        scrollAccumulator.current = 0
      }
      lastScrollTime.current = currentTime

      // Only accumulate if not transitioning
      if (!isTransitioning.current) {
        scrollAccumulator.current += e.deltaY

        // Check if we should change card
        if (Math.abs(scrollAccumulator.current) >= SCROLL_THRESHOLD) {
          if (scrollingDown && currentIdx < totalCards - 1) {
            // Next card
            isTransitioning.current = true
            setScrollDirection('down')
            setCurrentIndex(prev => prev + 1)
            scrollAccumulator.current = 0

            if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
            transitionTimeout.current = setTimeout(() => {
              isTransitioning.current = false
              setScrollDirection(null)
            }, TRANSITION_DURATION)
          } else if (scrollingUp && currentIdx > 0) {
            // Previous card
            isTransitioning.current = true
            setScrollDirection('up')
            setCurrentIndex(prev => prev - 1)
            scrollAccumulator.current = 0

            if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
            transitionTimeout.current = setTimeout(() => {
              isTransitioning.current = false
              setScrollDirection(null)
            }, TRANSITION_DURATION)
          }
        }
      }
    }

    // Add listeners once and keep them
    const appContainer = document.getElementById('app-container')

    // Use capture phase to intercept before any bubbling
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    appContainer?.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      appContainer?.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [totalCards]) // Only depend on totalCards which doesn't change

  // Detect scrollbar dragging
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicking on scrollbar (rough detection)
      const windowWidth = window.innerWidth
      const scrollbarWidth = windowWidth - document.documentElement.clientWidth

      if (e.clientX >= windowWidth - scrollbarWidth - 20) {
        isScrollbarDragging.current = true
      }
    }

    const handleMouseUp = () => {
      isScrollbarDragging.current = false
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Manual navigation
  const goToCard = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalCards && !isTransitioning.current) {
        isTransitioning.current = true
        setScrollDirection(index > currentIndex ? 'down' : 'up')
        setCurrentIndex(index)

        if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
        transitionTimeout.current = setTimeout(() => {
          isTransitioning.current = false
          setScrollDirection(null)
        }, TRANSITION_DURATION)
      }
    },
    [currentIndex, totalCards]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselActive || isTransitioning.current) return

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
  }, [isCarouselActive, currentIndex, totalCards, goToCard])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      if (alignmentTimeout.current) clearTimeout(alignmentTimeout.current)
      if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
    }
  }, [])

  // Preload ALL images on mount for smooth transitions
  useEffect(() => {
    // Preload all DTF images immediately
    dtfs.forEach((dtf) => {
      const cover = dtf?.brand?.cover
      if (cover) {
        const img = new Image()
        img.src = cover
      }
    })
  }, [dtfs])

  // State for viewport height
  const [wrapperHeight, setWrapperHeight] = useState(0)

  // Update wrapper height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      // Exact viewport height minus header
      const height = window.innerHeight - HEADER_HEIGHT
      setWrapperHeight(height)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Always render the container to prevent layout jumps
  // If no DTFs yet, render with minimum height
  if (!dtfs || dtfs.length === 0) {
    return <div style={{ height: `${wrapperHeight || 800}px` }} />
  }

  return (
    <section
      ref={containerRef}
      className="relative"
    >
      {/* Wrapper that will be tracked for visibility */}
      <div
        ref={wrapperRef}
        className="relative w-full bg-primary"
        style={{
          height: `${wrapperHeight || 800}px`,
          minHeight: `${wrapperHeight || 800}px`
        }}
      >
        {/* Cards Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            {/* Card Stack - All cards pre-rendered */}
            <div
              className="relative"
              style={{ width: '100%', height: `${CARD_HEIGHT}px` }}
            >
              {/* Pre-render ALL cards to avoid loading skeletons */}
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0

                // Only show max 3 cards in stack, hide the rest
                const maxStackDepth = 3
                const isInStack =
                  relativePosition >= 0 && relativePosition <= maxStackDepth
                const isPastStack = relativePosition > maxStackDepth

                // Calculate animation values based on relative position
                const yOffset =
                  relativePosition < 0
                    ? 800 // Card has been scrolled past (move down out of view)
                    : isPastStack
                      ? maxStackDepth * CARD_OFFSET // Hidden behind the stack
                      : relativePosition * CARD_OFFSET // Card in visible stack

                const scaleValue =
                  relativePosition < 0
                    ? 0.85
                    : isPastStack
                      ? 1 - maxStackDepth * SCALE_FACTOR // Same scale as deepest visible card
                      : 1 - relativePosition * SCALE_FACTOR

                // Fixed z-index: higher index = higher z-index (cards on top of stack have higher index)
                const zIndexValue = totalCards - relativePosition
                const opacityValue =
                  relativePosition < 0 ? 0 : isPastStack ? 0 : 1

                return (
                  <motion.div
                    key={dtf.address} // Stable key based on DTF address
                    className="absolute inset-0"
                    initial={false} // Prevent initial animation on mount
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
                      willChange: 'transform, opacity',
                      zIndex: zIndexValue,
                    }}
                  >
                    <DTFHomeCardFixed dtf={dtf} />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Debug indicator */}
        {isCarouselActive && (
          <div className="fixed top-24 left-4 bg-green-500 text-white p-2 rounded z-50">
            Carousel Active - Card {currentIndex + 1}/{totalCards}
          </div>
        )}

        {/* Scroll hint - Show when carousel is active */}
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

        {/* Navigation dots indicator */}
        {isCarouselActive && (
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

export default DTFCarouselSimple
