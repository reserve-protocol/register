import { notifyError } from '@/hooks/useNotification'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { MetadataApi } from '@cowprotocol/sdk-app-data'
import { AppDataHash, SigningScheme } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, maxUint256, parseUnits } from 'viem'
import { usePublicClient, useSendCalls } from 'wagmi'
import {
  getCowswapPreSignTx,
  COWSWAP_SETTLEMENT,
  COWSWAP_VAULT,
} from '../../async-swaps/hooks/useQuoteSignatures'
import {
  getApprovalCallIfNeeded,
  sendCallsWithRetry,
} from '../../async-swaps/hooks/utils'
import { useGlobalProtocolKit } from '../../async-swaps/providers/GlobalProtocolKitProvider'
import {
  failedOrdersAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintQuotesAtom,
  orderIdsAtom,
  ordersAtom,
  ordersCreatedAtAtom,
  slippageAtom,
  wizardStepAtom,
} from '../atoms'

type CowswapPreSignTx = {
  orderId: string
  quote: any
  preSignTx: `0x${string}`
  sellToken: string
  amount: string
}

export function useSubmitOrders(refresh = false) {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const quotes = useAtomValue(mintQuotesAtom)
  const slippage = useAtomValue(slippageAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)
  const { orderBookApi } = useGlobalProtocolKit()
  const { sendCallsAsync } = useSendCalls()
  const publicClient = usePublicClient()

  const setOrderIds = useSetAtom(orderIdsAtom)
  const setOrders = useSetAtom(ordersAtom)
  const setOrdersCreatedAt = useSetAtom(ordersCreatedAtAtom)
  const setQuotes = useSetAtom(mintQuotesAtom)
  const setStep = useSetAtom(wizardStepAtom)

  const mutation = useMutation({
    mutationKey: ['async-mint/submit-orders', chainId, address, refresh],
    mutationFn: async () => {
      if (!address || !orderBookApi || !chainId || !indexDTF) {
        return { orders: [] }
      }

      // Generate app data
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
      }

      // Filter successful quotes
      const successfulQuotes = Object.entries(quotes).filter(
        ([_, q]) => q.success
      )

      if (successfulQuotes.length === 0) {
        return { orders: [] }
      }

      // Generate pre-sign transactions
      const orderData = (
        await Promise.all(
          successfulQuotes.map(async ([_, quote]) => {
            if (!quote.success) return undefined
            return getCowswapPreSignTx({
              chainId,
              orderQuote: quote.data,
              operation: 'mint',
              address,
              appDataHex,
              slippageBps: Number(slippage),
            })
          })
        )
      ).filter((data): data is CowswapPreSignTx => !!data)

      // Build transaction array: pre-sign calls
      const txData: { to: Address; data: `0x${string}`; value: bigint }[] =
        orderData.map((data) => ({
          to: COWSWAP_SETTLEMENT as Address,
          data: data.preSignTx,
          value: 0n,
        }))

      // Add input token approval (at the beginning)
      const requiredAmount = parseUnits(mintAmount, inputToken.decimals)
      const approvalCall = await getApprovalCallIfNeeded({
        chainId,
        address: address as Address,
        token: inputToken.address as Address,
        requiredAmount,
        approvalAmount: maxUint256,
        spender: COWSWAP_VAULT as Address,
      })
      if (approvalCall) txData.unshift(approvalCall)

      // Send atomic batch
      if (txData.length > 0) {
        try {
          await sendCallsWithRetry(sendCallsAsync, chainId, txData, address)
        } catch (error) {
          console.error('sendCallsAsync failed', error)
          notifyError('Transaction failed', 'Please try again')
          throw error
        }
      }

      // Submit orders to CowSwap orderbook with retries
      const orderIds: string[] = []
      for (const data of orderData) {
        let submitted = false
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const orderId = await orderBookApi.sendOrder({
              ...data.quote,
              from: address,
              signature: address,
              signingScheme: SigningScheme.PRESIGN,
              appData: appDataContent,
            })
            orderIds.push(orderId)
            submitted = true
            break
          } catch (error) {
            console.error(
              `sendOrder attempt ${attempt + 1} failed:`,
              error
            )
            if (attempt < 2) {
              await new Promise((r) =>
                setTimeout(r, 1000 * Math.pow(2, attempt))
              )
            }
          }
        }
        if (!submitted) {
          notifyError(
            'Order submission failed',
            'Orders signed on-chain but not submitted to CowSwap. Your tokens are safe. Please try again.'
          )
          throw new Error(
            'Orders signed on-chain but not submitted to CowSwap. Your tokens are safe.'
          )
        }
      }

      // Update state
      if (refresh) {
        setOrderIds((prev) => [
          ...prev.filter(
            (id) =>
              !failedOrders.map((o) => o.orderId).includes(id)
          ),
          ...orderIds,
        ])
        setOrders((prev) =>
          prev.filter(
            (o) =>
              !failedOrders.map((fo) => fo.orderId).includes(o.orderId)
          )
        )
      } else {
        setOrderIds(orderIds)
      }
      setOrdersCreatedAt(new Date().toISOString())
      setQuotes({})
      setStep('processing')

      return { orders: orderIds }
    },
    onError(error) {
      console.error('Submit orders error:', error)
    },
    retry: false,
  })

  return {
    submit: mutation.mutate,
    isPending: mutation.isPending,
  }
}
