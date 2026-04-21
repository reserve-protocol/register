import { useEffect, useState } from 'react'

const getInitialIsDark = () => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme-ui-color-mode')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(getInitialIsDark)

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return isDark
}

export default useIsDarkMode
