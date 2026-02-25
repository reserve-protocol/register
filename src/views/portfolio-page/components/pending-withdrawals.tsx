import TokenLogo from '@/components/token-logo'
import ChainLogo from '@/components/icons/ChainLogo'
import DataTable from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import dtfIndexUnstakingManager from '@/abis/dtf-index-unstaking-manager'
import StRSR from '@/abis/StRSR'
import useCurrentTime from '@/hooks/useCurrentTime'
import {
  formatToSignificantDigits,
  formatUSD,
  parseDurationShort,
} from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Clock } from 'lucide-react'
import { Address } from 'viem'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { PortfolioStakedRSR, PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

type PendingWithdrawalRow =
  | {
      source: 'stakedRSR'
      endId: number
      amount: string
      availableAt: number
      delay: number
      value: number
      chainId: number
      stRSRAddress: Address
      tokenSymbol: string
    }
  | {
      source: 'voteLock'
      lockId: string
      amount: string
      unlockTime: number
      delay: number
      value: number
      chainId: number
      stTokenAddress: Address
      tokenSymbol: string
      underlyingSymbol: string
      underlyingAddress: Address
    }

const StakedRSRWithdrawButton = ({
  stRSRAddress,
  endId,
  chainId,
  availableAt,
}: {
  stRSRAddress: Address
  endId: number
  chainId: number
  availableAt: number
}) => {
  const { address: account } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash, chainId })
  const currentTime = useCurrentTime()
  const isReady = availableAt <= currentTime
  const loading = !receipt && (isPending || !!hash)

  return (
    <TransactionButtonContainer
      chain={chainId}
      size="sm"
      switchChainButtonClassName="rounded-full"
      connectButtonClassName="rounded-full"
    >
      <Button
        onClick={(e) => {
          e.stopPropagation()
          if (!account) return
          writeContract({
            abi: StRSR,
            functionName: 'withdraw',
            address: stRSRAddress,
            args: [account, BigInt(endId)],
            chainId,
          })
        }}
        disabled={!isReady || receipt?.status === 'success' || loading}
        variant="outline"
        className="rounded-full text-sm hover:text-primary text-primary disabled:border-border border-primary"
        size="sm"
      >
        {loading
          ? hash
            ? 'Confirming tx...'
            : 'Pending, sign in wallet'
          : receipt?.status === 'success'
            ? 'Withdrawn'
            : 'Withdraw'}
      </Button>
    </TransactionButtonContainer>
  )
}

const VoteLockWithdrawButton = ({
  stTokenAddress,
  lockId,
  chainId,
  unlockTime,
}: {
  stTokenAddress: Address
  lockId: string
  chainId: number
  unlockTime: number
}) => {
  const { data: unstakingManagerAddress } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingManager',
    address: stTokenAddress,
    chainId,
  })
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash, chainId })
  const currentTime = useCurrentTime()
  const isReady = unlockTime <= currentTime
  const loading = !receipt && (isPending || !!hash)

  return (
    <TransactionButtonContainer
      chain={chainId}
      size="sm"
      switchChainButtonClassName="rounded-full"
      connectButtonClassName="rounded-full"
    >
      <Button
        onClick={(e) => {
          e.stopPropagation()
          if (!unstakingManagerAddress) return
          writeContract({
            abi: dtfIndexUnstakingManager,
            functionName: 'claimLock',
            address: unstakingManagerAddress,
            args: [BigInt(lockId)],
            chainId,
          })
        }}
        disabled={!isReady || receipt?.status === 'success' || loading}
        variant="outline"
        className="rounded-full text-sm hover:text-primary text-primary disabled:border-border border-primary"
        size="sm"
      >
        {loading
          ? hash
            ? 'Confirming tx...'
            : 'Pending, sign in wallet'
          : receipt?.status === 'success'
            ? 'Withdrawn'
            : 'Withdraw'}
      </Button>
    </TransactionButtonContainer>
  )
}

const ProgressCell = ({ row }: { row: PendingWithdrawalRow }) => {
  const currentTime = useCurrentTime()
  const deadline = row.source === 'stakedRSR' ? row.availableAt : row.unlockTime
  const isReady = deadline <= currentTime

  if (isReady) {
    return (
      <span className="rounded-full bg-success/10 border border-success px-2 py-0.5 text-xs font-medium text-success">
        Ready
      </span>
    )
  }

  const elapsed = row.delay - (deadline - currentTime)
  const progress = Math.min(100, Math.max(0, (elapsed / row.delay) * 100))
  const timeLeft = deadline - currentTime
  const timeLeftStr = parseDurationShort(timeLeft)
    .replaceAll(' ', '')
    .replaceAll(',', ' ')

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={progress} className="h-1.5 flex-1" />
      <span className="text-xs text-legend whitespace-nowrap">{timeLeftStr}</span>
    </div>
  )
}

