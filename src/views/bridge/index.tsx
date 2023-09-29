import { Box, Grid } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeFaq from './components/BridgeFaq'

const ChainBridge = () => (
  <Grid columns={[1, 1, 2]} px={[1, 4, 4, 8, 9]} py={[1, 5, 5, 8]} gap={5}>
    <Bridge />
    <Box sx={{ height: 'fit-content' }}>
      <BridgeFaq />
    </Box>
  </Grid>
)

export default ChainBridge
