import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import DTFCarouselCard from './dtf-carousel-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarousel = ({ dtfs, isLoading }: DTFCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout>()
  const scrollAccumulator = useRef(0)
  const totalCards = dtfs.length

  // Handle card change
  const goToCard = (index: number) => {
    if (index >= 0 && index < totalCards && !isScrollLocked) {
      setCurrentIndex(index)
      setIsFirstLoad(false)
      setIsScrollLocked(true)
      scrollAccumulator.current = 0

      // Unlock after animation
      clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        setIsScrollLocked(false)
      }, 600)
    }
  }

  // Setup scroll hijacking when carousel is at the top of viewport
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    const container = containerRef.current

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect()

      // Check if carousel is at the top of viewport (with some tolerance)
      const isAtTop = rect.top <= 100 && rect.bottom > 200

      if (isAtTop) {
        e.preventDefault()
        e.stopPropagation()

        if (!isScrollLocked) {
          scrollAccumulator.current += e.deltaY

          // Threshold for triggering card change
          if (Math.abs(scrollAccumulator.current) > 50) {
            if (e.deltaY > 0 && currentIndex < totalCards - 1) {
              goToCard(currentIndex + 1)
            } else if (e.deltaY < 0 && currentIndex > 0) {
              goToCard(currentIndex - 1)
            } else {
              scrollAccumulator.current = 0
            }
          }
        }
      }
    }

    // Use the app-container for scroll events since that's the main scroll container
    const appContainer = document.getElementById('app-container')
    if (appContainer) {
      appContainer.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        appContainer.removeEventListener('wheel', handleWheel)
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [currentIndex, totalCards, isScrollLocked])

  // Touch support
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    const container = containerRef.current
    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect()
      const isAtTop = rect.top <= 100 && rect.bottom > 200

      if (isAtTop) {
        e.preventDefault()
        touchEndY = e.touches[0].clientY
      }
    }

    const handleTouchEnd = () => {
      if (touchStartY && touchEndY) {
        const deltaY = touchStartY - touchEndY
        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0 && currentIndex < totalCards - 1) {
            goToCard(currentIndex + 1)
          } else if (deltaY < 0 && currentIndex > 0) {
            goToCard(currentIndex - 1)
          }
        }
        touchStartY = 0
        touchEndY = 0
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentIndex, totalCards])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [currentIndex, totalCards])

  // Preload images
  useEffect(() => {
    const start = Math.max(0, currentIndex - 2)
    const end = Math.min(totalCards, currentIndex + 3)

    for (let i = start; i < end; i++) {
      if (dtfs[i]?.brand?.cover) {
        const img = new Image()
        img.src = dtfs[i].brand.cover
      }
    }
  }, [currentIndex, dtfs, totalCards])

  if (isLoading) {
    return (
      <div className="min-h-[800px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading DTFs...</div>
      </div>
    )
  }

  if (dtfs.length === 0) {
    return (
      <div className="min-h-[800px] flex items-center justify-center">
        <div className="text-muted-foreground">No DTFs available</div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-[800px]" ref={containerRef}>
      {/* Fixed Navigation UI */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
        {/* Progress dots */}
        <div className="flex flex-col gap-2">
          {dtfs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToCard(idx)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                idx === currentIndex
                  ? 'bg-primary w-3 h-3'
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
            disabled={currentIndex === 0}
            className={cn(
              'p-2 rounded-full border transition-all',
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed border-muted'
                : 'hover:bg-accent hover:border-primary'
            )}
            aria-label="Previous DTF"
          >
            <ChevronUp size={20} />
          </button>
          <button
            onClick={() => goToCard(currentIndex + 1)}
            disabled={currentIndex === totalCards - 1}
            className={cn(
              'p-2 rounded-full border transition-all',
              currentIndex === totalCards - 1
                ? 'opacity-30 cursor-not-allowed border-muted'
                : 'hover:bg-accent hover:border-primary'
            )}
            aria-label="Next DTF"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative h-[800px] flex items-center justify-center overflow-hidden">
        {/* Current card counter */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>

        {/* Cards Container - with proper sizing */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4" style={{ height: '600px' }}>
          {/* Only render visible cards for performance */}
          {dtfs.map((dtf, idx) => {
            const distance = Math.abs(idx - currentIndex)
            const isVisible = distance <= 2 // Only render ±2 cards from current

            if (!isVisible) return null

            return (
              <DTFCarouselCard
                key={dtf.address}
                dtf={dtf}
                index={idx}
                currentIndex={currentIndex}
                isVisible={idx === currentIndex}
                isFirstLoad={isFirstLoad && idx === 0}
              />
            )
          })}
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">
                Scroll to explore
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ChevronDown size={20} className="text-muted-foreground" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DTFCarousel