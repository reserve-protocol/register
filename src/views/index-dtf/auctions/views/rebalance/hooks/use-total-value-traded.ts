import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { formatUnits } from 'viem'
import { rebalanceAuctionsAtom } from '../atoms'
import useRebalanceParams from './use-rebalance-params'

/**
 * Hook to calculate total value traded from auction bids
 * @returns Total USD value of all trades executed in the rebalance
 */
export const useTotalValueTraded = () => {
  const rebalanceParams = useRebalanceParams()
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  return useMemo(() => {
    if (!rebalanceParams || auctions.length === 0) return 0

    const { prices } = rebalanceParams

    const totalValueTraded = auctions.reduce((acc, auction) => {
      return (
        acc +
        auction.bids.reduce((acc, bid) => {
          const price = prices[bid.sellToken.address]
          const sellAmount = Number(
            formatUnits(BigInt(bid.sellAmount), bid.sellToken.decimals)
          )

          if (!price || sellAmount === 0) return acc

          return acc + price.currentPrice * sellAmount
        }, 0)
      )
    }, 0)

    return totalValueTraded
  }, [rebalanceParams, auctions])
}

export default useTotalValueTraded