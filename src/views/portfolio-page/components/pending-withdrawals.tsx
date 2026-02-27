import TokenLogo from '@/components/token-logo'
import ChainLogo from '@/components/icons/ChainLogo'
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
import {
  portfolioStTokenAtom,
  stakingSidebarOpenAtom,
} from '@/views/index-dtf/overview/components/staking/atoms'
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
      dtfAddress: Address
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
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const { address: account } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash, chainId })
  const currentTime = useCurrentTime()
  const isReady = availableAt <= currentTime
  const loading = !receipt && (isPending || !!hash)
  const withdrawn = receipt?.status === 'success'
  const toastedRef = useRef(false)

  useEffect(() => {
    if (withdrawn && !toastedRef.current) {
      toastedRef.current = true
      toast.success('Withdrawal successful')
    }
  }, [withdrawn])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!wallet) {
        openConnectModal?.()
        return
      }
      if (walletChain !== chainId) {
        switchChain?.({ chainId })
        return
      }
      if (!account) return
      writeContract({
        abi: StRSR,
        functionName: 'withdraw',
        address: stRSRAddress,
        args: [account, BigInt(endId)],
        chainId,
      })
    },
    [wallet, walletChain, chainId, account, openConnectModal, switchChain, writeContract, stRSRAddress, endId]
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
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
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
  const withdrawn = receipt?.status === 'success'
  const toastedRef = useRef(false)

  useEffect(() => {
    if (withdrawn && !toastedRef.current) {
      toastedRef.current = true
      toast.success('Withdrawal successful')
    }
  }, [withdrawn])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!wallet) {
        openConnectModal?.()
        return
      }
      if (walletChain !== chainId) {
        switchChain?.({ chainId })
        return
      }
      if (!unstakingManagerAddress) return
      writeContract({
        abi: dtfIndexUnstakingManager,
        functionName: 'claimLock',
        address: unstakingManagerAddress,
        args: [BigInt(lockId)],
        chainId,
      })
    },
    [wallet, walletChain, chainId, unstakingManagerAddress, openConnectModal, switchChain, writeContract, lockId]
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
  const timeLeftStr = parseDurationShort(timeLeft)
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
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)
  const setPortfolioStToken = useSetAtom(portfolioStTokenAtom)

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
        setStakingSidebarOpen(true)
        setPortfolioStToken({
          id: row.stTokenAddress,
          token: {
            name: row.tokenSymbol,
            symbol: row.tokenSymbol,
            decimals: 18,
            totalSupply: '',
          },
          underlying: {
            name: row.underlyingSymbol,
            symbol: row.underlyingSymbol,
            address: row.underlyingAddress,
            decimals: 18,
          },
          legacyGovernance: [],
          rewardTokens: [],
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
        <div className="flex items-center gap-2 min-h-10">
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
    cell: ({ row }) => <SourceCell row={row.original} />,
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
    for (const w of position.pendingWithdrawals || []) {
      rows.push({
        source: 'stakedRSR',
        endId: w.endId,
        amount: w.amount,
        availableAt: w.availableAt,
        delay: w.delay,
        value: w.value,
        chainId: position.chainId,
        stRSRAddress: position.stRSRAddress,
        dtfAddress: position.address,
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
