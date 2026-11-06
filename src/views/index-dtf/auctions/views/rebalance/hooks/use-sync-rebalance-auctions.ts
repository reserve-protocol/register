import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { type Auction, rebalanceAuctionsAtom, refreshNonceAtom } from '../atoms'

// A refresh that finds no new bids keeps React Query's reference, so publish a new array
// on every refresh: the active-auction atom reads the clock only when its input changes.
export const useSyncRebalanceAuctions = (data: Auction[] | undefined) => {
  const setRebalanceAuctions = useSetAtom(rebalanceAuctionsAtom)
  const refreshNonce = useAtomValue(refreshNonceAtom)

  useEffect(() => {
    if (data) setRebalanceAuctions([...data])
  }, [data, refreshNonce, setRebalanceAuctions])
}
