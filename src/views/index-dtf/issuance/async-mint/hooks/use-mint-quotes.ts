import { chainIdAtom, walletAtom } from '@/state/atoms'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Address } from 'viem'
import { getCowswapQuote } from '../../async-swaps/hooks/useQuote'
import { useGlobalProtocolKit } from '../../async-swaps/providers/GlobalProtocolKitProvider'
import {
  collateralAllocationAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintQuotesAtom,
  quotesTimestampAtom,
} from '../atoms'
import { QuoteResult } from '../types'

export function useMintQuotes() {
  const address = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const allocation = useAtomValue(collateralAllocationAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const quotes = useAtomValue(mintQuotesAtom)
  const setQuotes = useSetAtom(mintQuotesAtom)
  const setQuotesTimestamp = useSetAtom(quotesTimestampAtom)
  const { orderBookApi } = useGlobalProtocolKit()
  const queryClient = useQueryClient()

  // Only request quotes for tokens that need swaps
  const tokensNeedingSwap = Object.entries(allocation).filter(
    ([_, alloc]) => alloc.fromSwap > 0n
  )

  const query = useQuery({
    queryKey: [
      'async-mint/quotes',
      tokensNeedingSwap.map(([addr]) => addr),
      mintAmount,
    ],
    queryFn: async () => {
      if (!address || !orderBookApi || tokensNeedingSwap.length === 0) {
        return {}
      }

      const results: Record<Address, QuoteResult> = {}

      await Promise.all(
        tokensNeedingSwap.map(async ([tokenAddress, alloc]) => {
          try {
            const quote = await getCowswapQuote({
              sellToken: inputToken.address,
              buyToken: tokenAddress as Address,
              amount: alloc.fromSwap,
              address: address as Address,
              operation: 'mint',
              orderBookApi,
            })

            if (quote) {
              results[tokenAddress as Address] = {
                success: true,
                data: quote,
              }
            } else {
              results[tokenAddress as Address] = {
                success: false,
                error: 'Quote returned null',
              }
            }
          } catch (error) {
            results[tokenAddress as Address] = {
              success: false,
              error: String(error),
            }
          }
        })
      )

      return results
    },
    enabled: false, // Manual trigger via refetch
  })

  // Auto-commit query data to global state. Backwards compatibility for the
  // `processing` / `processing-v2` flows that call refetch() and expect the
  // quotes atom + timestamp to update as a side effect. The iteration
  // orchestrator (useQuoteIteration) also relies on this — it doesn't need to
  // call writeQuotes explicitly during normal convergence.
  useEffect(() => {
    if (!query.data) return
    setQuotes(query.data)
    setQuotesTimestamp(Date.now())
  }, [query.data, setQuotes, setQuotesTimestamp])

  // Imperative refetch that returns the quote map directly. The orchestrator
  // calls this between rounds and inspects the result before deciding whether
  // to continue iterating or stop.
  const refetch = useCallback(async (): Promise<Record<Address, QuoteResult>> => {
    const result = await query.refetch()
    return result.data ?? {}
  }, [query])

  // Manually commit a quote set + timestamp. Used by the orchestrator to
  // restore a previous feasible round when the current round fails or the
  // iteration cap is hit without convergence.
  const writeQuotes = useCallback(
    (next: Record<Address, QuoteResult>) => {
      setQuotes(next)
      setQuotesTimestamp(Date.now())
    },
    [setQuotes, setQuotesTimestamp]
  )

  return {
    quotes,
    refetch,
    writeQuotes,
    cancel: () =>
      queryClient.cancelQueries({
        queryKey: ['async-mint/quotes'],
        exact: false,
      }),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
