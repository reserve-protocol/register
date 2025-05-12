import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import dtfIndexUnstakingManager from '@/abis/dtf-index-unstaking-manager'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import useCurrentTime from '@/hooks/useCurrentTime'
import { formatCurrency, parseDurationShort } from '@/utils'
import Staking from '@/views/index-dtf/overview/components/staking'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronRight } from 'lucide-react'
import { Address } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  type Lock,
  RewardToken,
  StakingToken,
  accountRewardsAtom,
  accountTokenPricesAtom,
  portfolioSidebarOpenAtom,
} from '../../atoms'
import {
  portfolioStTokenAtom,
  stakingSidebarOpenAtom,
} from '@/views/index-dtf/overview/components/staking/atoms'

export const StakeRSRAction = () => {
  return <ChevronRight className="h-4 w-4 text-primary" />
}

export const YieldDTFAction = ({
  yieldDTFUsdPrice,
}: {
  yieldDTFUsdPrice: number
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Price</span> $
        {formatCurrency(yieldDTFUsdPrice)}
      </div>
      <ChevronRight className="h-4 w-4 text-primary" />
    </div>
  )
}

export const IndexDTFAction = ({
  indexDTFAddress,
}: {
  indexDTFAddress: Address
}) => {
  const prices = useAtomValue(accountTokenPricesAtom)
  const indexDTFUsdPrice = prices[indexDTFAddress] || 0

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Price</span> $
        {formatCurrency(indexDTFUsdPrice)}
      </div>
      <ChevronRight className="h-4 w-4 text-primary" />
    </div>
  )
}

export const LockWithdrawAction = ({ token, lockId, chainId }: Lock) => {
  const { data: unstakingManagerAddress } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingManager',
    address: token.address,
    chainId,
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const write = () => {
    if (!unstakingManagerAddress) return

    writeContract({
      abi: dtfIndexUnstakingManager,
      functionName: 'claimLock',
      address: unstakingManagerAddress,
      args: [lockId],
      chainId,
    })
  }

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  const loading = !receipt && (isPending || !!hash || (hash && !receipt))

  return (
    <TransactionButtonContainer
      chain={chainId}
      size="sm"
      switchChainButtonClassName="rounded-full"
      connectButtonClassName="rounded-full"
    >
      <Button
        onClick={write}
        disabled={receipt?.status === 'success' || loading}
        variant="outline"
        className="rounded-full text-sm hover:text-primary text-primary disabled:border-border border-primary"
        size="sm"
      >
        {loading
          ? !!hash
            ? 'Confirming tx...'
            : 'Pending, sign in wallet'
          : receipt?.status === 'success'
            ? 'Withdrawn'
            : 'Withdraw'}
      </Button>
    </TransactionButtonContainer>
  )
}

export const CancelLockAction = ({
  token,
  lockId,
  unlockTime,
  chainId,
}: Lock) => {
  const { data: unstakingManagerAddress } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingManager',
    address: token.address,
    chainId,
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const write = () => {
    if (!unstakingManagerAddress) return

    writeContract({
      abi: dtfIndexUnstakingManager,
      functionName: 'cancelLock',
      address: unstakingManagerAddress,
      args: [lockId],
      chainId,
    })
  }

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  const timeNow = useCurrentTime()
  const timeLeft = unlockTime - timeNow
  const timeLeftString = parseDurationShort(timeLeft)
    .replaceAll(' ', '')
    .replaceAll(',', ' ')

  const loading = !receipt && (isPending || !!hash || (hash && !receipt))

  return (
    <div className="flex items-center text-sm gap-2">
      {receipt?.status !== 'success' && (
        <div className="flex items-center gap-2 text-sm">
          <Spinner className="h-4 w-4" />
          <span className="text-muted-foreground">{timeLeftString}</span>
        </div>
      )}
      <TransactionButtonContainer
        chain={chainId}
        size="sm"
        switchChainButtonClassName="rounded-full"
        connectButtonClassName="rounded-full"
      >
        <Button
          variant="ghost"
          className="rounded-full text-sm text-red-600 hover:text-red-600"
          size="sm"
          disabled={receipt?.status === 'success' || loading}
          onClick={write}
        >
          {loading
            ? !!hash
              ? 'Confirming tx...'
              : 'Pending, sign in wallet'
            : receipt?.status === 'success'
              ? 'Cancelled'
              : 'Cancel'}
        </Button>
      </TransactionButtonContainer>
    </div>
  )
}

export const UnlockAction = (lock: Lock) => {
  const timeNow = useCurrentTime()

  if (lock.unlockTime < timeNow) {
    return <LockWithdrawAction {...lock} />
  }
  return <CancelLockAction {...lock} />
}

