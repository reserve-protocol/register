import { Box, Grid } from 'theme-ui'
import BackupBasket from './BackupBasket'
import PrimaryBasket from './PrimaryBasket'
import TokenConfigurationOverview from './TokenConfigurationOverview'

const DeployPreview = () => {
  return (
    <Grid columns={2} variant="layout.card">
      <TokenConfigurationOverview />
      <Box>
        <PrimaryBasket readOnly />
        <BackupBasket mt={3} readOnly />
      </Box>
    </Grid>
  )
}

export default DeployPreview
