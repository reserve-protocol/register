import {
  useIndexDtfIdentity,
  useIndexDtfRebalanceAuctions,
  type IndexDtfAuction,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { currentRebalanceAtom } from '../../../atoms'
import { toAuction } from '../../../utils/sdk-mappers'
import { refreshNonceAtom } from '../atoms'
import { isRebalanceOngoing } from '../utils'

const AUCTIONS_POLL_MS = 30_000

// Stable identity so React Query memoizes the selection (inline selects loop the atom sync).
const selectAuctions = (auctions: readonly IndexDtfAuction[]) =>
  auctions.map(toAuction).sort((a, b) => +a.endTime - +b.endTime)

const useRebalanceAuctions = () => {
  const { chainId } = useIndexDtfIdentity()
  const rebalance = useAtomValue(currentRebalanceAtom)
  const refreshNonce = useAtomValue(refreshNonceAtom)
  const rebalanceId = rebalance?.rebalance.id
  const availableUntil = rebalance?.rebalance.availableUntil

  const query = useIndexDtfRebalanceAuctions(
    rebalanceId ? { chainId, rebalanceId } : undefined,
    {
      select: selectAuctions,
      // Only poll while the rebalance window is open; stop on completed/historical.
      refetchInterval: () =>
        isRebalanceOngoing(availableUntil, Math.floor(Date.now() / 1000))
          ? AUCTIONS_POLL_MS
          : false,
    }
  )

  const { refetch } = query
  useEffect(() => {
    if (refreshNonce > 0) refetch()
  }, [refreshNonce, refetch])

  return query
}

export default useRebalanceAuctions
