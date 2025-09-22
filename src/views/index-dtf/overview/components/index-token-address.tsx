import ChainLogo from '@/components/icons/ChainLogo'
import Copy from '@/components/ui/copy'
import { chainIdAtom } from '@/state/atoms'
import { iTokenAddressAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const IndexTokenAddress = () => {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(iTokenAddressAtom)

  if (!address) {
    return null
  }

  return (
    <div className="text-sm sm:text-base flex items-center gap-1.5">
      <ChainLogo chain={chainId} />
      <span>{shortenAddress(address)}</span>
      <div className="flex items-center justify-center bg-muted dark:bg-white/5 rounded-full w-5 h-5 sm:w-6 sm:h-6">
        <Copy value={address} />
      </div>
      <Link
        to={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
        target="_blank"
        className="p-1 bg-muted dark:bg-white/5 rounded-full"
      >
        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Link>
    </div>
  )
}

export default IndexTokenAddress
