import { sidebarToggleAtom } from 'components/layout/sidebar/Sidebar'
import Layout from 'components/rtoken-setup/Layout'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenManagement from './components/RTokenManagement'
import RTokenOverview from './components/RTokenOverview'
import useRTokenMeta from './useRTokenMeta'

const Settings = () => {
  useRTokenMeta()
  const toggleSidebar = useSetAtom(sidebarToggleAtom)

  useEffect(() => {
    toggleSidebar(true)

    return () => {
      toggleSidebar(false)
    }
  }, [])

  return (
    <Layout>
      <NavigationSidebar />
      <RTokenOverview />
      <RTokenManagement />
    </Layout>
  )
}

export default Settings
