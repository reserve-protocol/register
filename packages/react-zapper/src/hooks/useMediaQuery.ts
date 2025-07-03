import { useEffect, useState } from 'react'

/**
 * Hook to check if a media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)

    // Set initial value
    setMatches(media.matches)

    // Listen for changes
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

export default useMediaQuery
