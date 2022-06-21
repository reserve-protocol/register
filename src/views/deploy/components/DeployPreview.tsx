import { Box, Grid } from 'theme-ui'
import BackupBasket from './BackupBasket'
import PrimaryBasket from './PrimaryBasket'
import TokenConfigurationOverview from './TokenConfigurationOverview'

const DeployPreview = () => {
  return (
    <Grid gap={5} columns={[1, 2]}>
      <TokenConfigurationOverview />
      <Box>
        <PrimaryBasket readOnly />
        <BackupBasket mt={3} readOnly />
      </Box>
    </Grid>
  )
}

export default DeployPreview
