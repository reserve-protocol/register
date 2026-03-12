import { OrderStatus } from '@cowprotocol/cow-sdk'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useGlobalProtocolKit } from '../../async-swaps/providers/GlobalProtocolKitProvider'
import { ordersAtom } from '../atoms'

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
  const setOrders = useSetAtom(ordersAtom)

  return useQuery({
    queryKey: ['async-mint/order-status', orderId],
    enabled: !!orderId && !!orderBookApi && !disabled,
    queryFn: async () => {
      if (!orderBookApi) {
        throw new Error('OrderBookApi not initialized')
      }

      const order = await orderBookApi.getOrder(orderId)
      setOrders((prev) => [
        ...prev.filter((o) => o.orderId !== orderId),
        { ...order, orderId },
      ])

      return order
    },
    refetchInterval(query) {
      if (query.state.data && isOrderCompleted(query.state.data.status)) {
        return false
      }
      return 5_000
    },
  })
}
