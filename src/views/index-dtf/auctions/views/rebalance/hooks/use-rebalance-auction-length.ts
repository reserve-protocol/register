import { folioVersionAtom } from '@/state/dtf/atoms'
import {
  useIndexDtfIdentity,
  useIndexDtfMaxAuctionLength,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { AUCTION_POLL_MS } from './use-rebalance-current-data'

// Folio 6.0 openAuction carries a per-auction length; maxAuctionLength satisfies every price-control mode.
const useRebalanceAuctionLength = () => {
  const identity = useIndexDtfIdentity()
  const versionState = useAtomValue(folioVersionAtom)
  const isV6 = versionState.status === 'ready' && versionState.major === 6
  const { data, isError } = useIndexDtfMaxAuctionLength(
    isV6 && identity.address ? identity : undefined,
    {
      refetchInterval: (query) =>
        query.state.status === 'error' ? AUCTION_POLL_MS : false,
    }
  )

  return {
    auctionLength: isV6 ? data : undefined,
    isReady: !isV6 || (data !== undefined && !isError),
    isError: isV6 && isError,
  }
}

export default useRebalanceAuctionLength
