import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Box, Divider, Grid, Text } from 'theme-ui'
import TransactionsOverview from './components/GeneralOverview'
import Greet from './components/Greet'
import Portfolio from './components/Portfolio'
import TokenList from './components/TokenList'
import TokenStats from './components/TokenStats'

const VISITED_KEY = 'visited'

const Home = () => {
  const account = useAtomValue(walletAtom)
  const [visited, setVisited] = useState(
    !!account || !!localStorage.getItem(VISITED_KEY)
  )

  const handleDismiss = () => {
    setVisited(true)
    localStorage.setItem(VISITED_KEY, 'true')
  }

  useEffect(() => {
    if (account && !visited) {
      handleDismiss()
    }
  }, [account])

  return (
    <Box mx={7} my={8}>
      {!account && !visited && <Greet onDismiss={handleDismiss} />}
      {!!account && <Portfolio />}
      <Grid columns={[1, 1, 1, 2]}>
        <TokenStats mb={6} />
        <TransactionsOverview mb={6} />
      </Grid>
      <Divider mb={8} mt={6} mx={-7} sx={{ borderColor: 'darkBorder' }} />
      <TokenList mt={6} />
      <Divider my={8} mx={-7} sx={{ borderColor: 'darkBorder' }} />
      <Grid columns={2} mt={6} px={8} gap={8}>
        <Box>
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>RTokens</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus facilisis velit, at venenatis nunc iaculis . Vestibulum ante
            ipsum primis in faucibus orci luctus et posuere curae. Lorem ipsum
            dolor sit amet, consectetur elit. Etiam maximus facilisis velit, at
            venenatis nunc iaculis vitae.
          </Text>
          <br />
          <br />
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>This app</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. maximus
            facilisis velit, at venenatis nunc iaculis . Vestibulum ante ipsum
            primis in faucibus orci luctus et posuere curae. Lorem ipsum dolor
            sit amet, consectetur adipiscing elit.
          </Text>
          <br />
          <br />
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>How do we get usage data?</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus facilisis velit, at venenatis nurae. Lorem ipsum dolor amet,
            consectetur adipiscing elit. Etiam maximus facilisis velit,
            venenatis nunc iaculis vitae.
          </Text>
          <br />
          <br />
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>Reserve</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus facilisis velit, at venenatis nurae. Lorem ipsum dolor amet,
            consectetur adipiscing elit. Etiam maximus facilisis velit,
            venenatis nunc iaculis vitae.
          </Text>
        </Box>
        <Box>Intro video? Tutorial?</Box>
      </Grid>
    </Box>
  )
}

export default Home
