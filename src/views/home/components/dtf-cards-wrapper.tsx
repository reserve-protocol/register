import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import DTFCarousel from './dtf-carousel'
import DTFSkeletonStack from './dtf-skeleton-stack'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'

interface DTFCardsWrapperProps {
  data: IndexDTFItem[] | undefined
  isLoading: boolean
}

const DTFCardsWrapper = ({ data, isLoading }: DTFCardsWrapperProps) => {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [shouldSpeedUp, setShouldSpeedUp] = useState(false)
  const [readyToSwap, setReadyToSwap] = useState(false)
  const initialScrollPos = useRef<number | null>(null)
  const animationTimeout = useRef<NodeJS.Timeout | null>(null)

  // Track when data is ready
  const hasData = !isLoading && data && data.length > 0

  // Monitor scroll during animation to potentially speed it up
  useEffect(() => {
    if (animationComplete) return

    const handleScroll = () => {
      const appContainer = document.getElementById('app-container')
      const currentScroll = appContainer?.scrollTop || 0

      if (initialScrollPos.current === null) {
        initialScrollPos.current = currentScroll
        return
      }

      const scrollDelta = Math.abs(currentScroll - initialScrollPos.current)

      // Speed up animation if user scrolls more than 50px
      if (scrollDelta > 50 && !shouldSpeedUp) {
        setShouldSpeedUp(true)

        // Clear existing timeout and set faster completion
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current)
        }

        animationTimeout.current = setTimeout(() => {
          setAnimationComplete(true)
        }, 200)
      }
    }

    const appContainer = document.getElementById('app-container')
    appContainer?.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      appContainer?.removeEventListener('scroll', handleScroll)
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [animationComplete, shouldSpeedUp])

  // Mark animation as complete after initial animation
  useEffect(() => {
    if (!animationComplete && !animationTimeout.current) {
      // Set to 500ms to start crossfade while animation is finishing
      animationTimeout.current = setTimeout(() => {
        setAnimationComplete(true)
      }, 500)
    }

    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [animationComplete])

  // Start swap when data is ready AND animation is almost done
  useEffect(() => {
    if (animationComplete && hasData) {
      // Immediate swap when both conditions are met
      setReadyToSwap(true)
    }
  }, [animationComplete, hasData])

  // Animation variants for the entrance effect - using simpler easing for performance
  const stackVariants = {
    hidden: {
      y: 300,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const  // Custom cubic-bezier for smooth motion
      }
    },
    fast: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut' as const
      }
    }
  }

  // Render with seamless crossfade - both components stay in DOM during transition
  return (
    <div className="relative" style={{ minHeight: `${typeof window !== 'undefined' ? window.innerHeight - 72 : 693}px` }}>
      {/* Skeleton layer - always present but fades out */}
      <motion.div
        initial="hidden"
        animate={shouldSpeedUp ? "fast" : "visible"}
        variants={stackVariants}
        style={{
          position: readyToSwap ? 'absolute' : 'relative',
          width: '100%',
          top: 0,
          left: 0,
          opacity: readyToSwap ? 0 : 1,
          transition: readyToSwap ? 'opacity 0.6s ease-in-out' : 'none',
          pointerEvents: readyToSwap ? 'none' : 'auto',
          zIndex: 1,
          willChange: animationComplete ? 'auto' : 'transform, opacity',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        <DTFSkeletonStack />
      </motion.div>

      {/* Carousel layer - renders when data is ready and fades in */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: readyToSwap ? 1 : 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
            delay: readyToSwap ? 0.1 : 0 // Small delay to ensure overlap
          }}
          style={{
            position: readyToSwap ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        >
          <DTFCarousel dtfs={data!} isLoading={false} />
        </motion.div>
      )}
    </div>
  )
}

export default DTFCardsWrapper