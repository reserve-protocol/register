import { Box, Grid } from 'theme-ui'
import TokenAddresses from './TokenAddresses'
import TokenMandate from './TokenMandate'
import TokenStats from './TokenStats'

const Hero = () => (
  <Box ml="4">
    <TokenAddresses />
    <Grid gap={6} columns={[1, 1, 1, 2]}>
      <TokenStats />
      <TokenMandate />
    </Grid>
  </Box>
)

export default Hero
