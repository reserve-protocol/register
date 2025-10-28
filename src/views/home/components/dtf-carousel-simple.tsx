import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DTFCarouselSimpleProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

const DTFCarouselSimple = ({ dtfs, isLoading }: DTFCarouselSimpleProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  )
  const [viewportHeight, setViewportHeight] = useState(800) // Default fallback
  const containerRef = useRef<HTMLDivElement>(null)
  const totalCards = dtfs.length

  // Configuration
  const SCROLL_PER_CARD = 200 // Balanced scroll space per card
  const CARD_HEIGHT = 720
  const CARD_OFFSET = 15 // Vertical spacing between stacked cards (smaller for tighter stack)
  const SCALE_FACTOR = 0.06 // How much each card scales down (matching reference)
  const SCROLL_THRESHOLD = 100 // Pixels needed to trigger card change

  // ============================================================================
  // 🔴 CORE SCROLL HIJACKING LOGIC - WHERE THE MAGIC HAPPENS
  // ============================================================================
  useEffect(() => {
    if (!containerRef.current || totalCards === 0) return

    // 🔴 PROBLEM: These variables are recreated on every render, causing stale closure issues
    // The accumulator will reset when the component re-renders (when currentIndex changes)
    let accumulatedScroll = 0
    let lastScrollTime = Date.now()

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // 🔴 ISSUE: Only checking rect.top <= 0 isn't enough - should also check rect.bottom
      const isSticky = rect.top <= 0
      const scrollingUp = e.deltaY < 0
      const scrollingDown = e.deltaY > 0

      // Check if we're at boundaries
      const atFirstCard = currentIndex === 0
      const atLastCard = currentIndex === totalCards - 1

      // ALWAYS hijack scroll when sticky is active UNLESS at boundaries
      if (isSticky) {
        // Handle boundary releases with PROPER scroll position adjustment
        if (atFirstCard && scrollingUp) {
          // Don't accumulate or prevent - just let scroll happen naturally
          // The container start is where hero ends, so just release control
          return // Release scroll control
        }

        // 🔴 PROBLEM: This creates a jarring jump to footer
        if (atLastCard && scrollingDown) {
          // Jump to near the end of the ENTIRE document to show footer immediately
          const documentHeight = document.documentElement.scrollHeight
          const windowHeight = window.innerHeight
          const currentScrollY = window.scrollY

          // Position viewport so footer is just coming into view
          const targetScrollY = documentHeight - windowHeight - 100

          // 🔴 DEBUG: These console.logs should be removed in production
          console.log('Jumping from', currentScrollY, 'to', targetScrollY)

          // Use scrollTo with immediate behavior
          window.scrollTo(0, targetScrollY)

          // Double-check it worked
          setTimeout(() => {
            const newScrollY = window.scrollY
            console.log('After jump, scroll is at:', newScrollY)
          }, 10)

          return // Release scroll control
        }

        // Not at boundaries - hijack scroll for card navigation
        e.preventDefault() // 🔴 CRITICAL: Prevents native scrolling
        e.stopPropagation()

        // Reset accumulator if too much time has passed
        // 🔴 This prevents small scroll movements from accumulating over time
        const currentTime = Date.now()
        if (currentTime - lastScrollTime > 500) {
          accumulatedScroll = 0
        }
        lastScrollTime = currentTime

        // IMPORTANT: Only accumulate if not transitioning to prevent multiple jumps
        if (!isTransitioning) {
          // 🔴 Accumulator pattern: Collect scroll deltas until threshold is reached
          accumulatedScroll += e.deltaY

          // Check if we should change card (ONE at a time)
          if (Math.abs(accumulatedScroll) >= SCROLL_THRESHOLD) {
            if (scrollingDown && currentIndex < totalCards - 1) {
              // Scroll down - next card ONLY
              setIsTransitioning(true)
              setScrollDirection('down')
              setCurrentIndex((prev) => prev + 1)
              accumulatedScroll = 0 // Reset immediately

              setTimeout(() => {
                setIsTransitioning(false)
                setScrollDirection(null)
              }, 500)
            } else if (scrollingUp && currentIndex > 0) {
              // Scroll up - previous card ONLY
              setIsTransitioning(true)
              setScrollDirection('up')
              setCurrentIndex((prev) => prev - 1)
              accumulatedScroll = 0 // Reset immediately

              setTimeout(() => {
                setIsTransitioning(false)
                setScrollDirection(null)
              }, 500)
            } else {
              // At boundary, reset accumulator
              accumulatedScroll = 0
            }
          }
        }
      }
    }

    // 🔴 CRITICAL: passive: false allows preventDefault() to work
    // Without this, the browser would scroll the page while we're trying to control the carousel
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [currentIndex, totalCards, isTransitioning]) // 🔴 PROBLEM: Dependencies cause event listener to re-attach on every state change

  // Manual navigation
  const goToCard = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalCards && !isTransitioning) {
        setIsTransitioning(true)
        setScrollDirection(index > currentIndex ? 'down' : 'up')
        setCurrentIndex(index)

        setTimeout(() => {
          setIsTransitioning(false)
          setScrollDirection(null)
        }, 500)
      }
    },
    [currentIndex, totalCards, isTransitioning]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isInView = rect.top <= 0 && rect.bottom >= window.innerHeight

      if (isInView && !isTransitioning) {
        if (e.key === 'ArrowDown' && currentIndex < totalCards - 1) {
          e.preventDefault()
          goToCard(currentIndex + 1)
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault()
          goToCard(currentIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalCards, isTransitioning, goToCard])

  // Set viewport height on mount and resize
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight)
    }
    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)
    return () => window.removeEventListener('resize', updateViewportHeight)
  }, [])

  // Preload ALL images on mount for smooth transitions
  useEffect(() => {
    // Preload all DTF images immediately
    dtfs.forEach((dtf) => {
      const cover = dtf?.brand?.cover
      if (cover) {
        const img = new Image()
        img.src = cover
      }
    })
  }, [dtfs])

  // Always render the container to prevent layout jumps
  // If no DTFs yet, render with minimum height
  if (!dtfs || dtfs.length === 0) {
    return <div style={{ height: `${viewportHeight}px` }} />
  }

  // Calculate container height with LARGE buffer to ensure hijacking never breaks
  // We'll manually adjust scroll position when releasing to avoid dead space
  const INITIAL_SCROLL_BUFFER = 400 // Extra space before cards start changing
  const END_BUFFER = 5000 // 🔴 PROBLEM: This creates massive dead space at the end
  const containerHeight =
    viewportHeight +
    INITIAL_SCROLL_BUFFER +
    totalCards * SCROLL_PER_CARD +
    END_BUFFER

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${containerHeight}px` }}
    >
      {/* 🔴 Sticky wrapper: This stays fixed at top of viewport while user scrolls through container height */}
      <div className="sticky top-0 w-full h-screen">
        {/* Cards Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            {/* Card Stack - All cards pre-rendered */}
            <div
              className="relative"
              style={{ width: '100%', height: `${CARD_HEIGHT}px` }}
            >
              {/* Pre-render ALL cards to avoid loading skeletons */}
              {dtfs.map((dtf, index) => {
                const relativePosition = index - currentIndex
                const isTopCard = relativePosition === 0

                // Only show max 3 cards in stack, hide the rest
                const maxStackDepth = 3
                const isInStack =
                  relativePosition >= 0 && relativePosition <= maxStackDepth
                const isPastStack = relativePosition > maxStackDepth

                // Calculate animation values based on relative position
                const bottomOffset =
                  relativePosition < 0
                    ? 800 // Card has been scrolled past (move down out of view)
                    : isPastStack
                      ? maxStackDepth * CARD_OFFSET // Hidden behind the stack
                      : relativePosition * CARD_OFFSET // Card in visible stack

                const scaleValue =
                  relativePosition < 0
                    ? 0.82
                    : isPastStack
                      ? 1 - maxStackDepth * SCALE_FACTOR // Same scale as deepest visible card
                      : 1 - relativePosition * SCALE_FACTOR

                const zIndexValue = totalCards - index // 🔴 PROBLEM: This makes cards with lower index have higher z-index (backwards)
                const opacityValue =
                  relativePosition < 0 ? 0 : isPastStack ? 0 : 1

                return (
                  <motion.div
                    key={dtf.address} // Stable key based on DTF id, not index
                    className="absolute inset-0"
                    initial={false} // Prevent initial animation on mount
                    animate={{
                      y: bottomOffset,
                      scale: scaleValue,
                      opacity: opacityValue,
                    }}
                    transition={{
                      y: {
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        mass: 0.8,
                      },
                      scale: {
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        mass: 0.8,
                      },
                      opacity: { duration: 0.3, ease: 'easeOut' },
                    }}
                    style={{
                      transformOrigin: 'bottom center',
                      pointerEvents: isTopCard ? 'auto' : 'none',
                      willChange: 'auto',
                      zIndex: zIndexValue,
                      transform: 'translateZ(0)', // Force GPU acceleration
                    }}
                  >
                    <DTFHomeCardFixed dtf={dtf} />
                  </motion.div>
                )
              })}
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
        </AnimatePresence>
      </div>
    </section>
  )
}

export default DTFCarouselSimple
