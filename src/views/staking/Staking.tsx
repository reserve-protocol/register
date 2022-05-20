import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Stake from './components/stake'
import Unstake from './components/unstake'

const Staking = () => {
  // This component is protected by a guard, RToken always exists
  const RToken = useAtomValue(rTokenAtom) as ReserveToken

  return (
    <Container pb={4}>
      <Grid columns={[1, 1, 1, '2fr 1fr']} gap={4}>
        <Box>
          <Text ml={4} mb={3} variant="sectionTitle">
            Stake + UnStake
          </Text>
          <Grid columns={2} gap={4} mb={4}>
            <Stake />
            <Unstake data={RToken} />
          </Grid>
          <Balances rToken={RToken} />
        </Box>
      </Grid>
    </Container>
  )
}

export default Staking
