import { RESERVE_API } from '@/utils/constants'
import { ChainId } from '@/utils/chains'
import type { ZapResult } from '@reserve-protocol/react-zapper'
import { useQuery } from '@tanstack/react-query'

type PcsxQuoteResponse = {
  status: 'success' | 'error'
  result?: { available: boolean; amountOut?: string }
}

// Indicative PCSX (PancakeSwap X) quote for the pair/amount the zapper just
// quoted. Resolves to the raw amountOut, or undefined while loading or when
// PCSX can't price the pair (it only quotes BSC pairs with an RWA-program
// token, which covers the AI DTFs).
export const usePcsxAmountOut = (
  chain: number,
  quote: Pick<ZapResult, 'tokenIn' | 'tokenOut' | 'amountIn'> | undefined
): string | undefined => {
  const { data } = useQuery({
    queryKey: [
      'pcsx-quote',
      chain,
      quote?.tokenIn,
      quote?.tokenOut,
      quote?.amountIn,
    ],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        chainId: String(chain),
        tokenIn: quote!.tokenIn,
        tokenOut: quote!.tokenOut,
        amountIn: quote!.amountIn,
      })
      const response = await fetch(`${RESERVE_API}pcsx/quote?${params}`, {
        signal,
      })
      if (!response.ok) {
        throw new Error(`PCSX quote failed (${response.status})`)
      }
      return (await response.json()) as PcsxQuoteResponse
    },
    enabled: chain === ChainId.BSC && !!quote,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  return data?.result?.available ? data.result.amountOut : undefined
}
