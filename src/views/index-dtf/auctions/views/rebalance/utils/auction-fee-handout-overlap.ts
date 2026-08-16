const DAY = 24 * 60 * 60
const AUCTION_WARMUP = 30

// Folio accounts TVL fees at UTC-day boundaries and auctions have a 30s warmup.
export const wouldAuctionOverlapFeeHandout = (
  currentTimestamp: number,
  auctionLength: number
) => {
  const nextFeeHandout = (Math.floor(currentTimestamp / DAY) + 1) * DAY
  const auctionEnd = currentTimestamp + AUCTION_WARMUP + auctionLength

  return auctionEnd >= nextFeeHandout
}
