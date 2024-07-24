import { Box, Grid } from 'theme-ui'
import TokenInfo from './TokenInfo'
import TokenMandate from './TokenMandate'
import TokenStats from './TokenStats'

const Hero = () => (
  <Box mx="4" py={3}>
    <TokenInfo />
    <Grid
      mt={[5, 8]}
      gap={6}
      columns={[1, 1, 1, '3fr 2fr']}
      sx={{
        alignItems: 'end',
        '@media (min-width: 1152px) and (max-width: 1400px)': {
          'grid-template-columns': 'repeat(1, 1fr)',
        },
      }}
    >
      <TokenStats />
      <TokenMandate />
    </Grid>
  </Box>
)

export default Hero
