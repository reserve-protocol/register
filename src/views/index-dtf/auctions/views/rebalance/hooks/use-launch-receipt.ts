import {
  dtfQueryKeys,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { currentRebalanceAtom } from '../../../atoms'
import { latestAuctionAtom, refreshNonceAtom } from '../atoms'

const RECONCILE_POLL_MS = 2_000
// A provider that never catches up must not lock the UI forever; the gate still
// reads chain state on the next poll.
const RECONCILE_TIMEOUT_MS = 90_000

// After a launch receipt: refresh the RPC-backed state and hold the launching
// state until the latest-auction read is at or past the receipt block, so a
// lagging provider cannot re-enable the button before it knows the new auction.
// v4 has no SDK read (latestAuction stays undefined) and settles immediately.
const useLaunchReceipt = (
  receiptBlock: bigint | undefined,
  onSettled: () => void
) => {
  const identity = useIndexDtfIdentity()
  const rebalance = useAtomValue(currentRebalanceAtom)
  const latestAuction = useAtomValue(latestAuctionAtom)
  const setRefreshNonce = useSetAtom(refreshNonceAtom)
  const queryClient = useQueryClient()
  const rebalanceId = rebalance?.rebalance.id
  const settledFor = useRef<bigint | undefined>(undefined)

  const liveKeys = () => [
    dtfQueryKeys.index.latestAuction(identity),
    dtfQueryKeys.index.currentRebalance(identity),
  ]

  useEffect(() => {
    if (receiptBlock === undefined) return
    settledFor.current = undefined
    liveKeys().forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptBlock])

  useEffect(() => {
    if (receiptBlock === undefined || settledFor.current === receiptBlock) return

    const caughtUp =
      latestAuction === undefined ||
      (latestAuction !== null && latestAuction.blockNumber >= receiptBlock)
    if (!caughtUp) {
      const poll = setTimeout(() => {
        liveKeys().forEach((queryKey) =>
          queryClient.refetchQueries({ queryKey })
        )
      }, RECONCILE_POLL_MS)
      return () => clearTimeout(poll)
    }

    settledFor.current = receiptBlock
    onSettled()
    setRefreshNonce((nonce) => nonce + 1)
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
    history.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptBlock, latestAuction])

  useEffect(() => {
    if (receiptBlock === undefined) return
    const timeout = setTimeout(() => {
      if (settledFor.current !== receiptBlock) {
        settledFor.current = receiptBlock
        onSettled()
      }
    }, RECONCILE_TIMEOUT_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptBlock])
}

export default useLaunchReceipt
