import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import DTFHomeCard from './dtf-home-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselPolishedProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselPolished = ({ dtfs, isLoading }: DTFCarouselPolishedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const lastScrollPosition = useRef(0)
  const totalCards = dtfs.length

  // Shorter scroll distance per card for snappier feel
  const SCROLL_PER_CARD = 80 // 80vh per card - much more responsive
  const CARD_HEIGHT = 667 // Fixed height in pixels

  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const containerTop = rect.top
      const viewportHeight = window.innerHeight
      const scrollPerCard = viewportHeight * (SCROLL_PER_CARD / 100)

      // Start transitioning when container reaches top of viewport
      if (containerTop <= 0 && containerTop > -(rect.height - viewportHeight)) {
        // How far we've scrolled into the container
        const scrolledDistance = Math.abs(containerTop)

        // Calculate current card index with smoother transition
        const exactIndex = scrolledDistance / scrollPerCard
        const targetIndex = Math.min(Math.floor(exactIndex), totalCards - 1)
        const cardProgress = exactIndex % 1 // Progress within current card (0-1)

        // Update progress for smooth animations
        setScrollProgress(cardProgress)

        // Change card when crossing threshold
        if (targetIndex !== currentIndex && !isAnimatingRef.current) {
          // Only animate if we're moving forward/backward by 1 card
          const isSmallJump = Math.abs(targetIndex - currentIndex) === 1

          if (isSmallJump) {
            isAnimatingRef.current = true
            setCurrentIndex(targetIndex)
            setIsFirstLoad(false)

            // Shorter lock time for snappier transitions
            setTimeout(() => {
              isAnimatingRef.current = false
            }, 400)
          } else {
            // For large jumps (like scrolling fast), update immediately
            setCurrentIndex(targetIndex)
            setIsFirstLoad(false)
          }
        }
      } else if (containerTop > 0) {
        // Before container
        setCurrentIndex(0)
        setScrollProgress(0)
      }
    }

    let rafId: number | null = null
    const handleScrollThrottled = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          handleScroll()
          rafId = null
        })
      }
    }

    const scrollContainer = document.getElementById('app-container')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScrollThrottled, { passive: true })
      handleScroll()
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScrollThrottled)
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [currentIndex, totalCards])

  // Manual navigation
  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards && !isAnimatingRef.current) {
      isAnimatingRef.current = true
      setCurrentIndex(index)
      setIsFirstLoad(false)

      setTimeout(() => {
        isAnimatingRef.current = false
      }, 400)
    }
  }, [totalCards])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if carousel is in view
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || rect.top > window.innerHeight || rect.bottom < 0) return

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
  }, [currentIndex, totalCards, goToCard])

  // Preload images
  useEffect(() => {
    const preloadRange = 2 // Preload 2 cards ahead and behind
    const start = Math.max(0, currentIndex - preloadRange)
    const end = Math.min(totalCards, currentIndex + preloadRange + 1)

    for (let i = start; i < end; i++) {
      if (dtfs[i]?.brand?.cover) {
        const img = new Image()
        img.src = dtfs[i].brand.cover
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

  // Container height based on number of cards and scroll distance
  const containerHeight = totalCards * SCROLL_PER_CARD + 50 // +50vh for exit buffer

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}vh` }}
    >
      {/* Sticky wrapper - positioned at top with padding */}
      <div className="sticky top-0 w-full" style={{ paddingTop: '80px' }}>

        {/* Navigation UI */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex flex-col gap-2">
            {dtfs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToCard(idx)}
                disabled={isAnimatingRef.current}
                className={cn(
                  'transition-all duration-300',
                  idx === currentIndex
                    ? 'w-3 h-3 bg-primary rounded-full scale-110'
                    : idx < currentIndex
                    ? 'w-2 h-2 bg-primary/50 rounded-full'
                    : 'w-2 h-2 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to DTF ${idx + 1}`}
              >
                {/* Visual progress indicator for current card */}
                {idx === currentIndex && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={false}
                    animate={{
                      scale: 1 + scrollProgress * 0.2,
                      opacity: 1 - scrollProgress * 0.5
                    }}
                  />
                )}
              </button>
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
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Current card indicator */}
          <div className="text-xs text-muted-foreground mt-2">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>

        {/* Cards Container - Fixed height */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: `${CARD_HEIGHT}px` }}
        >
          <div className="absolute inset-0 flex items-start justify-center">
            <div className="w-full max-w-[1400px] px-4">
              <AnimatePresence mode="wait">
                {dtfs.map((dtf, idx) => {
                  if (idx !== currentIndex) return null

                  return (
                    <motion.div
                      key={dtf.address}
                      className="w-full"
                      initial={isFirstLoad && idx === 0 ? false : {
                        opacity: 0,
                        y: 60,
                        rotateX: 12,
                        scale: 0.95
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1
                      }}
                      exit={{
                        opacity: 0,
                        y: -60,
                        rotateX: -12,
                        scale: 0.95
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94] // Smooth easing
                      }}
                      style={{
                        perspective: 1000,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div style={{ maxHeight: `${CARD_HEIGHT}px`, overflow: 'hidden' }}>
                        <DTFHomeCard dtf={dtf} />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Next card preview (subtle) */}
              {currentIndex < totalCards - 1 && scrollProgress > 0.7 && (
                <motion.div
                  className="absolute inset-x-0 top-0 w-full pointer-events-none"
                  initial={false}
                  animate={{
                    opacity: (scrollProgress - 0.7) / 0.3 * 0.3, // Max 30% opacity
                    y: 100 - (scrollProgress - 0.7) / 0.3 * 40,
                    scale: 0.9 + (scrollProgress - 0.7) / 0.3 * 0.05
                  }}
                  style={{
                    perspective: 1000,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div style={{ maxHeight: `${CARD_HEIGHT}px`, overflow: 'hidden' }}>
                    <DTFHomeCard dtf={dtfs[currentIndex + 1]} />
                  </div>
                </motion.div>
              )}
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
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30"
            >
              <span className="text-xs text-muted-foreground">
                Scroll to explore
              </span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <ChevronDown size={16} className="text-muted-foreground" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default DTFCarouselPolished