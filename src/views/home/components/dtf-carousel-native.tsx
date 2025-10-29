import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValueEvent } from 'motion/react'
import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import DTFHomeCardFixed from './dtf-home-card-fixed'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DTFCarouselNativeProps {
  dtfs: IndexDTFItem[]
  isLoading?: boolean
}

// Card animation component
const AnimatedCard = ({
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
  // Calculate animations based on scroll progress
  const cardY = useTransform(
    progress,
    // Input range: when this card should be visible
    [
      Math.max(0, index - 0.5),
      index,
      Math.min(totalCards - 1, index + 0.5)
    ],
    // Output range: position values
    [
      index === 0 ? 0 : -100, // Previous position
      0,                      // Current position (centered)
      index === totalCards - 1 ? 0 : 100  // Next position
    ]
  )

  const cardScale = useTransform(
    progress,
    [
      Math.max(0, index - 0.3),
      index,
      Math.min(totalCards - 1, index + 0.3)
    ],
    [0.85, 1, 0.85]
  )

  const cardOpacity = useTransform(
    progress,
    [
      Math.max(0, index - 0.5),
      index - 0.2,
      index + 0.2,
      Math.min(totalCards - 1, index + 0.5)
    ],
    [0, 1, 1, 0]
  )

  // Stack effect for cards
  const stackY = useTransform(
    progress,
    (p) => {
      const distance = index - p
      if (distance <= 0) return 0 // Current and past cards
      if (distance > 3) return 60 // Max stack offset
      return distance * 20 // Stack offset
    }
  )

  const stackScale = useTransform(
    progress,
    (p) => {
      const distance = index - p
      if (distance <= 0) return 1 // Current and past cards
      if (distance > 3) return 0.85 // Min scale
      return 1 - (distance * 0.05) // Progressive scale
    }
  )

  // Determine if card should be interactive
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      setIsActive(Math.abs(latest - index) < 0.1)
    })
    return unsubscribe
  }, [progress, index])

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        y: useSpring(cardY, { stiffness: 300, damping: 30 }),
        scale: useSpring(cardScale, { stiffness: 300, damping: 30 }),
        opacity: cardOpacity,
      }}
    >
      <motion.div
        style={{
          y: stackY,
          scale: stackScale,
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        <DTFHomeCardFixed dtf={dtf} />
      </motion.div>
    </motion.div>
  )
}

const DTFCarouselNative = ({ dtfs, isLoading }: DTFCarouselNativeProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before initializing scroll tracking
  useLayoutEffect(() => {
    setIsMounted(true)
  }, [])

  // Track scroll progress of the entire section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
    layoutEffect: false // Disable layout effect to prevent hydration issues
  })

  // Transform scroll progress to card index
  const cardProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, Math.max(0, dtfs.length - 1)]
  )

  // Smooth the progress
  const smoothProgress = useSpring(cardProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  })

  // Update current index based on progress
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const newIndex = Math.round(latest)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
    // Mark as interacted after first scroll
    if (latest > 0.1 && !hasInteracted) {
      setHasInteracted(true)
    }
  })

  // Navigation dots click handler
  const scrollToCard = (index: number) => {
    if (!containerRef.current) return

    const container = containerRef.current
    const viewportHeight = window.innerHeight
    const cardScrollHeight = viewportHeight // Each card takes one viewport height
    const targetScroll = index * cardScrollHeight

    // Calculate the absolute position
    const containerTop = container.offsetTop
    const targetPosition = containerTop + targetScroll

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }

  // Empty state
  if (!dtfs || dtfs.length === 0) {
    return <div className="h-screen bg-primary" />
  }

  const totalCards = dtfs.length

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return <div className="h-screen bg-primary" />
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-primary"
      style={{
        // Exact height for scroll progress - no buffer
        // Each card gets exactly 1 viewport height of scroll
        height: `${totalCards * 100}vh`,
      }}
    >
      {/* Sticky container that holds the cards */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: '100%',
              height: '720px', // Fixed card height
              maxWidth: '1400px',
            }}
          >
            {/* Render all cards with animations */}
            {dtfs.map((dtf, index) => (
              <AnimatedCard
                key={dtf.address}
                dtf={dtf}
                index={index}
                progress={smoothProgress}
                totalCards={totalCards}
              />
            ))}
          </div>
        </div>

        {/* Scroll hint - only show at the beginning */}
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

        {/* Navigation dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {dtfs.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress indicator (optional) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{totalCards}</span>
        </div>
      </div>
    </div>
  )
}

export default DTFCarouselNative