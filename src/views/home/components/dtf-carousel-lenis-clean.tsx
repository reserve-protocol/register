import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Lenis from 'lenis'

interface DTFCarouselLenisCleanProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselLenisClean = ({ dtfs }: DTFCarouselLenisCleanProps) => {
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
  const isTransitioning = useRef(false)
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)

  // Configuration
  const HEADER_HEIGHT = 72
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 20
  const SCALE_FACTOR = 0.05
  const SCROLL_THRESHOLD = 50
  const TRANSITION_DURATION = 500

  // Initialize Lenis
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
      syncTouch: true,
    })

    lenisRef.current = lenis

    // Listen to Lenis scroll
    lenis.on('scroll', ({ scroll }) => {
      if (!wrapperRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2

      // Check if carousel is in the center of viewport
      const carouselCenter = rect.top + rect.height / 2
      const distanceFromCenter = Math.abs(carouselCenter - viewportCenter)

      // Activate when carousel is centered in viewport
      if (!isCarouselActive && distanceFromCenter < 100) {
        setIsCarouselActive(true)
        // Stop Lenis when carousel activates
        lenis.stop()
      }
      // Deactivate when carousel is far from center
      else if (isCarouselActive && distanceFromCenter > 300) {
        const currentIdx = currentIndex
        const atFirstCard = currentIdx === 0
        const atLastCard = currentIdx === totalCards - 1

        // Only deactivate at boundaries
        if ((atFirstCard && rect.top > HEADER_HEIGHT + 150) ||
            (atLastCard && rect.bottom < window.innerHeight - 150)) {
          setIsCarouselActive(false)
          // Restart Lenis when deactivating
          lenis.start()
        }
      }
    })

    // Animation loop
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [isCarouselActive, currentIndex, totalCards])

  // Wheel handler for carousel navigation
  useEffect(() => {
    if (!isCarouselActive) return

    const handleWheel = (e: WheelEvent) => {
      if (!isCarouselActive) return

      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0
      const currentIdx = currentIndex

      const atFirstCard = currentIdx === 0
      const atLastCard = currentIdx === totalCards - 1

      // Allow exit at boundaries
      if ((atFirstCard && scrollingUp) || (atLastCard && scrollingDown)) {
        // Start Lenis for exit
        lenisRef.current?.start()
        return
      }

      // Prevent default scroll and navigate cards
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

    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isCarouselActive, currentIndex, totalCards])

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
              {/* Render all cards with their animations */}
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

export default DTFCarouselLenisClean