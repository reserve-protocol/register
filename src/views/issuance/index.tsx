import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { balancesAtom, rTokenAtom } from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

const Issuance = () => {
  const RToken = useAtomValue(rTokenAtom) as ReserveToken
  const balance = useAtomValue(balancesAtom)[RToken.token.address]

  return (
    <Container pb={4}>
      <Grid columns={[1, 1, 1, '2fr 1fr']} gap={4}>
        <Box>
          <Text mb={3} variant="sectionTitle">
            Mint & Redeem {RToken.token.symbol}
          </Text>
          <Grid columns={2} gap={4} mb={4}>
            <Issue data={RToken} />
            <Redeem data={RToken} max={balance} />
          </Grid>
          <Balances rToken={RToken} />
        </Box>
        <About />
      </Grid>
    </Container>
  )
}

export default Issuance
