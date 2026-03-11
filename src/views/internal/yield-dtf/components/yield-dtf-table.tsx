import { useAtomValue } from 'jotai'
import { isLoadingAtom, listedYieldDTFsAtom, ListedYieldDTF } from '../atoms'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ChainId } from '@/utils/chains'
import Copy from '@/components/ui/copy'
import TokenLogo from '@/components/token-logo'
import ChainLogo from '@/components/icons/ChainLogo'

const getChainName = (chainId: number) => {
  switch (chainId) {
    case ChainId.Mainnet:
      return 'Ethereum'
    case ChainId.Base:
      return 'Base'
    case ChainId.Arbitrum:
      return 'Arbitrum'
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
    case ChainId.Arbitrum:
      return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
  }
}

const DTFTableRow = ({ dtf }: { dtf: ListedYieldDTF }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <TokenLogo
              src={dtf.logo ? `/svgs/${dtf.logo.toLowerCase()}` : undefined}
              size="xl"
            />
            <ChainLogo
              chain={dtf.chainId}
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div className="space-y-1">
            <div className="font-medium">{dtf.name}</div>
            <div className="text-sm text-muted-foreground">{dtf.symbol}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChainColor(dtf.chainId)}`}
        >
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
    </TableRow>
  )
}

const DTFTableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-28" />
        </TableCell>
      </TableRow>
    ))}
  </>
)

const TableHeaders = () => (
  <TableHeader>
    <TableRow>
      <TableHead>Name / Symbol</TableHead>
      <TableHead>Chain</TableHead>
      <TableHead>Address</TableHead>
    </TableRow>
  </TableHeader>
)

const YieldDTFTable = () => {
  const dtfList = useAtomValue(listedYieldDTFsAtom)
  const isLoading = useAtomValue(isLoadingAtom)

  if (isLoading && dtfList.length === 0) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeaders />
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
          <p className="text-muted-foreground">No listed Yield DTFs found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeaders />
        <TableBody>
          {dtfList.map((dtf) => (
            <DTFTableRow key={`${dtf.chainId}-${dtf.id}`} dtf={dtf} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default YieldDTFTable
