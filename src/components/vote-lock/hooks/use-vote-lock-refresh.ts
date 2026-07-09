import { useQueryClient } from '@tanstack/react-query'
import {
  dtfQueryKeys,
  indexDtfVoteLockStateQueryOptions,
  useDtfSdk,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import type { Address } from 'viem'

const EXTERNAL_API_REFRESH_DELAY = 10_000

type VoteLockStateParams = {
  address: Address
  chainId: SupportedChainId
  account: Address
}

export const useCurrentDtfVoteLockRefresh = ({
  account,
  dtfAddress,
  stToken,
  chainId,
  refetch,
}: {
  account: Address | null | undefined
  dtfAddress: Address | undefined
  stToken: Address | undefined
  chainId: SupportedChainId | undefined
  refetch: () => void
}) => {
  const sdk = useDtfSdk()
  const queryClient = useQueryClient()

  return () => {
    refetch()
    if (!account || !dtfAddress || !stToken || !chainId) return

    void queryClient.invalidateQueries({
      queryKey: indexDtfVoteLockStateQueryOptions(sdk, {
        address: dtfAddress,
        chainId,
        account,
      }).queryKey,
    })
    void queryClient.invalidateQueries({
      queryKey: dtfQueryKeys.index.governance.voterState({
        chainId,
        stToken,
        account,
      }),
    })
    window.setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: dtfQueryKeys.index.governance.delegates({
          chainId,
          stToken,
        }),
      })
    }, EXTERNAL_API_REFRESH_DELAY)
  }
}

export const useExternalVoteLockRefresh = ({
  dtfParams,
  stToken,
  isFallbackEnabled,
  refetchDtfState,
  refetchFallbackState,
}: {
  dtfParams: VoteLockStateParams | undefined
  stToken: Address | undefined
  isFallbackEnabled: boolean
  refetchDtfState: () => void
  refetchFallbackState: () => void
}) => {
  const sdk = useDtfSdk()
  const queryClient = useQueryClient()

  return () => {
    const refreshExternalApiData = () => {
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      void queryClient.invalidateQueries({ queryKey: ['vote-lock-positions'] })
    }

    if (dtfParams) {
      refetchDtfState()
      void queryClient.invalidateQueries({
        queryKey: indexDtfVoteLockStateQueryOptions(sdk, dtfParams).queryKey,
      })
      if (stToken) {
        void queryClient.invalidateQueries({
          queryKey: dtfQueryKeys.index.governance.voterState({
            chainId: dtfParams.chainId,
            stToken,
            account: dtfParams.account,
          }),
        })
      }
      if (isFallbackEnabled) {
        refetchFallbackState()
      }
    } else {
      refetchFallbackState()
    }

    refreshExternalApiData()
    window.setTimeout(refreshExternalApiData, EXTERNAL_API_REFRESH_DELAY)
  }
}
