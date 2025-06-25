import CowswapSettlement from '@/abis/CowSwapSettlement'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { OrderBalance } from '@cowprotocol/contracts'
import {
  OrderCreation,
  OrderQuoteResponse,
  OrderSigningUtils,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useMutation } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import pLimit from 'p-limit'
import { useCallback, useRef } from 'react'
import { generateTypedData, OrderRequest, Quote } from 'universal-sdk'
import { Address, encodeFunctionData, Hex, maxUint256, parseUnits } from 'viem'
import { useSendCalls, useSignTypedData } from 'wagmi'
import {
  cowswapOrderIdsAtom,
  cowswapOrdersAtom,
  cowswapOrdersCreatedAtAtom,
  failedOrdersAtom,
  fallbackQuotesAtom,
  operationAtom,
  quotesAtom,
  selectedTokenAtom,
  universalFailedOrdersAtom,
  universalSuccessOrdersAtom,
  userInputAtom,
} from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'
import {
  CustomUniversalQuote,
  getUniversalTokenAddress,
} from '../providers/universal'
import { QuoteProvider } from '../types'
import { convertTypeDataToBigInt, getApprovalCallIfNeeded } from './utils'

const COWSWAP_SETTLEMENT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41' as const
const COWSWAP_VAULT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' as const
const UNIVERSAL_PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const

type CowswapPreSignTx = {
  type: QuoteProvider.CowSwap
  data: {
    orderId: string
    quote: OrderCreation
    preSignTx: Hex
    sellToken: string
    amount: string
  }
}

type UniversalQuote = {
  type: QuoteProvider.Universal
  data: CustomUniversalQuote & {
    quote: Quote
  }
}

const getCowswapPreSignTx = async ({
  chainId,
  orderQuote,
  operation,
  address,
}: {
  chainId: number
  orderQuote: OrderQuoteResponse
  operation: string
  address: Address
}): Promise<CowswapPreSignTx | undefined> => {
  if (orderQuote.quote.sellAmount === '0') {
    return undefined
  }

  const modifiedQuote = {
    ...orderQuote.quote,
    feeAmount: '0',
    buyAmount:
      operation === 'mint'
        ? orderQuote.quote.buyAmount
        : ((BigInt(orderQuote.quote.buyAmount) * 98n) / 100n).toString(),
    sellAmount:
      operation === 'mint'
        ? ((BigInt(orderQuote.quote.sellAmount) * 101n) / 100n).toString()
        : orderQuote.quote.sellAmount,
    from: address,
    receiver: address!,
    signature: address!,
    signingScheme: SigningScheme.PRESIGN,
  } as const satisfies OrderCreation

  const orderId = await OrderSigningUtils.generateOrderId(
    chainId,
    {
      ...modifiedQuote,
      sellTokenBalance: OrderBalance.ERC20,
      buyTokenBalance: OrderBalance.ERC20,
    },
    {
      owner: address,
    }
  )

  const encodedPreSignTx = encodeFunctionData({
    abi: CowswapSettlement,
    functionName: 'setPreSignature',
    args: [orderId.orderId as Hex, true],
  })

  return {
    type: QuoteProvider.CowSwap,
    data: {
      orderId: orderId.orderId,
      quote: modifiedQuote,
      preSignTx: encodedPreSignTx,
      sellToken: modifiedQuote.sellToken,
      amount: modifiedQuote.sellAmount,
    },
  }
}