export const VoteLockAction = ({
  stToken,
  chainId,
}: {
  stToken: Address
  chainId: number
}) => {
  const accountRewards = useAtomValue(accountRewardsAtom)
  const stTokenRewards = accountRewards[stToken]
  const totalAccruedUSD =
    stTokenRewards?.reduce(
      (acc, reward) => acc + (reward?.accruedUSD || 0),
      0
    ) || 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className="text-sm">
          <span className="text-muted-foreground">Rewards</span>{' '}
          <span className="text-primary">
            ${formatCurrency(totalAccruedUSD)}
          </span>
        </div>
        <StackTokenLogo
          tokens={
            stTokenRewards
              ?.slice(0, 3)
              .map((t) => ({ chain: chainId, ...t })) || []
          }
          overlap={6}
          reverseStack
        />
      </div>
      <ChevronRight className="h-4 w-4" />
    </div>
  )
}

export const ModifyLockAction = ({ stToken }: { stToken: StakingToken }) => {
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)
  const setPortfolioSidebarOpen = useSetAtom(portfolioSidebarOpenAtom)
  const setPortfolioStToken = useSetAtom(portfolioStTokenAtom)

  const stTokenCompatible = {
    id: stToken.address,
    token: {
      name: stToken.name,
      symbol: stToken.symbol,
      address: stToken.address,
      decimals: stToken.decimals,
      chainId: stToken.chainId,
      totalSupply: '',
    },
    underlying: {
      name: stToken.underlying.name,
      symbol: stToken.underlying.symbol,
      address: stToken.underlying.address,
      decimals: stToken.underlying.decimals,
    },
    legacyGovernance: [],
    chainId: stToken.chainId,
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="rounded-full"
      onClick={() => {
        setPortfolioSidebarOpen(false)
        setStakingSidebarOpen(true)
        setPortfolioStToken({
          ...stTokenCompatible,
          rewardTokens: [],
        })
      }}
    >
      Modify lock
    </Button>
  )
}

export const RewardAction = ({
  stTokenAddress,
  reward,
}: {
  stTokenAddress: Address
  reward: RewardToken
}) => {
  const chainId = reward.chainId
  const { writeContract, data: hash, isPending } = useWriteContract()

  const write = () => {
    writeContract({
      abi: dtfIndexStakingVault,
      functionName: 'claimRewards',
      address: stTokenAddress,
      args: [[reward.address]],
      chainId,
    })
  }

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  const loading = !receipt && (isPending || !!hash || (hash && !receipt))

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        {reward.accruedUSD !== undefined
          ? `$${formatCurrency(reward.accruedUSD, 2)}`
          : '$0'}
      </span>
      <TransactionButtonContainer
        chain={chainId}
        size="sm"
        switchChainButtonClassName="rounded-full"
        connectButtonClassName="rounded-full"
      >
        <Button
          onClick={write}
          disabled={receipt?.status === 'success' || loading}
          variant="outline"
          className="rounded-full text-sm hover:text-primary text-primary disabled:border-border border-primary"
          size="sm"
        >
          {loading
            ? !!hash
              ? 'Confirming tx...'
              : 'Pending, sign in wallet'
            : receipt?.status === 'success'
              ? 'Claimed'
              : 'Claim'}
        </Button>
      </TransactionButtonContainer>
    </div>
  )
}

export const ClaimAllButton = ({
  stTokenAddress,
  rewards,
}: {
  stTokenAddress: Address
  rewards: RewardToken[]
}) => {
  const chainId = rewards[0]?.chainId
  const { writeContract, data: hash, isPending } = useWriteContract()

  const write = () => {
    writeContract({
      abi: dtfIndexStakingVault,
      functionName: 'claimRewards',
      address: stTokenAddress,
      args: [rewards.map(({ address }) => address)],
      chainId,
    })
  }

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  const loading = !receipt && (isPending || !!hash || (hash && !receipt))

  return (
    <TransactionButtonContainer
      chain={chainId}
      size="sm"
      switchChainButtonClassName="rounded-full"
      connectButtonClassName="rounded-full"
    >
      <Button
        onClick={write}
        disabled={receipt?.status === 'success' || loading}
        className="rounded-full text-sm"
        size="sm"
      >
        {loading
          ? !!hash
            ? 'Confirming tx...'
            : 'Pending, sign in wallet'
          : receipt?.status === 'success'
            ? 'Claimed'
            : 'Claim All'}
      </Button>
    </TransactionButtonContainer>
  )
}
