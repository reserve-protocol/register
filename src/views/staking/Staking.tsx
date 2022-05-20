import { Container } from 'components'
import { Box, Grid, Text } from 'theme-ui'
import Balances from './components/balances'
import Stake from './components/stake'
import Unstake from './components/unstake'

const Staking = () => (
  <Container pb={4}>
    <Grid columns={[1, 1, 1, '2fr 1fr']} gap={4}>
      <Box>
        <Text ml={4} mb={3} variant="sectionTitle">
          Stake + UnStake
        </Text>
        <Grid columns={2} gap={4} mb={4}>
          <Stake />
          <Unstake />
        </Grid>
        <Balances />
      </Box>
    </Grid>
  </Container>
)

export default Staking
