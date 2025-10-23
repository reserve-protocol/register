import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import DTFCarouselCard from './dtf-carousel-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselV2 = ({ dtfs, isLoading }: DTFCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isInHijackZone, setIsInHijackZone] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollLockRef = useRef(false)
  const lastScrollY = useRef(0)
  const scrollAccumulator = useRef(0)

  const totalCards = dtfs.length

  // Change card with animation lock
  const changeCard = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < totalCards && !scrollLockRef.current) {
      setCurrentIndex(newIndex)
      setIsFirstLoad(false)
      scrollLockRef.current = true
      scrollAccumulator.current = 0

      // Unlock after animation
      setTimeout(() => {
        scrollLockRef.current = false
      }, 600)
    }
  }, [totalCards])

  // Setup intersection observer for scroll hijack zone
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Consider "in zone" when carousel is prominently visible
        const inZone = entry.isIntersecting && entry.intersectionRatio > 0.5
        setIsInHijackZone(inZone)

        if (!inZone) {
          scrollAccumulator.current = 0
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  // Handle scroll when in hijack zone
  useEffect(() => {
    if (!isInHijackZone || totalCards === 0) return

    let rafId: number | null = null
    let isScrolling = false

    const handleScroll = () => {
      if (!containerRef.current) return

      const container = document.getElementById('app-container')
      if (!container) return

      const currentScrollY = container.scrollTop
      const deltaY = currentScrollY - lastScrollY.current

      // Only process if we have meaningful scroll
      if (Math.abs(deltaY) > 0) {
        scrollAccumulator.current += deltaY

        // Check if we should change card
        const threshold = 100 // pixels needed to trigger change

        if (!scrollLockRef.current && Math.abs(scrollAccumulator.current) >= threshold) {
          const rect = containerRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          const centerPoint = rect.top + rect.height / 2
          const isInCenter = Math.abs(centerPoint - viewportHeight / 2) < viewportHeight / 4

          if (isInCenter) {
            // Determine direction and change card
            if (scrollAccumulator.current > 0 && currentIndex < totalCards - 1) {
              // Scrolling down
              changeCard(currentIndex + 1)

              // Smooth lock the scroll position
              container.scrollTo({
                top: currentScrollY - deltaY,
                behavior: 'instant'
              })
            } else if (scrollAccumulator.current < 0 && currentIndex > 0) {
              // Scrolling up
              changeCard(currentIndex - 1)

              // Smooth lock the scroll position
              container.scrollTo({
                top: currentScrollY - deltaY,
                behavior: 'instant'
              })
            } else {
              // At boundaries, let normal scroll continue
              scrollAccumulator.current = 0
            }
          }
        }
      }

      lastScrollY.current = currentScrollY
      isScrolling = false
    }

    const onScroll = () => {
      if (!isScrolling) {
        isScrolling = true
        rafId = requestAnimationFrame(handleScroll)
      }
    }

    const container = document.getElementById('app-container')
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true })
      lastScrollY.current = container.scrollTop
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', onScroll)
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isInHijackZone, currentIndex, totalCards, changeCard])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInHijackZone) return

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
  }, [currentIndex, totalCards, isInHijackZone, changeCard])

  // Touch support
  useEffect(() => {
    if (!containerRef.current || !isInHijackZone) return

    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndY = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      if (touchStartY && touchEndY) {
        const deltaY = touchStartY - touchEndY

        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0 && currentIndex < totalCards - 1) {
            changeCard(currentIndex + 1)
          } else if (deltaY < 0 && currentIndex > 0) {
            changeCard(currentIndex - 1)
          }
        }
      }
      touchStartY = 0
      touchEndY = 0
    }

    const container = containerRef.current
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentIndex, totalCards, isInHijackZone, changeCard])

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
    <div className="relative w-full min-h-[100vh] py-20" ref={containerRef}>
      {/* Fixed Navigation UI - only show when in hijack zone */}
      <AnimatePresence>
        {isInHijackZone && (
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
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
          </div>
        </motion.div>

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
          {currentIndex === 0 && isInHijackZone && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
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

export default DTFCarouselV2