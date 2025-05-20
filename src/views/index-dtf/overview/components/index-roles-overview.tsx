import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, MousePointerClick, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'

const BrandCurator = ({
  icon,
  name,
  link,
}: {
  icon?: string
  name: string
  link?: string
}) => (
  <div className="flex items-center gap-2 p-2 pl-4">
    <TokenLogo src={icon || undefined} size="xl" />
    <div>
      <span className="text-legend text-xs md:text-sm">Curator:</span>
      <Link
        to={link ?? ''}
        target="_blank"
        className={cn(
          'flex items-center gap-1',
          !link && 'cursor-default pointer-events-none'
        )}
      >
        <span className="font-bold">{name}</span>
        <div className="rounded-full p-1 bg-muted">
          <ArrowUpRight size={12} />
        </div>
      </Link>
    </div>
  </div>
)

const Creator = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center sm:border-r gap-2 sm:p-2">
      {brandData?.creator?.icon ? (
        <TokenLogo src={brandData.creator.icon} size="xl" />
      ) : (
        <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
          <ScrollText size={16} />
        </div>
      )}

      <div>
        <span className="text-legend text-xs md:text-sm">Creator:</span>
        {dtf?.deployer ? (
          <div className="flex items-center gap-1">
            <span className="font-bold">
              {brandData?.creator?.name || shortenAddress(dtf.deployer)}
            </span>
            <Link
              to={
                brandData?.creator?.link ||
                getExplorerLink(dtf.deployer, chainId, ExplorerDataType.ADDRESS)
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
  )
}

const AuctionLaunchers = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center gap-2 p-2 pl-4">
      <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
        <MousePointerClick size={16} />
      </div>
      <div>
        <span className="text-legend text-xs md:text-sm">
          Auction Launcher:
        </span>
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
  )
}

const IndexRolesOverview = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)

  return (
    <div className="grid grid-cols-2 border-t px-2 sm:pt-2 text-sm md:text-base">
      <Creator />
      {brandData?.curator?.name ? (
        <BrandCurator
          icon={brandData.curator.icon}
          name={brandData.curator.name}
          link={brandData.curator.link}
        />
      ) : (
        <AuctionLaunchers />
      )}
    </div>
  )
}

export default IndexRolesOverview
