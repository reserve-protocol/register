import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'

const IndexCreatorOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  const creator = brandData?.creator?.name
  const icon = brandData?.creator?.icon ? (
    <TokenLogo src={brandData.creator.icon} size="sm" />
  ) : (
    <Crown size={16} />
  )
  const link =
    brandData?.creator?.link ||
    getExplorerLink(dtf?.deployer || '', chainId, ExplorerDataType.ADDRESS)

  if (!creator) {
    return null
  }

  return (
    <Link
      to={link}
      target="_blank"
      className="flex items-center gap-2 px-2.5 py-1.5 text-sm border border-white/20 rounded-full"
    >
      {icon}
      <span>Created by:</span>
      <div className="flex items-center gap-1 text-white/60">
        <span>{creator}</span>
        <ArrowUpRight size={16} />
      </div>
    </Link>
  )
}

export default IndexCreatorOverview
