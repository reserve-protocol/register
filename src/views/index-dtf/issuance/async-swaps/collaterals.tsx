import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import { atom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { asyncSwapResponseAtom, collateralPanelOpenAtom } from './atom'
import CowSwapOrder from './cowswap-order'

const STATUS_ORDER_MAP = {
  open: 1,
  scheduled: 1,
  active: 1,
  solved: 2,
  executing: 1,
  traded: 2,
  cancelled: 0,
}

const isVisibleAtom = atom(false)
const shouldRenderAtom = atom(false)
export const showCollateralsAtom = atom((get) => {
  const asyncSwapResponse = get(asyncSwapResponseAtom)
  const open = get(collateralPanelOpenAtom)
  return asyncSwapResponse && open
})

const Collaterals = () => {
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const open = useAtomValue(collateralPanelOpenAtom)
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

  const sortedOrders = useMemo(
    () =>
      cowswapOrders.sort(
        (a, b) =>
          STATUS_ORDER_MAP[a.status.type] - STATUS_ORDER_MAP[b.status.type]
      ),
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
      {sortedOrders.map((order) => (
        <CowSwapOrder key={order.orderId} order={order} />
      ))}
    </div>
  )
}

export default Collaterals
