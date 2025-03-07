import { getBasketPortion } from '@/lib/index-rebalance/utils'
import { IndexAuction, Token } from '@/types'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address } from 'viem'
import { SnapshotBasket } from './useSnapshotBasket'
import useTokensInfo from './useTokensInfo'

interface TokenPrice {
  address: Address
  price?: number
}

type HistoricalPriceResponse = {
  address: string
  timeseries: {
    price: number
    timestamp: number
  }[]
}

// TODO: Duplicated types

type EstimatedBasketAsset = {
  token: Token
  price: number
  currentShares: string
  targetShares: string
  delta: number
}

type SimulatedBasket = Record<string, EstimatedBasketAsset>

export type IndexAuctionSimulation = {
  price: number
  basket: SimulatedBasket
  trades: OrganizedTrades
}

type ProposedTradeWithMeta = IndexAuction & {
  index: number
  token: Token
  shares: number
}

type SellData = {
  token: Token
  amount: bigint
  percent: number
  shares: string
}

type IProposedTradeGroup = {
  sell: SellData
  trades: ProposedTradeWithMeta[]
}

type OrganizedTrades = Record<string, IProposedTradeGroup>

const getAssetPrices = async (
  tokens: string[],
  chain: number,
  timestamp?: number
): Promise<Record<string, number>> => {
  if (!tokens) return {}

  if (!timestamp) {
    const url = `${RESERVE_API}current/prices?chainId=${chain}&tokens=${tokens.join(',')}`
    const response = await fetch(url)
    const data = await response.json()
    return (data as TokenPrice[]).reduce(
      (acc, token) => {
        acc[token.address] = token.price ?? 0
        return acc
      },
      {} as Record<string, number>
    )
  }

  // from is timestamp - 1 hour
  const from = Number(timestamp) - 1 * 60 * 60
  const to = Number(timestamp) + 1 * 60 * 60
  const baseUrl = `${RESERVE_API}historical/prices?chainId=${chain}&from=${from}&to=${to}&interval=1h&address=`
  const calls = tokens.map((token) =>
    fetch(`${baseUrl}${token}`).then((res) => res.json())
  )

  const response = await (<Promise<HistoricalPriceResponse[]>>(
    Promise.all(calls)
  ))

  return tokens.reduce(
    (acc, token, index) => {
      const tokenResponse = response[index]
      const price =
        tokenResponse.timeseries.length === 0
          ? { price: 0 }
          : tokenResponse.timeseries[
              Math.floor(tokenResponse.timeseries.length / 2)
            ]
      acc[token] = price.price
      return acc
    },
    {} as Record<string, number>
  )
}

export const useAssetPrices = (
  tokens?: string[],
  chain?: number,
  timestamp?: number
) => {
  return useQuery({
    queryKey: ['asset-price', tokens, chain, timestamp],
    queryFn: () => getAssetPrices(tokens ?? [], chain ?? 0, timestamp),
    enabled: Boolean(tokens?.length && chain),
  })
}

const useMissingTokens = (basket?: SnapshotBasket, trades?: IndexAuction[]) => {
  return useMemo(() => {
    if (!basket || !trades) return undefined

    const currentTokens = new Set(
      basket.basket.map((token) => token.address.toLowerCase())
    )
    const missingTokenSet = new Set<string>()

    trades.forEach((trade) => {
      if (!currentTokens.has(trade.sell.toLowerCase())) {
        missingTokenSet.add(trade.sell.toLowerCase())
      }
      if (!currentTokens.has(trade.buy.toLowerCase())) {
        missingTokenSet.add(trade.buy.toLowerCase())
      }
    })

    return [...missingTokenSet]
  }, [basket, trades])
}

type TokenWithPrice = Token & {
  price: number
}

const useNewAssets = (
  basket?: SnapshotBasket,
  trades?: IndexAuction[],
  chain?: number,
  timestamp?: number
): TokenWithPrice[] | undefined => {
  const missingTokens = useMissingTokens(basket, trades)
  const { data: prices } = useAssetPrices(missingTokens, chain, timestamp)
  const { data: newTokensInfo } = useTokensInfo(missingTokens ?? [])

  return useMemo(() => {
    // Default case no missing tokens
    if (missingTokens?.length === 0) return []
    // Default case missing tokens but no prices or new tokens info
    if (!missingTokens || !prices || !newTokensInfo) return undefined

    return missingTokens.map((token) => ({
      ...newTokensInfo[token],
      price: prices[token],
    }))
  }, [missingTokens, prices, newTokensInfo])
}

