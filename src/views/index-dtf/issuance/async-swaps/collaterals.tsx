import { cn } from '@/lib/utils'
import { OrderStatus } from '@cowprotocol/cow-sdk'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  asyncSwapResponseAtom,
  openCollateralPanelAtom,
  orderIdsAtom,
  universalFailedOrdersAtom,
  universalSuccessOrdersAtom,
} from './atom'
import CowSwapOrder from './cowswap-order'
import { QuoteProvider } from './types'
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
  const asyncSwapResponse = get(asyncSwapResponseAtom)
  const open = get(openCollateralPanelAtom)
  return asyncSwapResponse && open
})

const Collaterals = () => {
  const orderIDs = useAtomValue(orderIdsAtom)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const universalSuccessOrders = useAtomValue(universalSuccessOrdersAtom)
  const universalFailedOrders = useAtomValue(universalFailedOrdersAtom)
  const open = useAtomValue(openCollateralPanelAtom)
  const [isVisible, setIsVisible] = useAtom(isVisibleAtom)
  const [shouldRender, setShouldRender] = useAtom(shouldRenderAtom)

  useEffect(() => {
    if (asyncSwapResponse && open) {
      setShouldRender(true)
      const timer = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [asyncSwapResponse, open, setIsVisible, setShouldRender])

  const { cowswapOrders = [] } = asyncSwapResponse || {}

  const sortedOrderIds = useMemo(
    () =>
      orderIDs
        .filter((o) => o.provider === QuoteProvider.CowSwap)
        .sort((a, b) => {
          const orderA = cowswapOrders.find((o) => o.orderId === a.id)
          const orderB = cowswapOrders.find((o) => o.orderId === b.id)

          if (!orderA?.status || !orderB?.status) return 0

          const orderAPriority = STATUS_PRIORITY[orderA.status as OrderStatus]
          const orderBPriority = STATUS_PRIORITY[orderB.status as OrderStatus]

          return orderAPriority - orderBPriority
        }),
    [cowswapOrders]
  )

  if (!shouldRender) return null

  return (
    <div
      className={cn(
        'flex flex-col px-6 py-2 overflow-y-auto flex-1 transition-all duration-300 ease-in-out max-h-[340px]',
        isVisible ? 'w-[400px]' : 'w-0'
      )}
    >
      {sortedOrderIds.map((order) => (
        <CowSwapOrder key={order.id} orderId={order.id} />
      ))}
      {universalSuccessOrders.map((order) => (
        <UniversalOrder key={order.id} order={order} />
      ))}
      {universalFailedOrders.map((quote) => (
        <UniversalFailedOrder key={quote.id} quote={quote} />
      ))}
    </div>
  )
}

export default Collaterals
