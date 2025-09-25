import { useEffect, useState } from 'react'

/**
 * Custom hook to detect media query matches
 * @param query - Media query string (e.g., '(min-width: 640px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

/**
 * Predefined breakpoint hooks for common use cases
 */
export const useIsMobile = () => !useMediaQuery('(min-width: 640px)') // < sm
export const useIsTablet = () => useMediaQuery('(min-width: 768px)') // >= md
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)') // >= lg
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1280px)') // >= xl
