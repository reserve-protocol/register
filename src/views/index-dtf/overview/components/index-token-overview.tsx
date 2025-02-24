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
import {
  ArrowUpRight,
  ImagePlus,
  MousePointerClick,
  ScrollText,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ZapMint from './zap-mint'
import { currentZapMintTabAtom } from './zap-mint/atom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'

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
    <div className="flex items-center gap-2 ">
      <ChainLogo chain={chainId} />
      <span>{shortenAddress(address)}</span>
      <div className="p-1 bg-muted rounded-full">
        <CopyValue value={address} />
      </div>
      <Link
        to={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
        target="_blank"
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

const RolesOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="grid grid-cols-2 border-t px-2 sm:pt-2">
      <div className="flex items-center border-r gap-2 sm:p-2">
        {brandData?.creator?.icon ? (
          <TokenLogo src={brandData.creator.icon} size="xl" />
        ) : (
          <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
            <ScrollText size={16} />
          </div>
        )}

        <div>
          <span className="text-legend text-sm">Creator:</span>
          {dtf?.deployer ? (
            <div className="flex items-center gap-1">
              <span className="font-bold">
                {brandData?.creator?.name || shortenAddress(dtf.deployer)}
              </span>
              <Link
                to={
                  brandData?.creator?.link ||
                  getExplorerLink(
                    dtf.deployer,
                    chainId,
                    ExplorerDataType.ADDRESS
                  )
                }
                target="_blank"
                className="p-1 bg-muted rounded-full"
              >
                <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <Skeleton className="w-30 h-5" />
          )}
        </div>
      </div>
      {brandData?.curator?.name ? (
        <div className="flex items-center gap-2 p-2 pl-4">
          <TokenLogo src={brandData.curator.icon || undefined} size="xl" />

          <div>
            <span className="text-legend text-sm">Curator:</span>
            <Link
              to={brandData.curator.link}
              target="_blank"
              className="flex items-center gap-1"
            >
              <span className="font-bold">{brandData.curator.name}</span>
              <div className="rounded-full p-1 bg-muted">
                <ArrowUpRight size={12} />
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 pl-4">
          <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
            <MousePointerClick size={16} />
          </div>
          <div>
            <span className="text-legend text-sm">Auction Launcher:</span>
            {dtf?.auctionLaunchers.length ? (
              <div className="flex items-center gap-1">
                <span className="font-bold">
                  {shortenAddress(dtf?.auctionLaunchers[0])}
                </span>
                <Link
                  to={getExplorerLink(
                    dtf.auctionLaunchers[0],
                    chainId,
                    ExplorerDataType.ADDRESS
                  )}
                  target="_blank"
                  className="p-1 bg-muted rounded-full"
                >
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            ) : (
              <Skeleton className="w-30 h-5" />
            )}
          </div>
        </div>
      )}
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
      <div className="p-2 sm:px-4 sm:pb-4 pt-0 relative max-w-96 sm:max-w-[620px] break-words">
        {!dtf ? (
          <TokenNameSkeleton />
        ) : (
          <>
            <h4>${dtf.token.symbol}</h4>
            <h1 className="mt-1 text-2xl md:text-3xl  font-medium w-full break-words">
              {dtf.token.name}
            </h1>
          </>
        )}
      </div>
      <ZapBuySellButtons />

      <RolesOverview />
    </Card>
  )
}

export default IndexTokenOverview
