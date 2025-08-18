import { useAtomValue } from 'jotai'
import { filteredDtfListAtom, isLoadingAtom, marketCapsAtom } from '../atoms'
import { formatCurrency } from '@/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { ChainId } from '@/utils/chains'
import { InternalDTF } from '../hooks/use-internal-dtf-list'
import { ExternalLink } from 'lucide-react'
import Copy from '@/components/ui/copy'

const getChainName = (chainId: number) => {
  switch (chainId) {
    case ChainId.Mainnet:
      return 'Ethereum'
    case ChainId.Base:
      return 'Base'
    case ChainId.BSC:
      return 'BSC'
    default:
      return 'Unknown'
  }
}

const getChainColor = (chainId: number) => {
  switch (chainId) {
    case ChainId.Mainnet:
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
    case ChainId.Base:
      return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
    case ChainId.BSC:
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
  }
}

const getChainPath = (chainId: number) => {
  switch (chainId) {
    case ChainId.Mainnet:
      return 'ethereum'
    case ChainId.Base:
      return 'base'
    case ChainId.BSC:
      return 'bsc'
    default:
      return 'ethereum'
  }
}

const formatGovernanceSpeed = (dtf: InternalDTF) => {
  const governance = dtf.ownerGovernance || dtf.tradingGovernance || dtf.stToken?.governance
  
  if (!governance) {
    return 'No governance'
  }
  
  const votingDelay = governance.votingDelay
  const votingPeriod = governance.votingPeriod
  
  // Convert from seconds to hours
  const delayHours = Math.round(votingDelay / 3600)
  const periodHours = Math.round(votingPeriod / 3600)
  
  return `${delayHours}h / ${periodHours}h`
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const DTFTableRow = ({ dtf }: { dtf: InternalDTF }) => {
  const chainPath = getChainPath(dtf.chainId)
  const dtfPath = `/${chainPath}/index-dtf/${dtf.id}`
  const marketCaps = useAtomValue(marketCapsAtom)
  
  // Get market cap for this DTF
  const marketCapKey = `${dtf.chainId}-${dtf.id.toLowerCase()}`
  const marketCap = marketCaps[marketCapKey]
  
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{dtf.token.name}</div>
          <div className="text-sm text-muted-foreground">{dtf.token.symbol}</div>
        </div>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChainColor(dtf.chainId)}`}>
          {getChainName(dtf.chainId)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {dtf.id.slice(0, 6)}...{dtf.id.slice(-4)}
          </span>
          <Copy 
            value={dtf.id} 
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          />
        </div>
      </TableCell>
      <TableCell className="text-right">
        {marketCap ? formatCurrency(marketCap, 0) : '-'}
      </TableCell>
      <TableCell>{formatGovernanceSpeed(dtf)}</TableCell>
      <TableCell>{formatTimestamp(dtf.timestamp)}</TableCell>
      <TableCell>
        <Link 
          to={dtfPath}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          View
          <ExternalLink className="h-3 w-3" />
        </Link>
      </TableCell>
    </TableRow>
  )
}

const DTFTableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-24 ml-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-12" />
        </TableCell>
      </TableRow>
    ))}
  </>
)

const DTFTable = () => {
  const dtfList = useAtomValue(filteredDtfListAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  
  if (isLoading && dtfList.length === 0) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name / Symbol</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead>Gov Speed</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <DTFTableSkeleton />
          </TableBody>
        </Table>
      </div>
    )
  }
  
  if (dtfList.length === 0) {
    return (
      <div className="rounded-lg border p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No DTFs found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or check back later
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name / Symbol</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead>Gov Speed</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dtfList.map((dtf) => (
            <DTFTableRow key={`${dtf.chainId}-${dtf.id}`} dtf={dtf} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DTFTable