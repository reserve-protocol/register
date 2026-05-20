import { OrderStatus } from '@cowprotocol/cow-sdk'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { cowswapOrdersAtom } from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'

interface UseOrderStatusParams {
  orderId: string
  disabled?: boolean
}

const isOrderCompleted = (status: OrderStatus) => {
  return [
    OrderStatus.FULFILLED,
    OrderStatus.EXPIRED,
    OrderStatus.CANCELLED,
  ].includes(status)
}

export function useOrderStatus({ orderId, disabled }: UseOrderStatusParams) {
  const { orderBookApi } = useGlobalProtocolKit()
  const setCowswapOrders = useSetAtom(cowswapOrdersAtom)

  return useQuery({
    queryKey: ['order/status', orderId],
    enabled: !!orderId && !!orderBookApi && !disabled,
    queryFn: async () => {
      if (!orderBookApi) {
        throw new Error('OrderBookApi not initialized')
      }

      const order = await orderBookApi.getOrder(orderId)
      setCowswapOrders((prev) => [
        ...prev.filter((o) => o.orderId !== orderId),
        { ...order, orderId },
      ])

      return order
    },
    refetchInterval(query) {
      if (query.state.data && isOrderCompleted(query.state.data.status)) {
        return false
      }

      return 3_000
    },
  })
}
