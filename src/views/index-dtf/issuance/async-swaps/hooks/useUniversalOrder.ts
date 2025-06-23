import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { asyncSwapResponseAtom } from '../atom'
import { useGlobalProtocolKit } from '../providers/GlobalProtocolKitProvider'

export enum UniversalOrderStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

interface UseUniversalOrderParams {
  orderId: string
}

export function useUniversalOrder({ orderId }: UseUniversalOrderParams) {
  const { universalSdk } = useGlobalProtocolKit()
  const setAsyncSwapResponse = useSetAtom(asyncSwapResponseAtom)

  return useQuery({
    queryKey: ['order/status', orderId],
    enabled: !!orderId && !!universalSdk,
    queryFn: async () => {
      if (!universalSdk) {
        throw new Error('UniversalSdk not initialized')
      }

      const orders = await universalSdk.getOrders({ order_id: orderId })
      const order = orders.data[0]
      if (!order) {
        return undefined
      }

      setAsyncSwapResponse((prev) => {
        if (!prev) {
          return undefined
        }

        return {
          ...prev,
          universalOrders: [
            ...(prev?.universalOrders.filter((o) => o.id !== orderId) || []),
            { ...order },
          ],
        }
      })

      return order
    },
    refetchInterval(query) {
      if (query.state.data) {
        if (
          [UniversalOrderStatus.SUCCESS, UniversalOrderStatus.FAILED].includes(
            query.state.data?.status as UniversalOrderStatus
          )
        ) {
          return false
        }
      }

      return 3_000
    },
  })
}
