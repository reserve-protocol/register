import { chainIdAtom, walletAtom } from '@/state/atoms'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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
  const [quotes, setQuotes] = useAtom(mintQuotesAtom)
  const setQuotesTimestamp = useSetAtom(quotesTimestampAtom)
  const { orderBookApi } = useGlobalProtocolKit()

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

      setQuotes(results)
      setQuotesTimestamp(Date.now())
      return results
    },
    enabled: false, // Manual trigger via refetch
  })

  return {
    quotes,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
