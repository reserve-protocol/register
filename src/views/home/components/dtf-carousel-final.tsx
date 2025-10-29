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
import { useRef, useState, useLayoutEffect, useMemo, memo, useEffect } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

// ============================================================================
// Constants & Types
// ============================================================================

const CARD_CONFIG = {
  HEADER_HEIGHT: 72,
  CARD_HEIGHT: 720,
  MAX_STACK: 3,
  STACK_OFFSET: 20,
  STACK_SCALE_FACTOR: 0.05,
  TRANSITION_RANGE: 0.5, // How much scroll range each transition takes
} as const

interface DTFCarouselFinalProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

interface AnimatedCardProps {
  dtf: IndexDTFItem
  index: number
  progress: MotionValue<number>
  totalCards: number
  isCurrentCard: boolean
}

// ============================================================================
// Memoized Animated Card Component
// ============================================================================

const AnimatedCard = memo(
  ({ dtf, index, progress, totalCards, isCurrentCard }: AnimatedCardProps) => {
    // Single transform for all animations - more performant
    const transform = useTransform(progress, (p) => {
      const distance = p - index
      const absDistance = Math.abs(distance)

      // Early return for cards too far away
      if (absDistance > 2) {
        return {
          y: distance > 0 ? -window.innerHeight : window.innerHeight,
          scale: 0.8,
          opacity: 0,
          zIndex: 0,
        }
      }

      // Calculate position
      let y = 0
      let scale = 1
      let opacity = 1
      let zIndex = totalCards - index

      if (distance < -0.5) {
        // Card has passed (scrolled past)
        y = -window.innerHeight
        opacity = 0
        scale = 0.9
      } else if (distance < 0) {
        // Card is leaving (current -> past)
        const exitProgress = (distance + 0.5) * 2 // 0 to 1 as card exits
        y = -window.innerHeight * (1 - exitProgress)
        opacity = exitProgress
        scale = 0.9 + 0.1 * exitProgress
      } else if (distance <= CARD_CONFIG.MAX_STACK) {
        // Card is in stack (upcoming cards)
        if (distance < 1) {
          // Card is entering (next -> current)
          const enterProgress = 1 - distance // 1 to 0 as card approaches
          y = distance * CARD_CONFIG.STACK_OFFSET
          scale = 1 - distance * CARD_CONFIG.STACK_SCALE_FACTOR
          opacity = 1
          zIndex = totalCards - index + Math.floor(enterProgress * 10) // Boost z-index during transition
        } else {
          // Card is waiting in stack
          y = Math.min(distance * CARD_CONFIG.STACK_OFFSET, CARD_CONFIG.MAX_STACK * CARD_CONFIG.STACK_OFFSET)
          scale = Math.max(1 - distance * CARD_CONFIG.STACK_SCALE_FACTOR, 0.85)
          opacity = 1
        }
      } else {
        // Card is too far ahead
        y = CARD_CONFIG.MAX_STACK * CARD_CONFIG.STACK_OFFSET
        scale = 0.85
        opacity = 0
      }

      return { y, scale, opacity, zIndex }
    })

    // Extract individual values from the transform
    const y = useTransform(transform, (t) => t.y)
    const scale = useTransform(transform, (t) => t.scale)
    const opacity = useTransform(transform, (t) => t.opacity)
    const zIndex = useTransform(transform, (t) => t.zIndex)

    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          y,
          scale,
          opacity,
          zIndex,
          pointerEvents: isCurrentCard ? 'auto' : 'none',
          willChange: isCurrentCard ? 'transform' : 'auto',
        }}
      >
        <DTFHomeCardFixed dtf={dtf} />
      </motion.div>
    )
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.index === nextProps.index &&
      prevProps.totalCards === nextProps.totalCards &&
      prevProps.isCurrentCard === nextProps.isCurrentCard &&
      prevProps.dtf.address === nextProps.dtf.address
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

// ============================================================================
// Navigation Dots Component
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

