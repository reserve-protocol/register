import { cn } from '@/lib/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  asyncSwapResponseAtom,
  openCollateralPanelAtom,
  orderIdsAtom,
} from './atom'
import CowSwapOrder from './cowswap-order'
import { OrderStatus } from '@cowprotocol/cow-sdk'

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  cancelled: 0,
  expired: 0,
  presignaturePending: 1,
  open: 1,
  fulfilled: 2,
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
      orderIDs.sort((a, b) => {
        const orderA = cowswapOrders.find((o) => o.orderId === a)
        const orderB = cowswapOrders.find((o) => o.orderId === b)

        if (!orderA?.status || !orderB?.status) return 0

        return (
          (STATUS_PRIORITY[orderA.status] ?? 0) -
          (STATUS_PRIORITY[orderB.status] ?? 0)
        )
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
      {sortedOrderIds.map((orderId) => (
        <CowSwapOrder key={orderId} orderId={orderId} />
      ))}
    </div>
  )
}

export default Collaterals
