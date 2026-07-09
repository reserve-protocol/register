import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches
  )

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setPrefersReducedMotion(media.matches)

    update()

    if (media.addEventListener) {
      media.addEventListener('change', update)
    } else {
      media.addListener(update)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', update)
      } else {
        media.removeListener(update)
      }
    }
  }, [])

  return prefersReducedMotion
}
