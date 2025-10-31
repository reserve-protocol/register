import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

interface LenisConfig {
  lerp?: number
  wheelMultiplier?: number
  touchMultiplier?: number
}

/**
 * Manages Lenis smooth scroll instance
 * Provides methods to control scroll behavior (stop/start/scrollTo)
 */
export function useLenisScroll(config?: LenisConfig) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const appContainer = document.getElementById('app-container')
    if (!appContainer) return

    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      wrapper: appContainer,
      content: appContainer,
      lerp: config?.lerp ?? 0.1,
      wheelMultiplier: config?.wheelMultiplier ?? 1,
      touchMultiplier: config?.touchMultiplier ?? 2,
      smoothWheel: true,
      syncTouch: true,
    })

    lenisRef.current = lenis

    // Start with Lenis stopped to prevent early scrolling
    lenis.stop()
    console.log('🚫 Lenis initially stopped to prevent early scrolling')

    // Start Lenis after a brief delay to let the page stabilize
    setTimeout(() => {
      lenis.start()
      console.log('✅ Lenis started after initial delay')
    }, 300)

    // Animation loop
    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [config?.lerp, config?.wheelMultiplier, config?.touchMultiplier])

  return lenisRef
}