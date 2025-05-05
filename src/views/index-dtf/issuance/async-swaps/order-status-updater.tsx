import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RESERVE_API } from '@/utils/constants'
import { asyncSwapResponseAtom, asyncSwapOrderIdAtom } from './atom'
import { AsyncSwapOrderResponse } from './types'

const OrderStatusUpdater = () => {
  const setAsyncSwapResponse = useSetAtom(asyncSwapResponseAtom)
  const swapOrderId = useAtomValue(asyncSwapOrderIdAtom)

  const { data } = useQuery({
    queryKey: ['async-swap-order', swapOrderId],
    queryFn: async () => {
      if (!swapOrderId) return null
      const response = await fetch(
        `${RESERVE_API}async-swap/order?orderId=${swapOrderId}`
      )
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      return response.json() as Promise<AsyncSwapOrderResponse>
    },
    enabled: !!swapOrderId,
    refetchInterval: 2000, // Poll every 2 seconds
    retry: false,
  })

  useEffect(() => {
    if (data) {
      setAsyncSwapResponse(data)
    }
  }, [data, setAsyncSwapResponse])

  return null
}

export default OrderStatusUpdater
