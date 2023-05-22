import { Trans } from '@lingui/macro'
import { Container } from 'components'
import { SmallButton } from 'components/button'
import useRToken from 'hooks/useRToken'
import { useAtom } from 'jotai'
import { Box, Divider, Text } from 'theme-ui'
import { auctionSidebarAtom } from './atoms'
import AuctionsSidebar from './auctions-sidebar'
import About from './components/About'
import FinalizedAuctions from './components/FinalizedAuctions'
import OngoingAuctions from './components/OngoingAuctions'
import TradesUpdater from './components/TradesUpdater'

const Auctions = () => {
  const rToken = useRToken()
  const [sidebar, setSidebar] = useAtom(auctionSidebarAtom)

  return (
    <>
      <TradesUpdater />
      <Container>
        <Box variant="layout.verticalAlign">
          <Box mb={4} ml={3}>
            <Text variant="strong" sx={{ fontSize: 3 }}>
              {rToken?.symbol || ''} related Auctions
            </Text>
            <Text variant="legend" mt="1">
              <Trans>Ongoing & historical auctions.</Trans>
            </Text>
          </Box>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => setSidebar(true)}
          >
            <Trans>Check for auctions</Trans>
          </SmallButton>
        </Box>
        <OngoingAuctions mb={6} />
        <FinalizedAuctions />
        <Divider mx={-5} my={6} />
        <About />
        {sidebar && <AuctionsSidebar onClose={() => setSidebar(false)} />}
      </Container>
    </>
  )
}

export default Auctions
