import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselFinalFixedProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselFinalFixed = ({ dtfs, isLoading }: DTFCarouselFinalFixedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollLockRef = useRef(false)
  const totalCards = dtfs.length

  // Configuration
  const SCROLL_PER_CARD = 80 // vh per card
  const CARD_HEIGHT = 720

  // Handle scroll with proper hijacking
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    let accumulatedScroll = 0
    const SCROLL_THRESHOLD = 120 // pixels needed to trigger card change

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isInView = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5

      if (isInView && !isTransitioning) {
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
            setCurrentIndex(prev => prev + 1)
            accumulatedScroll = 0

            setTimeout(() => setIsTransitioning(false), 600)
          } else if (e.deltaY < 0 && currentIndex > 0) {
            // Scroll up - previous card
            setIsTransitioning(true)
            setCurrentIndex(prev => prev - 1)
            accumulatedScroll = 0

            setTimeout(() => setIsTransitioning(false), 600)
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
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 600)
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

  // Preload images
  useEffect(() => {
    const preloadRange = 2
    for (let i = Math.max(0, currentIndex - preloadRange); i <= Math.min(totalCards - 1, currentIndex + preloadRange); i++) {
      const cover = dtfs[i]?.brand?.cover
      if (cover) {
        const img = new Image()
        img.src = cover
      }
    }
  }, [currentIndex, dtfs, totalCards])

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

  // Fixed container height calculation
  const containerHeight = (totalCards - 1) * SCROLL_PER_CARD + 50 // Last card doesn't need full scroll

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
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full" style={{ height: `${CARD_HEIGHT}px` }}>

            {/* Stack effect background cards - FULLY VISIBLE */}
            {currentIndex < totalCards - 1 && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  y: 40,
                  scale: 0.96,
                  opacity: 1  // Full opacity for real card effect
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ zIndex: -1 }}
              >
                <div style={{
                  filter: 'brightness(0.9)',  // Slight darkening instead of blur
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}>
                  <DTFHomeCardFixed dtf={dtfs[currentIndex + 1]} />
                </div>
              </motion.div>
            )}

            {currentIndex < totalCards - 2 && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  y: 80,
                  scale: 0.92,
                  opacity: 0.9  // Almost full opacity
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ zIndex: -2 }}
              >
                <div style={{
                  filter: 'brightness(0.8)',  // More darkening for depth
                  boxShadow: '0 15px 50px rgba(0,0,0,0.15)'
                }}>
                  <DTFHomeCardFixed dtf={dtfs[currentIndex + 2]} />
                </div>
              </motion.div>
            )}

            {/* Current card with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{
                  y: 100,
                  rotateX: 10,
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  rotateX: 0,
                  opacity: 1
                }}
                exit={{
                  y: -100,
                  rotateX: -10,
                  opacity: 0
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.32, 0.72, 0, 1]
                }}
                style={{
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d'
                }}
              >
                <DTFHomeCardFixed dtf={dtfs[currentIndex]} />
              </motion.div>
            </AnimatePresence>
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

export default DTFCarouselFinalFixed