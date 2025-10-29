import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence, MotionValue, useTransform, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Lenis from 'lenis'

interface DTFCarouselPerformanceProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// Memoized card component to prevent unnecessary re-renders
const CarouselCard = memo(({
  dtf,
  index,
  currentIndex,
  totalCards,
  isCarouselActive
}: {
  dtf: IndexDTFItem
  index: number
  currentIndex: number
  totalCards: number
  isCarouselActive: boolean
}) => {
  const CARD_OFFSET = 20
  const SCALE_FACTOR = 0.05

  const relativePosition = index - currentIndex
  const isTopCard = relativePosition === 0
  const maxStackDepth = 3
  const isPastStack = relativePosition > maxStackDepth

  // Only render cards that are visible or close to being visible
  const shouldRender = relativePosition >= -1 && relativePosition <= maxStackDepth + 1

  if (!shouldRender) {
    return null
  }

  const yOffset = useMemo(() => {
    if (relativePosition < 0) return 800
    if (isPastStack) return maxStackDepth * CARD_OFFSET
    return relativePosition * CARD_OFFSET
  }, [relativePosition, isPastStack, maxStackDepth])

  const scaleValue = useMemo(() => {
    if (relativePosition < 0) return 0.85
    if (isPastStack) return 1 - maxStackDepth * SCALE_FACTOR
    return 1 - relativePosition * SCALE_FACTOR
  }, [relativePosition, isPastStack, maxStackDepth])

  const opacityValue = relativePosition < 0 ? 0 : isPastStack ? 0 : 1
  const zIndexValue = totalCards - relativePosition

  // Only use willChange on cards that are actively animating
  const willChange = isCarouselActive && relativePosition >= -1 && relativePosition <= 1
    ? 'transform, opacity'
    : 'auto'

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{
        y: yOffset,
        scale: scaleValue,
        opacity: opacityValue,
      }}
      transition={{
        // Use simpler transitions for better performance
        y: {
          type: 'tween',
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1], // Custom ease curve
        },
        scale: {
          type: 'tween',
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1],
        },
        opacity: {
          duration: 0.2,
          ease: 'linear' // Simpler easing for opacity
        },
      }}
      style={{
        transformOrigin: 'bottom center',
        pointerEvents: isTopCard ? 'auto' : 'none',
        willChange,
        zIndex: zIndexValue,
        // Force GPU acceleration
        transform: 'translateZ(0)',
      }}
    >
      <DTFHomeCardFixed dtf={dtf} />
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  const prevRelative = prevProps.index - prevProps.currentIndex
  const nextRelative = nextProps.index - nextProps.currentIndex

  // Only re-render if the card's relative position changes
  // or if it's transitioning in/out of the visible range
  const wasVisible = prevRelative >= -1 && prevRelative <= 4
  const isVisible = nextRelative >= -1 && nextRelative <= 4

  return (
    prevRelative === nextRelative &&
    wasVisible === isVisible &&
    prevProps.isCarouselActive === nextProps.isCarouselActive &&
    prevProps.dtf.address === nextProps.dtf.address
  )
})

CarouselCard.displayName = 'CarouselCard'

