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
import { Address, formatUnits, parseEther, zeroAddress } from 'viem'
import {
  applyWalletBalanceAtom,
  failedOrdersAtom,
  fallbackQuotesAtom,
  fetchingQuotesAtom,
  mintValueAtom,
  operationAtom,
  quotesAtom,
  redeemAssetsAtom,
  refetchQuotesAtom,
  selectedTokenAtom,
  universalFailedOrdersAtom,
} from '../atom'
import {
  UniversalRelayerWithRateLimiter,
  useGlobalProtocolKit,
} from '../providers/GlobalProtocolKitProvider'
import {
  CustomUniversalQuote,
  getUniversalTokenAddress,
  getUniversalTokenName,
} from '../providers/universal'
import { QuoteProvider } from '../types'
import { useFolioDetails } from './useFolioDetails'
import { getAssetPrice } from './utils'

const MIN_UNIVERSAL_QUOTE_VALUE_USD = 2

async function getQuoteValue(
  chainId: number,
  buyToken: Address,
  amount: bigint,
  decimals: number
) {
  const assetPrice = await getAssetPrice(chainId, buyToken)
  if (!assetPrice) {
    return undefined
  }
  return Number(formatUnits(amount, decimals)) * assetPrice.price || undefined
}

async function getCowswapQuote({
  sellToken,
  buyToken,
  amount,
  address,
  operation,
  orderBookApi,
}: {
  sellToken: Address
  buyToken: Address
  amount: bigint
  address: Address
  operation: 'redeem' | 'mint'
  orderBookApi: OrderBookApi
}) {
  try {
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
  } catch (error) {
    console.error(`Error getting cowswap quote:`, error)
    return null
  }
}

async function getUniversalQuote({
  sellToken,
  buyToken,
  amount,
  address,
  operation,
  universalSdk,
}: {
  sellToken: Address
  buyToken: Address
  amount: bigint
  address: Address
  operation: 'redeem' | 'mint'
  universalSdk: UniversalRelayerWithRateLimiter
}) {
  try {
    const universalAsset = getUniversalTokenName(buyToken)
    const universalQuote = await universalSdk.getQuote({
      type: operation === 'redeem' ? 'SELL' : 'BUY',
      blockchain: 'BASE',
      token: universalAsset,
      pair_token: 'USDC',
      user_address: address,
      slippage_bips: 100,
      token_amount: amount.toString(),
    })

    const customQuote: CustomUniversalQuote = {
      _originalQuote: universalQuote,
      buyToken,
      sellToken,
      type: 'BUY',
      userAddress: address,
      sellAmount: BigInt(universalQuote.pair_token_amount ?? '0'),
      buyAmount: amount,
      validTo: Number(universalQuote.deadline ?? 0),
    }
    return customQuote
  } catch (error) {
    console.error(`Error getting universal quote:`, error)
    return null
  }
}

async function getQuote({
  sellToken,
  buyToken,
  amount,
  address,
  operation,
  orderBookApi,
  universalSdk,
  quoteValue,
}: {
  sellToken: Address
  buyToken: Address
  amount: bigint
  address: Address
  operation: 'redeem' | 'mint'
  orderBookApi: OrderBookApi
  universalSdk: UniversalRelayerWithRateLimiter
  quoteValue?: number
}) {
  if (
    !address ||
    address == zeroAddress ||
    buyToken == zeroAddress ||
    sellToken == zeroAddress ||
    !orderBookApi ||
    !universalSdk
  ) {
    throw new Error('getQuote: Invalid params')
  }

  if (amount <= 0n) {
    throw new Error('getQuote: Amount is 0')
  }

  // Try Universal first if available
  const universalAsset = getUniversalTokenName(buyToken)
  const hasMinValue = quoteValue && quoteValue > MIN_UNIVERSAL_QUOTE_VALUE_USD
  let universalQuote: CustomUniversalQuote | null = null

  if (universalAsset && hasMinValue) {
    universalQuote = await getUniversalQuote({
      sellToken,
      buyToken,
      amount,
      address,
      operation,
      universalSdk,
    })
  }

  const cowswapQuote = await getCowswapQuote({
    sellToken,
    buyToken,
    amount,
    address,
    operation,
    orderBookApi,
  })

  // TODO: if universalQuote is worse than cowswapQuote, use cowswapQuote (set universalQuote to null)

  return {
    universalQuote,
    cowswapQuote,
  }
}

