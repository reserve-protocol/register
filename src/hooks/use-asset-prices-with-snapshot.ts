import { chainIdAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Address } from 'viem'

export type TokenPriceWithSnapshot = Record<
  string,
  { currentPrice: number; snapshotPrice: number }
>

// The API returns `{ statusCode, message }` on error — reject bad shapes loud so prices never degrade to $0-everywhere.
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

const useAssetPricesWithSnapshot = (tokens: string[] | undefined) => {
  const chain = useAtomValue(chainIdAtom)

  return useQuery({
    queryKey: ['asset-price-with-snapshot', tokens, chain],
    queryFn: async () => {
      if (!tokens) return {}

      const currentPricesUrl = `${RESERVE_API}current/prices?chainId=${chain}&tokens=${tokens.join(',')}`
      const currentPricesBody: unknown = await fetch(currentPricesUrl).then(
        (res) => res.json()
      )

      return parseCurrentPricesResponse(currentPricesBody)
    },
    enabled: Boolean(tokens?.length && chain),
  })
}

export default useAssetPricesWithSnapshot
