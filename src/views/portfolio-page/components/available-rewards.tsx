import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/ui/data-table'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import { formatCurrency } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { PortfolioVoteLock } from '../types'

type RewardRow = {
  address: Address
  chainId: number
  symbol: string
  name: string
  logo?: string
  balance: number
  value: number
  stTokenAddress: Address
}

const ClaimButton = ({ reward }: { reward: RewardRow }) => {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId: reward.chainId,
  })
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    if (receipt?.status === 'success') setClaimed(true)
  }, [receipt])

  const loading = !receipt && (isPending || !!hash)

  return (
    <TransactionButtonContainer
      chain={reward.chainId}
      size="sm"
      switchChainButtonClassName="rounded-full"
      connectButtonClassName="rounded-full"
    >
      <Button
        onClick={() =>
          writeContract({
            abi: dtfIndexStakingVault,
            functionName: 'claimRewards',
            address: reward.stTokenAddress,
            args: [[reward.address]],
            chainId: reward.chainId,
          })
        }
        disabled={claimed || loading}
        variant="outline"
        className="rounded-full text-sm hover:text-primary text-primary disabled:border-border border-primary"
        size="sm"
      >
        {loading
          ? hash
            ? 'Confirming...'
            : 'Sign in wallet'
          : claimed
            ? 'Claimed'
            : 'Claim'}
      </Button>
    </TransactionButtonContainer>
  )
}

const columns: ColumnDef<RewardRow, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Reward Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <TokenLogo
            symbol={row.original.symbol}
            address={row.original.address}
            chain={row.original.chainId}
            src={row.original.logo}
            size="lg"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <div>
          <p className="font-medium">{row.original.symbol}</p>
          <p className="text-xs text-legend hidden sm:block">
            {row.original.name}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'balance',
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => (
      <span className="text-sm">{formatCurrency(row.original.balance)}</span>
    ),
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        ${formatCurrency(row.original.value)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
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
        .sort((a, b) => b.value - a.value),
    [voteLocks]
  )

  if (!rewards.length) return null

  return (
    <div id="available-rewards" className="rounded-4xl bg-secondary">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          Available Rewards
        </h2>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable columns={columns} data={rewards} />
      </div>
    </div>
  )
}

export default AvailableRewards
