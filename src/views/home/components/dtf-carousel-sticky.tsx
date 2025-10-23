import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import DTFHomeCard from './dtf-home-card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselStickyProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselSticky = ({ dtfs, isLoading }: DTFCarouselStickyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const totalCards = dtfs.length

  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const containerTop = rect.top
      const containerHeight = rect.height
      const viewportHeight = window.innerHeight
      const cardHeight = containerHeight / totalCards

      // Calculate which card should be showing based on scroll position
      // When container top reaches the top of viewport, start changing cards
      if (containerTop <= 0 && containerTop > -(containerHeight - viewportHeight)) {
        const scrolledDistance = Math.abs(containerTop)
        const newIndex = Math.min(
          Math.floor(scrolledDistance / cardHeight),
          totalCards - 1
        )
        setCurrentIndex(newIndex)

        // Calculate progress for smooth transitions
        const cardProgress = (scrolledDistance % cardHeight) / cardHeight
        setProgress(cardProgress)
      } else if (containerTop > 0) {
        setCurrentIndex(0)
        setProgress(0)
      } else {
        setCurrentIndex(totalCards - 1)
        setProgress(1)
      }
    }

    // Listen to scroll events on the main container
    const scrollContainer = document.getElementById('app-container')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initial check
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      } else {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [totalCards])

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

  // Calculate the height based on number of cards
  // Each card transition needs about 100vh of scroll
  const containerHeight = `${totalCards * 100}vh`

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: containerHeight }}
    >
      {/* Sticky wrapper that stays in viewport */}
      <div className="sticky top-0 h-screen">
        {/* Navigation UI */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex flex-col gap-2">
            {dtfs.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'bg-primary w-3 h-3'
                    : idx < currentIndex
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
                )}
                aria-label={`DTF ${idx + 1}`}
              />
            ))}
          </div>

          {/* Current card indicator */}
          <div className="text-xs text-muted-foreground mt-2">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>

        {/* Cards Container */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="relative w-full max-w-[1400px] mx-auto">
            {/* Render current and next card for smooth transition */}
            {dtfs.map((dtf, idx) => {
              const isActive = idx === currentIndex
              const isNext = idx === currentIndex + 1
              const isPrev = idx === currentIndex - 1

              // Only render nearby cards
              if (!isActive && !isNext && !isPrev) return null

              return (
                <motion.div
                  key={dtf.address}
                  className="absolute inset-x-0 top-0 w-full"
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : isNext ? progress * 0.5 : 0,
                    y: isActive
                      ? 0
                      : isNext
                        ? `${100 - (progress * 100)}%`
                        : isPrev
                          ? `-${100 - ((1 - progress) * 100)}%`
                          : '100%',
                    scale: isActive
                      ? 1 - (progress * 0.05)
                      : isNext
                        ? 0.95 + (progress * 0.05)
                        : 0.9,
                    rotateX: isActive
                      ? progress * -5
                      : isNext
                        ? 5 - (progress * 5)
                        : 0,
                  }}
                  transition={{
                    duration: 0.1,
                    ease: 'linear'
                  }}
                  style={{
                    perspective: 1200,
                    transformStyle: 'preserve-3d',
                    zIndex: isActive ? 2 : 1
                  }}
                >
                  <DTFHomeCard dtf={dtf} />
                </motion.div>
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
    </div>
  )
}

export default DTFCarouselSticky