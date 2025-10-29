import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState, memo } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Lenis from 'lenis'

interface DTFCarouselLenisOptimizedRenderProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// Memoize the card component with deep comparison
const MemoizedCard = memo(DTFHomeCardFixed, (prevProps, nextProps) => {
  return prevProps.dtf.address === nextProps.dtf.address
})

// This is the SAME as minimal but with ONLY rendering optimizations
const DTFCarouselLenisOptimizedRender = ({ dtfs, isLoading }: DTFCarouselLenisOptimizedRenderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCarouselActive, setIsCarouselActive] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const totalCards = dtfs.length

  // Mutable refs for scroll handling (avoid stale closures)
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
  const CARD_OFFSET = 20
  const SCALE_FACTOR = 0.05
  const SCROLL_THRESHOLD = 50
  const TRANSITION_DURATION = 500

  // States for smooth carousel activation
  const isApproaching = useRef(false)
  const isPositioning = useRef(false)
  const lockedScrollPosition = useRef<number | null>(null)
  const exitDirection = useRef<'top' | 'bottom' | null>(null)
  const lastExitIndex = useRef<number | null>(null)

  // Initialize Lenis ONLY for smooth scrolling
  useEffect(() => {
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    const lenis = new Lenis({
      wrapper: appContainer,
      content: appContainer,
      lerp: 0.1, // Smooth scrolling
      wheelMultiplier: 1,
      touchMultiplier: 2,
      smoothWheel: true,
      syncTouch: true,
    })

    lenisRef.current = lenis

    // Animation loop for Lenis
    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  // Main scroll handler (EXACTLY same as minimal)
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return

      const appContainer = document.getElementById('app-container')
      if (!appContainer) return

      // Skip all carousel logic if scrollbar is being dragged
      if (isScrollbarDragging.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const currentIdx = currentIndexRef.current

      // Early detection: when wrapper is approaching
      const isNearingFromTop = rect.top < 300 && rect.top > -100
      const isNearingFromBottom = rect.bottom > window.innerHeight - 300 && rect.bottom < window.innerHeight + 100
      const isNearingWrapper = isNearingFromTop || isNearingFromBottom

      if (!isCarouselActive && !isPositioning.current) {
        // First, clear exit state if carousel has moved away from viewport
        if (exitDirection.current) {
          const carouselAboveViewport = rect.bottom < 0
          const carouselBelowViewport = rect.top > window.innerHeight

          if (carouselAboveViewport || carouselBelowViewport) {
            // Carousel is completely out of view - clear for fresh engagement
            exitDirection.current = null
            lastExitIndex.current = null
          }
        }

        // Then check if we should block re-engagement based on exit direction
        if (exitDirection.current) {
          // Only block if we're still very close to the exit point
          if (exitDirection.current === 'top' && rect.top > HEADER_HEIGHT && rect.top < HEADER_HEIGHT + 100) {
            return // Still too close to exit point
          }
          if (exitDirection.current === 'bottom' && rect.bottom < window.innerHeight && rect.bottom > window.innerHeight - 100) {
            return // Still too close to exit point
          }
          // If we're approaching from opposite direction, clear exit but keep index
          if ((exitDirection.current === 'top' && isNearingFromBottom) ||
              (exitDirection.current === 'bottom' && isNearingFromTop)) {
            exitDirection.current = null
          }
        }

        // Check if we have a scrollbar release index waiting to be used
        const shouldEngageWithScrollbarIndex = scrollbarReleaseIndex.current !== null && isNearingWrapper

        if ((isNearingWrapper && !isApproaching.current && !exitDirection.current) || shouldEngageWithScrollbarIndex) {
          isApproaching.current = true
          isPositioning.current = true

          // Calculate perfect position
          const currentScroll = lenisRef.current?.scroll || appContainer.scrollTop
          const perfectPosition = currentScroll + (rect.top - HEADER_HEIGHT)

          // Lock position immediately
          lockedScrollPosition.current = perfectPosition

          // Use Lenis to scroll smoothly
          if (lenisRef.current) {
            lenisRef.current.scrollTo(perfectPosition, {
              duration: 0.4,
              easing: (t) => 1 - Math.pow(1 - t, 3),
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

            // STOP LENIS when carousel becomes active
            if (lenisRef.current) {
              lenisRef.current.stop()
            }

            // If we have a saved exit index, restore it (re-engagement)
            if (lastExitIndex.current !== null) {
              setCurrentIndex(lastExitIndex.current)
              lastExitIndex.current = null // Clear after using
            } else if (scrollbarReleaseIndex.current !== null) {
              // If user was dragging scrollbar, restore to that index
              setCurrentIndex(scrollbarReleaseIndex.current)
              scrollbarReleaseIndex.current = null
            } else {
              // First time engagement - set index based on approach direction
              if (isNearingFromBottom) {
                setCurrentIndex(totalCards - 1)
              } else {
                setCurrentIndex(0)
              }
            }
          }, 400)
        }
      } else if (isCarouselActive) {
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        // Deactivate with lenient thresholds
        if ((atFirstCard && rect.top > HEADER_HEIGHT + 150) ||
            (atLastCard && rect.bottom < window.innerHeight - 150)) {
          setIsCarouselActive(false)
          isApproaching.current = false
          lockedScrollPosition.current = null
          scrollAccumulator.current = 0

          // Save the current index for re-engagement
          lastExitIndex.current = currentIdx

          // Set exit direction based on which boundary we exited from
          if (atFirstCard && rect.top > HEADER_HEIGHT + 150) {
            exitDirection.current = 'top' // Exited from top boundary
          } else if (atLastCard && rect.bottom < window.innerHeight - 150) {
            exitDirection.current = 'bottom' // Exited from bottom boundary
          }

          // RESTART LENIS when exiting carousel
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
    }
  }, [isCarouselActive, totalCards])

  // Store active state in ref
  const isCarouselActiveRef = useRef(false)
  useEffect(() => {
    isCarouselActiveRef.current = isCarouselActive
  }, [isCarouselActive])

  const currentIndexRef = useRef(0)
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Wheel event handler (EXACTLY same as minimal)
  useEffect(() => {
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

      // At first card scrolling up - use boundary timeout
      if (atFirstCard && scrollingUp) {
        if (!isTryingToScrollPastBoundary.current) {
          isTryingToScrollPastBoundary.current = true
          e.preventDefault()
          e.stopPropagation()

          if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
          boundaryReleaseTimeout.current = setTimeout(() => {
            isTryingToScrollPastBoundary.current = false
            // Start Lenis for exit
            if (lenisRef.current) {
              lenisRef.current.start()
            }
          }, 500)
          return
        }
        return
      }

      // At last card scrolling down - allow exit immediately
      if (atLastCard && scrollingDown) {
        // Start Lenis for immediate exit
        if (lenisRef.current) {
          lenisRef.current.start()
        }
        return
      }

      // Clear boundary flags
      isTryingToScrollPastBoundary.current = false
      if (boundaryReleaseTimeout.current) {
        clearTimeout(boundaryReleaseTimeout.current)
        boundaryReleaseTimeout.current = null
      }

      e.preventDefault()
      e.stopPropagation()

      const currentTime = Date.now()
      if (currentTime - lastScrollTime.current > 500) {
        scrollAccumulator.current = 0
      }
      lastScrollTime.current = currentTime

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

    const appContainer = document.getElementById('app-container')
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    appContainer?.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      appContainer?.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [totalCards])

  // Scrollbar detection (EXACTLY same as minimal)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const scrollbarWidth = windowWidth - document.documentElement.clientWidth

      // Check if clicking on or near the scrollbar (with some tolerance)
      if (e.clientX >= windowWidth - scrollbarWidth - 20) {
        isScrollbarDragging.current = true

        // Save current index if carousel is active
        if (isCarouselActiveRef.current) {
          scrollbarReleaseIndex.current = currentIndexRef.current

          // Deactivate carousel immediately to prevent conflicts
          setIsCarouselActive(false)
          isApproaching.current = false
          lockedScrollPosition.current = null
          scrollAccumulator.current = 0

          // Restart Lenis for smooth scrollbar dragging
          if (lenisRef.current) {
            lenisRef.current.start()
          }
        }
      }
    }

    const handleMouseUp = () => {
      if (isScrollbarDragging.current) {
        isScrollbarDragging.current = false

        // Clear the saved index if user scrolled far away
        setTimeout(() => {
          if (!wrapperRef.current) return

          const rect = wrapperRef.current.getBoundingClientRect()
          const farFromCarousel = rect.bottom < -200 || rect.top > window.innerHeight + 200

          if (farFromCarousel) {
            scrollbarReleaseIndex.current = null
          }
        }, 100)
      }
    }

    // Also detect if mouse leaves the window while dragging
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
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
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
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
          minHeight: `${wrapperHeight || 800}px`
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            <div
              className="relative"
              style={{ width: '100%', height: `${CARD_HEIGHT}px` }}
            >
              {/* Render ALL cards - EXACT same as minimal version */}
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0

                const maxStackDepth = 3
                const isInStack = relativePosition >= 0 && relativePosition <= maxStackDepth
                const isPastStack = relativePosition > maxStackDepth

                const yOffset =
                  relativePosition < 0
                    ? 800
                    : isPastStack
                      ? maxStackDepth * CARD_OFFSET
                      : relativePosition * CARD_OFFSET

                const scaleValue =
                  relativePosition < 0
                    ? 0.85
                    : isPastStack
                      ? 1 - maxStackDepth * SCALE_FACTOR
                      : 1 - relativePosition * SCALE_FACTOR

                const zIndexValue = totalCards - relativePosition
                const opacityValue = relativePosition < 0 ? 0 : isPastStack ? 0 : 1

                return (
                  <motion.div
                    key={dtf.address}
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
                      willChange: 'transform, opacity',
                      zIndex: zIndexValue,
                    }}
                  >
                    <MemoizedCard dtf={dtf} />
                  </motion.div>
                )
              })}
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

export default DTFCarouselLenisOptimizedRender