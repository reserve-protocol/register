import { Trans } from '@lingui/macro'
import { Container } from 'components'
import useRToken from 'hooks/useRToken'
import { Box, Grid, Text } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

const Issuance = () => {
  const rToken = useRToken()

  if (!rToken) return null

  return (
    <Container pb={4}>
      <Text ml={4} mb={4} variant="sectionTitle">
        <Trans>Mint + Redeem</Trans>
      </Text>
      <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={6}>
        <Box>
          <Grid columns={[1, 2]} gap={4} mb={4}>
            <Issue data={rToken} />
            <Redeem data={rToken} />
          </Grid>
          <Balances rToken={rToken} />
        </Box>
        <About />
      </Grid>
    </Container>
  )
}

export default Issuance