const useSimulatedBasket = (
  basket?: SnapshotBasket,
  trades?: IndexAuction[],
  chain?: number,
  timestamp?: number
) => {
  const newAssets = useNewAssets(basket, trades, chain, timestamp)

  return useMemo(() => {
    // Initial check
    if (!basket || !trades || !newAssets) return undefined

    const dtfPrice = basket.price
    const allPrices = {
      ...(basket.basket.reduce(
        (acc, price) => {
          acc[price.address.toLowerCase()] = price.price ?? 0
          return acc
        },
        {} as Record<string, number>
      ) ?? {}),
      ...(newAssets?.reduce(
        (acc, asset) => {
          acc[asset.address.toLowerCase()] = asset.price ?? 0
          return acc
        },
        {} as Record<string, number>
      ) ?? {}),
    }
    // TODO: Missing name for snapshot basket
    const allTokens = {
      ...basket.basket.reduce(
        (acc, token) => {
          acc[token.address.toLowerCase()] = { ...token, name: token.symbol }
          return acc
        },
        {} as Record<string, Token>
      ),
      ...newAssets.reduce(
        (acc, asset) => {
          acc[asset.address.toLowerCase()] = asset
          return acc
        },
        {} as Record<string, Token>
      ),
    }
    const shares = basket.basket.reduce(
      (acc, token) => {
        acc[token.address.toLowerCase()] = token.weight
        return acc
      },
      {} as Record<string, string>
    )

    // Create initial estimated basket
    const estimatedBasket = Object.entries(allTokens).reduce(
      (acc, [address, token]) => {
        acc[address.toLowerCase()] = {
          token: {
            ...token,
            address: token.address.toLowerCase() as Address,
          },
          price: allPrices[address.toLowerCase()],
          currentShares: shares[address.toLowerCase()] ?? '0',
          targetShares: shares[address.toLowerCase()] ?? '0',
          delta: 0,
        }
        return acc
      },
      {} as SimulatedBasket
    )

    // Track already substracted tokens "up to" shares
    const substractedMap = new Set<string>()

    // Create organized trades by sell token
    // Group trades by sell token
    const organizedTrades = trades.reduce((acc, trade, index) => {
      const sellAddress = trade.sell.toLowerCase()
      const buyAddress = trade.buy.toLowerCase()

      if (!acc[sellAddress]) {
        acc[sellAddress] = {
          trades: [],
          sell: {
            token: estimatedBasket[sellAddress].token,
            amount: 0n,
            percent: 0,
            shares: estimatedBasket[sellAddress].currentShares,
          },
        }
      }

      const sellTokenShares =
        getBasketPortion(
          trade.sellLimit.spot,
          BigInt(estimatedBasket[sellAddress].token.decimals),
          allPrices[sellAddress],
          dtfPrice
        )[0] * 100
      const buyTokenShares =
        getBasketPortion(
          trade.buyLimit.spot,
          BigInt(estimatedBasket[buyAddress].token.decimals),
          allPrices[buyAddress],
          dtfPrice
        )[0] * 100

      acc[sellAddress].trades.push({
        ...trade,
        index,
        token: estimatedBasket[buyAddress].token,
        shares:
          buyTokenShares - Number(estimatedBasket[buyAddress].currentShares),
      })
      acc[sellAddress].sell.amount += trade.sellLimit.spot
      acc[sellAddress].sell.percent = sellTokenShares

      if (!substractedMap.has(sellAddress)) {
        estimatedBasket[sellAddress].targetShares = sellTokenShares.toFixed(2)
        estimatedBasket[sellAddress].delta =
          Number(estimatedBasket[sellAddress].targetShares) -
          Number(estimatedBasket[sellAddress].currentShares)
        substractedMap.add(sellAddress)
      }

      if (!substractedMap.has(buyAddress)) {
        estimatedBasket[buyAddress].targetShares = buyTokenShares.toFixed(2)
        estimatedBasket[buyAddress].delta =
          Number(estimatedBasket[buyAddress].targetShares) -
          Number(estimatedBasket[buyAddress].currentShares)
        substractedMap.add(buyAddress)
      }

      return acc
    }, {} as OrganizedTrades)

    return {
      price: dtfPrice,
      basket: (() => {
        // Calculate the sum of all targetShares
        const targetSharesSum = Object.values(estimatedBasket).reduce(
          (sum, item) =>
            sum + (item.targetShares ? Number(item.targetShares) : 0),
          0
        )

        // Calculate the difference from 100%
        const diff = 100 - targetSharesSum

        if (Math.abs(diff) > 0.01) {
          // Only adjust if difference is significant
          // Find all items with changed delta
          const changedItems = Object.entries(estimatedBasket).filter(
            ([_, item]) => item.delta !== 0 && item.targetShares
          )

          if (changedItems.length > 0) {
            // Sort by targetShares in descending order
            changedItems.sort(
              (a, b) => Number(b[1].targetShares) - Number(a[1].targetShares)
            )

            // Find the item with the largest targetShare that can absorb the adjustment
            let adjustedItem = changedItems[0]

            for (const [address, item] of changedItems) {
              const currentTarget = Number(item.targetShares)
              // Ensure we don't make any share negative
              if ((diff < 0 && currentTarget > Math.abs(diff)) || diff > 0) {
                adjustedItem = [address, item]
                break
              }
            }

            const [adjustAddress, adjustItem] = adjustedItem
            const newTargetValue = Number(adjustItem.targetShares) + diff

            // Ensure we don't go below zero
            const finalTargetValue = Math.max(0, newTargetValue)

            // If we couldn't adjust fully with one item, distribute among others
            const remainingDiff =
              newTargetValue < 0 ? Math.abs(newTargetValue) : 0

            // Update the adjusted item
            estimatedBasket[adjustAddress].targetShares =
              finalTargetValue.toFixed(2)
            estimatedBasket[adjustAddress].delta =
              finalTargetValue -
              Number(estimatedBasket[adjustAddress].currentShares)

            // Distribute any remaining difference if needed
            if (remainingDiff > 0) {
              const otherItems = changedItems.filter(
                ([addr]) => addr !== adjustAddress
              )
              if (otherItems.length > 0) {
                const adjustPerItem = remainingDiff / otherItems.length
                for (const [addr, item] of otherItems) {
                  const newValue = Number(item.targetShares) - adjustPerItem
                  estimatedBasket[addr].targetShares = newValue.toFixed(2)
                  estimatedBasket[addr].delta =
                    newValue - Number(estimatedBasket[addr].currentShares)
                }
              }
            }
          }
        }

        return estimatedBasket
      })(),
      trades: organizedTrades,
    }
  }, [basket, trades, newAssets])
}

export default useSimulatedBasket
