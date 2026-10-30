import {
  processFolioAuctions,
  ProcessFolioResult,
  SubmittedOrder,
  SupportedChainId,
} from '@reserve-protocol/trusted-fillers-sdk'
import { useLingui } from '@lingui/react/macro'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PublicClient } from 'viem'
import { CowbotConfig, CowbotStatus } from './types'

const SUPPORTED_CHAINS: SupportedChainId[] = [1, 8453, 56]

const getOrderKey = ({ order, submission }: SubmittedOrder): string =>
  submission.orderId ??
  `${submission.cowswapDeploymentId}-${order.sellToken}-${order.buyToken}-${order.sellAmount}-${order.buyAmount}`

interface UseCowbotQueryProps {
  config: CowbotConfig
  client: PublicClient | undefined
}

/**
 * Core hook for CowBot polling logic.
 * Uses React Query for polling, retries, and state management.
 */
export const useCowbotQuery = ({ config, client }: UseCowbotQueryProps) => {
  const { t } = useLingui()
  const [enabled, setEnabled] = useState(true)
  const submittedOrdersRef = useRef<Set<string>>(new Set())
  const [totalOrders, setTotalOrders] = useState(0)
  const queryClient = useQueryClient()

  const {
    folioAddress,
    chainId,
    isAuctionActive,
    isListedDTF,
    pollingInterval = 30_000,
    validityDuration = 120,
  } = config

  const isSupportedChain = SUPPORTED_CHAINS.includes(chainId as SupportedChainId)
  // Fork e2e lane: the bot would post real CoW orders for fork-only DTFs.
  const isDisabledByEnv = import.meta.env.VITE_DISABLE_COWBOT === 'true'

  // Should the query run?
  const shouldRun =
    enabled &&
    !isDisabledByEnv &&
    isAuctionActive &&
    !isListedDTF &&
    isSupportedChain &&
    !!client &&
    !!folioAddress

  const query = useQuery<ProcessFolioResult>({
    queryKey: ['cowbot', folioAddress, chainId],
    queryFn: async (): Promise<ProcessFolioResult> => {
      if (!client || !folioAddress || !chainId) {
        throw new Error('Missing params')
      }

      const result = await processFolioAuctions({
        chainId: chainId as SupportedChainId,
        client,
        folioAddress,
        validityDuration,
      })

      console.log('cowbot result', result)

      if (result.status === 'skipped') {
        if (result.reason === 'unsupported_version') {
          console.warn(`CowBot does not support Folio ${result.folioVersion}`)
        }
        return result
      }

      // Handle SDK-level errors (per-order errors, not fatal)
      if (result.errors.length > 0) {
        console.error('CowBot errors:', result.errors)
        toast.error(t`CowBot encountered errors`, {
          description: result.errors[0].message,
        })
      }

      // Track only NEW unique orders
      if (result.submittedOrders.length > 0) {
        let newOrdersCount = 0

        for (const order of result.submittedOrders) {
          const orderKey = getOrderKey(order)

          if (!submittedOrdersRef.current.has(orderKey)) {
            submittedOrdersRef.current.add(orderKey)
            newOrdersCount++
          }
        }

        if (newOrdersCount > 0) {
          setTotalOrders(submittedOrdersRef.current.size)
          toast.success(
            newOrdersCount === 1
              ? t`CowBot submitted ${newOrdersCount} new order`
              : t`CowBot submitted ${newOrdersCount} new orders`
          )
        }
      }

      return result
    },
    enabled: shouldRun,
    refetchInterval: ({ state }) =>
      state.data?.status === 'skipped' &&
      state.data.reason === 'unsupported_version'
        ? false
        : pollingInterval,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })

  // Derive status from query state + external conditions
  const getStatus = (): CowbotStatus => {
    if (isListedDTF) return 'external'
    if (!shouldRun) return 'idle'
    if (query.isLoading) return 'initializing'
    if (query.isError) return 'error'
    if (
      query.data?.status === 'skipped' &&
      query.data.reason === 'unsupported_version'
    )
      return 'unsupported'
    return 'running'
  }

  const start = useCallback(() => {
    setEnabled(true)
  }, [])

  const stop = useCallback(() => {
    setEnabled(false)
    queryClient.cancelQueries({ queryKey: ['cowbot', folioAddress, chainId] })
  }, [queryClient, folioAddress, chainId])

  const reset = useCallback(() => {
    setEnabled(true)
    setTotalOrders(0)
    submittedOrdersRef.current.clear()
    queryClient.resetQueries({ queryKey: ['cowbot', folioAddress, chainId] })
  }, [queryClient, folioAddress, chainId])

  return {
    status: getStatus(),
    enabled,
    totalOrders,
    error: query.error,
    lastResult: query.data ?? null,
    isSupportedChain,
    start,
    stop,
    reset,
  }
}
