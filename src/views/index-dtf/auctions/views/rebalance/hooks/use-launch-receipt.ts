import {
  dtfQueryKeys,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { currentRebalanceAtom } from '../../../atoms'
import { refreshNonceAtom } from '../atoms'

// After a launch receipt: refresh the RPC-backed state first (latest auction,
// current rebalance) so the ongoing gate flips from chain truth, then the
// indexed history; `onSettled` fires once those refetches resolve.
const useLaunchReceipt = (isSuccess: boolean, onSettled: () => void) => {
  const identity = useIndexDtfIdentity()
  const rebalance = useAtomValue(currentRebalanceAtom)
  const setRefreshNonce = useSetAtom(refreshNonceAtom)
  const queryClient = useQueryClient()
  const rebalanceId = rebalance?.rebalance.id

  useEffect(() => {
    if (!isSuccess) return

    const live = [
      dtfQueryKeys.index.latestAuction(identity),
      dtfQueryKeys.index.currentRebalance(identity),
    ]
    const history = [
      dtfQueryKeys.index.rebalances(identity),
      ...(rebalanceId
        ? [
            dtfQueryKeys.index.rebalanceAuctions({
              chainId: identity.chainId,
              rebalanceId,
            }),
          ]
        : []),
    ]

    void Promise.all(
      live.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
    ).finally(() => {
      onSettled()
      // v4 keeps wagmi reads keyed on this nonce; history refetches on it too.
      setRefreshNonce((nonce) => nonce + 1)
      history.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey })
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])
}

export default useLaunchReceipt
