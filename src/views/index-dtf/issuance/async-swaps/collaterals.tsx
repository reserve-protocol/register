import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { asyncSwapResponseAtom, collateralPanelOpenAtom } from './atom'
import CowSwapOrder from './cowswap-order'

const Collaterals = () => {
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const open = useAtomValue(collateralPanelOpenAtom)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

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
  }, [asyncSwapResponse, open])

  if (!shouldRender) return null

  const { cowswapOrders = [] } = asyncSwapResponse || {}

  return (
    <div
      className={cn(
        'flex flex-col px-6 py-2 rounded-2xl overflow-y-auto flex-1 border-l-4 border-secondary transition-all duration-300 ease-in-out',
        isVisible ? 'w-[400px]' : 'w-0'
      )}
    >
      {cowswapOrders.map((order) => (
        <CowSwapOrder key={order.orderId} order={order} />
      ))}
    </div>
  )
}

export default Collaterals
