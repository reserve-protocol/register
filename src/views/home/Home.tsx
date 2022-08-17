import { Trans } from '@lingui/macro'
import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom, walletAtom } from 'state/atoms'
import { Divider, Text, Box, Grid } from 'theme-ui'
import GeneralOverview from './components/GeneralOverview'
import Portfolio from './components/Portfolio'
import TokenList from './components/TokenList'

const Home = () => {
  const account = useAtomValue(walletAtom)
  const selectedToken = useAtomValue(selectedRTokenAtom)

  return (
    <Container mx={selectedToken ? 0 : [0, 3]}>
      {!!account && <Portfolio />}
      <GeneralOverview />
      <Divider my={5} mx={-5} sx={{ borderColor: 'darkBorder' }} />
      <TokenList />
      <Divider my={5} mx={-5} sx={{ borderColor: 'darkBorder' }} />
      <Grid columns={2} gap={3}>
        <Box mb={5}>
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
    </Container>
  )
}

export default Home
