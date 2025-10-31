import { useEffect, useRef, useState } from 'react'
import DTFCarousel from './dtf-carousel'
import DTFSkeletonStack from './dtf-skeleton-stack'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import './dtf-entrance.css' // CSS animations for better performance

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

  // Render with CSS animations for better performance
  return (
    <div className="relative" style={{ minHeight: `${typeof window !== 'undefined' ? window.innerHeight - 72 : 693}px` }}>
      {/* Skeleton layer - uses CSS animations */}
      <div
        className={`${shouldSpeedUp ? 'dtf-entrance-animation-fast' : 'dtf-entrance-animation'} ${readyToSwap ? 'dtf-crossfade-out' : ''}`}
        style={{
          position: readyToSwap ? 'absolute' : 'relative',
          width: '100%',
          top: 0,
          left: 0,
          pointerEvents: readyToSwap ? 'none' : 'auto',
          zIndex: 1,
        }}
      >
        <DTFSkeletonStack />
      </div>

      {/* Carousel layer - only renders when data is ready */}
      {hasData && (
        <div
          className={readyToSwap ? 'dtf-crossfade-in' : ''}
          style={{
            position: readyToSwap ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            zIndex: 2,
            opacity: readyToSwap ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
          }}
        >
          <DTFCarousel dtfs={data!} isLoading={false} />
        </div>
      )}
    </div>
  )
}

export default DTFCardsWrapper