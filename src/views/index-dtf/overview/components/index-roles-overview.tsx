import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'

const IndexRolesOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center gap-1 ml-2 sm:ml-4 my-2 text-sm">
      {brandData?.creator?.icon ? (
        <TokenLogo src={brandData.creator.icon} size="lg" />
      ) : (
        <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
          <ScrollText size={16} />
        </div>
      )}

      <span className="text-legend ml-1">Creator:</span>
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
            className="p-1 bg-muted rounded-full ml-1"
          >
            <ArrowUpRight size={12} />
          </Link>
        </div>
      ) : (
        <Skeleton className="w-30 h-5" />
      )}
    </div>
  )
}

export default IndexRolesOverview
