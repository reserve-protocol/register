import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage } from '@/utils'
import { createColumnHelper } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { ArrowRight, Lock, LockOpen } from 'lucide-react'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import { voteLockPositionsAtom } from '../atoms'
import { VoteLockPosition } from '../hooks/use-vote-lock-positions'
import ChainLogo from '@/components/icons/ChainLogo'

const TableFilters = () => {
  return <div className="flex items-center gap-2">Filters</div>
}

const VoteLockAmount = ({
  address,
  chain,
  price,
  decimals,
}: {
  address: Address
  chain: number
  price: number
  decimals: number
}) => {
  const { data } = useBalance({
    address,
    chainId: chain,
    token: address,
  })

  const hasBalance = data && data?.value > 0n
  const amount = formatUnits(data?.value ?? 0n, decimals)
  const usdAmount = Number(amount) * price

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        hasBalance ? 'text-success' : 'text-legend'
      )}
    >
      {hasBalance ? <Lock size={20} /> : <LockOpen size={20} />}
      {hasBalance && (
        <div className="flex flex-col">
          <span className="text-primary">
            {formatCurrency(Number(amount), 2)}
          </span>
          <span className="text-sm text-legend">
            ${formatCurrency(usdAmount, 2)}
          </span>
        </div>
      )}
    </div>
  )
}

const useColumns = () => {
  const columnHelper = createColumnHelper<VoteLockPosition>()
  return useMemo(() => {
    return [
      columnHelper.accessor('underlying.token.symbol', {
        header: 'Gov. Token',
        cell: (data) => (
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <TokenLogo
                symbol={data.getValue()}
                address={data.row.original.underlying.token.address}
                chain={data.row.original.chainId}
                size="xl"
              />
              <ChainLogo
                chain={data.row.original.chainId}
                className="absolute -bottom-1 -right-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className=" font-semibold">{data.getValue()}</span>
              <div className="flex items-center gap-1 text-sm text-legend">
                <ArrowRight size={14} />
                {data.row.original.token.symbol}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('lockedAmountUsd', {
        header: 'Vote locked',
        cell: (data) => (
          <VoteLockAmount
            address={data.row.original.token.address as Address}
            chain={data.row.original.chainId}
            price={data.row.original.token.price}
            decimals={data.row.original.token.decimals}
          />
        ),
      }),
      columnHelper.accessor('underlying.token.symbol', {
        header: 'Governs',
        cell: (data) => (
          <span className="text-legend">
            {data.row.original.dtfs.map((dtf) => dtf.symbol).join(', ')}
          </span>
        ),
      }),
      columnHelper.accessor('apr', {
        header: 'Avg. 30d%',
        cell: (data) => {
          return (
            <div className="text-primary font-semibold">
              {formatPercentage(data.getValue())} APR
            </div>
          )
        },
      }),
      columnHelper.accessor('token.symbol', {
        header: 'Rewards',
        cell: (data) => (
          <span className="min-w-[80px] inline-block text-sm">Manage</span>
        ),
      }),
    ]
  }, [])
}

const TableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={index} className="border-none">
          <TableCell>
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex -space-x-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-background"
                  />
                ))}
              </div>
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 min-w-[100px]">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

const VoteLockPositions = () => {
  const data = useAtomValue(voteLockPositionsAtom)
  const columns = useColumns()

  return (
    <div className="bg-card rounded-3xl border-2 border-secondary p-2">
      <DataTable
        columns={columns as any}
        data={data || []}
        initialSorting={[{ id: 'apr', desc: true }]}
      />
    </div>
  )
}

export default VoteLockPositions
