import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { ongoingDutchTradesAtom } from '../atoms'
import DutchAuction from './DutchAuction'
import OngoingAuctionsSkeleton from '@/views/yield-dtf/auctions/components/OngoingAuctionsSkeleton'

const OngoingDutchAuctions = () => {
  const trades = useAtomValue(ongoingDutchTradesAtom)

  return (
    <div className="mb-6">
      <span className="font-semibold ml-4 mb-4 block">
        <Trans>Ongoing dutch auctions</Trans>
      </span>
      {trades.map((trade) => (
        <DutchAuction key={trade.id} data={trade} />
      ))}
      {!trades.length && <OngoingAuctionsSkeleton />}
    </div>
  )
}

export default OngoingDutchAuctions
