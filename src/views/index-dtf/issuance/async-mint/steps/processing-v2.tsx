import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatTokenAmount } from '@/utils'
import {
  AsyncZapExecutionStep,
  AsyncZapOrderAttempt,
} from '@reserve-protocol/async-zap-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { Check, Loader, X } from 'lucide-react'
import { useEffect } from 'react'
import { formatUnits } from 'viem'
import { useAsyncZapMint } from '../async-zap-context'
import { inputTokenAtom, wizardStepAtom } from '../atoms'

const STEP_LABELS: Record<AsyncZapExecutionStep, string> = {
  idle: 'Preparing…',
  submitting_orders: 'Submitting orders…',
  signing_first_batch: 'Sign the transaction in your wallet…',
  waiting_first_batch: 'Confirming transaction…',
  syncing_redeem: 'Syncing…',
  waiting_orders: 'Waiting for swaps to fill…',
  signing_second_batch: 'Sign the final transaction in your wallet…',
  waiting_second_batch: 'Confirming final transaction…',
  complete: 'Complete',
  error: 'Something went wrong',
}

const isTerminalSettled = (status?: string) =>
  status === 'fulfilled'

const isFailed = (status?: string) =>
  status === 'submissionFailed' ||
  status === 'cancelled' ||
  status === 'expired'

const OrderAttemptRow = ({ order }: { order: AsyncZapOrderAttempt }) => {
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const status = order.status as string | undefined
  const settled = isTerminalSettled(status)
  const failed = isFailed(status)

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
            {order.error?.message ?? status ?? 'pending'}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm font-medium">
          -{formatTokenAmount(Number(formatUnits(order.sellAmount, inputToken.decimals)))}{' '}
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
  const chainId = useAtomValue(chainIdAtom)
  const setStep = useSetAtom(wizardStepAtom)
  const { execution } = useAsyncZapMint()

  const { step, orders, error } = execution

  // Move to success once the SDK reports completion.
  useEffect(() => {
    if (step === 'complete') {
      setStep('success')
    }
  }, [step, setStep])

  const isError = step === 'error'

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
      <div className="bg-card rounded-2xl p-2 flex flex-col gap-2">
        <div className="px-4 py-5 flex flex-col items-center text-center gap-3">
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
                Keep this window open until your mint completes.
              </p>
            )}
          </div>
        </div>

        {orders.length > 0 && (
          <ScrollArea className="max-h-[420px]">
            <div className="flex flex-col gap-1 px-2">
              {orders.map((order) => (
                <OrderAttemptRow key={order.legId} order={order} />
              ))}
            </div>
          </ScrollArea>
        )}

        {isError && (
          <div className="px-2 pb-2 flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full h-[49px] rounded-[12px]"
              onClick={() => void execution.executeNext()}
            >
              Retry
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
    </div>
  )
}

export default ProcessingV2
