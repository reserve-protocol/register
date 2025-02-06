import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import dtfIndexUnstakingManager from '@/abis/dtf-index-unstaking-manager'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import useCurrentTime from '@/hooks/useCurrentTime'
import { formatCurrency, parseDurationShort } from '@/utils'
import { CHAIN_TO_NETWORK, ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { ChevronRight } from 'lucide-react'
import { Address } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { type Lock, accountTokenPricesAtom } from '../../atoms'

export const NavigateTo = ({ src }: { src: string }) => {
  return (
    <a href={src} className="text-primary">
      <ChevronRight className="h-4 w-4" />
    </a>
  )
}

export const StakeRSRAction = ({
  yieldDTFChainId,
  yieldDTFAddress,
}: {
  yieldDTFChainId: number
  yieldDTFAddress: string
}) => {
  return (
    <NavigateTo
      src={`/${CHAIN_TO_NETWORK[yieldDTFChainId]}/token/${yieldDTFAddress}/${ROUTES.STAKING}`}
    />
  )
}

export const YieldDTFAction = ({
  yieldDTFChainId,
  yieldDTFAddress,
  yieldDTFUsdPrice,
}: {
  yieldDTFChainId: number
  yieldDTFAddress: string
  yieldDTFUsdPrice: number
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Price</span> $
        {formatCurrency(yieldDTFUsdPrice)}
      </div>
      <NavigateTo
        src={`/${CHAIN_TO_NETWORK[yieldDTFChainId]}/token/${yieldDTFAddress}/${ROUTES.OVERVIEW}`}
      />
    </div>
  )
}

export const IndexDTFAction = ({
  indexDTFChainId,
  indexDTFAddress,
}: {
  indexDTFChainId: number
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
      <NavigateTo
        src={`/${indexDTFChainId}/index-dtf/${indexDTFAddress}/${ROUTES.OVERVIEW}`}
      />
    </div>
  )
}

export const LockWithdrawAction = ({ token, lockId }: Lock) => {
  const { data: unstakingManagerAddress } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingManager',
    address: token.address,
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const write = () => {
    if (!unstakingManagerAddress) return

    writeContract({
      abi: dtfIndexUnstakingManager,
      functionName: 'claimLock',
      address: unstakingManagerAddress,
      args: [lockId],
    })
  }

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  const loading = !receipt && (isPending || !!hash || (hash && !receipt))

  return (
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
  )
}

export const CancelLockAction = ({ token, lockId, unlockTime }: Lock) => {
  const { data: unstakingManagerAddress } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingManager',
    address: token.address,
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const write = () => {
    if (!unstakingManagerAddress) return

    writeContract({
      abi: dtfIndexUnstakingManager,
      functionName: 'cancelLock',
      address: unstakingManagerAddress,
      args: [lockId],
    })
  }

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
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
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Rewards</span> $
      </div>
      <ChevronRight className="h-4 w-4" />
    </div>
  )
}
