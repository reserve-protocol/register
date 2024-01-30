import { Grid } from 'theme-ui'
import NavigationSidebar from './components/NavigationSidebar'
import RTokenOverview from './components/RTokenOverview'

const Settings = () => {
  return (
    <Grid
      columns={['1fr']}
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
      <RTokenOverview />
    </Grid>
  )
}

export default Settings
