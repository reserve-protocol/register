import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import DTFCarouselCard from './dtf-carousel-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselV3 = ({ dtfs, isLoading }: DTFCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const [isInView, setIsInView] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollAccumulator = useRef(0)
  const animationLock = useRef(false)
  const scrollPositionRef = useRef(0)

  const totalCards = dtfs.length

  // Change card
  const changeCard = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < totalCards && !animationLock.current) {
      setCurrentIndex(newIndex)
      setIsFirstLoad(false)
      animationLock.current = true
      scrollAccumulator.current = 0

      // Unlock after animation
      setTimeout(() => {
        animationLock.current = false
      }, 600)
    }
  }, [totalCards])

  // Setup intersection observer
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio > 0.3
        setIsInView(inView)

        // When entering view, lock scroll at this position
        if (inView && !isScrollLocked) {
          const container = document.getElementById('app-container')
          if (container) {
            scrollPositionRef.current = container.scrollTop
          }
          setIsScrollLocked(true)
        }

        // When leaving view completely, unlock
        if (!entry.isIntersecting && isScrollLocked) {
          setIsScrollLocked(false)
          scrollAccumulator.current = 0
        }
      },
      {
        threshold: [0, 0.3, 0.5, 0.7, 1],
        rootMargin: '-50px 0px -50px 0px'
      }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [isScrollLocked])

  // Handle scroll hijacking
  useEffect(() => {
    if (!isScrollLocked || !isInView) return

    const handleWheel = (e: WheelEvent) => {
      // Check if we're over the carousel
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isOverCarousel =
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      if (isOverCarousel) {
        // Prevent default scroll
        e.preventDefault()
        e.stopPropagation()

        // Lock the scroll position
        const container = document.getElementById('app-container')
        if (container) {
          container.scrollTop = scrollPositionRef.current
        }

        // Accumulate scroll for card change
        if (!animationLock.current) {
          scrollAccumulator.current += e.deltaY

          const threshold = 100

          if (Math.abs(scrollAccumulator.current) >= threshold) {
            if (e.deltaY > 0 && currentIndex < totalCards - 1) {
              // Scroll down - next card
              changeCard(currentIndex + 1)
            } else if (e.deltaY < 0 && currentIndex > 0) {
              // Scroll up - previous card
              changeCard(currentIndex - 1)
            } else if (
              (e.deltaY > 0 && currentIndex === totalCards - 1) ||
              (e.deltaY < 0 && currentIndex === 0)
            ) {
              // At boundary - unlock and allow natural scroll
              setIsScrollLocked(false)
              scrollAccumulator.current = 0
            }
          }
        }
      }
    }

    // Add to window with capture phase to intercept before other handlers
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    // Also prevent scroll on the app-container when locked
    const container = document.getElementById('app-container')
    const preventScroll = (e: Event) => {
      if (isScrollLocked && isInView) {
        container!.scrollTop = scrollPositionRef.current
      }
    }

    if (container) {
      container.addEventListener('scroll', preventScroll)
    }

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      if (container) {
        container.removeEventListener('scroll', preventScroll)
      }
    }
  }, [isScrollLocked, isInView, currentIndex, totalCards, changeCard])

  // Touch support
  useEffect(() => {
    if (!containerRef.current || !isInView) return

    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollLocked) {
        e.preventDefault()
      }
      touchEndY = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      if (touchStartY && touchEndY && isScrollLocked) {
        const deltaY = touchStartY - touchEndY

        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0 && currentIndex < totalCards - 1) {
            changeCard(currentIndex + 1)
          } else if (deltaY < 0 && currentIndex > 0) {
            changeCard(currentIndex - 1)
          } else {
            // At boundary
            setIsScrollLocked(false)
          }
        }
      }
      touchStartY = 0
      touchEndY = 0
    }

    const container = containerRef.current
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentIndex, totalCards, isInView, isScrollLocked, changeCard])

  // Keyboard navigation
  useEffect(() => {
    if (!isInView) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < totalCards - 1) {
        e.preventDefault()
        changeCard(currentIndex + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        changeCard(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalCards, isInView, changeCard])

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
      <div className="min-h-[100vh] flex items-center justify-center">
        <div className="text-muted-foreground">Loading DTFs...</div>
      </div>
    )
  }

  if (dtfs.length === 0) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center">
        <div className="text-muted-foreground">No DTFs available</div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full min-h-[100vh] py-20"
      ref={containerRef}
      style={{
        // Visual indicator when scroll is locked (optional)
        backgroundColor: isScrollLocked ? 'rgba(0,0,0,0.02)' : 'transparent',
        transition: 'background-color 0.3s'
      }}
    >
      {/* Debug Info (remove in production) */}
      <div className="fixed top-20 left-4 z-50 text-xs space-y-1 bg-black/80 text-white p-2 rounded">
        <div>In View: {isInView ? 'Yes' : 'No'}</div>
        <div>Scroll Locked: {isScrollLocked ? 'Yes' : 'No'}</div>
        <div>Current Index: {currentIndex}</div>
        <div>Accumulator: {scrollAccumulator.current.toFixed(0)}</div>
      </div>

      {/* Fixed Navigation UI */}
      <AnimatePresence>
        {isInView && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4"
          >
            {/* Progress dots */}
            <div className="flex flex-col gap-2">
              {dtfs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changeCard(idx)}
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
                onClick={() => changeCard(currentIndex - 1)}
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
                onClick={() => changeCard(currentIndex + 1)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[600px]">
        {/* Card counter */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>

        {/* Cards Container */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4 mt-12">
          {dtfs.map((dtf, idx) => {
            const distance = Math.abs(idx - currentIndex)
            const isVisible = distance <= 2

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
          {currentIndex === 0 && isInView && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">
                {isScrollLocked ? 'Scroll to flip cards' : 'Entering card view...'}
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

export default DTFCarouselV3