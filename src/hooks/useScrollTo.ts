import { useCallback } from 'react'

const useScrollTo = (elementId: string, offset = 20) =>
  useCallback(() => {
    const target = document.getElementById(elementId)
    const wrapper = document.getElementById('app-container')

    if (target && wrapper) {
      const count = target.offsetTop - wrapper.scrollTop - offset // xx = any extra distance from top ex. 60
      wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
    }
  }, [elementId, offset])

export default useScrollTo
