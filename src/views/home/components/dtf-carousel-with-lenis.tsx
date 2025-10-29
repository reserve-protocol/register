import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Lenis from 'lenis'

interface DTFCarouselWithLenisProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselWithLenis = ({ dtfs }: DTFCarouselWithLenisProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCarouselActive, setIsCarouselActive] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const totalCards = dtfs.length

  // Mutable refs for scroll handling (same as simple)
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const isScrollbarDragging = useRef(false)
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTransitioning = useRef(false)
  const boundaryReleaseTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTryingToScrollPastBoundary = useRef(false)

  // Configuration (same as simple)
  const HEADER_HEIGHT = 72
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 20
  const SCALE_FACTOR = 0.05
  const SCROLL_THRESHOLD = 50
  const TRANSITION_DURATION = 500

  // States for smooth carousel activation (same as simple)
  const isApproaching = useRef(false)
  const isPositioning = useRef(false)
  const lockedScrollPosition = useRef<number | null>(null)

  // Initialize Lenis ONLY for smooth scrolling
  useEffect(() => {
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    // Create Lenis instance for smooth scrolling
    const lenis = new Lenis({
      wrapper: appContainer,
      content: appContainer,
      lerp: 0.1, // Smoothness factor
      wheelMultiplier: 1, // Keep normal scroll speed
      touchMultiplier: 2,
      smoothWheel: true,
      syncTouch: true,
    })

    lenisRef.current = lenis

    // Animation loop for Lenis
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Main scroll handler (EXACTLY same as simple)
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return

      const appContainer = document.getElementById('app-container')
      if (!appContainer) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const currentIdx = currentIndexRef.current

      // Early detection: when wrapper is approaching
      const isNearingFromTop = rect.top < 300 && rect.top > -100
      const isNearingFromBottom = rect.bottom > window.innerHeight - 300 && rect.bottom < window.innerHeight + 100
      const isNearingWrapper = isNearingFromTop || isNearingFromBottom

      if (!isCarouselActive && !isPositioning.current) {
        if (isNearingWrapper && !isApproaching.current) {
          isApproaching.current = true
          isPositioning.current = true

          // Calculate perfect position
          const perfectPosition = appContainer.scrollTop + (rect.top - HEADER_HEIGHT)

          // Use Lenis for smooth scroll if available, otherwise fallback
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

          lockedScrollPosition.current = perfectPosition

          setTimeout(() => {
            setIsCarouselActive(true)
            isPositioning.current = false

            if (isNearingFromBottom) {
              setCurrentIndex(totalCards - 1)
            } else {
              setCurrentIndex(0)
            }
          }, 400)
        }
      } else if (isCarouselActive) {
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        if ((atFirstCard && rect.top > HEADER_HEIGHT + 150) ||
            (atLastCard && rect.bottom < window.innerHeight - 150)) {
          setIsCarouselActive(false)
          isApproaching.current = false
          lockedScrollPosition.current = null
          scrollAccumulator.current = 0
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

  // Lock scroll position (same as simple)
  useEffect(() => {
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    const lockScroll = () => {
      if (isPositioning.current) {
        return
      }

      if (lockedScrollPosition.current !== null) {
        const currentIdx = currentIndexRef.current
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        const currentScroll = appContainer.scrollTop
        const isScrollingUp = currentScroll < lockedScrollPosition.current
        const isScrollingDown = currentScroll > lockedScrollPosition.current

        // At last card scrolling down - release the lock completely
        if (atLastCard && isScrollingDown) {
          lockedScrollPosition.current = null
          return
        }

        // At first card scrolling up - allow natural scroll
        if (atFirstCard && isScrollingUp) {
          return
        }

        // Lock the scroll position for all other cases
        appContainer.scrollTop = lockedScrollPosition.current
      }
    }

    appContainer.addEventListener('scroll', lockScroll)

    return () => {
      appContainer.removeEventListener('scroll', lockScroll)
    }
  }, [isCarouselActive, totalCards])

  // Store active state in ref (same as simple)
  const isCarouselActiveRef = useRef(false)
  useEffect(() => {
    isCarouselActiveRef.current = isCarouselActive
  }, [isCarouselActive])

  const currentIndexRef = useRef(0)
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Wheel event handler (EXACTLY same as simple)
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

      // At last card scrolling down - let it scroll naturally to exit
      if (atLastCard && scrollingDown) {
        // Don't prevent default - allow natural scroll
        return
      }

      // At first card scrolling up - use the boundary timeout logic
      if (atFirstCard && scrollingUp) {
        if (!isTryingToScrollPastBoundary.current) {
          isTryingToScrollPastBoundary.current = true
          e.preventDefault()
          e.stopPropagation()

          if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
          boundaryReleaseTimeout.current = setTimeout(() => {
            isTryingToScrollPastBoundary.current = false
          }, 500)
          return
        }
        return
      }

      // Clear boundary flags when not at boundaries
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

  // Scrollbar detection (same as simple)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
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

  // Manual navigation (same as simple)
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

  // Keyboard navigation (same as simple)
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

  // Cleanup (same as simple)
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      if (boundaryReleaseTimeout.current) clearTimeout(boundaryReleaseTimeout.current)
    }
  }, [])

  // Preload images (same as simple)
  useEffect(() => {
    dtfs.forEach((dtf) => {
      const cover = dtf?.brand?.cover
      if (cover) {
        const img = new Image()
        img.src = cover
      }
    })
  }, [dtfs])

  // Viewport height management (same as simple)
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
              {/* Render all cards with their animations (EXACTLY same as simple) */}
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
                    <DTFHomeCardFixed dtf={dtf} />
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

export default DTFCarouselWithLenis