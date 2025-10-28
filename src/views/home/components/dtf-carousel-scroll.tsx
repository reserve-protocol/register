import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselScrollProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselScroll = ({ dtfs, isLoading }: DTFCarouselScrollProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollAccumulator = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const isTransitioning = useRef(false)

  // Configuration
  const HEADER_HEIGHT = 72
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 25
  const SCALE_FACTOR = 0.05
  const SCROLL_THRESHOLD = 80
  const SCROLL_BUFFER = 200 // Extra scroll space per card
  const totalCards = dtfs.length

  // Calculate total container height
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - HEADER_HEIGHT : 800
  const containerHeight = viewportHeight + (totalCards * SCROLL_BUFFER)

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('app-container')
      if (!container || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const scrollTop = container.scrollTop
      const containerTop = containerRef.current.offsetTop

      // Check if we're in the carousel zone
      const relativeScroll = scrollTop - containerTop
      const inCarouselZone = relativeScroll >= 0 && relativeScroll < (totalCards * SCROLL_BUFFER)

      if (inCarouselZone) {
        // Activate carousel
        if (!isActive) {
          setIsActive(true)
          console.log('Carousel activated')
        }

        // Calculate which card should be shown based on scroll position
        const cardIndex = Math.floor(relativeScroll / SCROLL_BUFFER)
        const clampedIndex = Math.max(0, Math.min(cardIndex, totalCards - 1))

        if (clampedIndex !== currentIndex && !isTransitioning.current) {
          isTransitioning.current = true
          setCurrentIndex(clampedIndex)
          setTimeout(() => {
            isTransitioning.current = false
          }, 500)
        }
      } else {
        if (isActive) {
          setIsActive(false)
          console.log('Carousel deactivated')
        }
      }
    }

    const container = document.getElementById('app-container')
    container?.addEventListener('scroll', handleScroll, { passive: true })

    // Initial check
    handleScroll()

    return () => {
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [currentIndex, totalCards, isActive])

  // Preload images
  useEffect(() => {
    dtfs.forEach((dtf) => {
      const cover = dtf?.brand?.cover
      if (cover) {
        const img = new Image()
        img.src = cover
      }
    })
  }, [dtfs])

  if (!dtfs || dtfs.length === 0) {
    return <div style={{ height: `${viewportHeight}px` }} />
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Sticky container for cards */}
      <div className="sticky top-[72px] w-full" style={{ height: `${viewportHeight}px` }}>
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            {/* Card Stack */}
            <div
              className="relative"
              style={{ width: '100%', height: `${CARD_HEIGHT}px` }}
            >
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0

                // Stack visualization
                const maxStackDepth = 3
                const isInStack = relativePosition >= 0 && relativePosition <= maxStackDepth
                const isPastStack = relativePosition > maxStackDepth

                // Animation values
                const yOffset =
                  relativePosition < 0
                    ? 800 // Card scrolled past
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

        {/* UI Elements */}
        {isActive && (
          <>
            {/* Debug indicator */}
            <div className="fixed top-24 left-4 bg-green-500 text-white p-2 rounded z-50">
              Carousel Active - Card {currentIndex + 1}/{totalCards}
            </div>

            {/* Scroll hint */}
            {currentIndex === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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

            {/* Navigation dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {dtfs.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default DTFCarouselScroll