import { Box, Grid } from 'theme-ui'
import BackupBasket from './BackupBasket'
import PrimaryBasket from './PrimaryBasket'

const DeployPreview = () => {
  return (
    <Grid gap={5} columns={[1, 2]}>
      <Box></Box>
      <Box>
        <PrimaryBasket readOnly />
        <BackupBasket mt={3} readOnly />
      </Box>
    </Grid>
  )
}

export default DeployPreview
