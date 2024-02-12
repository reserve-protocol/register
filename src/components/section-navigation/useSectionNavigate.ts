import { useCallback } from 'react'

const useSectionNavigate = () => {
  return useCallback((id: string) => {
    const target = document.getElementById(id)
    const wrapper = document.getElementById('app-container')

    if (target && wrapper) {
      const count = target.offsetTop - wrapper.scrollTop - 80 // xx = any extra distance from top ex. 60
      wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
    }
  }, [])
}

export default useSectionNavigate
