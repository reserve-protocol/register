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
import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import Lenis from 'lenis'

// ============================================================================
// Constants & Types
// ============================================================================

const CARD_CONFIG = {
  HEADER_HEIGHT: 72,
  CARD_HEIGHT: 720,
  MAX_VISIBLE: 4,
  STACK_OFFSET: 25,
  STACK_SCALE: 0.04,
  ROTATION_MAX: 2, // Subtle rotation for depth
  SMOOTH_FACTOR: 0.08, // Lenis smoothness
  WHEEL_MULTIPLIER: 0.8, // Control scroll speed
} as const

interface DTFCarouselLenisProps {
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
// Lenis Instance Manager (Singleton)
// ============================================================================

class LenisManager {
  private static instance: Lenis | null = null
  private static refCount = 0

  static create(element: HTMLElement): Lenis {
    if (!this.instance) {
      this.instance = new Lenis({
        wrapper: element,
        content: element,
        lerp: CARD_CONFIG.SMOOTH_FACTOR,
        wheelMultiplier: CARD_CONFIG.WHEEL_MULTIPLIER,
        touchMultiplier: 1.5,
        smoothWheel: true,
        syncTouch: true,
        infinite: false,
      })

      // Start the animation loop
      const animate = (time: number) => {
        this.instance?.raf(time)
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }

    this.refCount++
    return this.instance
  }

  static destroy() {
    this.refCount--
    if (this.refCount === 0 && this.instance) {
      this.instance.destroy()
      this.instance = null
    }
  }

  static get() {
    return this.instance
  }
}

// ============================================================================
// Optimized Animated Card Component
// ============================================================================

const AnimatedCard = memo(
  ({ dtf, index, progress, totalCards, isCurrentCard }: AnimatedCardProps) => {
    // Unified transform for performance
    const transform = useTransform(progress, (p) => {
      const distance = p - index
      const absDistance = Math.abs(distance)

      // Base values
      let y = 0
      let scale = 1
      let opacity = 1
      let zIndex = totalCards - index
      let rotateX = 0

      // Card states based on distance from current
      if (distance < -0.5) {
        // Card has passed (scrolled past)
        y = -window.innerHeight * 0.5
        scale = 0.85
        opacity = 0
        rotateX = -5
      } else if (distance < 0) {
        // Card is transitioning out (current -> past)
        const t = (distance + 0.5) * 2 // Normalize to 0-1
        y = -window.innerHeight * 0.5 * (1 - t)
        scale = 0.85 + 0.15 * t
        opacity = t
        rotateX = -5 * (1 - t)
      } else if (distance === 0) {
        // Current card
        y = 0
        scale = 1
        opacity = 1
        rotateX = 0
        zIndex = totalCards + 10 // Ensure it's on top
      } else if (distance <= CARD_CONFIG.MAX_VISIBLE) {
        // Cards in the stack (upcoming)
        const stackPosition = Math.min(distance, CARD_CONFIG.MAX_VISIBLE - 1)
        y = stackPosition * CARD_CONFIG.STACK_OFFSET
        scale = 1 - (stackPosition * CARD_CONFIG.STACK_SCALE)
        opacity = 1
        rotateX = Math.min(distance * CARD_CONFIG.ROTATION_MAX, CARD_CONFIG.ROTATION_MAX * 2)

        // Boost z-index for cards about to become current
        if (distance < 1) {
          zIndex = totalCards - index + Math.floor((1 - distance) * 10)
        }
      } else {
        // Cards too far ahead
        y = (CARD_CONFIG.MAX_VISIBLE - 1) * CARD_CONFIG.STACK_OFFSET
        scale = 1 - ((CARD_CONFIG.MAX_VISIBLE - 1) * CARD_CONFIG.STACK_SCALE)
        opacity = 0
        rotateX = CARD_CONFIG.ROTATION_MAX * 2
      }

      return { y, scale, opacity, zIndex, rotateX }
    })

    // Extract individual motion values
    const y = useTransform(transform, (t) => t.y)
    const scale = useTransform(transform, (t) => t.scale)
    const opacity = useTransform(transform, (t) => t.opacity)
    const zIndex = useTransform(transform, (t) => t.zIndex)
    const rotateX = useTransform(transform, (t) => t.rotateX)

    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          y,
          scale,
          opacity,
          zIndex,
          rotateX,
          perspective: 1200,
          transformStyle: 'preserve-3d',
          pointerEvents: isCurrentCard ? 'auto' : 'none',
          willChange: isCurrentCard ? 'transform, opacity' : 'auto',
        }}
      >
        <DTFHomeCardFixed dtf={dtf} />
      </motion.div>
    )
  },
  (prevProps, nextProps) => {
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
// Navigation Component
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
              'h-2 rounded-full transition-all duration-500 ease-out',
              'hover:bg-primary-foreground/70',
              index === currentIndex
                ? 'bg-primary-foreground w-8'
                : 'bg-primary-foreground/30 w-2'
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
// Main Carousel Component with Lenis
// ============================================================================

const DTFCarouselLenis = ({ dtfs, isLoading }: DTFCarouselLenisProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const totalCards = dtfs.length

  // Check if component is mounted (client-side)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize Lenis after mount and ref is available
  useEffect(() => {
    if (!isMounted || !containerRef.current || totalCards === 0) return

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (containerRef.current) {
        // Get the app container for Lenis
        const appContainer = document.getElementById('app-container')
        if (appContainer) {
          lenisRef.current = LenisManager.create(appContainer)
          setIsReady(true)
        }
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (lenisRef.current) {
        LenisManager.destroy()
        lenisRef.current = null
      }
    }
  }, [isMounted, totalCards])

  // Create fallback motion value for when scroll isn't ready
  const fallbackProgress = useMotionValue(0)

  // Track scroll progress with Framer Motion (only when ready)
  const { scrollYProgress } = useScroll(
    isReady && containerRef.current
      ? {
          target: containerRef,
          offset: ['start start', 'end end'],
          layoutEffect: false,
        }
      : undefined
  )

  // Use actual scroll progress or fallback
  const activeProgress = isReady && scrollYProgress ? scrollYProgress : fallbackProgress

  // Convert scroll progress to card index
  const cardProgress = useTransform(
    activeProgress,
    [0, 1],
    [0, Math.max(0, totalCards - 1)]
  )

  // Update current index and interaction state
  useMotionValueEvent(cardProgress, 'change', (latest) => {
    if (!isReady) return // Don't process if not ready

    const newIndex = Math.round(latest)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
    if (latest > 0.05 && !hasInteracted) {
      setHasInteracted(true)
    }
  })

  // Smooth scroll to specific card using Lenis
  const scrollToCard = useCallback((index: number) => {
    if (!containerRef.current || !lenisRef.current) return

    const container = containerRef.current
    const scrollRange = container.scrollHeight - window.innerHeight
    const targetProgress = index / Math.max(1, totalCards - 1)
    const targetScroll = targetProgress * scrollRange

    // Get container position
    const containerRect = container.getBoundingClientRect()
    const currentScrollY = window.scrollY || window.pageYOffset
    const containerTop = containerRect.top + currentScrollY

    // Use Lenis for smooth scrolling
    lenisRef.current.scrollTo(containerTop + targetScroll, {
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3), // Ease out cubic
    })
  }, [totalCards])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady) return

      if (e.key === 'ArrowDown' && currentIndex < totalCards - 1) {
        e.preventDefault()
        scrollToCard(currentIndex + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        scrollToCard(currentIndex - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        scrollToCard(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        scrollToCard(totalCards - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isReady, currentIndex, totalCards, scrollToCard])

  // Touch/Swipe support for mobile
  useEffect(() => {
    if (!containerRef.current || !isReady) return

    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY

      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < totalCards - 1) {
          scrollToCard(currentIndex + 1)
        } else if (diff < 0 && currentIndex > 0) {
          scrollToCard(currentIndex - 1)
        }
      }
    }

    const container = containerRef.current
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isReady, currentIndex, totalCards, scrollToCard])

  // Optimize visible cards rendering
  const visibleCards = useMemo(() => {
    const range = CARD_CONFIG.MAX_VISIBLE + 1
    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(totalCards - 1, currentIndex + range)

    return dtfs.slice(start, end + 1).map((dtf, i) => ({
      dtf,
      index: start + i,
    }))
  }, [dtfs, currentIndex, totalCards])

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-primary flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-primary-foreground/60"
        >
          Loading DTFs...
        </motion.div>
      </div>
    )
  }

  // Empty state
  if (!dtfs || dtfs.length === 0) {
    return <div className="h-screen bg-primary" />
  }

  // Don't render until mounted (SSR safety)
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
      {/* Sticky viewport for cards */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Cards container with perspective */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="relative w-full"
            style={{
              height: `${CARD_CONFIG.CARD_HEIGHT}px`,
              maxWidth: '1400px',
              margin: '0 auto',
              perspective: 1200,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Render visible cards */}
            {isReady && visibleCards.map(({ dtf, index }) => (
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
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            >
              <div className="text-xs text-primary-foreground/60 mb-3">
                Scroll to explore
              </div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ChevronDown
                  size={24}
                  className="text-primary-foreground/40"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Progress counter */}
          {hasInteracted && (
            <motion.div
              key="counter"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute top-8 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-light text-primary-foreground"
                >
                  {String(currentIndex + 1).padStart(2, '0')}
                </motion.span>
                <span className="text-sm text-primary-foreground/50">
                  / {String(totalCards).padStart(2, '0')}
                </span>
              </div>
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

export default DTFCarouselLenis