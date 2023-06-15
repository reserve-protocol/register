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
        <Box
          px={4}
          pb={7}
          mt={2}
          mb={6}
          variant="layout.verticalAlign"
          sx={{ borderBottom: '1px dashed', borderBottomColor: 'border' }}
        >
          <Box>
            <Text variant="pageTitle">
              {rToken?.symbol || ''} related Auctions
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
        <Divider my={6} />
        <About />
        {sidebar && <AuctionsSidebar onClose={() => setSidebar(false)} />}
      </Container>
    </>
  )
}

export default Auctions
