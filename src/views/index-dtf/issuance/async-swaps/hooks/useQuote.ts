import { useERC20Balances } from '@/hooks/useERC20Balance'
import useTokensInfo from '@/hooks/useTokensInfo'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { Token } from '@/types'
import {
  OrderBookApi,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, parseEther, zeroAddress } from 'viem'
import {
  fetchingQuotesAtom,
  mintValueAtom,
  quotesAtom,
  redeemAssetsAtom,
  refetchQuotesAtom,
  selectedTokenAtom,
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
  operation,
}: {
  sellToken: Token
  buyToken: Token
  amount: bigint
  address: Address
  orderBookApi: OrderBookApi
  operation: 'redeem' | 'mint'
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
    ...(operation === 'redeem'
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
  if (operation === 'redeem') {
    quote.quote.sellAmount = amount.toString()
  } else {
    quote.quote.buyAmount = amount.toString()
  }

  return quote
}

// export function useQuote({ sellToken, buyToken, amount }: UseQuoteParams) {
//   const indexDTF = useAtomValue(indexDTFAtom)
//   const folioAddress = indexDTF?.id
//   const operation = useAtomValue(operationAtom)
//   const chainId = useAtomValue(chainIdAtom)
//   const address = useAtomValue(walletAtom)
//   const setQuotes = useSetAtom(quotesAtom)
//   const { orderBookApi } = useGlobalProtocolKit()

//   return useQuery({
//     queryKey: ['quote/single', sellToken, buyToken, amount, address],
//     enabled:
//       !!chainId && !!address && !!sellToken && !!buyToken && !!orderBookApi,
//     queryFn: async ({ signal }) => {
//       if (!orderBookApi) {
//         throw new Error('orderBookApi is not available')
//       }

//       try {
//         const quote = await getQuote({
//           sellToken,
//           buyToken,
//           amount,
//           address: address as Address,
//           orderBookApi,
//           operation,
//         })

//         if (!signal.aborted) {
//           setQuotes((prev) => ({
//             ...prev,
//             [folioAddress as string]: {
//               success: true,
//               type: QuoteProvider.CowSwap,
//               data: quote,
//             },
//           }))
//         }

//         return {
//           token: operation ? buyToken : sellToken,
//           success: true,
//           source: QuoteProvider.CowSwap,
//           quote,
//         }
//       } catch {
//         if (!signal.aborted) {
//           setQuotes((prev) => ({
//             ...prev,
//             [folioAddress as string]: {
//               success: false,
//             },
//           }))
//         }

//         return {
//           success: false,
//         }
//       }
//     },
//     retry: false,
//     staleTime: Infinity,
//   })
// }

export const useQuotesForMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const mintValue = useAtomValue(mintValueAtom)
  const folioAmount = parseEther(mintValue.toString())
  const address = useAtomValue(walletAtom)
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const setRefetchQuotes = useSetAtom(refetchQuotesAtom)
  const setFetchingQuotes = useSetAtom(fetchingQuotesAtom)

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

  const query = useQuery({
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
              operation: 'mint',
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
                success: !!quote,
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
    enabled: !!folioDetails?.mintValues && !!tokensInfo && !!folioAmount,
  })

  useEffect(() => {
    setRefetchQuotes({ fn: query.refetch })
    setFetchingQuotes(query.isFetching)
  }, [query.refetch, query.isFetching, setRefetchQuotes, setFetchingQuotes])

  return query
}

export const useQuotesForRedeem = () => {
  const selectedToken = useAtomValue(selectedTokenAtom)
  const redeemAssets = useAtomValue(redeemAssetsAtom)
  const address = useAtomValue(walletAtom)
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const setRefetchQuotes = useSetAtom(refetchQuotesAtom)
  const setFetchingQuotes = useSetAtom(fetchingQuotesAtom)

  const { orderBookApi } = useGlobalProtocolKit()

  const assets = Object.keys(redeemAssets)

  const { data: tokensInfo } = useTokensInfo(
    assets.map((address) => address as Address)
  )

  const query = useQuery({
    queryKey: ['quotes/redeem', assets, redeemAssets],
    queryFn: async ({ signal }) => {
      if (
        !redeemAssets ||
        !assets ||
        !assets.length ||
        !tokensInfo ||
        !orderBookApi
      ) {
        return {}
      }

      const quotePromises =
        assets.map(async (asset) => {
          const token = tokensInfo[asset.toLowerCase()]
          const amount = redeemAssets[asset as Address]

          try {
            return await getQuote({
              sellToken: token,
              buyToken: selectedToken,
              amount,
              address: address as Address,
              orderBookApi,
              operation: 'redeem',
            })
          } catch (error) {
            console.error(`Error getting quote for ${asset}:`, error)
            return null
          }
        }) || []

      const results = await Promise.all(quotePromises)

      assets.forEach((asset, i) => {
        const token = tokensInfo[asset.toLowerCase()]
        const quote = results[i]
        try {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                success: !!quote,
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
    enabled: !!assets && !!tokensInfo && !!redeemAssets && assets.length > 0,
  })

  useEffect(() => {
    setRefetchQuotes({ fn: query.refetch })
    setFetchingQuotes(query.isFetching)
  }, [query.refetch, query.isFetching, setRefetchQuotes, setFetchingQuotes])

  return query
}
