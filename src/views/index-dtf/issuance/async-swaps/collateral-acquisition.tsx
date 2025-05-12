import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { getTimerFormat } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowLeft, ArrowRight, Check, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  asyncSwapResponseAtom,
  collateralPanelOpenAtom,
  currentAsyncSwapTabAtom,
} from './atom'
import MintButton from './mint-button'

const OpenCollateralPanel = () => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const [open, setOpen] = useAtom(collateralPanelOpenAtom)

  return (
    <Button
      variant="ghost"
      size="xs"
      className="flex items-center gap-1 rounded-full bg-muted h-8"
      onClick={() => setOpen((prev) => !prev)}
    >
      {open && <ArrowLeft size={16} />}
      <StackTokenLogo
        tokens={(basket || []).slice(0, 5)}
        size={16}
        overlap={4}
        reverseStack
      />
      {!open && <ArrowRight size={16} />}
    </Button>
  )
}

const CollateralAcquisition = () => {
  const tab = useAtomValue(currentAsyncSwapTabAtom)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!asyncSwapResponse?.createdAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const createdAt = new Date(asyncSwapResponse.createdAt)
      const elapsed = now.getTime() - createdAt.getTime()
      setElapsedTime(elapsed / 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [asyncSwapResponse?.createdAt])

  if (!asyncSwapResponse) return null

  const hasAllCollaterals = asyncSwapResponse.cowswapOrders.every(
    (order) => order.status.type === 'traded' || order.status.type === 'solved'
  )

  if (hasAllCollaterals) {
    return (
      <div>
        <div className="flex gap-2 items-center justify-between p-4 border-t border-border">
          <div className="flex gap-2 items-center text-primary">
            <div className="border border-primary/80 rounded-full p-1.5">
              <Check size={16} strokeWidth={1.5} />
            </div>
            <div className="font-semibold">Collateral Acquired</div>
          </div>
          <OpenCollateralPanel />
        </div>
        <MintButton />
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_5s_infinite] bg-[length:200%_100%]">
      <div className="flex gap-2 items-center justify-between p-4 bg-card rounded-2xl shadow-md">
        <div className="flex gap-2 items-center text-primary">
          <div className="border border-primary/40 rounded-full p-1.5">
            <Loader size={16} strokeWidth={1.5} className="animate-spin-slow" />
          </div>
          <div className="font-semibold">
            {tab === 'mint'
              ? 'Acquiring Collateral'
              : 'Selling collateral for USDC'}
          </div>
        </div>
        <div className="text-muted-foreground">
          {getTimerFormat(elapsedTime)}
        </div>
      </div>
    </div>
  )
}

export default CollateralAcquisition