// Performance-optimized carousel
const DTFCarouselPerformance = ({ dtfs, isLoading }: DTFCarouselPerformanceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCarouselActive, setIsCarouselActive] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const totalCards = dtfs.length

  // Mutable refs for scroll handling
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const isScrollbarDragging = useRef(false)
  const scrollbarReleaseIndex = useRef<number | null>(null)
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTransitioning = useRef(false)
  const boundaryReleaseTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTryingToScrollPastBoundary = useRef(false)

  // Configuration
  const HEADER_HEIGHT = 72
  const CARD_HEIGHT = 720
  const SCROLL_THRESHOLD = 50
  const TRANSITION_DURATION = 400

  // States for smooth carousel activation
  const isApproaching = useRef(false)
  const isPositioning = useRef(false)
  const lockedScrollPosition = useRef<number | null>(null)
  const exitDirection = useRef<'top' | 'bottom' | null>(null)
  const lastExitIndex = useRef<number | null>(null)

  // Use RAF for scroll handling to improve performance
  const rafId = useRef<number | null>(null)
  const lastScrollPosition = useRef(0)

  // Initialize Lenis with performance optimizations
  useEffect(() => {
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    const lenis = new Lenis({
      wrapper: appContainer,
      content: appContainer,
      lerp: 0.12, // Slightly higher lerp for snappier response
      wheelMultiplier: 1,
      touchMultiplier: 2,
      smoothWheel: true,
      syncTouch: true,
      // Performance optimizations
      normalizeWheel: true,
      gestureOrientation: 'vertical',
    })

    lenisRef.current = lenis

    // Use RAF for smooth animation
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Optimized scroll handler with RAF throttling
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking && !isScrollbarDragging.current) {
        requestAnimationFrame(() => {
          processScroll()
          ticking = false
        })
        ticking = true
      }
    }

    const processScroll = () => {
      if (!wrapperRef.current) return

      const appContainer = document.getElementById('app-container')
      if (!appContainer) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const currentIdx = currentIndexRef.current

      // Early detection with optimized thresholds
      const threshold = 250 // Reduced threshold for quicker response
      const isNearingFromTop = rect.top < threshold && rect.top > -50
      const isNearingFromBottom = rect.bottom > window.innerHeight - threshold && rect.bottom < window.innerHeight + 50
      const isNearingWrapper = isNearingFromTop || isNearingFromBottom

      if (!isCarouselActive && !isPositioning.current) {
        // Clear exit state if carousel moved away
        if (exitDirection.current) {
          const carouselAboveViewport = rect.bottom < -100
          const carouselBelowViewport = rect.top > window.innerHeight + 100

          if (carouselAboveViewport || carouselBelowViewport) {
            exitDirection.current = null
            lastExitIndex.current = null
          }
        }

        // Check exit direction blocking
        if (exitDirection.current) {
          if (exitDirection.current === 'top' && rect.top > HEADER_HEIGHT && rect.top < HEADER_HEIGHT + 80) {
            return
          }
          if (exitDirection.current === 'bottom' && rect.bottom < window.innerHeight && rect.bottom > window.innerHeight - 80) {
            return
          }
          if ((exitDirection.current === 'top' && isNearingFromBottom) ||
              (exitDirection.current === 'bottom' && isNearingFromTop)) {
            exitDirection.current = null
          }
        }

        // Check for engagement
        const shouldEngageWithScrollbarIndex = scrollbarReleaseIndex.current !== null && isNearingWrapper

        if ((isNearingWrapper && !isApproaching.current && !exitDirection.current) || shouldEngageWithScrollbarIndex) {
          isApproaching.current = true
          isPositioning.current = true

          const currentScroll = lenisRef.current?.scroll || appContainer.scrollTop
          const perfectPosition = currentScroll + (rect.top - HEADER_HEIGHT)

          lockedScrollPosition.current = perfectPosition

          if (lenisRef.current) {
            lenisRef.current.scrollTo(perfectPosition, {
              duration: 0.35, // Slightly faster
              easing: (t) => 1 - Math.pow(1 - t, 4), // Smoother easing
            })
          } else {
            appContainer.scrollTo({
              top: perfectPosition,
              behavior: 'smooth'
            })
          }

          setTimeout(() => {
            setIsCarouselActive(true)
            isPositioning.current = false

            if (lenisRef.current) {
              lenisRef.current.stop()
            }

            // Restore index based on exit method
            if (lastExitIndex.current !== null) {
              setCurrentIndex(lastExitIndex.current)
              lastExitIndex.current = null
            } else if (scrollbarReleaseIndex.current !== null) {
              setCurrentIndex(scrollbarReleaseIndex.current)
              scrollbarReleaseIndex.current = null
            } else {
              setCurrentIndex(isNearingFromBottom ? totalCards - 1 : 0)
            }
          }, 350)
        }
      } else if (isCarouselActive) {
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        // Deactivate thresholds
        if ((atFirstCard && rect.top > HEADER_HEIGHT + 120) ||
            (atLastCard && rect.bottom < window.innerHeight - 120)) {
          setIsCarouselActive(false)
          isApproaching.current = false
          lockedScrollPosition.current = null
          scrollAccumulator.current = 0

          lastExitIndex.current = currentIdx

          if (atFirstCard && rect.top > HEADER_HEIGHT + 120) {
            exitDirection.current = 'top'
          } else if (atLastCard && rect.bottom < window.innerHeight - 120) {
            exitDirection.current = 'bottom'
          }

          if (lenisRef.current) {
            lenisRef.current.start()
          }
        }
      }

      if (!isNearingWrapper && !isCarouselActive) {
        isApproaching.current = false
      }
    }

    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      appContainer?.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isCarouselActive, totalCards])

  // Store refs for callbacks
  const isCarouselActiveRef = useRef(false)
  useEffect(() => {
    isCarouselActiveRef.current = isCarouselActive
  }, [isCarouselActive])

  const currentIndexRef = useRef(0)
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Optimized wheel handler
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout | null = null

    const handleWheel = (e: WheelEvent) => {
      if (isPositioning.current) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (!isCarouselActiveRef.current || isScrollbarDragging.current) {
        return
      }

      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0
      const currentIdx = currentIndexRef.current

      const atFirstCard = currentIdx === 0
      const atLastCard = currentIdx === totalCards - 1

      // Boundary handling
      if (atFirstCard && scrollingUp) {
        if (!isTryingToScrollPastBoundary.current) {
          isTryingToScrollPastBoundary.current = true
          e.preventDefault()
          e.stopPropagation()

          if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
          boundaryReleaseTimeout.current = setTimeout(() => {
            isTryingToScrollPastBoundary.current = false
            if (lenisRef.current) {
              lenisRef.current.start()
            }
          }, 450) // Slightly faster timeout
          return
        }
        return
      }

      if (atLastCard && scrollingDown) {
        if (lenisRef.current) {
          lenisRef.current.start()
        }
        return
      }

      isTryingToScrollPastBoundary.current = false
      if (boundaryReleaseTimeout.current) {
        clearTimeout(boundaryReleaseTimeout.current)
        boundaryReleaseTimeout.current = null
      }

      e.preventDefault()
      e.stopPropagation()

      // Debounce wheel events for smoother performance
      if (wheelTimeout) clearTimeout(wheelTimeout)
      wheelTimeout = setTimeout(() => {
        scrollAccumulator.current = 0
      }, 100)

      if (!isTransitioning.current) {
        scrollAccumulator.current += e.deltaY

        if (Math.abs(scrollAccumulator.current) >= SCROLL_THRESHOLD) {
          if (scrollingDown && currentIdx < totalCards - 1) {
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

    // Only add listener once on window with capture
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      if (wheelTimeout) clearTimeout(wheelTimeout)
    }
  }, [totalCards])

  // Optimized scrollbar detection
  useEffect(() => {
    let scrollbarCheckRaf: number | null = null

    const handleMouseDown = (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const scrollbarWidth = windowWidth - document.documentElement.clientWidth

      if (e.clientX >= windowWidth - scrollbarWidth - 20) {
        isScrollbarDragging.current = true

        if (isCarouselActiveRef.current) {
          scrollbarReleaseIndex.current = currentIndexRef.current
          setIsCarouselActive(false)
          isApproaching.current = false
          lockedScrollPosition.current = null
          scrollAccumulator.current = 0

          if (lenisRef.current) {
            lenisRef.current.start()
          }
        }
      }
    }

    const handleMouseUp = () => {
      if (isScrollbarDragging.current) {
        isScrollbarDragging.current = false

        // Use RAF for position check
        scrollbarCheckRaf = requestAnimationFrame(() => {
          if (!wrapperRef.current) return

          const rect = wrapperRef.current.getBoundingClientRect()
          const farFromCarousel = rect.bottom < -200 || rect.top > window.innerHeight + 200

          if (farFromCarousel) {
            scrollbarReleaseIndex.current = null
          }
        })
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientX >= window.innerWidth - 50) {
        handleMouseUp()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (scrollbarCheckRaf) cancelAnimationFrame(scrollbarCheckRaf)
    }
  }, [])

  // Memoized navigation function
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

  // Keyboard navigation with memoization
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  // Viewport height management
  const [wrapperHeight, setWrapperHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      const height = window.innerHeight - HEADER_HEIGHT
      setWrapperHeight(height)
    }

    updateHeight()

    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateHeight, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

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
          minHeight: `${wrapperHeight || 800}px`,
          // Force GPU acceleration
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            <div
              className="relative"
              style={{
                width: '100%',
                height: `${CARD_HEIGHT}px`,
                // Optimize rendering
                contain: 'layout style paint',
              }}
            >
              {/* Render only visible cards with memoization */}
              {dtfs.map((dtf, index) => (
                <CarouselCard
                  key={dtf.address}
                  dtf={dtf}
                  index={index}
                  currentIndex={currentIndex}
                  totalCards={totalCards}
                  isCarouselActive={isCarouselActive}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint with optimized animation */}
        <AnimatePresence mode="wait">
          {isCarouselActive && currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none"
            >
              <div className="text-xs text-muted-foreground mb-2">
                Scroll to explore
              </div>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <ChevronDown size={20} className="text-muted-foreground" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation dots optimized */}
        {isCarouselActive && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
            {dtfs.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
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

export default DTFCarouselPerformance