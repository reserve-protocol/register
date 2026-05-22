import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { useAsyncZapMint } from '../async-zap-context'
import { inputTokenAtom, mintAmountAtom, wizardStepAtom } from '../atoms'

const SummaryRow = ({
  label,
  value,
  subvalue,
}: {
  label: string
  value: string
  subvalue?: string
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-base text-muted-foreground font-light">{label}</span>
    <div className="text-right">
      <div className="text-base font-medium">{value}</div>
      {subvalue && (
        <div className="text-xs text-muted-foreground font-light">
          {subvalue}
        </div>
      )}
    </div>
  </div>
)

const Success = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const setStep = useSetAtom(wizardStepAtom)
  const setMintAmount = useSetAtom(mintAmountAtom)
  const { currentQuote, execution } = useAsyncZapMint()

  if (!indexDTF) return null

  const parsedAmount = Number(mintAmount)
  const dtfAmount = currentQuote
    ? Number(formatUnits(currentQuote.shares, 18))
    : 0
  const spentUsd = currentQuote
    ? Number(
        formatUnits(currentQuote.totalQuoteTokenAmount, inputToken.decimals)
      )
    : 0
  const unusedBuffer = Math.max(parsedAmount - spentUsd, 0)
  const mintFee = indexDTF.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  const handleNewMint = () => {
    execution.reset()
    setMintAmount('')
    setStep('configure')
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
      <div className="grid w-full gap-0.5 lg:min-h-[calc(100vh-108px)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4 lg:col-start-1 lg:row-start-1">
          <Tabs value="mint">
            <TabsList className="h-9">
              <TabsTrigger
                value="mint"
                className="px-3 data-[state=active]:text-primary"
              >
                Mint
              </TabsTrigger>
              <TabsTrigger value="redeem" disabled className="px-3">
                Redeem
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="min-w-0 flex flex-col gap-0.5 lg:col-start-1 lg:row-start-2 lg:h-full">
          <div className="bg-card rounded-2xl p-6 lg:min-h-[260px]">
            <div className="flex h-full min-h-[212px] flex-col justify-between gap-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check size={17} strokeWidth={1.7} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full"
                    onClick={handleNewMint}
                  >
                    <RotateCcw size={14} />
                    New mint
                  </Button>
                  <Button asChild size="sm" className="rounded-full">
                    <Link
                      to={getFolioRoute(indexDTF.id, chainId, ROUTES.OVERVIEW)}
                    >
                      View DTF
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-3 text-base text-primary">Mint Completed</div>
                <div className="flex items-center gap-2">
                  <TokenLogo
                    address={indexDTF.id}
                    symbol={indexDTF.token.symbol}
                    chain={chainId}
                    size="xl"
                  />
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-[40px] font-light text-primary leading-10">
                      {formatTokenAmount(dtfAmount)}
                    </span>
                    <span className="text-[40px] font-light text-muted-foreground leading-10">
                      {indexDTF.token.symbol}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-base text-muted-foreground font-light">
                  ${formatCurrency(spentUsd)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 flex flex-col gap-6 lg:flex-1">
            <div className="grid gap-3">
              <SummaryRow
                label="Input amount"
                value={`$${formatCurrency(parsedAmount)} ${inputToken.symbol}`}
              />
              <SummaryRow
                label="Spent"
                value={`$${formatCurrency(spentUsd)} ${inputToken.symbol}`}
                subvalue={`${formatTokenAmount(dtfAmount)} ${indexDTF.token.symbol}`}
              />
              <SummaryRow
                label="Unused (returned)"
                value={`$${formatCurrency(unusedBuffer)} ${inputToken.symbol}`}
              />
              <SummaryRow label="Mint fee" value={`${mintFee}%`} />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
          <div className="px-4 py-3">
            <h3 className="font-medium text-base">Activity history</h3>
            <p className="text-sm text-muted-foreground font-light">
              Collateral swaps for this mint.
            </p>
          </div>

          <div className="flex flex-col gap-1 px-2 pb-2 lg:flex-1">
            {execution.orders.length > 0 ? (
              execution.orders.map((order) => (
                <a
                  key={order.legId}
                  href={
                    order.orderUid
                      ? `https://explorer.cow.fi/orders/${order.orderUid}`
                      : undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="-mx-2 rounded-[18px] border border-primary/35 bg-primary/5 px-4 py-3 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-base truncate">
                      {order.cowOrder?.buyToken
                        ? `Bought ${order.cowOrder.buyToken.slice(0, 8)}…`
                        : `Leg ${order.legId}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-light text-primary">
                      <Check size={14} />
                      <span>{(order.status as string) ?? 'submitted'}</span>
                    </div>
                  </div>
                  {order.orderUid && (
                    <ArrowUpRight size={13} className="shrink-0" />
                  )}
                </a>
              ))
            ) : (
              <div className="-mx-2 rounded-[18px] border border-border/70 px-4 py-3 text-sm text-muted-foreground font-light">
                No collateral swaps were needed for this mint.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success
