import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, formatToSignificantDigits, formatUSD } from '@/utils'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { Gift } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { walletAtom, walletChainAtom } from '@/state/atoms'
import { toast } from 'sonner'
import {
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { PortfolioRewardRow, portfolioRewardsAtom } from '../atoms'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

type RewardRow = PortfolioRewardRow

const ClaimButton = ({ reward }: { reward: RewardRow }) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const { openConnectModal } = useConnectModal()
  const { switchChainAsync } = useSwitchChain()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId: reward.chainId,
  })
  const claimed = receipt?.status === 'success'

  useEffect(() => {
    if (claimed) {
      toast.success(
        reward.source === 'revenue' ? 'Fees distributed' : 'Rewards claimed',
        { duration: 8000 }
      )
    }
  }, [claimed, reward.source])

  const loading = !receipt && (isPending || !!hash)

  const handleClick = useCallback(async () => {
    if (!wallet) {
      openConnectModal?.()
      return
    }
    if (walletChain !== reward.chainId) {
      await switchChainAsync?.({ chainId: reward.chainId })
    }
    if (reward.source === 'revenue' && reward.dtfAddress) {
      writeContract({
        abi: dtfIndexAbi,
        functionName: 'distributeFees',
        address: reward.dtfAddress,
        chainId: reward.chainId,
      })
      return
    }
    if (reward.stTokenAddress) {
      writeContract({
        abi: dtfIndexStakingVault,
        functionName: 'claimRewards',
        address: reward.stTokenAddress,
        args: [[reward.address]],
        chainId: reward.chainId,
      })
    }
  }, [wallet, walletChain, reward, openConnectModal, switchChainAsync, writeContract])

  const isRevenue = reward.source === 'revenue'
  const idleLabel = isRevenue ? 'Distribute Fees' : 'Claim'
  const doneLabel = isRevenue ? 'Distributed' : 'Claimed'

  return (
    <Button
      onClick={handleClick}
      disabled={claimed || loading}
      className="rounded-full text-sm"
      size="sm"
    >
      {claimed ? doneLabel : idleLabel}
    </Button>
  )
}

const columns: ColumnDef<RewardRow, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Reward Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TokenLogoWithChain
          symbol={row.original.symbol}
          address={row.original.address}
          chain={row.original.chainId}
        />
        <div className="flex flex-col">
          <p className="font-bold text-sm">{row.original.symbol}</p>
          <span className="text-xs text-legend">
            {row.original.source === 'revenue' ? 'Revenue' : 'Staking'}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'balance',
    accessorKey: 'amount',
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
    id: 'actions',
    header: 'Claim',
    cell: ({ row }) => <ClaimButton reward={row.original} />,
    meta: { className: 'text-right' },
  },
]

const AvailableRewards = () => {
  const rewards = useAtomValue(portfolioRewardsAtom)

  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(rewards)

  if (!rewards.length) return null

  return (
    <div id="available-rewards">
      <SectionHeader
        icon={Gift}
        title="Available Rewards"
        subtitle={
          <>
            Earn rewards by staking or participating in governance.{' '}
            <a
              href="https://docs.reserve.org/core-components/index-dtfs/roles"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Learn more
            </a>
            .
          </>
        }
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable columns={columns} data={displayData} />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default AvailableRewards
