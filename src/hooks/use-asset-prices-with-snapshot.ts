import { chainIdAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Address } from 'viem'

type HistoricalPriceResponse = {
  address: string
  timeseries: {
    price: number
    timestamp: number
  }[]
}

export type TokenPriceWithSnapshot = Record<
  string,
  { currentPrice: number; snapshotPrice: number }
>

const useAssetPricesWithSnapshot = (
  tokens: string[] | undefined,
  timestamp?: number
) => {
  const chain = useAtomValue(chainIdAtom)

  return useQuery({
    queryKey: ['asset-price-with-snapshot', tokens, chain, timestamp ?? ''],
    queryFn: async () => {
      if (!tokens) return {}

      const currentPricesUrl = `${RESERVE_API}current/prices?chainId=${chain}&tokens=${tokens.join(',')}`
      const currentPrices: {
        address: Address
        price?: number
      }[] = await fetch(currentPricesUrl).then((res) => res.json())

      const result = currentPrices.reduce((acc, token) => {
        const price = token.price ?? 0
        acc[token.address.toLowerCase()] = {
          currentPrice: price,
          snapshotPrice: price,
        }
        return acc
      }, {} as TokenPriceWithSnapshot)

      // Fetch snapshot prices if timestamp is provided
      if (timestamp) {
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

        for (const priceResult of response) {
          const price =
            priceResult.timeseries.length === 0
              ? 0
              : priceResult.timeseries[
                  Math.floor(priceResult.timeseries.length / 2)
                ].price

          result[priceResult.address.toLowerCase()] = {
            snapshotPrice: price,
            currentPrice:
              result[priceResult.address.toLowerCase()].currentPrice,
          }
        }
      }

      return result
    },
    enabled: Boolean(tokens?.length && chain),
  })
}

export default useAssetPricesWithSnapshot
