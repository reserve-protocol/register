import { Box, Grid } from 'theme-ui'
import TokenInfo from './TokenInfo'
import TokenMandate from './TokenMandate'
import TokenStats from './TokenStats'

const Hero = () => (
  <Box ml="4" py={3}>
    <TokenInfo />
    <Grid mt={[3, 8]} gap={6} columns={[1, 1, 1, 2]}>
      <TokenStats />
      <TokenMandate />
    </Grid>
  </Box>
)

export default Hero