const ActionCell = ({ row }: { row: PendingWithdrawalRow }) => {
  if (row.source === 'stakedRSR') {
    return (
      <StakedRSRWithdrawButton
        stRSRAddress={row.stRSRAddress}
        endId={row.endId}
        chainId={row.chainId}
        availableAt={row.availableAt}
      />
    )
  }
  return (
    <VoteLockWithdrawButton
      stTokenAddress={row.stTokenAddress}
      lockId={row.lockId}
      chainId={row.chainId}
      unlockTime={row.unlockTime}
    />
  )
}

const columns: ColumnDef<PendingWithdrawalRow, any>[] = [
  {
    id: 'token',
    header: 'Token',
    cell: ({ row }) => {
      const d = row.original
      if (d.source === 'stakedRSR') {
        return (
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <TokenLogo symbol="RSR" size="lg" />
              <ChainLogo
                chain={d.chainId}
                className="absolute -bottom-0.5 -right-0.5"
                width={12}
                height={12}
              />
            </div>
            <span className="text-sm font-bold">RSR</span>
          </div>
        )
      }
      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <TokenLogo
              symbol={d.underlyingSymbol}
              address={d.underlyingAddress}
              chain={d.chainId}
              size="lg"
            />
            <ChainLogo
              chain={d.chainId}
              className="absolute -bottom-0.5 -right-0.5"
              width={12}
              height={12}
            />
          </div>
          <span className="text-sm font-bold">{d.underlyingSymbol}</span>
        </div>
      )
    },
  },
  {
    id: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const d = row.original
      return (
        <span className="text-sm text-legend">
          {d.source === 'stakedRSR' ? d.tokenSymbol : d.tokenSymbol}
        </span>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      const val = Number(row.original.amount)
      return (
        <span className="text-sm">
          {!isNaN(val) ? formatToSignificantDigits(val) : '—'}
        </span>
      )
    },
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => {
      const val = row.original.value
      return (
        <span className="text-sm font-bold">
          {val != null && !isNaN(val) ? formatUSD(val) : '—'}
        </span>
      )
    },
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => <ProgressCell row={row.original} />,
  },
  {
    id: 'action',
    header: () => <span className="flex justify-end">Action</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ActionCell row={row.original} />
      </div>
    ),
  },
]

const flattenPendingWithdrawals = (
  stakedRSR: PortfolioStakedRSR[],
  voteLocks: PortfolioVoteLock[]
): PendingWithdrawalRow[] => {
  const rows: PendingWithdrawalRow[] = []

  for (const position of stakedRSR) {
    for (const w of position.pendingWithdraws || []) {
      rows.push({
        source: 'stakedRSR',
        endId: w.endId,
        amount: w.amount,
        availableAt: w.availableAt,
        delay: w.delay,
        value: w.value,
        chainId: position.chainId,
        stRSRAddress: position.stRSRAddress,
        tokenSymbol: `${position.symbol.toLowerCase()}RSR`,
      })
    }
  }

  for (const position of voteLocks) {
    for (const lock of position.locks || []) {
      rows.push({
        source: 'voteLock',
        lockId: lock.lockId,
        amount: lock.amount,
        unlockTime: lock.unlockTime,
        delay: lock.delay,
        value: lock.value,
        chainId: position.chainId,
        stTokenAddress: position.stTokenAddress,
        tokenSymbol: position.symbol,
        underlyingSymbol: position.underlying.symbol,
        underlyingAddress: position.underlying.address,
      })
    }
  }

  return rows.sort((a, b) => (b.value || 0) - (a.value || 0))
}

const PendingWithdrawals = ({
  stakedRSR,
  voteLocks,
}: {
  stakedRSR: PortfolioStakedRSR[]
  voteLocks: PortfolioVoteLock[]
}) => {
  const rows = flattenPendingWithdrawals(stakedRSR, voteLocks)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(rows)

  if (!rows.length) return null

  return (
    <div>
      <SectionHeader
        icon={Clock}
        title="Pending Withdrawals"
        subtitle="Unstaking and unlock cooldown periods."
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          initialSorting={[{ id: 'value', desc: true }]}
        />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default PendingWithdrawals
