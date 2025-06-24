import { cn } from '@/lib/utils'
import { OrderStatus } from '@cowprotocol/cow-sdk'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  cowswapOrderIdsAtom,
  cowswapOrdersAtom,
  openCollateralPanelAtom,
  ordersSubmittedAtom,
  universalFailedOrdersAtom,
  universalSuccessOrdersAtom,
} from './atom'
import CowSwapOrder from './cowswap-order'
import UniversalFailedOrder from './universal-failed-order'
import UniversalOrder from './universal-order'

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  [OrderStatus.CANCELLED]: 0,
  [OrderStatus.EXPIRED]: 0,
  [OrderStatus.PRESIGNATURE_PENDING]: 1,
  [OrderStatus.OPEN]: 1,
  [OrderStatus.FULFILLED]: 2,
}

const isVisibleAtom = atom(false)
const shouldRenderAtom = atom(false)
export const showCollateralsAtom = atom((get) => {
  const ordersSubmitted = get(ordersSubmittedAtom)
  const open = get(openCollateralPanelAtom)
  return ordersSubmitted && open
})

const Collaterals = () => {
  const cowswapOrderIds = useAtomValue(cowswapOrderIdsAtom)
  const cowswapOrders = useAtomValue(cowswapOrdersAtom)
  const ordersSubmitted = useAtomValue(ordersSubmittedAtom)
  const universalSuccessOrders = useAtomValue(universalSuccessOrdersAtom)
  const universalFailedOrders = useAtomValue(universalFailedOrdersAtom)
  const open = useAtomValue(openCollateralPanelAtom)
  const [isVisible, setIsVisible] = useAtom(isVisibleAtom)
  const [shouldRender, setShouldRender] = useAtom(shouldRenderAtom)

  useEffect(() => {
    if (ordersSubmitted && open) {
      setShouldRender(true)
      const timer = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [ordersSubmitted, open, setIsVisible, setShouldRender])

  const sortedCowswapOrderIds = useMemo(
    () =>
      cowswapOrderIds.sort((a, b) => {
        const orderA = cowswapOrders.find((o) => o.orderId === a)
        const orderB = cowswapOrders.find((o) => o.orderId === b)

        if (!orderA?.status || !orderB?.status) return 0

        const orderAPriority = STATUS_PRIORITY[orderA.status]
        const orderBPriority = STATUS_PRIORITY[orderB.status]

        return orderAPriority - orderBPriority
      }),
    [cowswapOrders, cowswapOrderIds]
  )

  if (!shouldRender) return null

  return (
    <div
      className={cn(
        'flex flex-col px-6 py-2 overflow-y-auto flex-1 transition-all duration-300 ease-in-out max-h-[340px]',
        isVisible ? 'w-[400px]' : 'w-0'
      )}
    >
      {universalFailedOrders.map((quote, index) => (
        <UniversalFailedOrder key={`${quote.id}-${index}`} quote={quote} />
      ))}
      {sortedCowswapOrderIds.map((orderId) => (
        <CowSwapOrder key={orderId} orderId={orderId} />
      ))}
      {universalSuccessOrders.map((order, index) => (
        <UniversalOrder key={`${order.id}-${index}`} order={order} />
      ))}
    </div>
  )
}

export default Collaterals
