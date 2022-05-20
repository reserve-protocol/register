import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

const Issuance = () => {
  const RToken = useAtomValue(rTokenAtom) as ReserveToken

  return (
    <Container pb={4}>
      <Grid columns={[1, 1, 1, '2fr 1fr']} gap={4}>
        <Box>
          <Text ml={4} mb={3} variant="sectionTitle">
            Mint + Redeem
          </Text>
          <Grid columns={2} gap={4} mb={4}>
            <Issue data={RToken} />
            <Redeem data={RToken} />
          </Grid>
          <Balances rToken={RToken} />
        </Box>
        <About />
      </Grid>
    </Container>
  )
}

export default Issuance