const DTFCarouselFinal = ({ dtfs, isLoading }: DTFCarouselFinalProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isRefReady, setIsRefReady] = useState(false)

  const totalCards = dtfs.length

  // Create a fallback motion value for SSR
  const fallbackProgress = useMotionValue(0)

  // Ensure component and ref are ready
  useEffect(() => {
    // Use regular useEffect instead of useLayoutEffect for better SSR compatibility
    setIsMounted(true)
  }, [])

  // Check if ref is ready after mount
  useEffect(() => {
    if (isMounted && containerRef.current && !isRefReady) {
      setIsRefReady(true)
    }
  }, [isMounted, isRefReady])

  // Track scroll progress only when ref is ready
  const { scrollYProgress } = useScroll(
    isRefReady && containerRef.current
      ? {
          target: containerRef,
          offset: ['start start', 'end end'],
          layoutEffect: false,
        }
      : {} // Empty config when not ready
  )

  // Use fallback progress if scroll isn't ready yet
  const activeProgress = isRefReady ? scrollYProgress : fallbackProgress

  // Direct transform without spring for more precise control
  const cardProgress = useTransform(
    activeProgress,
    [0, 1],
    [0, Math.max(0, totalCards - 1)]
  )

  // Update current index based on scroll progress
  useMotionValueEvent(cardProgress, 'change', (latest) => {
    if (!isRefReady) return // Don't update if not ready

    const newIndex = Math.round(latest)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
    // Mark as interacted after first meaningful scroll
    if (latest > 0.05 && !hasInteracted) {
      setHasInteracted(true)
    }
  })

  // Optimized scroll to card function
  const scrollToCard = (index: number) => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollRange = container.scrollHeight - window.innerHeight
    const targetProgress = index / (totalCards - 1)
    const targetScroll = targetProgress * scrollRange

    // Get the container's position relative to the page
    const containerRect = container.getBoundingClientRect()
    const currentScrollY = window.scrollY
    const containerTop = containerRect.top + currentScrollY

    // Calculate final scroll position
    const targetPosition = containerTop + targetScroll

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })
  }

  // Memoize visible cards for performance
  const visibleCards = useMemo(() => {
    // Only render cards within a reasonable range of the current index
    const renderRange = 3
    const start = Math.max(0, currentIndex - renderRange)
    const end = Math.min(totalCards - 1, currentIndex + renderRange)

    return dtfs.slice(start, end + 1).map((dtf, i) => ({
      dtf,
      index: start + i,
    }))
  }, [dtfs, currentIndex, totalCards])

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="text-muted-foreground">Loading DTFs...</div>
      </div>
    )
  }

  // Empty state
  if (!dtfs || dtfs.length === 0) {
    return <div className="h-screen bg-primary" />
  }

  // SSR safety - don't render until mounted and ref is ready
  if (!isMounted || !isRefReady) {
    return (
      <div
        ref={containerRef}
        className="h-screen bg-primary flex items-center justify-center"
      >
        {/* Keep the same height to prevent layout shift */}
        <div style={{ height: `${totalCards * 100}vh`, minHeight: '100vh' }} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-primary"
      style={{
        // Precise height calculation for smooth scrolling
        height: `${totalCards * 100}vh`,
        minHeight: '100vh',
      }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Cards container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="relative w-full"
            style={{
              height: `${CARD_CONFIG.CARD_HEIGHT}px`,
              maxWidth: '1400px',
              margin: '0 auto',
            }}
          >
            {/* Render only visible cards for performance */}
            {isRefReady && visibleCards.map(({ dtf, index }) => (
              <AnimatedCard
                key={`${dtf.address}-${index}`}
                dtf={dtf}
                index={index}
                progress={cardProgress}
                totalCards={totalCards}
                isCurrentCard={index === currentIndex}
              />
            ))}
          </div>
        </div>

        {/* UI Overlays */}
        <AnimatePresence mode="wait">
          {/* Scroll hint */}
          {!hasInteracted && currentIndex === 0 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            >
              <div className="text-xs text-muted-foreground/80 mb-2">
                Scroll to explore
              </div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ChevronDown
                  size={24}
                  className="text-muted-foreground/60"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Card counter */}
          {hasInteracted && (
            <motion.div
              key="counter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
            >
              <span className="text-2xl font-light text-primary-foreground">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground mt-2">
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

export default DTFCarouselFinal