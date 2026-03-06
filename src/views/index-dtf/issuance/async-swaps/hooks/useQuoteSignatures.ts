import CowswapSettlement from '@/abis/CowSwapSettlement'
import { notifyError } from '@/hooks/useNotification'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { MetadataApi } from '@cowprotocol/sdk-app-data'
import {
  AppDataHash,
  OrderBalance,
  OrderCreation,
  OrderQuoteResponse,
  OrderSigningUtils,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { useMutation } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useRef } from 'react'
import { Address, encodeFunctionData, Hex, maxUint256, parseUnits } from 'viem'
import { useSendCalls, usePublicClient } from 'wagmi'
import {
  cowswapOrderIdsAtom,
  cowswapOrdersAtom,
  cowswapOrdersCreatedAtAtom,
  failedOrdersAtom,
  infoMessageAtom,
  operationAtom,
  quotesAtom,
  selectedTokenAtom,
  userInputAtom,
} from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'
import {
  getApprovalCallIfNeeded,
  getCowswapOrdersInfoMessage,
  getTransactionInfoMessage,
  sendCallsWithRetry,
} from './utils'

export const COWSWAP_SETTLEMENT =
  '0x9008D19f58AAbD9eD0D60971565AA8510560ab41' as const
export const COWSWAP_VAULT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' as const

type CowswapPreSignTx = {
  orderId: string
  quote: OrderCreation
  preSignTx: Hex
  sellToken: string
  amount: string
}

export const getCowswapPreSignTx = async ({
  chainId,
  orderQuote,
  operation,
  address,
  appDataHex,
  slippageBps,
}: {
  chainId: number
  orderQuote: OrderQuoteResponse
  operation: string
  address: Address
  appDataHex: AppDataHash
  slippageBps?: number
}): Promise<CowswapPreSignTx | undefined> => {
  if (orderQuote.quote.sellAmount === '0') {
    return undefined
  }

  const modifiedQuote = {
    ...orderQuote.quote,
    feeAmount: '0',
    sellAmount:
      operation === 'mint'
        ? slippageBps !== undefined
          ? ((BigInt(orderQuote.quote.sellAmount) * (10000n + BigInt(slippageBps))) / 10000n).toString()
          : ((BigInt(orderQuote.quote.sellAmount) * 101n) / 100n).toString()
        : orderQuote.quote.sellAmount,
    buyAmount:
      operation === 'mint'
        ? orderQuote.quote.buyAmount
        : slippageBps !== undefined
          ? ((BigInt(orderQuote.quote.buyAmount) * (10000n - BigInt(slippageBps))) / 10000n).toString()
          : ((BigInt(orderQuote.quote.buyAmount) * 98n) / 100n).toString(),
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
      appData: appDataHex,
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
    orderId: orderId.orderId,
    quote: modifiedQuote,
    preSignTx: encodedPreSignTx,
    sellToken: modifiedQuote.sellToken,
    amount: modifiedQuote.sellAmount,
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
  const setCowswapOrderIds = useSetAtom(cowswapOrderIdsAtom)
  const setCowswapOrders = useSetAtom(cowswapOrdersAtom)
  const setCowswapOrdersCreatedAt = useSetAtom(cowswapOrdersCreatedAtAtom)
  const setInfoMessage = useSetAtom(infoMessageAtom)
  const { orderBookApi } = useGlobalProtocolKit()
  const { sendCallsAsync } = useSendCalls()
  const failedOrders = useAtomValue(failedOrdersAtom)
  const publicClient = usePublicClient()

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
      if (!address || !orderBookApi || !chainId || !indexDTF) {
        console.error('No global kit')
        return {
          orders: [],
        }
      }

      // Create a Viem adapter for the MetadataApi
      let metadataApi: MetadataApi
      if (publicClient) {
        const viemAdapter = new ViemAdapter({ provider: publicClient })
        metadataApi = new MetadataApi(viemAdapter)
      } else {
        metadataApi = new MetadataApi()
      }

      let appDataContent: string
      let appDataHex: AppDataHash

      try {
        const appDataDoc = await metadataApi.generateAppDataDoc({
          appCode: 'Reserve Protocol',
          environment: 'production',
        })
        const appDataInfo = await metadataApi.getAppDataInfo(appDataDoc)
        appDataContent = appDataInfo.appDataContent
        appDataHex = appDataInfo.appDataHex
      } catch (error) {
        console.error('Failed to calculate appDataHex', error)
        appDataContent = JSON.stringify({
          appCode: 'Reserve Protocol',
          environment: 'production',
          version: '1.0.0',
        })
        appDataHex = ('0x' + '0'.repeat(64)) as AppDataHash
        console.warn('Using fallback appData due to MetadataApi error')
      }

      const successfulQuotes = Object.values(quotes).filter(
        (quote) => quote.success
      )

      if (successfulQuotes.length === 0) {
        return {
          orders: [],
        }
      }

      // Generate pre-sign transactions for all quotes
      const orderData = (
        await Promise.all(
          successfulQuotes.map(async (quote) => {
            if (!quote.success) return undefined
            return getCowswapPreSignTx({
              chainId,
              orderQuote: quote.data,
              operation,
              address,
              appDataHex,
            })
          })
        )
      ).filter((data): data is CowswapPreSignTx => !!data)

      const txData = await Promise.all(
        orderData.map(async (data) => {
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
        })
      ).then((results) => results.flat())

      if (operation === 'mint') {
        const requiredAmount = parseUnits(inputAmount, quoteToken.decimals)
        const approvalCall = await getApprovalCallIfNeeded({
          chainId,
          address: address as Address,
          token: quoteToken.address as Address,
          requiredAmount,
          approvalAmount: maxUint256,
          spender: COWSWAP_VAULT,
        })
        if (approvalCall) txData.unshift(approvalCall)
      }

      if (txData.length > 0) {
        try {
          const infoMessage = getTransactionInfoMessage(txData)
          setInfoMessage((prev) => infoMessage || prev)

          await sendCallsWithRetry(sendCallsAsync, chainId, txData, address)
        } catch (error) {
          console.error('sendCallsAsync', error)
          notifyError('Transaction failed', 'Please try again')
        }
      }

      const cowswapInfoMessage = getCowswapOrdersInfoMessage(orderData)
      setInfoMessage((prev) => cowswapInfoMessage || prev)

      const orderIds = (
        await Promise.all(
          orderData.map(async (data) => {
            const order = data.quote as OrderCreation
            try {
              const orderId = await orderBookApi.sendOrder({
                ...order,
                from: address,
                signature: address,
                signingScheme: SigningScheme.PRESIGN,
                appData: appDataContent,
              })
              return orderId
            } catch (error) {
              console.error('orderBookApi.sendOrder', error)
              notifyError(
                'Cowswap order failed',
                `Failed to submit Cowswap order`
              )
              return undefined
            }
          })
        )
      ).filter((orderId) => orderId !== undefined)

      if (refresh) {
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
      setInfoMessage(undefined)

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
