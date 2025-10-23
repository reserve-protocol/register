import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselSimpleProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselSimple = ({ dtfs, isLoading }: DTFCarouselSimpleProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const totalCards = dtfs.length

  // Configuration
  const SCROLL_PER_CARD = 80 // vh per card
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 15 // Vertical spacing between stacked cards (smaller for tighter stack)
  const SCALE_FACTOR = 0.06 // How much each card scales down (matching reference)

  // Handle scroll with proper hijacking
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    let accumulatedScroll = 0
    const SCROLL_THRESHOLD = 100 // pixels needed to trigger card change

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // Hijack scroll when sticky container is in view and stuck at top
      const stickyTop = rect.top <= 0
      const stickyBottom = rect.bottom >= window.innerHeight
      const isInView = stickyTop && stickyBottom

      // Also check if we're scrolling up at the boundary
      const scrollingUpAtStart = e.deltaY < 0 && currentIndex === 0
      const shouldAllowNormalScroll = scrollingUpAtStart && rect.top >= 0

      if (isInView && !isTransitioning && !shouldAllowNormalScroll) {
        // Prevent default scroll when in card zone
        e.preventDefault()
        e.stopPropagation()

        // Accumulate scroll
        accumulatedScroll += e.deltaY

        // Check if we should change card
        if (Math.abs(accumulatedScroll) >= SCROLL_THRESHOLD) {
          if (e.deltaY > 0 && currentIndex < totalCards - 1) {
            // Scroll down - next card
            setIsTransitioning(true)
            setScrollDirection('down')
            setCurrentIndex(prev => prev + 1)
            accumulatedScroll = 0

            setTimeout(() => {
              setIsTransitioning(false)
              setScrollDirection(null)
            }, 500)
          } else if (e.deltaY < 0 && currentIndex > 0) {
            // Scroll up - previous card
            setIsTransitioning(true)
            setScrollDirection('up')
            setCurrentIndex(prev => prev - 1)
            accumulatedScroll = 0

            setTimeout(() => {
              setIsTransitioning(false)
              setScrollDirection(null)
            }, 500)
          } else {
            // At boundaries - reset accumulator
            accumulatedScroll = 0
          }
        }
      }
    }

    // Add event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [currentIndex, totalCards, isTransitioning])

  // Manual navigation
  const goToCard = (index: number) => {
    if (index >= 0 && index < totalCards && !isTransitioning) {
      setIsTransitioning(true)
      setScrollDirection(index > currentIndex ? 'down' : 'up')
      setCurrentIndex(index)

      setTimeout(() => {
        setIsTransitioning(false)
        setScrollDirection(null)
      }, 500)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isInView = rect.top <= window.innerHeight && rect.bottom >= 0

      if (isInView && !isTransitioning) {
        if (e.key === 'ArrowDown' && currentIndex < totalCards - 1) {
          e.preventDefault()
          goToCard(currentIndex + 1)
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault()
          goToCard(currentIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalCards, isTransitioning])

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

  if (isLoading) {
    return (
      <div style={{ height: `${CARD_HEIGHT}px` }} className="flex items-center justify-center">
        <div className="text-muted-foreground">Loading DTFs...</div>
      </div>
    )
  }

  if (dtfs.length === 0) {
    return (
      <div style={{ height: `${CARD_HEIGHT}px` }} className="flex items-center justify-center">
        <div className="text-muted-foreground">No DTFs available</div>
      </div>
    )
  }

  const containerHeight = (totalCards - 1) * SCROLL_PER_CARD + 50

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}vh` }}
    >
      {/* Sticky wrapper */}
      <div className="sticky top-0 w-full h-screen">

        {/* Navigation UI */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex flex-col gap-2">
            {dtfs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToCard(idx)}
                disabled={isTransitioning}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'w-3 h-3 bg-primary'
                    : idx < currentIndex
                    ? 'bg-primary/40'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to DTF ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => goToCard(currentIndex - 1)}
              disabled={currentIndex === 0 || isTransitioning}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === 0 || isTransitioning
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary'
              )}
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={() => goToCard(currentIndex + 1)}
              disabled={currentIndex === totalCards - 1 || isTransitioning}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === totalCards - 1 || isTransitioning
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary'
              )}
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Counter */}
          <div className="text-xs text-muted-foreground mt-2">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>

        {/* Cards Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div className="relative w-full flex items-center justify-center" style={{ height: `${CARD_HEIGHT}px` }}>

            {/* Card Stack - All cards pre-rendered */}
            <div className="relative" style={{ width: '100%', height: `${CARD_HEIGHT}px` }}>
              {/* Pre-render ALL cards to avoid loading skeletons */}
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0

                // Only show max 3 cards in stack, hide the rest
                const maxStackDepth = 3
                const isInStack = relativePosition >= 0 && relativePosition <= maxStackDepth
                const isPastStack = relativePosition > maxStackDepth

                // Calculate animation values based on relative position
                const topOffset = relativePosition < 0
                  ? -800 // Card has been scrolled past
                  : isPastStack
                  ? maxStackDepth * -CARD_OFFSET // Hidden behind the stack
                  : relativePosition * -CARD_OFFSET // Card in visible stack

                const scaleValue = relativePosition < 0
                  ? 0.82
                  : isPastStack
                  ? 1 - maxStackDepth * SCALE_FACTOR // Same scale as deepest visible card
                  : 1 - relativePosition * SCALE_FACTOR

                const zIndexValue = totalCards - index
                const opacityValue = relativePosition < 0 ? 0 : isPastStack ? 0 : 1

                return (
                  <motion.div
                    key={dtf.id} // Stable key based on DTF id, not index
                    className="absolute inset-0"
                    initial={false} // Prevent initial animation on mount
                    animate={{
                      y: topOffset,
                      scale: scaleValue,
                      opacity: opacityValue
                    }}
                    transition={{
                      y: {
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        mass: 0.8
                      },
                      scale: {
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        mass: 0.8
                      },
                      opacity: { duration: 0.3, ease: "easeOut" }
                    }}
                    style={{
                      transformOrigin: 'top center',
                      pointerEvents: isTopCard ? 'auto' : 'none',
                      willChange: 'auto',
                      zIndex: zIndexValue,
                      transform: 'translateZ(0)' // Force GPU acceleration
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
          {currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
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
      </div>
    </section>
  )
}

export default DTFCarouselSimple