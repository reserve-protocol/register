import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import DTFHomeCard from './dtf-home-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselStackedProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselStacked = ({ dtfs, isLoading }: DTFCarouselStackedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTransitioningRef = useRef(false)
  const totalCards = dtfs.length

  // Configuration
  const SCROLL_PER_CARD = 70 // Reduced for snappier feel
  const CARD_HEIGHT = 720 // Increased height
  const CARD_SPACING = 40 // Space between stacked cards
  const VISIBLE_STACK_SIZE = 3 // How many cards to show in stack

  // Calculate dynamic viewport-aware positioning
  const getCardPosition = useCallback((index: number, current: number, progress: number) => {
    const relativeIndex = index - current

    if (relativeIndex < 0) {
      // Cards that have been flipped away
      return {
        y: -CARD_HEIGHT,
        opacity: 0,
        scale: 0.9,
        rotateX: -15,
        zIndex: 0
      }
    } else if (relativeIndex === 0) {
      // Current card being flipped
      const flipProgress = progress > 0.5 ? (progress - 0.5) * 2 : 0
      return {
        y: -flipProgress * (CARD_HEIGHT - CARD_SPACING),
        opacity: 1 - flipProgress * 0.3,
        scale: 1 - flipProgress * 0.05,
        rotateX: -flipProgress * 15,
        zIndex: 100 - relativeIndex
      }
    } else if (relativeIndex <= VISIBLE_STACK_SIZE) {
      // Stacked cards below
      const stackPosition = relativeIndex - 1
      const riseAmount = progress * (stackPosition === 0 ? 1 : 0.3)

      return {
        y: (stackPosition * CARD_SPACING) - (riseAmount * CARD_SPACING),
        opacity: Math.min(1, 0.7 + (relativeIndex === 1 ? progress * 0.3 : 0)),
        scale: 0.95 - (stackPosition * 0.02) + (riseAmount * 0.02),
        rotateX: 0,
        zIndex: 100 - relativeIndex
      }
    } else {
      // Cards too far down the stack
      return {
        y: VISIBLE_STACK_SIZE * CARD_SPACING,
        opacity: 0,
        scale: 0.9,
        rotateX: 0,
        zIndex: 0
      }
    }
  }, [])

  // Handle scroll-based card changes
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const containerTop = rect.top
      const viewportHeight = window.innerHeight
      const scrollPerCard = viewportHeight * (SCROLL_PER_CARD / 100)

      if (containerTop <= 0 && containerTop > -(rect.height - viewportHeight)) {
        const scrolledDistance = Math.abs(containerTop)
        const exactIndex = scrolledDistance / scrollPerCard
        const targetIndex = Math.min(Math.floor(exactIndex), totalCards - 1)
        const cardProgress = exactIndex % 1

        setScrollProgress(cardProgress)

        if (targetIndex !== currentIndex && !isTransitioningRef.current) {
          isTransitioningRef.current = true
          setCurrentIndex(targetIndex)

          setTimeout(() => {
            isTransitioningRef.current = false
          }, 300)
        }
      } else if (containerTop > 0) {
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
    if (index >= 0 && index < totalCards && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      setCurrentIndex(index)
      setScrollProgress(0)

      setTimeout(() => {
        isTransitioningRef.current = false
      }, 300)
    }
  }, [totalCards])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Preload images for visible cards
  useEffect(() => {
    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(totalCards, currentIndex + VISIBLE_STACK_SIZE + 2)

    for (let i = start; i < end; i++) {
      if (dtfs[i]?.brand?.cover) {
        const img = new Image()
        img.src = dtfs[i].brand.cover
      }
    }
  }, [currentIndex, dtfs, totalCards])

  // Calculate which cards to render (optimization)
  const visibleCards = useMemo(() => {
    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(totalCards, currentIndex + VISIBLE_STACK_SIZE + 1)
    return dtfs.slice(start, end).map((dtf, idx) => ({
      dtf,
      originalIndex: start + idx
    }))
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

  const containerHeight = totalCards * SCROLL_PER_CARD + 30

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}vh` }}
    >
      {/* Sticky wrapper */}
      <div className="sticky top-0 w-full" style={{ paddingTop: '60px' }}>

        {/* Navigation UI */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex flex-col gap-2">
            {dtfs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToCard(idx)}
                disabled={isTransitioningRef.current}
                className={cn(
                  'relative transition-all duration-300',
                  idx === currentIndex
                    ? 'w-3 h-3 bg-primary rounded-full'
                    : idx < currentIndex
                    ? 'w-2 h-2 bg-primary/40 rounded-full'
                    : 'w-2 h-2 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to DTF ${idx + 1}`}
              >
                {idx === currentIndex && scrollProgress > 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={false}
                    animate={{
                      scale: 1 + scrollProgress * 0.3,
                      opacity: 1 - scrollProgress * 0.7
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
              disabled={currentIndex === 0 || isTransitioningRef.current}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === 0 || isTransitioningRef.current
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary cursor-pointer'
              )}
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={() => goToCard(currentIndex + 1)}
              disabled={currentIndex === totalCards - 1 || isTransitioningRef.current}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === totalCards - 1 || isTransitioningRef.current
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

        {/* Cards Container with Stack Effect */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: `${CARD_HEIGHT}px`,
            perspective: '2000px',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 flex items-start justify-center">
            <div className="w-full max-w-[1400px] px-4 relative" style={{ height: `${CARD_HEIGHT}px` }}>

              {/* Render visible cards in stack */}
              {visibleCards.map(({ dtf, originalIndex }) => {
                const position = getCardPosition(originalIndex, currentIndex, scrollProgress)

                return (
                  <motion.div
                    key={dtf.address}
                    className="absolute inset-x-0 top-0 w-full"
                    initial={false}
                    animate={{
                      y: position.y,
                      opacity: position.opacity,
                      scale: position.scale,
                      rotateX: position.rotateX,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.32, 0.72, 0, 1]
                    }}
                    style={{
                      zIndex: position.zIndex,
                      transformOrigin: 'center top',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <div style={{
                      height: `${CARD_HEIGHT - CARD_SPACING * 2}px`,
                      boxShadow: originalIndex > currentIndex
                        ? '0 4px 20px rgba(0,0,0,0.1)'
                        : 'none'
                    }}>
                      <DTFHomeCard dtf={dtf} />
                    </div>
                  </motion.div>
                )
              })}

              {/* Stack indicator at bottom */}
              {currentIndex < totalCards - 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {Array.from({ length: Math.min(3, totalCards - currentIndex - 1) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-1 bg-muted-foreground/20 rounded-full"
                      style={{
                        opacity: 1 - (i * 0.3)
                      }}
                    />
                  ))}
                </div>
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
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30"
            >
              <span className="text-xs text-muted-foreground">
                {totalCards > 1 ? `${totalCards} DTFs to explore` : 'Scroll to explore'}
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

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted-foreground/10">
          <motion.div
            className="h-full bg-primary/50"
            initial={false}
            animate={{
              width: `${((currentIndex + scrollProgress) / (totalCards - 1)) * 100}%`
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </section>
  )
}

export default DTFCarouselStacked