export const useQuotesForMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const mintValue = useAtomValue(mintValueAtom)
  const folioAmount = parseEther(mintValue.toString())
  const address = useAtomValue(walletAtom)
  const applyWalletBalance = useAtomValue(applyWalletBalanceAtom)
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const setRefetchQuotes = useSetAtom(refetchQuotesAtom)
  const setFetchingQuotes = useSetAtom(fetchingQuotesAtom)
  const setFallbackQuotes = useSetAtom(fallbackQuotesAtom)

  const { orderBookApi, universalSdk } = useGlobalProtocolKit()
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
      if (!folioDetails || !tokensInfo || !orderBookApi || !universalSdk) {
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
            const quoteValue = await getQuoteValue(
              chainId,
              token.address,
              amount,
              token.decimals
            )
            const { universalQuote, cowswapQuote } = await getQuote({
              sellToken: selectedToken.address,
              buyToken: token.address,
              amount,
              address: address as Address,
              operation: 'mint',
              orderBookApi,
              universalSdk,
              quoteValue,
            })

            if (cowswapQuote) {
              setFallbackQuotes((prev) => ({
                ...prev,
                [token.address]: cowswapQuote,
              }))
            }

            return universalQuote || cowswapQuote
          } catch (error) {
            console.error(`Error getting quote for ${asset}:`, error)
            return null
          }
        }) || []

      const results = await Promise.all(quotePromises)

      folioDetails.assets.forEach((asset, i) => {
        const token = tokensInfo[asset.toLowerCase()]
        const quote = results[i]
        const type =
          quote && '_originalQuote' in quote
            ? QuoteProvider.Universal
            : QuoteProvider.CowSwap

        try {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                success: !!quote,
                type,
                data: quote,
              },
            }))
          }

          return {
            token,
            success: true,
            type,
            quote,
          }
        } catch {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                token,
                success: false,
              },
            }))
          }

          return {
            token,
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
  const chainId = useAtomValue(chainIdAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const redeemAssets = useAtomValue(redeemAssetsAtom)
  const address = useAtomValue(walletAtom)
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const setRefetchQuotes = useSetAtom(refetchQuotesAtom)
  const setFetchingQuotes = useSetAtom(fetchingQuotesAtom)
  const setFallbackQuotes = useSetAtom(fallbackQuotesAtom)

  const { orderBookApi, universalSdk } = useGlobalProtocolKit()

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
        !orderBookApi ||
        !universalSdk
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
            const quoteValue = await getQuoteValue(
              chainId,
              token.address,
              amount,
              token.decimals
            )
            const { universalQuote, cowswapQuote } = await getQuote({
              sellToken: token.address,
              buyToken: selectedToken.address,
              amount,
              address: address as Address,
              operation: 'redeem',
              orderBookApi,
              universalSdk,
              quoteValue,
            })

            if (cowswapQuote) {
              setFallbackQuotes((prev) => ({
                ...prev,
                [token.address]: cowswapQuote,
              }))
            }

            return universalQuote || cowswapQuote
          } catch (error) {
            console.error(`Error getting quote for ${asset}:`, error)
            return null
          }
        }) || []

      const results = await Promise.all(quotePromises)

      assets.forEach((asset, i) => {
        const token = tokensInfo[asset.toLowerCase()]
        const quote = results[i]
        const type =
          quote && '_originalQuote' in quote
            ? QuoteProvider.Universal
            : QuoteProvider.CowSwap

        try {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                success: !!quote,
                type,
                data: quote,
              },
            }))
          }

          return {
            token,
            success: true,
            type,
            quote,
          }
        } catch {
          if (!signal.aborted) {
            setQuotes((prev) => ({
              ...prev,
              [token.address as string]: {
                token,
                success: false,
              },
            }))
          }

          return {
            token,
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
  const { orderBookApi, universalSdk } = useGlobalProtocolKit()
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const operation = useAtomValue(operationAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)
  const failedUniversalOrders = useAtomValue(universalFailedOrdersAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)

  const query = useQuery({
    queryKey: ['refresh-quotes', failedOrders],
    queryFn: async () => {
      if (!failedOrders || !orderBookApi || !address || !universalSdk) {
        return
      }

      // Failed Cowswap quotes
      const quotePromises = failedOrders.map(async (order) => {
        return await getCowswapQuote({
          sellToken: order.sellToken as Address,
          buyToken: order.buyToken as Address,
          amount: BigInt(
            operation === 'redeem' ? order.sellAmount : order.buyAmount
          ),
          address: address as Address,
          operation,
          orderBookApi,
        })
      })

      // Failed Universal orders are retried through CowSwap as fallback
      const universalQuotePromises = failedUniversalOrders.map(
        async (order) => {
          const token = getUniversalTokenAddress(order.token)
          const sellToken =
            operation === 'redeem' ? token : selectedToken.address
          const buyToken =
            operation === 'redeem' ? selectedToken.address : token
          const amount =
            operation === 'redeem'
              ? BigInt(order.pair_token_amount ?? '0')
              : BigInt(order.token_amount ?? '0')

          return await getCowswapQuote({
            sellToken: sellToken as Address,
            buyToken: buyToken as Address,
            amount,
            address: address as Address,
            operation,
            orderBookApi,
          })
        }
      )

      const results = await Promise.all([
        ...quotePromises,
        ...universalQuotePromises,
      ])

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
