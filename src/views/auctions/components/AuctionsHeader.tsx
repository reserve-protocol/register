import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { isModuleLegacyAtom, rTokenContractsAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { ToggleButton } from '../../../components/ToggleButton'
import { TradeKind, auctionPlatformAtom, auctionSidebarAtom } from '../atoms'

const AuctionsHeader = () => {
  const toggleSidebar = useSetAtom(auctionSidebarAtom)
  const contracts = useAtomValue(rTokenContractsAtom)
  const [platform, setPlatform] = useAtom(auctionPlatformAtom)
  const { auctions: isLegacy } = useAtomValue(isModuleLegacyAtom)

  // Make sure platform = batch auctions for legacy tokens
  useEffect(() => {
    if (contracts && platform === TradeKind.DutchTrade && isLegacy) {
      setPlatform(TradeKind.BatchTrade)
    }
  }, [platform, isLegacy, contracts])

  return (
    <Box variant="layout.verticalAlign">
      {!isLegacy && (
        <>
          <ToggleButton
            selected={TradeKind.BatchTrade === platform}
            onClick={() => setPlatform(TradeKind.BatchTrade)}
            mx={3}
          >
            <Trans>Batch auctions</Trans>
          </ToggleButton>
          <ToggleButton
            selected={TradeKind.DutchTrade === platform}
            variant="bordered"
            onClick={() => setPlatform(TradeKind.DutchTrade)}
          >
            <Trans>Dutch auctions</Trans>
          </ToggleButton>
        </>
      )}

      <Button ml="auto" mr={3} small onClick={toggleSidebar}>
        <Text>
          <Trans>Check for auctions</Trans>
        </Text>
      </Button>
    </Box>
  )
}

export default AuctionsHeader
