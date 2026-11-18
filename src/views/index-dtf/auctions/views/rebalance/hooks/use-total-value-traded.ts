import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { formatUnits } from 'viem'
import { rebalanceAuctionsAtom } from '../atoms'
import useRebalanceParams from './use-rebalance-params'

type TradedBid = {
  sellToken: { address: string; decimals: number }
  sellAmount: string
}

// Prices are keyed by lowercase address; SDK-mapped bid tokens are checksummed.
export const getTotalValueTraded = (
  auctions: readonly { bids: readonly TradedBid[] }[],
  prices: Record<string, { currentPrice: number } | undefined>
) =>
  auctions.reduce(
    (acc, auction) =>
      acc +
      auction.bids.reduce((acc, bid) => {
        const price = prices[bid.sellToken.address.toLowerCase()]
        const sellAmount = Number(
          formatUnits(BigInt(bid.sellAmount), bid.sellToken.decimals)
        )

        if (!price || sellAmount === 0) return acc

        return acc + price.currentPrice * sellAmount
      }, 0),
    0
  )

/**
 * Hook to calculate total value traded from auction bids
 * @returns Total USD value of all trades executed in the rebalance
 */
export const useTotalValueTraded = () => {
  const rebalanceParams = useRebalanceParams()
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  return useMemo(() => {
    if (!rebalanceParams || auctions.length === 0) return 0

    return getTotalValueTraded(auctions, rebalanceParams.prices)
  }, [rebalanceParams, auctions])
}

export default useTotalValueTraded
