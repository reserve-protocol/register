import Layout from 'components/rtoken-setup/Layout'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenManagement from './components/RTokenManagement'
import RTokenOverview from './components/RTokenOverview'

const Management = () => (
  <Layout>
    <NavigationSidebar />
    <RTokenOverview />
    <RTokenManagement />
  </Layout>
)

export default Management
