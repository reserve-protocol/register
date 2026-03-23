import { useEffect } from 'react'

const useScrollToHash = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const attempt = () => {
      const target = document.getElementById(hash)
      const wrapper = document.getElementById('app-container')
      if (target && wrapper) {
        const offset = target.offsetTop - wrapper.scrollTop - 75
        wrapper.scrollBy({ top: offset, left: 0, behavior: 'smooth' })
        return true
      }
      return false
    }

    // Retry a few times to wait for components to render
    const timers = [1000, 1500].map((delay) =>
      setTimeout(() => attempt(), delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [])
}

export default useScrollToHash
