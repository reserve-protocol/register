import { Grid } from 'theme-ui'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenOverview from './components/RTokenOverview'

const Settings = () => {
  return (
    <Grid
      columns={['1fr', '200px 1fr', '200px 1fr', '200px 600px']}
      gap={5}
      px={[2, 4, 7]}
      pt={[2, 4, 6]}
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <NavigationSidebar sx={{ display: ['none', 'block'] }} />
      <RTokenOverview />
    </Grid>
  )
}

export default Settings
