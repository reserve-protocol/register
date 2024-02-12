import { Grid } from 'theme-ui'
import RTokenOverview from './components/RTokenOverview'

const Settings = () => {
  return (
    <Grid
      columns={['1fr']}
      gap={5}
      p={[1, 6]}
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
