import { Box, Grid } from 'theme-ui'
import TokenAddresses from './TokenAddresses'
import TokenMandate from './TokenMandate'
import TokenStats from './TokenStats'

const Hero = () => (
  <Box ml="4" py={3}>
    <TokenAddresses />
    <Grid mt={[3, 8]} gap={6} columns={[1, 1, 1, 2]} sx={{ alignItems: 'end' }}>
      <TokenStats />
      <TokenMandate />
    </Grid>
  </Box>
)

export default Hero
