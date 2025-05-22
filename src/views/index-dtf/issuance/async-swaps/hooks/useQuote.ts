import { useERC20Balances } from '@/hooks/useERC20Balance'
import useTokensInfo from '@/hooks/useTokensInfo'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { safeParseEther } from '@/utils'
import {
  OrderBookApi,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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

async function getQuote({
  sellToken,
  buyToken,
  amount,
  address,
  orderBookApi,
  zapDirection,
}: {
  sellToken: Token
  buyToken: Token
  amount: bigint
  address: Address
  orderBookApi: OrderBookApi
  zapDirection: 'redeem' | 'mint'
}) {
  if (
    !address ||
    address == zeroAddress ||
    buyToken.address == zeroAddress ||
    sellToken.address == zeroAddress ||
    !orderBookApi
  ) {
    throw new Error('getQuote: Invalid params')
  }

  if (amount <= 0n) {
    throw new Error('getQuote: Amount is 0')
  }

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

  return quote
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
    enabled:
      !!chainId && !!address && !!sellToken && !!buyToken && !!orderBookApi,
    queryFn: async ({ signal }) => {
      if (!orderBookApi) {
        throw new Error('orderBookApi is not available')
      }

      try {
        const quote = await getQuote({
          sellToken,
          buyToken,
          amount,
          address: address as Address,
          orderBookApi,
          zapDirection,
        })

        if (!signal.aborted) {
          setQuotes((prev) => ({
            ...prev,
            [folioAddress as string]: {
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
            [folioAddress as string]: {
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
  const address = useAtomValue(walletAtom)
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const { orderBookApi } = useGlobalProtocolKit()
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
    queryFn: async ({ signal }) => {
      if (!folioDetails || !tokensInfo || !orderBookApi) {
        return {}
      }

      const quotePromises =
        folioDetails?.assets.map(async (asset, i) => {
          const token = tokensInfo[asset.toLowerCase()]
          const mintValue = folioDetails?.mintValues[i]
          const walletValue = (balances?.[i] as bigint) ?? 0n
          const amount = mintValue - walletValue

          if (amount <= 0n) {
            console.log(asset, 'already has enough balance')
            return null
          }

          try {
            return await getQuote({
              sellToken: selectedToken,
              buyToken: token,
              amount,
              address: address as Address,
              orderBookApi,
              zapDirection: 'mint',
            })
          } catch (error) {
            console.error(`Error getting quote for ${asset}:`, error)
            return null
          }
        }) || []

      const results = await Promise.all(quotePromises)

      folioDetails.assets.forEach((asset, i) => {
        const token = tokensInfo[asset.toLowerCase()]
        const quote = results[i]
        try {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                success: true,
                type: QuoteProvider.CowSwap,
                data: quote,
              },
            }))
          }

          return {
            token: token,
            success: true,
            source: QuoteProvider.CowSwap,
            quote,
          }
        } catch {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                success: false,
              },
            }))
          }

          return {
            success: false,
          }
        }
      })

      return quotes
    },
    enabled:
      !!folioDetails?.mintValues &&
      !!tokensInfo &&
      !!inputAmount &&
      !isNaN(Number(inputAmount)),
  })
}
