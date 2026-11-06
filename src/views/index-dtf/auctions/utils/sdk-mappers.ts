import type { Token } from '@/types'
import type {
  IndexDtfAuction,
  IndexDtfRebalance,
} from '@reserve-protocol/react-sdk'
import type { Rebalance } from '../atoms'
import type { Auction } from '../views/rebalance/atoms'

// The view keeps its string-typed subgraph shapes; the SDK owns the fetch.
const toStrings = (values: readonly bigint[]) => values.map(String)

const toToken = (token: IndexDtfRebalance['tokens'][number]): Token => ({
  address: token.address,
  name: token.name,
  symbol: token.symbol,
  decimals: token.decimals,
})

export const toRebalance = (rebalance: IndexDtfRebalance): Rebalance => ({
  id: rebalance.id,
  nonce: rebalance.nonce,
  tokens: rebalance.tokens.map(toToken),
  priceControl: rebalance.priceControl,
  weightLowLimit: toStrings(rebalance.weightLowLimit),
  weightSpotLimit: toStrings(rebalance.weightSpotLimit),
  weightHighLimit: toStrings(rebalance.weightHighLimit),
  rebalanceLowLimit: String(rebalance.rebalanceLimits.low),
  rebalanceSpotLimit: String(rebalance.rebalanceLimits.spot),
  rebalanceHighLimit: String(rebalance.rebalanceLimits.high),
  priceLowLimit: toStrings(rebalance.priceLowLimit),
  priceHighLimit: toStrings(rebalance.priceHighLimit),
  restrictedUntil: String(rebalance.restrictedUntil),
  availableUntil: String(rebalance.availableUntil),
  transactionHash: rebalance.transactionHash,
  blockNumber: String(rebalance.blockNumber),
  timestamp: String(rebalance.timestamp),
})

export const toAuction = (auction: IndexDtfAuction): Auction => ({
  id: auction.id,
  tokens: auction.tokens.map(toToken),
  weightLowLimit: toStrings(auction.weightLowLimit),
  weightSpotLimit: toStrings(auction.weightSpotLimit),
  weightHighLimit: toStrings(auction.weightHighLimit),
  rebalanceLowLimit: String(auction.rebalanceLimits.low),
  rebalanceSpotLimit: String(auction.rebalanceLimits.spot),
  rebalanceHighLimit: String(auction.rebalanceLimits.high),
  priceLowLimit: toStrings(auction.priceLowLimit),
  priceHighLimit: toStrings(auction.priceHighLimit),
  startTime: String(auction.startTime),
  endTime: String(auction.endTime),
  blockNumber: String(auction.blockNumber),
  timestamp: String(auction.timestamp),
  transactionHash: auction.transactionHash,
  bids: auction.bids.map((bid) => ({
    id: bid.id,
    bidder: bid.bidder,
    sellToken: toToken(bid.sellToken),
    buyToken: toToken(bid.buyToken),
    sellAmount: String(bid.sellAmount),
    buyAmount: String(bid.buyAmount),
    blockNumber: String(bid.blockNumber),
    timestamp: String(bid.timestamp),
    transactionHash: bid.transactionHash,
  })),
})
