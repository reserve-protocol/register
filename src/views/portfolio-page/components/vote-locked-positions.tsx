import { AnimatedNumber } from '@/components/ui/animated-number'
import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, formatToSignificantDigits, formatUSD } from '@/utils'
import { isSelfAppreciatingVoteLock, toCompoundApy } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import {
  useIndexDtfVoteLockVaultState,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { ColumnDef } from '@tanstack/react-table'
import { Trans } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { ExternalLink, Lock } from 'lucide-react'
import { Address } from 'viem'
import {
  openStakingSidebarAtom,
  portfolioAddressAtom,
  portfolioVoteLocksAtom,
} from '../atoms'
import { PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import GovernsCell from './governs-cell'
import SectionHeader from './section-header'

// Self-appreciating vaults (vlRSR): the API's `amount` is shares priced 1:1
// with the underlying, which hides appreciation. Read the live redeemable
// (maxWithdraw) + rate via RPC for flagged rows only; fall back to API values
// while loading or on RPC failure so a row never blanks.
const useSelfAppreciatingVaultState = (voteLock: PortfolioVoteLock) => {
  const account = useAtomValue(portfolioAddressAtom)
  const flagged = isSelfAppreciatingVoteLock(
    voteLock.chainId,
    voteLock.stTokenAddress
  )

  return useIndexDtfVoteLockVaultState(
    flagged && account
      ? {
          chainId: voteLock.chainId as SupportedChainId,
          stToken: voteLock.stTokenAddress as Address,
          account,
        }
      : undefined,
    { refetchInterval: 30_000 }
  )
}

const BalanceCell = ({ voteLock }: { voteLock: PortfolioVoteLock }) => {
  const { data } = useSelfAppreciatingVaultState(voteLock)
  const redeemable = data?.maxWithdraw

  // Trust a successful live read even when it's zero (fully redeemed) — the
  // API lags up to 60s and would show a phantom position. Fall back to API
  // values only while loading or on RPC error.
  if (redeemable) {
    return (
      <div className="whitespace-nowrap">
        <p className="text-sm">
          <AnimatedNumber
            value={Number(redeemable.formatted)}
            formatter={formatToSignificantDigits}
          />{' '}
          {voteLock.underlying.symbol}
        </p>
        <p className="text-xs text-legend">
          1 {voteLock.symbol} ={' '}
          <AnimatedNumber
            value={Number(data.exchangeRate.formatted)}
            formatter={(value) => formatCurrency(value, 4)}
          />{' '}
          {voteLock.underlying.symbol}
        </p>
      </div>
    )
  }

  const val = Number(voteLock.amount)
  return (
    <span className="text-sm whitespace-nowrap">
      {!isNaN(val) ? formatToSignificantDigits(val) : '—'}
    </span>
  )
}

const ValueCell = ({ voteLock }: { voteLock: PortfolioVoteLock }) => {
  const { data } = useSelfAppreciatingVaultState(voteLock)
  const liveValue =
    data?.underlyingPrice !== undefined && data.maxWithdraw
      ? data.underlyingPrice * Number(data.maxWithdraw.formatted)
      : undefined
  const val = liveValue ?? voteLock.value

  return (
    <span className="text-sm font-bold whitespace-nowrap">
      {val != null && !isNaN(val) ? (
        <AnimatedNumber value={val} formatter={formatUSD} />
      ) : (
        '—'
      )}
    </span>
  )
}

const ModifyButton = ({ voteLock }: { voteLock: PortfolioVoteLock }) => {
  const openStakingSidebar = useSetAtom(openStakingSidebarAtom)

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full text-primary border-primary hover:text-primary"
      onClick={(e) => {
        e.stopPropagation()
        openStakingSidebar({
          id: voteLock.stTokenAddress,
          tokenSymbol: voteLock.symbol,
          underlyingSymbol: voteLock.underlying.symbol,
          underlyingAddress: voteLock.underlying.address,
          chainId: voteLock.chainId,
          dtfAddress: voteLock.dtfs[0]?.address,
          isOptimistic: voteLock.activeProposals.some((p) => p.isOptimistic),
        })
      }}
    >
      <Trans>Modify</Trans>
    </Button>
  )
}

const columns: ColumnDef<PortfolioVoteLock, any>[] = [
  {
    id: 'stTokenName',
    accessorKey: 'stTokenName',
    header: () => <Trans>Governance Token</Trans>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-h-10">
        <TokenLogoWithChain
          symbol={row.original.symbol}
          address={row.original.stTokenAddress}
          chain={row.original.chainId}
        />
        <div>
          <p className="font-bold text-sm">{row.original.symbol}</p>
          <p className="text-xs text-legend hidden sm:block">
            {row.original.name}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'underlying',
    header: () => <Trans>Underlying</Trans>,
    cell: ({ row }) => {
      const u = row.original.underlying
      if (!u) return <span className="text-sm text-legend">—</span>
      return (
        <div className="flex items-center gap-2">
          <TokenLogo
            symbol={u.symbol}
            address={u.address}
            chain={row.original.chainId}
            size="md"
          />
          <span className="text-sm">{u.symbol}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                getExplorerLink(
                  u.address,
                  row.original.chainId,
                  ExplorerDataType.TOKEN
                ),
                '_blank'
              )
            }}
            className="text-legend hover:text-primary"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'governs',
    header: () => <Trans>Governs</Trans>,
    cell: ({ row }) => (
      <GovernsCell dtfs={row.original.dtfs} chainId={row.original.chainId} />
    ),
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'apy',
    accessorKey: 'apy',
    header: () => <Trans>APY</Trans>,
    cell: ({ row }) => {
      const raw = row.original.apy
      // Self-appreciating vaults auto-compound → daily-compounded APY.
      const val =
        raw != null &&
        isSelfAppreciatingVoteLock(
          row.original.chainId,
          row.original.stTokenAddress
        )
          ? toCompoundApy(raw)
          : raw
      return (
        <span className="text-sm whitespace-nowrap">
          {val != null && !isNaN(val) ? `${formatCurrency(val)}%` : '—'}
        </span>
      )
    },
  },
  {
    id: 'balance',
    accessorKey: 'amount',
    header: () => <Trans>Balance</Trans>,
    cell: ({ row }) => <BalanceCell voteLock={row.original} />,
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: () => <Trans>Value</Trans>,
    cell: ({ row }) => <ValueCell voteLock={row.original} />,
  },
  {
    id: 'action',
    header: () => (
      <span className="flex justify-end">
        <Trans>Action</Trans>
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ModifyButton voteLock={row.original} />
      </div>
    ),
  },
]

const VoteLockedPositions = () => {
  const voteLocks = useAtomValue(portfolioVoteLocksAtom)
  const filtered = voteLocks.filter((v) => Number(v.amount) > 0)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(filtered)

  if (!filtered.length) return null

  return (
    <div>
      <SectionHeader
        icon={Lock}
        title={<Trans>Vote-locked positions</Trans>}
        subtitle={
          <Trans>
            Participate in governance with any ERC-20 token and earn APY
            rewards.{' '}
            <a
              href="https://docs.reserve.org/core-components/index-dtfs/roles"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Learn more
            </a>
            .
          </Trans>
        }
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

export default VoteLockedPositions
