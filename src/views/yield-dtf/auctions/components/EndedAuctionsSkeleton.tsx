import { Trans } from '@lingui/macro'

const EndedAuctionsSkeleton = () => {
  return (
    <div className="border border-dashed border-border text-center rounded-2xl p-6">
      <span className="text-legend">
        <Trans>No ended auctions</Trans>
      </span>
    </div>
  )
}

export default EndedAuctionsSkeleton
