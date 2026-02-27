import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, formatToSignificantDigits, formatUSD } from '@/utils'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { Gift } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { walletAtom, walletChainAtom } from '@/state/atoms'
import { toast } from 'sonner'
import { Address } from 'viem'
import {
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

type RewardRow = {
  address: Address
  chainId: number
  symbol: string
  name: string
  decimals: number
  amount: string
  value: number
  stTokenAddress: Address
}

const ClaimButton = ({ reward }: { reward: RewardRow }) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId: reward.chainId,
  })
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    if (receipt?.status === 'success') {
      setClaimed(true)
      toast.success('Rewards claimed')
    }
  }, [receipt])

  const loading = !receipt && (isPending || !!hash)

  const handleClick = useCallback(() => {
    if (!wallet) {
      openConnectModal?.()
      return
    }
    if (walletChain !== reward.chainId) {
      switchChain?.({ chainId: reward.chainId })
      return
    }
    writeContract({
      abi: dtfIndexStakingVault,
      functionName: 'claimRewards',
      address: reward.stTokenAddress,
      args: [[reward.address]],
      chainId: reward.chainId,
    })
  }, [wallet, walletChain, reward, openConnectModal, switchChain, writeContract])

  return (
    <Button
      onClick={handleClick}
      disabled={claimed || loading}
      className="rounded-full text-sm"
      size="sm"
    >
      {claimed ? 'Claimed' : 'Claim'}
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
        <div className="relative flex-shrink-0">
          <TokenLogo
            symbol={row.original.symbol}
            address={row.original.address}
            chain={row.original.chainId}
            size="lg"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <p className="font-bold text-sm">{row.original.symbol}</p>
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
    id: 'actions',
    header: 'Claim',
    cell: ({ row }) => <ClaimButton reward={row.original} />,
    meta: { className: 'text-right' },
  },
]

const AvailableRewards = ({
  voteLocks,
}: {
  voteLocks: PortfolioVoteLock[]
}) => {
  const rewards: RewardRow[] = useMemo(
    () =>
      voteLocks
        .flatMap((lock) =>
          (lock.rewards || []).map((r) => ({
            ...r,
            stTokenAddress: lock.stTokenAddress,
          }))
        )
        .sort((a, b) => (b.value || 0) - (a.value || 0)),
    [voteLocks]
  )

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
              href="https://reserve.org/protocol/"
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
