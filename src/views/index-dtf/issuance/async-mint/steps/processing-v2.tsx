import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatTokenAmount } from '@/utils'
import {
  AsyncZapExecutionStep,
  AsyncZapOrderState,
} from '@reserve-protocol/async-zap-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { Check, Loader, X } from 'lucide-react'
import { useEffect } from 'react'
import { formatUnits } from 'viem'
import { useAsyncZap } from '../async-zap-context'
import { inputTokenAtom, wizardStepAtom } from '../atoms'

const STEP_LABELS: Record<AsyncZapExecutionStep, string> = {
  idle: 'Preparing…',
  finalized: 'Finalizing quote…',
  submitting_and_signing: 'Sign the transaction in your wallet…',
  waiting_submit_and_sign: 'Confirming transaction…',
  waiting_orders: 'Waiting for swaps to fill…',
  finishing: 'Sign the final transaction in your wallet…',
  waiting_finish: 'Confirming final transaction…',
  complete: 'Complete',
  error: 'Something went wrong',
}

const OrderAttemptRow = ({ order }: { order: AsyncZapOrderState }) => {
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const settled = order.phase === 'fulfilled'
  const failed = order.phase === 'failed'

  return (
    <div
      className={cn(
        '-mx-2 rounded-[18px] border px-4 py-3 transition-colors',
        settled && 'border-primary/35 bg-primary/5',
        failed && 'border-destructive/25 bg-destructive/5',
        !settled && !failed && 'border-border/70 bg-background'
      )}
    >
      <div className="flex items-center gap-3">
        {order.cowOrder?.buyToken ? (
          <TokenLogoWithChain
            address={order.cowOrder.buyToken}
            chain={chainId}
            size="lg"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">
            {order.orderUid
              ? `Order ${order.orderUid.slice(0, 10)}…`
              : `Leg ${order.legId}`}
          </div>
          <div
            className={cn(
              'text-xs font-light text-muted-foreground',
              failed && 'text-destructive/70'
            )}
          >
            {order.error?.message ?? order.phase}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm font-medium">
          -
          {formatTokenAmount(
            Number(formatUnits(order.sellAmount, inputToken.decimals))
          )}{' '}
          {inputToken.symbol}
        </div>
        <div className="h-5 w-5 shrink-0">
          {settled && <Check size={18} className="text-primary" />}
          {failed && <X size={18} className="text-destructive" />}
          {!settled && !failed && (
            <Loader size={18} className="animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}

const ProcessingV2 = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const { execution } = useAsyncZap()

  const { step, ordersByLegId, error } = execution
  const orders = Object.values(ordersByLegId)

  // Move to success once the SDK reports completion.
  useEffect(() => {
    if (step === 'complete') {
      setStep('success')
    }
  }, [step, setStep])

  const isError = step === 'error'

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full">
      <div className="grid w-full gap-0.5 lg:grid-cols-[480px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="bg-card rounded-2xl p-2 flex flex-col lg:col-start-1 lg:row-start-2 lg:h-full">
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-3 px-4 py-10">
            {isError ? (
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <X size={24} className="text-destructive" />
              </div>
            ) : (
              <Loader size={32} className="animate-spin text-primary" />
            )}
            <div>
              <h3 className="font-medium text-lg">{STEP_LABELS[step]}</h3>
              {isError && error && (
                <p className="mt-1 text-sm text-destructive/80 max-w-[420px]">
                  {error.message}
                </p>
              )}
              {!isError && (
                <p className="mt-1 text-sm text-muted-foreground font-light">
                  Keep this window open until your operation completes.
                </p>
              )}
            </div>
          </div>

          {isError && (
            <div className="px-2 pb-2 flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full h-[49px] rounded-[12px]"
                onClick={() => void execution.retryFailedOrders()}
              >
                Retry failed orders
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-[49px] rounded-[12px]"
                onClick={() => {
                  execution.reset()
                  setStep('configure')
                }}
              >
                Start over
              </Button>
            </div>
          )}
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
          <div className="px-4 py-3">
            <h3 className="font-medium text-base">Order progress</h3>
            <p className="text-sm text-muted-foreground font-light">
              Swaps are settled by CoW Protocol solvers.
            </p>
          </div>

          <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex flex-col gap-1 px-2">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <OrderAttemptRow key={order.legId} order={order} />
                ))
              ) : (
                <div className="flex min-h-[320px] flex-1 items-center justify-center px-4 py-10 text-center">
                  <p className="max-w-[260px] text-sm text-muted-foreground font-light">
                    Waiting for swaps to start…
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default ProcessingV2
