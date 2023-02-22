import Layout from 'components/rtoken-setup/Layout'
import useToggledSidebar from 'hooks/useToggledSidebar'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenManagement from './components/RTokenManagement'
import RTokenOverview from './components/RTokenOverview'

const Settings = () => {
  useToggledSidebar()

  return (
    <Layout>
      <NavigationSidebar />
      <RTokenOverview />
      <RTokenManagement />
    </Layout>
  )
}

export default Settings
