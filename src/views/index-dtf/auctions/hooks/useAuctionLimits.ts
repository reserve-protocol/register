import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Auction } from '@/lib/index-rebalance/types'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue } from 'jotai'
import { Address, parseEther, parseUnits } from 'viem'
import { useReadContract } from 'wagmi'
import {
  AssetTrade,
  dtfTradesByProposalMapAtom,
  proposedBasketAtom,
  expectedBasketAtom,
  selectedProposalAtom,
  VOLATILITY_VALUES,
  VOLATILITY_OPTIONS,
} from '../atoms'
import { useMemo } from 'react'
import { getBasketTrackingDTF } from '@/lib/index-rebalance/get-basket-by-trades'

const currentProposalAuctionsAtom = atom<Auction[] | undefined>((get) => {
  const proposal = get(selectedProposalAtom)
  const proposals = get(dtfTradesByProposalMapAtom)

  if (!proposal || !proposals) return undefined

  return (
    proposals[proposal]?.trades.map((trade: AssetTrade) => ({
      sell: trade.sell.address,
      buy: trade.buy.address,
      sellLimit: {
        spot: trade.sellLimitSpot,
        low: trade.sellLimitLow,
        high: trade.sellLimitHigh,
      },
      buyLimit: {
        spot: trade.buyLimitSpot,
        low: trade.buyLimitLow,
        high: trade.buyLimitHigh,
      },
      prices: {
        start: trade.startPrice,
        end: trade.endPrice,
      },
      availableRuns: trade.availableRuns,
    })) ?? undefined
  )
})

const useAuctionLimits = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const currentProposalAuctions = useAtomValue(currentProposalAuctionsAtom)
  const proposedBasket = useAtomValue(proposedBasketAtom)
  const expectedBasket = useAtomValue(expectedBasketAtom)
  const { data: assetDistribution } = useReadContract({
    abi: dtfIndexAbi,
    address: indexDTF?.id,
    functionName: 'toAssets',
    args: [parseEther('1'), 0],
    chainId,
    query: {
      select: (data) => {
        const [assets, amounts] = data

        return assets.reduce(
          (acc, asset, index) => {
            acc[asset.toLowerCase()] = amounts[index]
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })

  return useMemo(() => {
    if (
      !assetDistribution ||
      !currentProposalAuctions ||
      !proposedBasket ||
      !expectedBasket
    )
      return undefined

    const volatility = VOLATILITY_VALUES[VOLATILITY_OPTIONS.LOW]
    let basketDetails = Object.values(proposedBasket.basket).reduce(
      (acc, asset) => {
        acc.tokens.push(asset.token.address)
        acc.decimals.push(BigInt(asset.token.decimals))
        acc.targetBasket.push(parseUnits(asset.targetShares, 16))
        acc.prices.push(
          expectedBasket?.basket?.[asset.token.address]?.price || asset.price
        )
        acc.priceError.push(volatility)

        return acc
      },
      {
        tokens: [],
        decimals: [],
        targetBasket: [],
        prices: [],
        priceError: [],
      } as {
        tokens: Address[]
        decimals: bigint[]
        targetBasket: bigint[]
        prices: number[]
        priceError: number[]
      }
    )

    const amounts = basketDetails.tokens.map(
      (token) => assetDistribution[token.toLowerCase()] || 0n
    )

    const targetBasket = getBasketTrackingDTF(
      currentProposalAuctions,
      basketDetails.tokens,
      amounts,
      basketDetails.decimals,
      basketDetails.prices
    )

    return { basketDetails, targetBasket }
  }, [
    assetDistribution,
    currentProposalAuctions,
    proposedBasket,
    expectedBasket,
  ])
}

export default useAuctionLimits
