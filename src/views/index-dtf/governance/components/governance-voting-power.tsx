import votesTokenAbi from '@/abis/votes-token'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EnsName from '@/components/utils/ens-name'
import { useWatchReadContract } from '@/hooks/useWatchReadContract'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtomValue } from 'jotai'
import { Pencil, Sparkles, Vote } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Address, zeroAddress } from 'viem'
import {
  getDTFSettingsGovernance,
  getGovernanceVoteTokenAddress,
} from '../governance-helpers'
import { useVotingPower } from '../hooks/use-voting-power'
import DelegateModal from './delegate-modal'

const DelegateStatus = ({
  account,
  delegate,
}: {
  account?: Address
  delegate?: Address
}) => {
  if (!account) {
    return <span>Connect wallet to delegate</span>
  }

  if (!delegate || delegate === zeroAddress) {
    return <span>Not delegated</span>
  }

  if (delegate.toLowerCase() === account.toLowerCase()) {
    return <span>Delegated to self</span>
  }

  return (
    <span>
      Delegated to <EnsName address={delegate} />
    </span>
  )
}

const PowerRow = ({
  title,
  description,
  value,
  symbol,
  loading,
  icon,
  account,
  delegate,
  onDelegate,
}: {
  title: string
  description: string
  value: number
  symbol?: string
  loading?: boolean
  icon: ReactNode
  account?: Address
  delegate?: Address
  onDelegate(): void
}) => {
  const hasDelegate = !!delegate && delegate !== zeroAddress

  return (
    <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-primary/30 bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold leading-none">{title}</div>
              <div className="mt-1 text-xs text-legend">{description}</div>
            </div>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-right font-bold">
                {formatCurrency(value, 1, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
                {!!symbol && (
                  <span className="ml-1 text-xs text-legend">{symbol}</span>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-3 py-2 text-sm">
            <div className="min-w-0 truncate text-legend">
              <DelegateStatus account={account} delegate={delegate} />
            </div>
            <Button
              size="sm"
              variant={hasDelegate ? 'outline' : 'default'}
              onClick={onDelegate}
              className="h-8 shrink-0 gap-1 rounded-xl px-3"
            >
              <Pencil size={13} />
              {hasDelegate ? 'Change' : 'Delegate'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ReadOnlyPower = ({
  chainId,
  tokenLogoSymbol,
  tokenLogoAddress,
  tokenSymbol,
  isVoteLockToken,
  votingPower,
  optimisticVotingPower,
  isOptimisticGovernance,
  isLoading,
  isOptimisticLoading,
}: {
  chainId: number
  tokenLogoSymbol?: string
  tokenLogoAddress?: Address
  tokenSymbol?: string
  isVoteLockToken: boolean
  votingPower: number
  optimisticVotingPower: number
  isOptimisticGovernance: boolean
  isLoading?: boolean
  isOptimisticLoading?: boolean
}) => (
  <div className="border-t">
    <div className="flex items-center gap-3 p-6">
      <TokenLogo
        size="lg"
        symbol={tokenLogoSymbol}
        address={tokenLogoAddress}
        chain={chainId}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-legend text-sm">
            {isVoteLockToken ? 'Vote locked' : 'Voting power'}
          </span>
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="font-bold">
              {formatCurrency(votingPower, 1, {
                notation: 'compact',
                compactDisplay: 'short',
              })}{' '}
              {tokenSymbol}
            </span>
          )}
        </div>
        {isOptimisticGovernance && (
          <div className="flex flex-col">
            <span className="text-legend text-sm">Optimistic voting power</span>
            {isOptimisticLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="font-bold">
                {formatCurrency(optimisticVotingPower, 1, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}{' '}
                {tokenSymbol}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)

const GovernanceVotingPower = () => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [delegateType, setDelegateType] = useState<'standard' | 'optimistic'>()
  const governance = getDTFSettingsGovernance(dtf)
  const governanceToken = governance?.token?.token
  const voteTokenAddress = getGovernanceVoteTokenAddress(
    governance,
    dtf?.stToken?.id
  )
  const isVoteLockToken =
    !!dtf?.stToken?.id &&
    voteTokenAddress?.toLowerCase() === dtf.stToken.id.toLowerCase()
  const tokenSymbol = isVoteLockToken
    ? `$${dtf?.stToken?.token.symbol}`
    : governanceToken?.symbol
  const tokenLogoSymbol = isVoteLockToken
    ? dtf?.stToken?.underlying.symbol
    : governanceToken?.symbol
  const tokenLogoAddress = isVoteLockToken
    ? dtf?.stToken?.underlying.address
    : governanceToken?.address
  const {
    votingPower,
    optimisticVotingPower,
    isOptimisticGovernance,
    isLoading,
    isOptimisticLoading,
  } = useVotingPower()

  const { data: delegate } = useWatchReadContract({
    abi: votesTokenAbi,
    address: voteTokenAddress,
    functionName: 'delegates',
    args: account ? [account] : undefined,
    chainId,
    query: {
      enabled: !!account && !!voteTokenAddress && !!chainId,
    },
  })

  const { data: voteTokenBalance } = useWatchReadContract({
    abi: votesTokenAbi,
    address: voteTokenAddress,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    chainId,
    query: {
      enabled: !!account && !!voteTokenAddress && !!chainId,
    },
  })

  const { data: optimisticDelegate } = useWatchReadContract({
    abi: votesTokenAbi,
    address: voteTokenAddress,
    functionName: 'optimisticDelegates',
    args: account ? [account] : undefined,
    chainId,
    query: {
      enabled:
        !!account && !!voteTokenAddress && !!chainId && isOptimisticGovernance,
    },
  })

  if (!voteTokenAddress) {
    return null
  }

  const activeDelegate =
    delegateType === 'optimistic' ? optimisticDelegate : delegate
  const defaultDelegate =
    activeDelegate && activeDelegate !== zeroAddress
      ? activeDelegate
      : (account ?? '')
  const canDelegate = !!account && (voteTokenBalance ?? 0n) > 0n

  if (!canDelegate) {
    return (
      <ReadOnlyPower
        chainId={chainId}
        tokenLogoSymbol={tokenLogoSymbol}
        tokenLogoAddress={tokenLogoAddress}
        tokenSymbol={tokenSymbol}
        isVoteLockToken={isVoteLockToken}
        votingPower={votingPower}
        optimisticVotingPower={optimisticVotingPower}
        isOptimisticGovernance={isOptimisticGovernance}
        isLoading={isLoading}
        isOptimisticLoading={isOptimisticLoading}
      />
    )
  }

  return (
    <div className="border-t p-2">
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <div className="mb-4 flex items-center gap-3">
          <TokenLogo
            size="lg"
            symbol={tokenLogoSymbol}
            address={tokenLogoAddress}
            chain={chainId}
          />
          <div>
            <div className="font-bold">Your governance power</div>
            <div className="text-sm text-legend">
              Delegate to yourself or another address.
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <PowerRow
            title="Voting power"
            description="Used for standard governance proposals."
            value={votingPower}
            symbol={tokenSymbol}
            loading={isLoading}
            icon={<Vote size={16} />}
            account={account ?? undefined}
            delegate={delegate}
            onDelegate={() => setDelegateType('standard')}
          />

          {isOptimisticGovernance && (
            <PowerRow
              title="Optimistic voting power"
              description="Used to veto optimistic proposals."
              value={optimisticVotingPower}
              symbol={tokenSymbol}
              loading={isOptimisticLoading}
              icon={<Sparkles size={16} />}
              account={account ?? undefined}
              delegate={optimisticDelegate}
              onDelegate={() => setDelegateType('optimistic')}
            />
          )}
        </div>
      </div>

      {!!delegateType && canDelegate && (
        <DelegateModal
          tokenAddress={voteTokenAddress}
          delegated={!!activeDelegate && activeDelegate !== zeroAddress}
          optimistic={delegateType === 'optimistic'}
          defaultAddress={defaultDelegate}
          onClose={() => setDelegateType(undefined)}
        />
      )}
    </div>
  )
}

export default GovernanceVotingPower
