import { useERC20Balances } from '@/hooks/useERC20Balance'
import useTokensInfo from '@/hooks/useTokensInfo'
import { chainIdAtom, walletAtom } from '@/state/atoms'
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
  failedOrdersAtom,
  fetchingQuotesAtom,
  insufficientBalanceAtom,
  mintValueAtom,
  operationAtom,
  quotesAtom,
  redeemAssetsAtom,
  refetchQuotesAtom,
  selectedTokenAtom,
  applyWalletBalanceAtom,
} from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'
import { QuoteProvider } from '../types'
import { useFolioDetails } from './useFolioDetails'

async function getQuote({
  sellToken,
  buyToken,
  amount,
  address,
  orderBookApi,
  operation,
}: {
  sellToken: Address
  buyToken: Address
  amount: bigint
  address: Address
  orderBookApi: OrderBookApi
  operation: 'redeem' | 'mint'
}) {
  if (
    !address ||
    address == zeroAddress ||
    buyToken == zeroAddress ||
    sellToken == zeroAddress ||
    !orderBookApi
  ) {
    throw new Error('getQuote: Invalid params')
  }

  if (amount <= 0n) {
    throw new Error('getQuote: Amount is 0')
  }

  const quote = await orderBookApi.getQuote({
    sellToken,
    buyToken,
    from: address,
    receiver: address,
    validFor: 60 * 10, // 10 minutes
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

export const useQuotesForMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const mintValue = useAtomValue(mintValueAtom)
  const folioAmount = parseEther(mintValue.toString())
  const address = useAtomValue(walletAtom)
  const insufficientBalance = useAtomValue(insufficientBalanceAtom)
  const applyWalletBalance = useAtomValue(applyWalletBalanceAtom)
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
          const walletValue = applyWalletBalance
            ? ((balances?.[i] as bigint) ?? 0n)
            : 0n
          const amount = mintValue - walletValue

          if (amount <= 0n || token.address === selectedToken.address) {
            console.log(asset, 'already has enough balance')
            return null
          }

          try {
            return await getQuote({
              sellToken: selectedToken.address,
              buyToken: token.address,
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
    enabled:
      !insufficientBalance &&
      !!folioDetails?.mintValues &&
      !!tokensInfo &&
      !!folioAmount,
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

          if (token.address === selectedToken.address) {
            console.log(asset, 'no need to redeem')
            return null
          }

          try {
            return await getQuote({
              sellToken: token.address,
              buyToken: selectedToken.address,
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

export const useRefreshQuotes = () => {
  const address = useAtomValue(walletAtom)
  const { orderBookApi } = useGlobalProtocolKit()
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const operation = useAtomValue(operationAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)

  const query = useQuery({
    queryKey: ['refresh-quotes', failedOrders],
    queryFn: async () => {
      if (!failedOrders || !orderBookApi || !address) {
        return
      }

      const quotePromises = failedOrders.map(async (order) => {
        return await getQuote({
          sellToken: order.sellToken as Address,
          buyToken: order.buyToken as Address,
          amount: BigInt(
            operation === 'redeem' ? order.sellAmount : order.buyAmount
          ),
          address: address as Address,
          orderBookApi,
          operation,
        })
      })

      const results = await Promise.all(quotePromises)

      failedOrders.forEach((order, i) => {
        setQuotes((prev) => ({
          ...prev,
          [operation === 'redeem' ? order.sellToken : order.buyToken]: {
            success: !!results[i],
            type: QuoteProvider.CowSwap,
            data: results[i],
          },
        }))
      })

      return quotes
    },
  })

  return query
}