export function useQuoteSignatures(refresh = false) {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(walletAtom)
  const operation = useAtomValue(operationAtom)
  const inputAmount = useAtomValue(userInputAtom)
  const quoteToken = useAtomValue(selectedTokenAtom)
  const [quotes, setQuotes] = useAtom(quotesAtom)
  const fallbackQuotes = useAtomValue(fallbackQuotesAtom)
  const setCowswapOrderIds = useSetAtom(cowswapOrderIdsAtom)
  const setCowswapOrders = useSetAtom(cowswapOrdersAtom)
  const setUniversalFailedOrders = useSetAtom(universalFailedOrdersAtom)
  const setUniversalSuccessOrders = useSetAtom(universalSuccessOrdersAtom)
  const setCowswapOrdersCreatedAt = useSetAtom(cowswapOrdersCreatedAtAtom)
  const { orderBookApi, universalSdk } = useGlobalProtocolKit()
  const { sendCallsAsync } = useSendCalls()
  const failedOrders = useAtomValue(failedOrdersAtom)
  const { signTypedDataAsync } = useSignTypedData()

  const limiter = pLimit(1)

  return useMutation({
    mutationKey: [
      'quote-signatures',
      chainId,
      address,
      operation,
      JSON.stringify(quotes, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
      refresh,
    ],
    mutationFn: async () => {
      if (!address || !orderBookApi || !chainId || !indexDTF || !universalSdk) {
        console.error('No global kit')
        return {
          orders: [],
        }
      }

      const successfulQuotes = Object.values(quotes).filter(
        (quote) => quote.success
      )

      console.log({ successfulQuotes })

      if (successfulQuotes.length === 0) {
        // TODO: handle this
        return {
          orders: [],
        }
      }

      // Generate order IDs and hashed messages for all quotes
      const orderData: (CowswapPreSignTx | UniversalQuote | undefined)[] =
        await Promise.all(
          successfulQuotes.map(async (quote) => {
            if (quote.type === QuoteProvider.CowSwap) {
              return getCowswapPreSignTx({
                chainId,
                orderQuote: quote.data,
                operation,
                address,
              })
            }

            if (quote.type === QuoteProvider.Universal) {
              const uq = quote.data as CustomUniversalQuote

              return {
                type: QuoteProvider.Universal,
                data: {
                  ...uq,
                  quote: uq._originalQuote,
                },
              }
            }
          })
        )

      const validOrderData = orderData.filter((data) => !!data)

      const txData = await Promise.all(
        validOrderData.map(async ({ type, data }) => {
          if (type === QuoteProvider.CowSwap) {
            return [
              operation === 'redeem'
                ? await getApprovalCallIfNeeded({
                    chainId,
                    address: address,
                    token: data.sellToken as Address,
                    requiredAmount: BigInt(data.amount as string),
                    spender: COWSWAP_VAULT,
                  })
                : null,
              {
                to: COWSWAP_SETTLEMENT,
                data: data.preSignTx,
                value: 0n,
              },
            ].filter((e) => e !== null)
          }

          if (operation === 'redeem' && type === QuoteProvider.Universal) {
            return [
              await await getApprovalCallIfNeeded({
                chainId,
                address: address,
                token: data.sellToken as Address,
                requiredAmount: data.sellAmount,
                spender: UNIVERSAL_PERMIT2,
              }),
            ].filter((e) => e !== null)
          }

          return null
        })
      ).then((results) => results.filter((data) => data !== null).flat())

      if (operation === 'mint') {
        const requiredAmount = parseUnits(inputAmount, quoteToken.decimals)
        for (const spender of [COWSWAP_VAULT, UNIVERSAL_PERMIT2]) {
          const approvalCall = await getApprovalCallIfNeeded({
            chainId,
            address: address as Address,
            token: quoteToken.address as Address,
            requiredAmount,
            approvalAmount: maxUint256,
            spender,
          })
          if (approvalCall) txData.unshift(approvalCall)
        }
      }

      if (txData.length > 0) {
        const txBundle = await sendCallsAsync({
          calls: txData,
          account: address,
          forceAtomic: true,
        })

        console.log({ txBundle })
      }

      // Separate signature generation from order submission to optimize performance
      const universalQuotes = validOrderData.filter(
        ({ type }) => type === QuoteProvider.Universal
      )

      const universalOrderResults = await Promise.all(
        universalQuotes.map(({ data }) =>
          limiter(async () => {
            const quote = data.quote as OrderRequest

            try {
              const { typedData } = await generateTypedData(quote)
              const _typedData = convertTypeDataToBigInt(typedData)
              const signature = await signTypedDataAsync(_typedData)
              const universalOrder = await universalSdk.submitOrder({
                ...quote,
                signature,
              })

              setUniversalSuccessOrders((prev) => {
                return [
                  ...prev,
                  {
                    ...quote,
                    orderId: universalOrder.order_id,
                    transactionHash: universalOrder.transaction_hash,
                  },
                ]
              })

              return { success: true, quote, order: universalOrder }
            } catch (error) {
              console.error(error)
              setUniversalFailedOrders((prev) => [...prev, quote])
              return { success: false, quote, error }
            }
          })
        )
      )

      // Log results for debugging
      const successfulOrders = universalOrderResults.filter(
        (result) => result.success
      )
      const failedUniversalOrders = universalOrderResults.filter(
        (result) => !result.success
      )

      console.log(
        `Universal orders completed: ${successfulOrders.length} successful, ${failedUniversalOrders.length} failed`
      )

      // For failed universal orders, use fallback quotes
      const fallbackOrderData = (
        await Promise.all(
          failedUniversalOrders.map(async ({ quote }) => {
            const token = getUniversalTokenAddress(quote.token)
            const fallbackQuote = fallbackQuotes[token]
            console.log({ fallbackQuote })
            if (!fallbackQuote) {
              return null
            }

            return await getCowswapPreSignTx({
              chainId,
              orderQuote: fallbackQuote,
              operation,
              address,
            })
          })
        )
      ).filter((data) => !!data)

      const fallbackTxData = await Promise.all(
        fallbackOrderData.map(async ({ type, data }) => {
          if (type === QuoteProvider.CowSwap) {
            return [
              operation === 'redeem'
                ? await getApprovalCallIfNeeded({
                    chainId,
                    address: address,
                    token: data.sellToken as Address,
                    requiredAmount: BigInt(data.amount as string),
                    spender: COWSWAP_VAULT,
                  })
                : null,
              {
                to: COWSWAP_SETTLEMENT,
                data: data.preSignTx,
                value: 0n,
              },
            ].filter((e) => e !== null)
          }
          return null
        })
      ).then((results) => results.filter((data) => data !== null).flat())

      if (fallbackTxData.length > 0) {
        const txBundle = await sendCallsAsync({
          calls: fallbackTxData,
          account: address,
          forceAtomic: true,
        })

        console.log({ txBundle })
      }

      const orderIds = await Promise.all(
        [...validOrderData, ...fallbackOrderData]
          .filter(({ type }) => type === QuoteProvider.CowSwap)
          .map(async ({ data }) => {
            const order = data.quote as OrderCreation
            const orderId = await orderBookApi.sendOrder({
              ...order,
              from: address,
              signature: address,
              signingScheme: SigningScheme.PRESIGN,
            })
            return orderId
          })
      )

      if (refresh) {
        // Reset universal failed orders
        setUniversalFailedOrders([])
        // replace failed orders with new ones
        setCowswapOrderIds((prev) => [
          ...prev.filter(
            (orderId) => !failedOrders.map((o) => o.orderId).includes(orderId)
          ),
          ...orderIds,
        ])
        setCowswapOrders((prev) => [
          ...prev.filter(
            (o) => !failedOrders.map((fo) => fo.orderId).includes(o.orderId)
          ),
        ])
      } else {
        setCowswapOrderIds(orderIds)
      }
      setCowswapOrdersCreatedAt(new Date().toISOString())
      setQuotes({})

      return {
        orders: orderIds,
      }
    },
    onError(error) {
      console.error(error)
    },
    retry: false,
    retryDelay: 0,
    gcTime: 5 * 60 * 1000,
  })
}

// Custom hook to stabilize dependencies
export const useStableQuoteSignatures = (refresh = false) => {
  const { mutate, isPending } = useQuoteSignatures(refresh)

  // Use useRef to maintain a stable reference to mutate
  const mutateRef = useRef(mutate)
  mutateRef.current = mutate

  const stableMutate = useCallback(() => {
    mutateRef.current()
  }, [])

  return {
    mutate: stableMutate,
    isPending,
  }
}
