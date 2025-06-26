import dtfIndexAbi from '@/abis/dtf-index-abi'
import { getBasketTrackingDTF } from '@/lib/index-rebalance/get-basket-by-trades'
import { openAuction } from '@/lib/index-rebalance/open-auction'
import { Auction } from '@/lib/index-rebalance/types'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, erc20Abi, parseEther, parseUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { isUnitBasketAtom } from '../../governance/views/propose/basket/atoms'
import {
  AssetTrade,
  dtfTradesByProposalMapAtom,
  expectedBasketAtom,
  proposedBasketAtom,
  selectedProposalAtom,
  VOLATILITY_OPTIONS,
  VOLATILITY_VALUES,
} from '../atoms'

const currentProposalAuctionsAtom = atom<Auction[] | undefined>((get) => {
  const proposal = get(selectedProposalAtom)
  const proposals = get(dtfTradesByProposalMapAtom)

  if (!proposal || !proposals) return undefined

  return (
    proposals[proposal]?.trades.map((trade: AssetTrade) => ({
      sell: trade.sell.address,
      buy: trade.buy.address,
      sellLimit: {
        spot: trade.approvedSellLimitSpot,
        low: trade.sellLimitLow,
        high: trade.sellLimitHigh,
      },
      buyLimit: {
        spot: trade.approvedBuyLimitSpot,
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

const useProposalDtfSupply = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data: supply } = useReadContract({
    address: indexDTF?.id,
    abi: erc20Abi,
    functionName: 'totalSupply',
    args: [],
    chainId,
    query: {
      enabled: !!indexDTF?.id && !!chainId,
    },
  })

  return supply
}

const useAssetDistribution = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  return useReadContract({
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
}

const useAuctionLimits = (trade: AssetTrade, ejectFully: boolean) => {
  const proposedBasket = useAtomValue(proposedBasketAtom)
  const expectedBasket = useAtomValue(expectedBasketAtom)
  const dtfSupply = useProposalDtfSupply()
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const currentProposalAuctions = useAtomValue(currentProposalAuctionsAtom)
  const { data: assetDistribution } = useAssetDistribution()
  const isUnitBasket = useAtomValue(isUnitBasketAtom)

  return useMemo(() => {
    if (
      !dtfSupply ||
      !dtfPrice ||
      !proposedBasket ||
      !expectedBasket ||
      getCurrentTime() >= trade.launchTimeout + 5
    ) {
      return undefined
    }

    try {
      let { tokens, decimals, targetBasket, prices, priceError } =
        Object.values(proposedBasket.basket).reduce(
          (acc, asset) => {
            acc.tokens.push(asset.token.address)
            acc.decimals.push(BigInt(asset.token.decimals))
            acc.targetBasket.push(parseUnits(asset.targetShares, 16))
            acc.prices.push(
              expectedBasket?.basket?.[asset.token.address]?.price ||
                asset.price
            )
            acc.priceError.push(VOLATILITY_VALUES[VOLATILITY_OPTIONS.MEDIUM])

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

      // TODO: This is a temp hack to consider the unit basket case
      if (isUnitBasket && assetDistribution && currentProposalAuctions) {
        const amounts = tokens.map(
          (token) => assetDistribution[token.toLowerCase()] || 0n
        )

        targetBasket = getBasketTrackingDTF(
          currentProposalAuctions,
          tokens,
          amounts,
          decimals,
          prices
        )
      }

      const [sellLimit, buyLimit, startPrice, endPrice] = openAuction(
        {
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
        },
        {
          start: trade.approvedStartPrice,
          end: trade.approvedEndPrice,
        },
        dtfSupply,
        tokens,
        decimals,
        targetBasket,
        prices,
        priceError,
        proposedBasket.price,
        ejectFully
      )

      return {
        sellLimit,
        buyLimit,
        startPrice,
        endPrice,
      }
    } catch (e) {
      console.error('ERROR FETCHING TRADE LIMITS', e)
      return undefined
    }
  }, [
    trade,
    ejectFully,
    isUnitBasket,
    assetDistribution,
    currentProposalAuctions,
    proposedBasket,
    expectedBasket,
    dtfSupply,
    dtfPrice,
  ])
}

export default useAuctionLimits
