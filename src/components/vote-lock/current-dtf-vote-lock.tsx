import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import {
  useCurrentIndexDtf,
  useIndexDtfVoteLockState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect, type ReactNode } from 'react'
import type { StTokenExtended, VoteLockTab } from './atoms'
import { VoteLockDrawer } from './drawer'
import { useCurrentDtfVoteLockRefresh } from './hooks/use-vote-lock-refresh'
import { isSameAddress } from './utils'

export const CurrentDtfVoteLock = ({
  children,
  initialTab,
}: {
  children?: ReactNode
  initialTab?: VoteLockTab
}) => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const stToken = dtf?.stToken
    ? ({
        ...dtf.stToken,
        chainId: dtf.chainId,
        dtfAddress: dtf.id,
      } as StTokenExtended)
    : undefined
  const params =
    account && dtf?.id
      ? { address: dtf.id, chainId: dtf.chainId, account }
      : undefined
  const { data: voteLockState, refetch } = useIndexDtfVoteLockState(params)
  const { refetch: refetchDtf } = useCurrentIndexDtf({ enabled: false })
  const isVaultOutOfSync =
    !!stToken &&
    !!voteLockState &&
    !isSameAddress(voteLockState.stToken, stToken.id)

  // The DTF is read once per session, so it can keep a replaced vault; the state read follows the new one.
  useEffect(() => {
    if (!isVaultOutOfSync) return

    void refetchDtf()
    void refetch()
  }, [isVaultOutOfSync, refetchDtf, refetch])

  const refresh = useCurrentDtfVoteLockRefresh({
    account,
    dtfAddress: dtf?.id,
    stToken: stToken?.id,
    chainId: stToken?.chainId,
    refetch: () => void refetch(),
  })

  if (!stToken) return null

  return (
    <VoteLockDrawer
      stToken={stToken}
      voteLockState={voteLockState}
      isOptimisticGovernance={!!stToken.governance?.isOptimistic}
      initialTab={initialTab}
      onRefresh={refresh}
    >
      {children}
    </VoteLockDrawer>
  )
}
