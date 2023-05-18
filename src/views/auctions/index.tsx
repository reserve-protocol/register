import { Trans } from '@lingui/macro'
import { Container } from 'components'
import { SmallButton } from 'components/button'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { Box, Divider, Text } from 'theme-ui'
import { auctionsToSettleAtom } from './atoms'
import AuctionsSidebar from './auctions-sidebar'
import About from './components/About'
import FinalizedAuctions from './components/FinalizedAuctions'
import OngoingAuctions from './components/OngoingAuctions'
import TradesUpdater from './components/TradesUpdater'

const settleableAuctionsAtom = atom(
  (get) => (get(auctionsToSettleAtom) || []).length
)

const Auctions = () => {
  const rToken = useRToken()
  const [sidebar, setSidebar] = useState(false)
  const toSettle = useAtomValue(settleableAuctionsAtom)

  return (
    <>
      <TradesUpdater />
      <Container>
        <Box variant="layout.verticalAlign">
          <Box mb={4}>
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
