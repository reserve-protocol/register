import { useCallback } from 'react'

const useScrollTo = (elementId: string) =>
  useCallback(() => {
    const target = document.getElementById(elementId)
    const wrapper = document.getElementById('app-container')

    if (target && wrapper) {
      const count = target.offsetTop - wrapper.scrollTop - 20 // xx = any extra distance from top ex. 60
      wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
    }
  }, [elementId])

export default useScrollTo
