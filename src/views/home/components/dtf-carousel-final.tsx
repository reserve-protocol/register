import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import DTFHomeCard from './dtf-home-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselFinalProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselFinal = ({ dtfs, isLoading }: DTFCarouselFinalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const totalCards = dtfs.length

  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    const handleScroll = () => {
      if (!containerRef.current || isAnimatingRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const containerTop = rect.top
      const containerHeight = rect.height
      const viewportHeight = window.innerHeight

      // Height per card section (more scroll distance needed per card)
      const scrollPerCard = viewportHeight * 1.5 // Increase this for more scroll distance per card

      // Only process when container is in view
      if (containerTop <= viewportHeight * 0.3 && containerTop > -(containerHeight - viewportHeight)) {
        // Calculate how much we've scrolled into the container
        const scrolledIntoContainer = Math.abs(containerTop - viewportHeight * 0.3)

        // Calculate which card should be showing (with larger scroll zones)
        const newIndex = Math.min(
          Math.floor(scrolledIntoContainer / scrollPerCard),
          totalCards - 1
        )

        // Only update if index changed to avoid unnecessary renders
        if (newIndex !== currentIndex && !isAnimatingRef.current) {
          isAnimatingRef.current = true
          setCurrentIndex(newIndex)
          setIsFirstLoad(false)

          // Reset animation lock after animation completes
          setTimeout(() => {
            isAnimatingRef.current = false
          }, 600)
        }
      }
    }

    // Throttle scroll events for better performance
    let ticking = false
    const handleScrollThrottled = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    const scrollContainer = document.getElementById('app-container')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScrollThrottled, { passive: true })
      handleScroll() // Initial check
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScrollThrottled)
      }
    }
  }, [currentIndex, totalCards])

  // Manual navigation
  const goToCard = (index: number) => {
    if (index >= 0 && index < totalCards && !isAnimatingRef.current) {
      isAnimatingRef.current = true
      setCurrentIndex(index)
      setIsFirstLoad(false)

      setTimeout(() => {
        isAnimatingRef.current = false
      }, 600)
    }
  }

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
    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(totalCards, currentIndex + 2)

    for (let i = start; i < end; i++) {
      if (dtfs[i]?.brand?.cover) {
        const img = new Image()
        img.src = dtfs[i].brand.cover
      }
    }
  }, [currentIndex, dtfs, totalCards])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading DTFs...</div>
      </div>
    )
  }

  if (dtfs.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">No DTFs available</div>
      </div>
    )
  }

  // Container height: enough scroll distance for smooth transitions
  // Each card needs about 1.5x viewport height of scroll
  const containerHeight = `${totalCards * 150}vh`

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: containerHeight }}
    >
      {/* Sticky wrapper - stays in center of viewport */}
      <div className="sticky top-0 h-screen flex items-center justify-center">

        {/* Navigation UI - Fixed position on right */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex flex-col gap-2">
            {dtfs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToCard(idx)}
                disabled={isAnimatingRef.current}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
                  idx === currentIndex
                    ? 'bg-primary w-3 h-3'
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
              disabled={currentIndex === 0 || isAnimatingRef.current}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === 0 || isAnimatingRef.current
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary cursor-pointer'
              )}
              aria-label="Previous DTF"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={() => goToCard(currentIndex + 1)}
              disabled={currentIndex === totalCards - 1 || isAnimatingRef.current}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === totalCards - 1 || isAnimatingRef.current
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary cursor-pointer'
              )}
              aria-label="Next DTF"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Current card indicator */}
          <div className="text-xs text-muted-foreground mt-2">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>

        {/* Cards Container - Centered in viewport */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4">
          <AnimatePresence mode="wait">
            {dtfs.map((dtf, idx) => {
              if (idx !== currentIndex) return null

              return (
                <motion.div
                  key={dtf.address}
                  initial={isFirstLoad && idx === 0 ? false : {
                    opacity: 0,
                    y: 100,
                    rotateX: 15
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -100,
                    rotateX: -15
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1]
                  }}
                  style={{
                    perspective: 1200,
                    transformStyle: 'preserve-3d'
                  }}
                  className="w-full"
                >
                  <DTFHomeCard dtf={dtf} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Scroll hint - positioned at bottom of viewport */}
        <AnimatePresence>
          {currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
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
    </section>
  )
}

export default DTFCarouselFinal