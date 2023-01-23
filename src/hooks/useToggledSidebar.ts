import { sidebarToggleAtom } from 'components/layout/sidebar/Sidebar'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

const useToggledSidebar = () => {
  const toggleSidebar = useSetAtom(sidebarToggleAtom)

  useEffect(() => {
    toggleSidebar(true)

    return () => {
      toggleSidebar(false)
    }
  }, [])

  return null
}

export default useToggledSidebar
