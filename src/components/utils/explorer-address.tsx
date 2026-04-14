import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEnsName } from '@/hooks/use-ens-name'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

type ExplorerAddressProps = {
  address: string
  chain: number
  type?: ExplorerDataType
  className?: string
  ens?: boolean
}

const ExplorerAddress = ({
  address,
  chain,
  type = ExplorerDataType.ADDRESS,
  className,
  ens,
}: ExplorerAddressProps) => {
  const ensName = useEnsName(ens ? address : undefined)
  const displayName = ens ? ensName : shortenAddress(address)

  const handleAddress = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    window.open(getExplorerLink(address, chain, type), '_blank')
  }
  return (
    <div
      role="button"
      onClick={handleAddress}
      className={cn(
        'flex items-center gap-1 hover:text-primary cursor-pointer',
        className
      )}
    >
      {displayName}
      <div className="flex items-center">
        <ArrowUpRight size={14} />
      </div>
    </div>
  )
}

export default ExplorerAddress
