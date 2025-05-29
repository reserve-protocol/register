import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { getTimerFormat } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, ArrowRight, Check, Loader, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  asyncSwapResponseAtom,
  failedOrdersAtom,
  hasAllCollateralsAtom,
  openCollateralPanelAtom,
  operationAtom,
  pendingOrdersAtom,
  successAtom,
} from './atom'
import MintButton from './mint-button'
import { OrderStatus } from '@cowprotocol/cow-sdk'
import { useRefreshQuotes } from './hooks/useQuote'
import { useQuoteSignatures } from './hooks/useQuoteSignatures'

const OpenCollateralPanel = () => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const [open, setOpen] = useAtom(openCollateralPanelAtom)

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

const RequoteFailedOrders = () => {
  const { isFetching } = useRefreshQuotes()
  const failedOrdersQty = useAtomValue(failedOrdersAtom).length
  const { mutate: signQuotes, isPending: isSigning } = useQuoteSignatures(true)

  return (
    <div className="border-t border-border">
      <div className="flex gap-2 items-center justify-between p-4">
        <div className="flex gap-2 items-center text-primary">
          <div className="border border-primary/40 rounded-full p-1.5">
            <RefreshCw size={16} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-semibold">Prices have moved</div>
            <div className="font-light text-muted-foreground text-sm">
              Accept the new quotes for {failedOrdersQty} tokens.
            </div>
          </div>
        </div>
        {/* <OpenCollateralPanel /> */}
      </div>
      <Button
        size="lg"
        className="w-full rounded-xl bg-black text-white"
        disabled={isFetching || isSigning}
        onClick={() => signQuotes()}
      >
        {isFetching
          ? 'Awaiting Quotes'
          : isSigning
            ? 'Signing...'
            : 'Accept New Quotes'}
      </Button>
    </div>
  )
}

const CollateralAcquisition = () => {
  const operation = useAtomValue(operationAtom)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const [elapsedTime, setElapsedTime] = useState(0)
  const setSuccess = useSetAtom(successAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)
  const pendingOrders = useAtomValue(pendingOrdersAtom)
  const hasAllCollaterals = useAtomValue(hasAllCollateralsAtom)

  const refreshQuotes = useMemo(
    () => failedOrders.length > 0 && pendingOrders.length === 0,
    [failedOrders, pendingOrders]
  )

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

  useEffect(() => {
    if (hasAllCollaterals && operation === 'redeem') {
      setSuccess(true)
    }
  }, [hasAllCollaterals, setSuccess, operation])

  if (!asyncSwapResponse) return null

  if (hasAllCollaterals && operation === 'mint') {
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

  if (refreshQuotes) return <RequoteFailedOrders />

  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_5s_infinite] bg-[length:200%_100%]">
      <div className="flex gap-2 items-center justify-between p-4 bg-card rounded-2xl shadow-md">
        <div className="flex gap-2 items-center text-primary">
          <div className="border border-primary/40 rounded-full p-1.5">
            <Loader size={16} strokeWidth={1.5} className="animate-spin-slow" />
          </div>
          <div className="font-semibold">
            {operation === 'mint'
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
