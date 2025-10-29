import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Lenis from 'lenis'

interface DTFCarouselCleanProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselClean = ({ dtfs }: DTFCarouselCleanProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCarouselActive, setIsCarouselActive] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const totalCards = dtfs.length

  // Simplified refs - removed many unnecessary ones
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const isTransitioning = useRef(false)

  // Configuration
  const HEADER_HEIGHT = 72
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 20
  const SCALE_FACTOR = 0.05
  const SCROLL_THRESHOLD = 50
  const TRANSITION_DURATION = 500
  const ACTIVATION_THRESHOLD = 200 // Distance from viewport edge to activate

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    const lenis = new Lenis({
      wrapper: appContainer,
      content: appContainer,
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Simplified scroll detection for carousel activation
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Check if carousel is in the "active zone" (center of viewport)
      const isInActiveZone =
        rect.top <= HEADER_HEIGHT + ACTIVATION_THRESHOLD &&
        rect.bottom >= viewportHeight - ACTIVATION_THRESHOLD

      // Simple activation/deactivation
      if (isInActiveZone && !isCarouselActive) {
        // Entering the carousel zone
        setIsCarouselActive(true)

        // Determine starting index based on scroll direction
        const scrollingDown = rect.top < HEADER_HEIGHT
        if (scrollingDown) {
          setCurrentIndex(0)
        } else {
          setCurrentIndex(totalCards - 1)
        }
      } else if (!isInActiveZone && isCarouselActive) {
        // Leaving the carousel zone
        setIsCarouselActive(false)
        scrollAccumulator.current = 0
      }
    }

    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      appContainer?.removeEventListener('scroll', handleScroll)
    }
  }, [isCarouselActive, totalCards])

  // Store active state in ref for event handlers
  const isCarouselActiveRef = useRef(false)
  useEffect(() => {
    isCarouselActiveRef.current = isCarouselActive
  }, [isCarouselActive])

  const currentIndexRef = useRef(0)
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Simplified wheel handler - no aggressive locking
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isCarouselActiveRef.current) return

      const currentIdx = currentIndexRef.current
      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0

      // At boundaries, let natural scroll take over
      const atFirstCard = currentIdx === 0
      const atLastCard = currentIdx === totalCards - 1

      if ((atFirstCard && scrollingUp) || (atLastCard && scrollingDown)) {
        // Allow natural scroll to exit carousel
        return
      }

      // Only prevent default when actively changing cards
      if (isCarouselActiveRef.current) {
        e.preventDefault()
      }

      // Accumulate scroll
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
            setCurrentIndex(prev => prev + 1)
            scrollAccumulator.current = 0

            setTimeout(() => {
              isTransitioning.current = false
            }, TRANSITION_DURATION)
          } else if (scrollingUp && currentIdx > 0) {
            isTransitioning.current = true
            setCurrentIndex(prev => prev - 1)
            scrollAccumulator.current = 0

            setTimeout(() => {
              isTransitioning.current = false
            }, TRANSITION_DURATION)
          }
        }
      }
    }

    // Single event listener on window
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [totalCards])

  // Manual navigation
  const goToCard = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalCards && !isTransitioning.current) {
        isTransitioning.current = true
        setCurrentIndex(index)

        setTimeout(() => {
          isTransitioning.current = false
        }, TRANSITION_DURATION)
      }
    },
    [totalCards]
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

  // Preload images
  useEffect(() => {
    dtfs.forEach((dtf) => {
      if (dtf?.brand?.cover) {
        const img = new Image()
        img.src = dtf.brand.cover
      }
    })
  }, [dtfs])

  // Viewport height
  const [wrapperHeight, setWrapperHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      setWrapperHeight(window.innerHeight - HEADER_HEIGHT)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  if (!dtfs || dtfs.length === 0) {
    return <div style={{ height: `${wrapperHeight || 800}px` }} />
  }

  return (
    <section className="relative">
      <div
        ref={wrapperRef}
        className="relative w-full bg-primary"
        style={{
          height: `${wrapperHeight || 800}px`,
          minHeight: `${wrapperHeight || 800}px`
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            <div
              className="relative"
              style={{ width: '100%', height: `${CARD_HEIGHT}px` }}
            >
              {/* Render all cards */}
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0
                const maxStackDepth = 3
                const isPastStack = relativePosition > maxStackDepth

                const yOffset =
                  relativePosition < 0
                    ? 800 // Card scrolled past
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
                      },
                      scale: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      },
                      opacity: { duration: 0.2 },
                    }}
                    style={{
                      transformOrigin: 'bottom center',
                      pointerEvents: isTopCard ? 'auto' : 'none',
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

        {/* UI Overlays */}
        <AnimatePresence>
          {isCarouselActive && currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none"
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
        <AnimatePresence>
          {isCarouselActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50"
            >
              {dtfs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCard(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple indicator for active state */}
        <AnimatePresence>
          {isCarouselActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className="text-2xl font-light text-primary-foreground">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="mt-1">/ {String(totalCards).padStart(2, '0')}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default DTFCarouselClean