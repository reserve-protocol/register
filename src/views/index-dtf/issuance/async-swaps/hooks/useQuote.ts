import { useERC20Balances } from '@/hooks/useERC20Balance'
import useTokensInfo from '@/hooks/useTokensInfo'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { safeParseEther } from '@/utils'
import {
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, zeroAddress } from 'viem'
import {
  asyncSwapInputAtom,
  currentAsyncSwapTabAtom,
  quotesAtom,
  selectedTokenOrDefaultAtom,
} from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'
import { QuoteProvider } from '../types'
import { useFolioDetails } from './useFolioDetails'

interface UseQuoteParams {
  sellToken: Token
  buyToken: Token
  amount: bigint
}

export function useQuote({ sellToken, buyToken, amount }: UseQuoteParams) {
  const indexDTF = useAtomValue(indexDTFAtom)
  const folioAddress = indexDTF?.id
  const zapDirection = useAtomValue(currentAsyncSwapTabAtom)
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(walletAtom)
  const setQuotes = useSetAtom(quotesAtom)

  const { orderBookApi } = useGlobalProtocolKit()

  return useQuery({
    queryKey: ['quote/single', sellToken, buyToken, amount, address],
    enabled: !!chainId && !!address && !!sellToken && !!buyToken,
    queryFn: async ({ signal }) => {
      if (
        !folioAddress ||
        !address ||
        address == zeroAddress ||
        buyToken.address == zeroAddress ||
        sellToken.address == zeroAddress ||
        !orderBookApi
      ) {
        throw new Error('useQuote: Invalid params')
      }

      // TODO: Add logic for "best quote" response between multiple providers.
      try {
        if (amount <= 0n) {
          throw new Error('useQuote: Amount is 0')
        }

        // TODO: Add appData here
        const quote = await orderBookApi.getQuote({
          sellToken: sellToken.address,
          buyToken: buyToken.address,
          from: address,
          receiver: address,
          validFor: 60 * 15, // 15 minutes
          priceQuality: PriceQuality.VERIFIED,
          ...(zapDirection === 'redeem'
            ? {
                kind: OrderQuoteSideKindSell.SELL,
                sellAmountBeforeFee: amount.toString(),
              }
            : {
                kind: OrderQuoteSideKindBuy.BUY,
                buyAmountAfterFee: amount.toString(),
              }),
          signingScheme: SigningScheme.PRESIGN,
        })

        // CowSwap orders sometimes return every so slightly different amounts than requested.
        if (zapDirection === 'redeem') {
          quote.quote.sellAmount = amount.toString()
        } else {
          quote.quote.buyAmount = amount.toString()
        }

        if (!signal.aborted) {
          setQuotes((prev) => ({
            ...prev,
            [folioAddress]: {
              success: true,
              type: QuoteProvider.CowSwap,
              data: quote,
            },
          }))
        }

        return {
          token: zapDirection ? buyToken : sellToken,
          success: true,
          source: QuoteProvider.CowSwap,
          quote,
        }
      } catch {
        if (!signal.aborted) {
          setQuotes((prev) => ({
            ...prev,
            [folioAddress]: {
              success: false,
            },
          }))
        }

        return {
          success: false,
        }
      }
    },
    retry: false,
    staleTime: Infinity,
  })
}

export const useQuotesForMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const inputAmount = useAtomValue(asyncSwapInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const folioAmount = safeParseEther(inputAmount)
  const quotes = useAtomValue(quotesAtom)
  const { data: folioDetails } = useFolioDetails({ shares: folioAmount })
  const { data: balances } = useERC20Balances(
    (folioDetails?.assets || []).map((address) => ({
      address,
      chainId,
    }))
  )

  const { data: tokensInfo } = useTokensInfo(
    folioDetails?.assets.map((address) => address as Address) || []
  )

  return useQuery({
    queryKey: ['quotes/mint', folioDetails?.assets, folioDetails?.mintValues],
    queryFn: async () => {
      if (!folioDetails || !tokensInfo) {
        return {}
      }

      await Promise.all(
        folioDetails?.assets.map((asset, i) => {
          const token = tokensInfo[asset.toLowerCase()]
          const mintValue = folioDetails?.mintValues[i]
          const walletValue = (balances?.[i] as bigint) ?? 0n
          const amount = mintValue - walletValue

          if (amount <= 0n) {
            return
          }

          return useQuote({
            sellToken: selectedToken,
            buyToken: token,
            amount,
          })
        }) || []
      )
    },
    select: () => {
      return quotes
    },
    enabled: !!folioDetails && !!tokensInfo,
  })
}
