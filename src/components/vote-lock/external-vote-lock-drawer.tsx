import { walletAtom } from '@/state/atoms'
import {
  useIndexDtf,
  useIndexDtfVoteLockState,
  useIndexDtfVoteLockVaultState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import type { Address } from 'viem'
import { VoteLockDrawer, type VoteLockDrawerProps } from './drawer'
import { useExternalVoteLockRefresh } from './hooks/use-vote-lock-refresh'

export const ExternalVoteLockDrawer = ({
  stToken,
  dtfAddress,
  open,
  onOpenChange,
  onClose,
  initialTab,
}: VoteLockDrawerProps & { dtfAddress?: Address }) => {
  const account = useAtomValue(walletAtom)
  const dtfParams =
    account && dtfAddress
      ? { address: dtfAddress, chainId: stToken.chainId, account }
      : undefined
  const dtfQueryParams = dtfAddress
    ? { address: dtfAddress, chainId: stToken.chainId }
    : undefined
  const { data: dtf } = useIndexDtf(dtfQueryParams)
  const {
    data: dtfVoteLockState,
    isError: isDtfVoteLockStateError,
    refetch,
  } = useIndexDtfVoteLockState(dtfParams)
  const isFallbackStateEnabled = !dtfAddress || isDtfVoteLockStateError
  const fallbackState = useIndexDtfVoteLockVaultState(
    isFallbackStateEnabled && account
      ? { chainId: stToken.chainId, stToken: stToken.id, account }
      : undefined
  )
  const voteLockState = dtfVoteLockState ?? fallbackState.data
  const isOptimisticGovernance =
    !!dtf?.voteLockVault?.governance?.isOptimistic ||
    !!stToken.governance?.isOptimistic ||
    voteLockState?.optimisticDelegate != null ||
    voteLockState?.optimisticVotingPower != null
  const refresh = useExternalVoteLockRefresh({
    dtfParams,
    stToken: stToken.id,
    isFallbackEnabled: isFallbackStateEnabled,
    refetchDtfState: () => void refetch(),
    refetchFallbackState: () => void fallbackState.refetch(),
  })

  return (
    <VoteLockDrawer
      stToken={{
        ...stToken,
        ...(isOptimisticGovernance
          ? { governance: { isOptimistic: true } }
          : {}),
      }}
      voteLockState={voteLockState}
      isOptimisticGovernance={isOptimisticGovernance}
      onRefresh={refresh}
      open={open}
      onOpenChange={onOpenChange}
      onClose={onClose}
      initialTab={initialTab}
    />
  )
}
