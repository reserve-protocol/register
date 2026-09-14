import { useLocation } from 'react-router-dom'
import { AuctionsRecordReview } from './record-review'
import { AuctionsHistoryReview } from './history-review'
import { CurrentTableReview } from '../auctions-current-table/review'

export function AuctionsBrowseReview() {
  const { hash } = useLocation()
  if (hash === '#auctions-current-table-review') return <CurrentTableReview />
  return hash === '#auctions-records-review' ? (
    <AuctionsRecordReview />
  ) : (
    <AuctionsHistoryReview />
  )
}
