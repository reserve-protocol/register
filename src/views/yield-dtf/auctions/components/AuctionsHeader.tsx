import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import TabMenu from 'components/tab-menu'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { isModuleLegacyAtom, rTokenContractsAtom } from 'state/atoms'
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
    <div className="flex items-center mt-3 md:mt-0">
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

      <Button className="ml-auto mr-4" size="sm" onClick={toggleSidebar}>
        <span className="hidden sm:block">
          <Trans>Check for auctions</Trans>
        </span>
        <div className="flex sm:hidden items-center py-1">
          <AuctionsIcon />
        </div>
      </Button>
    </div>
  )
}

export default AuctionsHeader
