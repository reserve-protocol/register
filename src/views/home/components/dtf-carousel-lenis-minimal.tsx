import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Lenis from 'lenis'

interface DTFCarouselLenisMinimalProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// This is the SIMPLE carousel with MINIMAL Lenis integration
// Lenis is ONLY used for smooth scrolling, NOT for control
const DTFCarouselLenisMinimal = ({ dtfs, isLoading }: DTFCarouselLenisMinimalProps) => {
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
  const exitDirection = useRef<'top' | 'bottom' | null>(null) // Track which way user exited
  const lastExitIndex = useRef<number | null>(null) // Remember which card we exited from

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
        // Check exit direction to prevent immediate re-engagement
        if (exitDirection.current) {
          // If exited from top, only block re-engagement if approaching from top
          if (exitDirection.current === 'top' && isNearingFromTop) {
            return // Don't re-engage
          }
          // If exited from bottom, only block re-engagement if approaching from bottom
          if (exitDirection.current === 'bottom' && isNearingFromBottom) {
            return // Don't re-engage
          }
          // Clear exit direction if approaching from opposite side or far away
          const isFarAway = rect.bottom < -200 || rect.top > window.innerHeight + 200
          if (isFarAway) {
            // Far away - clear everything for fresh engagement
            exitDirection.current = null
            lastExitIndex.current = null
          } else if ((exitDirection.current === 'top' && isNearingFromBottom) ||
                     (exitDirection.current === 'bottom' && isNearingFromTop)) {
            // Approaching from opposite direction - clear exit direction but keep index
            exitDirection.current = null
          }
        }

        if (isNearingWrapper && !isApproaching.current && !exitDirection.current) {
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

  // No lock scroll needed - Lenis stop() handles it when carousel is active

  // Store active state in ref
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

  // Scrollbar detection
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
              {/* Render all cards with animations */}
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

export default DTFCarouselLenisMinimal