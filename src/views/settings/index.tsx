import Layout from 'components/rtoken-setup/Layout'
import useToggledSidebar from 'hooks/useToggledSidebar'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenOverview from './components/RTokenOverview'
import { Grid } from 'theme-ui'

const Settings = () => {
  useToggledSidebar()

  return (
    <Grid
      // id="rtoken-setup-container"
      columns={['1fr', '200px 1fr', '200px 1fr', '200px 600px']}
      gap={5}
      px={[2, 4, 7]}
      pt={[2, 4, 6]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        overflowY: 'auto',
      }}
    >
      <NavigationSidebar sx={{ display: ['none', 'block'] }} />
      <RTokenOverview />
    </Grid>
  )
}

export default Settings
