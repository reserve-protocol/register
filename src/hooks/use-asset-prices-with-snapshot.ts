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

// WHY: the API returns a `{ statusCode, message }` object on error and can
// otherwise return a non-array; feeding either into `.reduce` throws an opaque
// error. Reject the bad shape loud (mirrors usePrices) so the rebalance price
// path never silently degrades into a $0-everywhere basket.
export function parseCurrentPricesResponse(
  body: unknown
): TokenPriceWithSnapshot {
  if (body && typeof body === 'object' && 'statusCode' in body) {
    throw new Error(
      (body as { message?: string }).message ?? 'Failed to fetch prices'
    )
  }
  if (!Array.isArray(body)) {
    throw new Error('Unexpected prices response shape')
  }

  return (body as { address: Address; price?: number }[]).reduce(
    (acc, token) => {
      const price = token.price ?? 0
      acc[token.address.toLowerCase()] = {
        currentPrice: price,
        snapshotPrice: price,
      }
      return acc
    },
    {} as TokenPriceWithSnapshot
  )
}

// WHY: same trust boundary as parseCurrentPricesResponse — a `{ statusCode }`
// or otherwise mis-shaped historical body must fail loud, never silently retain
// the current price as the snapshot. An empty (but well-formed) timeseries is a
// legitimate "no price at that time" → 0, which Z26 validates before the lib.
export function parseHistoricalSnapshotPrice(priceResult: unknown): number {
  if (
    priceResult &&
    typeof priceResult === 'object' &&
    'statusCode' in priceResult
  ) {
    throw new Error(
      (priceResult as { message?: string }).message ??
        'Failed to fetch historical prices'
    )
  }
  const timeseries = (priceResult as HistoricalPriceResponse | undefined)
    ?.timeseries
  if (!Array.isArray(timeseries)) {
    throw new Error('Unexpected historical prices response shape')
  }
  if (timeseries.length === 0) return 0
  return timeseries[Math.floor(timeseries.length / 2)].price
}

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
      const currentPricesBody: unknown = await fetch(currentPricesUrl).then(
        (res) => res.json()
      )

      const result = parseCurrentPricesResponse(currentPricesBody)

      // TODO: No longer used!
      // Fetch snapshot prices if timestamp is provided
      if (timestamp) {
        // from is timestamp - 1 hour
        const from = Number(timestamp) - 1 * 60 * 60
        const to = Number(timestamp) + 1 * 60 * 60
        const baseUrl = `${RESERVE_API}historical/prices?chainId=${chain}&from=${from}&to=${to}&interval=1h&address=`
        const calls = tokens.map((token) =>
          fetch(`${baseUrl}${token}`).then((res) => res.json())
        )

        const response: unknown[] = await Promise.all(calls)

        for (const priceResult of response) {
          const price = parseHistoricalSnapshotPrice(priceResult)
          const address = (
            priceResult as HistoricalPriceResponse
          )?.address?.toLowerCase()
          if (!address || !result[address]) continue

          result[address] = {
            snapshotPrice: price,
            currentPrice: result[address].currentPrice,
          }
        }
      }

      return result
    },
    enabled: Boolean(tokens?.length && chain),
  })
}

export default useAssetPricesWithSnapshot
