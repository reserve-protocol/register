import { useAtomValue } from 'jotai'
import { isLoadingAtom, listedDTFsAtom, ListedDTFGovernance } from '../atoms'
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
import { Address } from 'viem'
import TokenLogo from '@/components/token-logo'
import ChainLogo from '@/components/icons/ChainLogo'

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

const AddressCell = ({ address }: { address?: Address }) => {
  if (!address) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <Copy
        value={address}
        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      />
    </div>
  )
}

const DTFTableRow = ({ dtf }: { dtf: ListedDTFGovernance }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <TokenLogo src={dtf.icon} size="xl" />
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
        <AddressCell address={dtf.id} />
      </TableCell>
      <TableCell>
        <AddressCell address={dtf.tradingGovernance} />
      </TableCell>
      <TableCell>
        <AddressCell address={dtf.tradingTimelock} />
      </TableCell>
      <TableCell>
        <AddressCell address={dtf.ownerGovernance} />
      </TableCell>
      <TableCell>
        <AddressCell address={dtf.ownerTimelock} />
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
        <TableCell>
          <Skeleton className="h-4 w-28" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-28" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-28" />
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
      <TableHead>Trading Gov</TableHead>
      <TableHead>Trading Timelock</TableHead>
      <TableHead>Admin Gov</TableHead>
      <TableHead>Admin Timelock</TableHead>
    </TableRow>
  </TableHeader>
)

const ListedDTFTable = () => {
  const dtfList = useAtomValue(listedDTFsAtom)
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
          <p className="text-muted-foreground">No listed DTFs found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later or verify the API is accessible
          </p>
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

export default ListedDTFTable
