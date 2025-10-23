import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import DTFHomeCardEnhanced from './dtf-home-card-enhanced'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselSmoothProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselSmooth = ({ dtfs, isLoading }: DTFCarouselSmoothProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollProgressRef = useRef(0)
  const lastScrollTime = useRef(0)
  const animationCompleteTimer = useRef<NodeJS.Timeout>()

  const totalCards = dtfs.length

  // Configuration
  const SCROLL_PER_CARD = 60 // 60vh for snappy response
  const CARD_HEIGHT = 720
  const ANIMATION_DURATION = 500 // ms for complete animation

  // Spring animation for smooth transitions
  const springConfig = { stiffness: 300, damping: 30, mass: 0.8 }
  const cardY = useSpring(0, springConfig)
  const cardOpacity = useSpring(1, springConfig)
  const cardRotateX = useSpring(0, springConfig)

  // Handle card change with complete animation
  const changeCard = useCallback((newIndex: number, immediate = false) => {
    if (newIndex < 0 || newIndex >= totalCards || isAnimating) return

    // Lock animations during transition
    setIsAnimating(true)

    // Clear any pending animation timers
    if (animationCompleteTimer.current) {
      clearTimeout(animationCompleteTimer.current)
    }

    // Animate out current card
    if (!immediate && newIndex > currentIndex) {
      // Moving forward - card flips up
      cardY.set(-100)
      cardOpacity.set(0)
      cardRotateX.set(-20)
    } else if (!immediate && newIndex < currentIndex) {
      // Moving backward - card flips down
      cardY.set(100)
      cardOpacity.set(0)
      cardRotateX.set(20)
    }

    // Set new index after a brief delay for exit animation
    setTimeout(() => {
      setCurrentIndex(newIndex)

      // Animate in new card
      if (!immediate) {
        cardY.set(newIndex > currentIndex ? 100 : -100)
        cardOpacity.set(0)
        cardRotateX.set(newIndex > currentIndex ? 20 : -20)

        setTimeout(() => {
          cardY.set(0)
          cardOpacity.set(1)
          cardRotateX.set(0)
        }, 50)
      } else {
        cardY.set(0)
        cardOpacity.set(1)
        cardRotateX.set(0)
      }

      // Unlock after animation completes
      animationCompleteTimer.current = setTimeout(() => {
        setIsAnimating(false)
      }, ANIMATION_DURATION)
    }, immediate ? 0 : 200)
  }, [currentIndex, totalCards, isAnimating, cardY, cardOpacity, cardRotateX])

  // Smooth scroll handling
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    let scrollEndTimer: NodeJS.Timeout

    const handleScroll = () => {
      if (!containerRef.current || isAnimating) return

      const rect = containerRef.current.getBoundingClientRect()
      const containerTop = rect.top
      const viewportHeight = window.innerHeight
      const scrollPerCard = viewportHeight * (SCROLL_PER_CARD / 100)

      // Only process when in scroll zone
      if (containerTop <= 0 && containerTop > -(rect.height - viewportHeight)) {
        const scrolledDistance = Math.abs(containerTop)
        const targetIndex = Math.min(
          Math.floor(scrolledDistance / scrollPerCard),
          totalCards - 1
        )

        // Store scroll progress
        scrollProgressRef.current = (scrolledDistance % scrollPerCard) / scrollPerCard

        // Debounce card changes
        const now = Date.now()
        if (targetIndex !== currentIndex && now - lastScrollTime.current > 100) {
          lastScrollTime.current = now

          // Clear previous timer
          clearTimeout(scrollEndTimer)

          // Wait for scroll to settle before changing card
          scrollEndTimer = setTimeout(() => {
            if (targetIndex !== currentIndex) {
              changeCard(targetIndex)
            }
          }, 50)
        }
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
      clearTimeout(scrollEndTimer)
      if (animationCompleteTimer.current) {
        clearTimeout(animationCompleteTimer.current)
      }
    }
  }, [currentIndex, totalCards, isAnimating, changeCard])

  // Manual navigation
  const goToCard = (index: number) => {
    if (!isAnimating) {
      changeCard(index)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || rect.top > window.innerHeight || rect.bottom < 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToCard(currentIndex + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToCard(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalCards, isAnimating])

  // Preload images
  useEffect(() => {
    for (let i = Math.max(0, currentIndex - 1); i <= Math.min(totalCards - 1, currentIndex + 2); i++) {
      if (dtfs[i]?.brand?.cover) {
        const img = new Image()
        img.src = dtfs[i].brand.cover
      }
    }
  }, [currentIndex, dtfs, totalCards])

  if (isLoading) {
    return (
      <div style={{ height: `${CARD_HEIGHT}px` }} className="flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
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

  const containerHeight = totalCards * SCROLL_PER_CARD + 20

  return (
    <section
      ref={containerRef}
      className="relative bg-background"
      style={{ height: `${containerHeight}vh` }}
    >
      {/* Sticky wrapper */}
      <div className="sticky top-0 w-full" style={{ height: '100vh' }}>

        {/* Navigation UI */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4"
        >
          {/* Progress dots */}
          <div className="flex flex-col gap-2">
            {dtfs.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => goToCard(idx)}
                disabled={isAnimating}
                className={cn(
                  'relative transition-all duration-300',
                  idx === currentIndex
                    ? 'w-3 h-3 bg-primary rounded-full'
                    : idx < currentIndex
                    ? 'w-2 h-2 bg-primary/40 rounded-full'
                    : 'w-2 h-2 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50'
                )}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to DTF ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <motion.button
              onClick={() => goToCard(currentIndex - 1)}
              disabled={currentIndex === 0 || isAnimating}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === 0 || isAnimating
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary cursor-pointer'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronUp size={20} />
            </motion.button>
            <motion.button
              onClick={() => goToCard(currentIndex + 1)}
              disabled={currentIndex === totalCards - 1 || isAnimating}
              className={cn(
                'p-2 rounded-full border transition-all',
                currentIndex === totalCards - 1 || isAnimating
                  ? 'opacity-30 cursor-not-allowed border-muted'
                  : 'hover:bg-accent hover:border-primary cursor-pointer'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronDown size={20} />
            </motion.button>
          </div>

          {/* Current card indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mt-2"
          >
            {currentIndex + 1} / {totalCards}
          </motion.div>
        </motion.div>

        {/* Cards Container */}
        <div
          className="relative w-full h-full flex items-center justify-center px-4"
          style={{
            perspective: '1500px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Card Stack Effect */}
          <div className="relative w-full max-w-[1400px]">
            <AnimatePresence mode="wait">
              {/* Current Card */}
              <motion.div
                key={`card-${currentIndex}`}
                className="w-full"
                initial={{
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
                  duration: 0.5,
                  ease: [0.32, 0.72, 0, 1]
                }}
                style={{
                  transformOrigin: 'center center'
                }}
              >
                <DTFHomeCardEnhanced dtf={dtfs[currentIndex]} />
              </motion.div>
            </AnimatePresence>

            {/* Next cards preview (stacked effect) */}
            {currentIndex < totalCards - 1 && (
              <>
                <motion.div
                  className="absolute inset-0 w-full pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 0.3,
                    y: 20,
                    scale: 0.95,
                    filter: 'blur(2px)'
                  }}
                  style={{ zIndex: -1 }}
                >
                  <DTFHomeCardEnhanced dtf={dtfs[Math.min(currentIndex + 1, totalCards - 1)]} />
                </motion.div>
                {currentIndex < totalCards - 2 && (
                  <motion.div
                    className="absolute inset-0 w-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 0.15,
                      y: 40,
                      scale: 0.9,
                      filter: 'blur(4px)'
                    }}
                    style={{ zIndex: -2 }}
                  >
                    <DTFHomeCardEnhanced dtf={dtfs[Math.min(currentIndex + 2, totalCards - 1)]} />
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Scroll hint */}
          <AnimatePresence>
            {currentIndex === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              >
                <span className="text-xs text-muted-foreground">
                  Scroll to explore {totalCards} DTFs
                </span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <ChevronDown size={20} className="text-muted-foreground" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default DTFCarouselSmooth