import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
  useMotionValueEvent,
  AnimatePresence,
  useMotionValue,
} from 'motion/react'
import { useRef, useState, useEffect, useMemo, memo } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import Lenis from 'lenis'

// ============================================================================
// Constants
// ============================================================================

const CARD_CONFIG = {
  CARD_HEIGHT: 720,
  MAX_STACK: 3,
  STACK_OFFSET: 20,
  STACK_SCALE_FACTOR: 0.05,
} as const

interface DTFCarouselLenisV2Props {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// ============================================================================
// Animated Card Component - Same as original
// ============================================================================

const AnimatedCard = memo(
  ({
    dtf,
    index,
    progress,
    totalCards
  }: {
    dtf: IndexDTFItem
    index: number
    progress: MotionValue<number>
    totalCards: number
  }) => {
    // Transform based on scroll progress - similar to original
    const y = useTransform(progress, (p) => {
      const distance = index - p

      // Card has passed (scrolled past)
      if (distance < -0.5) {
        return -window.innerHeight
      }

      // Card is exiting (current -> past)
      if (distance < 0) {
        const t = (distance + 0.5) * 2
        return -window.innerHeight * (1 - t)
      }

      // Card is in stack (current or upcoming)
      if (distance <= CARD_CONFIG.MAX_STACK) {
        return distance * CARD_CONFIG.STACK_OFFSET
      }

      // Card is too far ahead
      return CARD_CONFIG.MAX_STACK * CARD_CONFIG.STACK_OFFSET
    })

    const scale = useTransform(progress, (p) => {
      const distance = index - p

      if (distance < 0) {
        return 0.9
      }

      if (distance <= CARD_CONFIG.MAX_STACK) {
        return 1 - (distance * CARD_CONFIG.STACK_SCALE_FACTOR)
      }

      return 1 - (CARD_CONFIG.MAX_STACK * CARD_CONFIG.STACK_SCALE_FACTOR)
    })

    const opacity = useTransform(progress, (p) => {
      const distance = index - p

      if (distance < -0.5) {
        return 0
      }

      if (distance < 0) {
        return (distance + 0.5) * 2
      }

      if (distance > CARD_CONFIG.MAX_STACK) {
        return 0
      }

      return 1
    })

    const zIndex = useTransform(progress, (p) => {
      const distance = index - p
      const baseZ = totalCards - index

      // Boost z-index when card is transitioning to current
      if (distance >= 0 && distance < 1) {
        return baseZ + Math.floor((1 - distance) * 10)
      }

      return baseZ
    })

    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          y,
          scale,
          opacity,
          zIndex,
        }}
      >
        <DTFHomeCardFixed dtf={dtf} />
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

// ============================================================================
// Navigation Dots
// ============================================================================

const NavigationDots = memo(
  ({
    totalCards,
    currentIndex,
    onCardSelect,
  }: {
    totalCards: number
    currentIndex: number
    onCardSelect: (index: number) => void
  }) => {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {Array.from({ length: totalCards }, (_, index) => (
          <button
            key={index}
            onClick={() => onCardSelect(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              'hover:bg-muted-foreground/50',
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-muted-foreground/30 w-2'
            )}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    )
  }
)

NavigationDots.displayName = 'NavigationDots'

// ============================================================================
// Main Carousel Component
// ============================================================================

const DTFCarouselLenisV2 = ({ dtfs }: DTFCarouselLenisV2Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isRefReady, setIsRefReady] = useState(false)

  const totalCards = dtfs.length

  // Fallback motion value for SSR
  const fallbackProgress = useMotionValue(0)

  // Mount check
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if ref is ready after mount
  useEffect(() => {
    if (isMounted && containerRef.current) {
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        setIsRefReady(true)
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [isMounted])

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    if (!isRefReady) return

    // Initialize Lenis on the app container for smooth scrolling
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    const lenis = new Lenis({
      wrapper: appContainer,
      content: appContainer,
      lerp: 0.1, // Smoothness
      wheelMultiplier: 1, // Normal scroll speed
      touchMultiplier: 2,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    // Animation loop
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [isRefReady])

  // Track scroll progress - only when ref is ready
  const { scrollYProgress } = useScroll(
    isRefReady && containerRef.current
      ? {
          target: containerRef,
          offset: ['start start', 'end end'],
          layoutEffect: false,
        }
      : undefined
  )

  // Use actual scroll or fallback
  const activeProgress = isRefReady && scrollYProgress ? scrollYProgress : fallbackProgress

  // Convert to card progress
  const cardProgress = useTransform(
    activeProgress,
    [0, 1],
    [0, Math.max(0, totalCards - 1)]
  )

  // Update current index
  useMotionValueEvent(cardProgress, 'change', (latest) => {
    if (!isRefReady) return // Don't process until ready

    const newIndex = Math.round(latest)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
    if (latest > 0.05 && !hasInteracted) {
      setHasInteracted(true)
    }
  })

  // Scroll to specific card
  const scrollToCard = (index: number) => {
    if (!containerRef.current || !lenisRef.current) return

    const container = containerRef.current
    const scrollRange = container.scrollHeight - window.innerHeight
    const targetProgress = index / Math.max(1, totalCards - 1)
    const targetScroll = targetProgress * scrollRange

    const containerRect = container.getBoundingClientRect()
    const currentScrollY = window.scrollY
    const containerTop = containerRect.top + currentScrollY

    lenisRef.current.scrollTo(containerTop + targetScroll, {
      duration: 1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    })
  }

  // Empty state
  if (!dtfs || dtfs.length === 0) {
    return <div className="h-screen bg-primary" />
  }

  // SSR safety
  if (!isMounted) {
    return <div className="h-screen bg-primary" />
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-primary"
      style={{
        height: `${totalCards * 100}vh`,
        minHeight: '100vh',
      }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="relative w-full"
            style={{
              height: `${CARD_CONFIG.CARD_HEIGHT}px`,
              maxWidth: '1400px',
              margin: '0 auto',
            }}
          >
            {/* Render all cards - they handle their own visibility */}
            {isRefReady && dtfs.map((dtf, index) => (
              <AnimatedCard
                key={dtf.address}
                dtf={dtf}
                index={index}
                progress={cardProgress}
                totalCards={totalCards}
              />
            ))}
          </div>
        </div>

        {/* UI Overlays */}
        <AnimatePresence>
          {/* Scroll hint */}
          {!hasInteracted && currentIndex === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none"
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

          {/* Counter */}
          {hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className="text-2xl font-light text-primary-foreground">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="mt-2">
                / {String(totalCards).padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation dots */}
        <NavigationDots
          totalCards={totalCards}
          currentIndex={currentIndex}
          onCardSelect={scrollToCard}
        />
      </div>
    </div>
  )
}

export default DTFCarouselLenisV2