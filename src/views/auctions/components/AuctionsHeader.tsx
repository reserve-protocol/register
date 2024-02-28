import { Trans } from '@lingui/macro'
import { Button } from 'components'
import TabMenu from 'components/tab-menu'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { isModuleLegacyAtom, rTokenContractsAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { TradeKind, auctionPlatformAtom, auctionSidebarAtom } from '../atoms'
import AuctionsIcon from 'components/icons/AuctionsIcon'

const platformOptions = [
  { label: 'Batch auctions', key: TradeKind.BatchTrade },
  { label: 'Dutch auctions', key: TradeKind.DutchTrade },
]

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
    <Box variant="layout.verticalAlign" mt={[3, 0]}>
      {!isLegacy && (
        <TabMenu
          active={platform}
          items={platformOptions}
          background="border"
          onMenuChange={(kind: string) =>
            setPlatform(Number(kind) as TradeKind)
          }
        />
      )}

      <Button ml="auto" mr={3} small onClick={toggleSidebar}>
        <Text sx={{ display: ['none', 'block'] }}>
          <Trans>Check for auctions</Trans>
        </Text>
        <Box
          py={1}
          variant="layout.verticalAlign"
          sx={{ display: ['flex', 'none'] }}
        >
          <AuctionsIcon />
        </Box>
      </Button>
    </Box>
  )
}

export default AuctionsHeader
