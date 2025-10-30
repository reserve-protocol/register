import { useRef, MutableRefObject } from 'react'
import type Lenis from 'lenis'

interface ActivationConfig {
  headerHeight: number
  topThreshold: number
  bottomThreshold: number
  exitDeadZone: number
}

interface ActivationState {
  isApproaching: MutableRefObject<boolean>
  isPositioning: MutableRefObject<boolean>
  exitDirection: MutableRefObject<'top' | 'bottom' | null>
  lastExitIndex: MutableRefObject<number | null>
}

/**
 * Manages carousel activation/deactivation logic
 * Handles entry detection, exit tracking, and re-engagement prevention
 */
export function useCarouselActivation(config: ActivationConfig): ActivationState {
  const isApproaching = useRef(false)
  const isPositioning = useRef(false)
  const exitDirection = useRef<'top' | 'bottom' | null>(null)
  const lastExitIndex = useRef<number | null>(null)

  return {
    isApproaching,
    isPositioning,
    exitDirection,
    lastExitIndex,
  }
}

/**
 * Determines if carousel should activate based on scroll position
 */
export function shouldActivateCarousel(
  rect: DOMRect,
  state: ActivationState,
  config: ActivationConfig
): { shouldActivate: boolean; approachDirection: 'top' | 'bottom' | null } {
  const { headerHeight, topThreshold, bottomThreshold, exitDeadZone } = config
  const { exitDirection, isApproaching, isPositioning } = state

  // Check if carousel is near viewport
  const isNearingFromTop = rect.top < topThreshold && rect.top > -50
  const isNearingFromBottom =
    rect.bottom > window.innerHeight - bottomThreshold &&
    rect.bottom < window.innerHeight + 50

  if (isPositioning.current) {
    return { shouldActivate: false, approachDirection: null }
  }

  // Clear exit state if carousel is completely out of view
  if (exitDirection.current) {
    const carouselAboveViewport = rect.bottom < 0
    const carouselBelowViewport = rect.top > window.innerHeight

    if (carouselAboveViewport || carouselBelowViewport) {
      exitDirection.current = null
      state.lastExitIndex.current = null
    }
  }

  // Check if we're in the dead zone after exit
  if (exitDirection.current) {
    const inTopDeadZone =
      exitDirection.current === 'top' &&
      rect.top > headerHeight &&
      rect.top < headerHeight + exitDeadZone

    const inBottomDeadZone =
      exitDirection.current === 'bottom' &&
      rect.bottom < window.innerHeight &&
      rect.bottom > window.innerHeight - exitDeadZone

    if (inTopDeadZone || inBottomDeadZone) {
      return { shouldActivate: false, approachDirection: null }
    }

    // Clear exit direction if approaching from opposite side
    if (
      (exitDirection.current === 'top' && isNearingFromBottom) ||
      (exitDirection.current === 'bottom' && isNearingFromTop)
    ) {
      exitDirection.current = null
    }
  }

  // Determine if we should activate
  const shouldActivate =
    (isNearingFromTop || isNearingFromBottom) &&
    !isApproaching.current &&
    !exitDirection.current

  const approachDirection = isNearingFromBottom ? 'bottom' : isNearingFromTop ? 'top' : null

  return { shouldActivate, approachDirection }
}

/**
 * Determines if carousel should deactivate based on position
 */
export function shouldDeactivateCarousel(
  rect: DOMRect,
  currentIndex: number,
  totalCards: number,
  config: ActivationConfig
): { shouldDeactivate: boolean; exitBoundary: 'top' | 'bottom' | null } {
  const { headerHeight } = config
  const atFirstCard = currentIndex === 0
  const atLastCard = currentIndex === totalCards - 1

  // Check deactivation conditions with lenient thresholds
  const exitingTop = atFirstCard && rect.top > headerHeight + 150
  const exitingBottom = atLastCard && rect.bottom < window.innerHeight - 150

  if (exitingTop || exitingBottom) {
    // Determine which boundary we're exiting from (with tighter threshold)
    let exitBoundary: 'top' | 'bottom' | null = null

    if (atFirstCard && rect.top > headerHeight + 50) {
      exitBoundary = 'top'
    } else if (atLastCard && rect.bottom < window.innerHeight - 50) {
      exitBoundary = 'bottom'
    }

    return { shouldDeactivate: true, exitBoundary }
  }

  return { shouldDeactivate: false, exitBoundary: null }
}

/**
 * Smoothly scrolls to carousel position using Lenis
 */
export function scrollToCarousel(
  rect: DOMRect,
  lenisRef: MutableRefObject<Lenis | null>,
  headerHeight: number
): number {
  const appContainer = document.getElementById('app-container')
  if (!appContainer) return 0

  const currentScroll = lenisRef.current?.scroll || appContainer.scrollTop
  const targetPosition = currentScroll + (rect.top - headerHeight)

  if (lenisRef.current) {
    lenisRef.current.scrollTo(targetPosition, {
      duration: 0.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })
  } else {
    appContainer.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }

  return targetPosition
}