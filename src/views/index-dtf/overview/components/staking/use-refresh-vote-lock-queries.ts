import { indexDTFAtom } from '@/state/dtf/atoms'
import { dtfQueryKeys } from '@reserve-protocol/react-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import type { Address } from 'viem'
import type { StTokenExtended } from './atoms'

export const VOTE_LOCK_SUBGRAPH_REFRESH_DELAY = 10_000

const isSameAddress = (left?: string, right?: string) =>
  !!left && !!right && left.toLowerCase() === right.toLowerCase()

const useRefreshVoteLockQueries = ({
  account,
  stToken,
}: {
  account: Address | null | undefined
  stToken: StTokenExtended | undefined
}) => {
  const queryClient = useQueryClient()
  const currentDtf = useAtomValue(indexDTFAtom)
  const currentChainId = currentDtf?.chainId
  const currentStToken = currentDtf?.stToken?.id
  const stTokenChainId = stToken?.chainId
  const stTokenAddress = stToken?.id
  const isCurrentIndexDtfStToken =
    currentChainId === stTokenChainId &&
    isSameAddress(currentStToken, stTokenAddress)

  const invalidateCurrentVoteLockRpcQueries = useCallback(() => {
    if (
      !isCurrentIndexDtfStToken ||
      !currentChainId ||
      !currentStToken ||
      !account
    ) {
      return
    }

    void queryClient.invalidateQueries({
      queryKey: dtfQueryKeys.index.governance.voterState({
        chainId: currentChainId,
        stToken: currentStToken,
        account,
      }),
    })
  }, [
    account,
    currentChainId,
    currentStToken,
    isCurrentIndexDtfStToken,
    queryClient,
  ])

  const invalidateCurrentVoteLockSubgraphQueries = useCallback(() => {
    if (!isCurrentIndexDtfStToken || !currentChainId || !currentStToken) return

    // WHY: delegate lists/counts are subgraph-backed, so wait for indexing.
    void queryClient.invalidateQueries({
      queryKey: dtfQueryKeys.index.governance.delegates({
        chainId: currentChainId,
        stToken: currentStToken,
      }),
    })
  }, [currentChainId, currentStToken, isCurrentIndexDtfStToken, queryClient])

  const scheduleCurrentVoteLockSubgraphRefresh = useCallback(() => {
    if (!isCurrentIndexDtfStToken) return

    window.setTimeout(
      invalidateCurrentVoteLockSubgraphQueries,
      VOTE_LOCK_SUBGRAPH_REFRESH_DELAY
    )
  }, [invalidateCurrentVoteLockSubgraphQueries, isCurrentIndexDtfStToken])

  return {
    invalidateCurrentVoteLockRpcQueries,
    scheduleCurrentVoteLockSubgraphRefresh,
  }
}

export default useRefreshVoteLockQueries
