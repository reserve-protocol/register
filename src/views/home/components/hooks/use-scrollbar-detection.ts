import { useEffect, useRef, MutableRefObject } from 'react'
import type Lenis from 'lenis'

interface ScrollbarDetectionResult {
  isScrollbarDragging: MutableRefObject<boolean>
  scrollbarReleaseIndex: MutableRefObject<number | null>
}

/**
 * Detects when user is dragging the scrollbar
 * Handles carousel deactivation during scrollbar interaction
 */
export function useScrollbarDetection(
  isActive: boolean,
  currentIndex: number,
  wrapperRef: MutableRefObject<HTMLDivElement | null>,
  lenisRef: MutableRefObject<Lenis | null>,
  onDeactivate: () => void
): ScrollbarDetectionResult {
  const isScrollbarDragging = useRef(false)
  const scrollbarReleaseIndex = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const scrollbarWidth = windowWidth - document.documentElement.clientWidth

      // Detect if clicking near scrollbar (with tolerance for easier detection)
      const isNearScrollbar = e.clientX >= windowWidth - scrollbarWidth - 20

      if (isNearScrollbar) {
        isScrollbarDragging.current = true

        // Save current state if carousel is active
        if (isActive) {
          scrollbarReleaseIndex.current = currentIndex
          onDeactivate()

          // Re-enable smooth scrolling for scrollbar drag
          if (lenisRef.current) {
            lenisRef.current.start()
          }
        }
      }
    }

    const handleMouseUp = () => {
      if (isScrollbarDragging.current) {
        isScrollbarDragging.current = false

        // Clear saved index if user scrolled far from carousel
        setTimeout(() => {
          if (!wrapperRef.current) return

          const rect = wrapperRef.current.getBoundingClientRect()
          const isFarFromCarousel = rect.bottom < -200 || rect.top > window.innerHeight + 200

          if (isFarFromCarousel) {
            scrollbarReleaseIndex.current = null
          }
        }, 100)
      }
    }

    // Handle mouse leaving window while dragging
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientX >= window.innerWidth - 50) {
        handleMouseUp()
      }
    }

    // Attach listeners
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isActive, currentIndex, wrapperRef, lenisRef, onDeactivate])

  return {
    isScrollbarDragging,
    scrollbarReleaseIndex,
  }
}