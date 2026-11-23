import { useMediaQuery } from '@/hooks/use-media-query'

export const useReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)')
