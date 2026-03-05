import { notifyError } from '@/hooks/useNotification'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { MetadataApi } from '@cowprotocol/sdk-app-data'
import { AppDataHash, SigningScheme } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, maxUint256 } from 'viem'
import { usePublicClient, useSendCalls } from 'wagmi'
import { getCowswapQuote } from '../../async-swaps/hooks/useQuote'
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
import { inputTokenAtom, reverseOrderIdsAtom, slippageAtom } from '../atoms'

/**
 * Shared hook for selling collateral back to USDC.
 * Used by both "Cancel and reverse swaps" and "Convert leftover tokens".
 */
export function useReverseOrders() {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(walletAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const slippage = useAtomValue(slippageAtom)
  const setReverseOrderIds = useSetAtom(reverseOrderIdsAtom)
  const { orderBookApi } = useGlobalProtocolKit()
  const { sendCallsAsync } = useSendCalls()
  const publicClient = usePublicClient()

  const mutation = useMutation({
    mutationKey: ['async-mint/reverse-orders'],
    mutationFn: async (tokensToSell: Record<Address, bigint>) => {
      if (!address || !orderBookApi || !chainId) {
        return { orderIds: [] as string[], totalEstimatedReturn: 0 }
      }

      // Get quotes for selling each token back to input token
      const entries = Object.entries(tokensToSell).filter(
        ([_, amount]) => amount > 0n
      )

      const quotes = await Promise.all(
        entries.map(async ([tokenAddress, amount]) => {
          const quote = await getCowswapQuote({
            sellToken: tokenAddress as Address,
            buyToken: inputToken.address,
            amount,
            address: address as Address,
            operation: 'redeem',
            orderBookApi,
          })
          return { tokenAddress: tokenAddress as Address, quote, amount }
        })
      )

      const successfulQuotes = quotes.filter((q) => q.quote !== null)

      if (successfulQuotes.length === 0) {
        notifyError('No quotes available', 'Could not get quotes for selling tokens back')
        return { orderIds: [] as string[], totalEstimatedReturn: 0 }
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
      } catch {
        appDataContent = JSON.stringify({
          appCode: 'Reserve Protocol',
          environment: 'production',
          version: '1.0.0',
        })
        appDataHex = ('0x' + '0'.repeat(64)) as AppDataHash
      }

      // Generate pre-sign txs
      const orderData = (
        await Promise.all(
          successfulQuotes.map(async ({ quote }) => {
            if (!quote) return undefined
            return getCowswapPreSignTx({
              chainId,
              orderQuote: quote,
              operation: 'redeem',
              address,
              appDataHex,
              slippageBps: Number(slippage),
            })
          })
        )
      ).filter(Boolean) as any[]

      // Build tx array: approvals for each sell token + pre-signs
      const txData: { to: Address; data: `0x${string}`; value: bigint }[] = []

      for (const q of successfulQuotes) {
        const approval = await getApprovalCallIfNeeded({
          chainId,
          address: address as Address,
          token: q.tokenAddress,
          requiredAmount: q.amount,
          approvalAmount: maxUint256,
          spender: COWSWAP_VAULT as Address,
        })
        if (approval) txData.push(approval)
      }

      for (const data of orderData) {
        txData.push({
          to: COWSWAP_SETTLEMENT as Address,
          data: data.preSignTx,
          value: 0n,
        })
      }

      // Send atomic batch
      if (txData.length > 0) {
        await sendCallsWithRetry(sendCallsAsync, chainId, txData, address)
      }

      // Submit to CowSwap with retries (best-effort — don't throw on failure)
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
            console.error(`Reverse sendOrder attempt ${attempt + 1} failed:`, error)
            if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
          }
        }
        if (!submitted) {
          notifyError('Order submission failed', 'Could not submit reverse order. Your tokens are safe.')
        }
      }

      setReverseOrderIds(prev => [...prev, ...orderIds])

      return { orderIds, totalEstimatedReturn: 0 }
    },
    retry: false,
  })

  return {
    reverse: mutation.mutate,
    reverseAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    data: mutation.data,
  }
}
