import ChainLogo from '@/components/icons/ChainLogo'
import CopyValue from '@/components/old/button/CopyValue'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRight, ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import IndexRolesOverview from './index-roles-overview'
import { UniswapButton } from './landing-mint'
import ZapMint from './zap-mint'
import { currentZapMintTabAtom } from './zap-mint/atom'

const TokenNameSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-24 h-5" />
    <Skeleton className="h-12 w-52 max-w-full" />
  </div>
)

const TokenAddresses = () => {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(iTokenAddressAtom)

  if (!address) {
    return null
  }

  return (
    <div className="flex items-center gap-1.5 ">
      <ChainLogo chain={chainId} />
      <span>{shortenAddress(address)}</span>
      <div className="p-1 bg-muted dark:bg-white/5 rounded-full ">
        <CopyValue value={address} />
      </div>
      <Link
        to={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
        target="_blank"
        className="p-1 bg-muted dark:bg-white/5 rounded-full"
      >
        <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}

const ZapBuySellButtons = () => {
  const setZapMintTab = useSetAtom(currentZapMintTabAtom)
  return (
    <div className="block xl:hidden w-full mb-3 mt-2">
      <ZapMint>
        <div
          className="flex gap-2"
          onClick={(e) => {
            if (!(e.target instanceof HTMLButtonElement)) {
              e.preventDefault()
            }
          }}
        >
          <Button
            className="rounded-xl h-12 w-full"
            onClick={() => setZapMintTab('buy')}
          >
            Buy
          </Button>
          <Button
            className="rounded-xl h-12 w-full"
            variant="outline"
            onClick={() => setZapMintTab('sell')}
          >
            Sell
          </Button>
        </div>
      </ZapMint>
    </div>
  )
}

const IndexTokenOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const isBrandManager = useAtomValue(isBrandManagerAtom)

  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  return (
    <Card className="p-2">
      <div className="flex items-center flex-wrap p-2 sm:p-4">
        <div className="flex items-center mr-auto">
          {!brand ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <TokenLogo
              src={brand?.dtf?.icon || undefined}
              alt={dtf?.token.symbol ?? 'dtf token logo'}
              size="xl"
            />
          )}
          {isBrandManager && (
            <Link to="../manage" onClick={() => trackClick('brand_manager')}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 rounded-full ml-3"
              >
                <ImagePlus size={14} />
                Edit page
              </Button>
            </Link>
          )}
        </div>
        <TokenAddresses />
      </div>
      <div className="p-2 pb-4 sm:px-4 pt-2 relative max-w-96 sm:max-w-[620px] break-words">
        {!dtf ? (
          <TokenNameSkeleton />
        ) : (
          <>
            <h4>${dtf.token.symbol}</h4>
            <h1 className="mt-1 text-2xl md:text-3xl font-medium w-full break-words">
              {dtf.token.name}
            </h1>
          </>
        )}
      </div>
      {dtf?.id?.toLowerCase() ===
      '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267' ? (
        <div className="block xl:hidden w-full">
          <UniswapButton />
        </div>
      ) : (
        <ZapBuySellButtons />
      )}

      <IndexRolesOverview />
    </Card>
  )
}

export default IndexTokenOverview
