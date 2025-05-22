import { OrderStatus } from '@cowprotocol/cow-sdk'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { asyncSwapResponseAtom } from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'

interface UseOrderStatusParams {
  orderId: string
}

export function useOrderStatus({ orderId }: UseOrderStatusParams) {
  const { orderBookApi } = useGlobalProtocolKit()
  const setAsyncSwapResponse = useSetAtom(asyncSwapResponseAtom)

  return useQuery({
    queryKey: ['order/status', orderId],
    enabled: !!orderId && !!orderBookApi,
    queryFn: async () => {
      if (!orderBookApi) {
        throw new Error('OrderBookApi not initialized')
      }

      const order = await orderBookApi.getOrder(orderId)
      setAsyncSwapResponse((prev) => {
        if (!prev) {
          return undefined
        }

        return {
          ...prev,
          cowswapOrders: [
            ...(prev?.cowswapOrders.filter((o) => o.orderId !== orderId) || []),
            { ...order, orderId },
          ],
        }
      })

      return order
    },
    refetchInterval(query) {
      if (query.state.data) {
        if (
          [
            OrderStatus.FULFILLED,
            OrderStatus.EXPIRED,
            OrderStatus.CANCELLED,
          ].includes(query.state.data.status)
        ) {
          return false
        }
      }

      return 3_000
    },
  })
}
