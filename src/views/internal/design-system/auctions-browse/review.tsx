import { useLocation } from 'react-router-dom'
import { AuctionsRecordReview } from './record-review'
import { AuctionsHistoryReview } from './history-review'

export function AuctionsBrowseReview() {
  const { hash } = useLocation()
  return hash === '#auctions-records-review' ? (
    <AuctionsRecordReview />
  ) : (
    <AuctionsHistoryReview />
  )
}
