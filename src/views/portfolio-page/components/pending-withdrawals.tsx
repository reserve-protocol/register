import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import DataTable from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import dtfIndexUnstakingManager from '@/abis/dtf-index-unstaking-manager'
import StRSR from '@/abis/StRSR'
import useCurrentTime from '@/hooks/useCurrentTime'
import { walletAtom, walletChainAtom } from '@/state/atoms'
import {
  formatToSignificantDigits,
  formatUSD,
  getTokenRoute,
  parseDurationShort,
} from '@/utils'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue, useSetAtom } from 'jotai'
import { Clock } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Address } from 'viem'
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  openStakingSidebarAtom,
  PendingWithdrawalRow,
  portfolioPendingWithdrawalsAtom,
} from '../atoms'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

const WithdrawButton = ({
  chainId,
  isReady,
  getWriteConfig,
}: {
  chainId: number
  isReady: boolean
  getWriteConfig: () => Parameters<ReturnType<typeof useWriteContract>['writeContract']>[0] | null
}) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const { openConnectModal } = useConnectModal()
  const { switchChainAsync } = useSwitchChain()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash, chainId })
  const loading = !receipt && (isPending || !!hash)
  const withdrawn = receipt?.status === 'success'
  const toastedRef = useRef(false)

  useEffect(() => {
    if (withdrawn && !toastedRef.current) {
      toastedRef.current = true
      toast.success('Withdrawal successful', { duration: 8000 })
    }
  }, [withdrawn])

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!wallet) {
        openConnectModal?.()
        return
      }
      if (walletChain !== chainId) {
        await switchChainAsync?.({ chainId })
      }
      const config = getWriteConfig()
      if (!config) return
      writeContract(config)
    },
    [wallet, walletChain, chainId, openConnectModal, switchChainAsync, writeContract, getWriteConfig]
  )

  return (
    <Button
      onClick={handleClick}
      disabled={!isReady || withdrawn || loading}
      variant="outline"
      className="rounded-full text-sm hover:text-primary text-primary disabled:border-border border-primary"
      size="sm"
    >
      {withdrawn ? 'Withdrawn' : 'Withdraw'}
    </Button>
  )
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
  const currentTime = useCurrentTime()
  const isReady = availableAt <= currentTime

  const getWriteConfig = useCallback(() => {
    if (!account) return null
    return {
      abi: StRSR,
      functionName: 'withdraw' as const,
      address: stRSRAddress,
      args: [account, BigInt(endId)] as const,
      chainId,
    }
  }, [account, stRSRAddress, endId, chainId])

  return (
    <WithdrawButton
      chainId={chainId}
      isReady={isReady}
      getWriteConfig={getWriteConfig}
    />
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
  const currentTime = useCurrentTime()
  const isReady = unlockTime <= currentTime

  const getWriteConfig = useCallback(() => {
    if (!unstakingManagerAddress) return null
    return {
      abi: dtfIndexUnstakingManager,
      functionName: 'claimLock' as const,
      address: unstakingManagerAddress,
      args: [BigInt(lockId)] as const,
      chainId,
    }
  }, [unstakingManagerAddress, lockId, chainId])

  return (
    <WithdrawButton
      chainId={chainId}
      isReady={isReady}
      getWriteConfig={getWriteConfig}
    />
  )
}

const CircularProgress = ({ value }: { value: number }) => {
  const r = 6
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0">
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-border"
      />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary"
        transform="rotate(-90 8 8)"
      />
    </svg>
  )
}

const ProgressCell = ({ row }: { row: PendingWithdrawalRow }) => {
  const currentTime = useCurrentTime()
  const deadline = row.source === 'stakedRSR' ? row.availableAt : row.unlockTime
  const isReady = deadline <= currentTime

  if (isReady) {
    return <span className="text-sm font-light text-success">Ready</span>
  }

  const timeLeft = deadline - currentTime
  const elapsed = row.delay - timeLeft
  const progress = Math.min(100, Math.max(0, (elapsed / row.delay) * 100))
  const timeLeftStr = parseDurationShort(timeLeft, { units: ['d', 'h', 'm'], round: true })
    .replaceAll(' ', '')
    .replaceAll(',', ' ')

  return (
    <div className="flex items-center gap-1.5 min-w-[120px]">
      <CircularProgress value={progress} />
      <span className="text-sm text-legend whitespace-nowrap">{timeLeftStr}</span>
    </div>
  )
}

const SourceCell = ({ row }: { row: PendingWithdrawalRow }) => {
  const openStakingSidebar = useSetAtom(openStakingSidebarAtom)

  if (row.source === 'stakedRSR') {
    return (
      <Link
        to={getTokenRoute(row.dtfAddress, row.chainId, 'staking')}
        className="text-sm text-primary hover:underline"
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        {row.tokenSymbol}
      </Link>
    )
  }

  return (
    <button
      className="text-sm text-primary hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        openStakingSidebar({
          id: row.stTokenAddress,
          tokenSymbol: row.tokenSymbol,
          underlyingSymbol: row.underlyingSymbol,
          underlyingAddress: row.underlyingAddress,
          chainId: row.chainId,
        })
      }}
    >
      {row.tokenSymbol}
    </button>
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
          <div className="flex items-center gap-2 min-h-10">
            <TokenLogoWithChain symbol="RSR" chain={d.chainId} />
            <span className="text-sm font-bold">RSR</span>
          </div>
        )
      }
      return (
        <div className="flex items-center gap-2 min-h-10">
          <TokenLogoWithChain
            symbol={d.underlyingSymbol}
            address={d.underlyingAddress}
            chain={d.chainId}
          />
          <span className="text-sm font-bold">{d.underlyingSymbol}</span>
        </div>
      )
    },
  },
  {
    id: 'source',
    header: 'Source',
    cell: ({ row }) => <SourceCell row={row.original} />,
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      const val = Number(row.original.amount)
      return (
        <span className="text-sm whitespace-nowrap">
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
        <span className="text-sm font-bold whitespace-nowrap">
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

const PendingWithdrawals = () => {
  const rows = useAtomValue(portfolioPendingWithdrawalsAtom)
  const { displayData, expanded, toggle, hasMore, total } = useExpandable(rows)

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
