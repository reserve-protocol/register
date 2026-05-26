import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address, formatUnits } from 'viem'
import { useAsyncZap } from '../async-zap-context'
import {
  dustStartBalancesAtom,
  inputTokenAtom,
  mintAmountAtom,
  redeemAmountAtom,
  wizardStepAtom,
} from '../atoms'
import { useDust } from '../hooks/use-dust'

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
  const redeemAmount = useAtomValue(redeemAmountAtom)
  const setStep = useSetAtom(wizardStepAtom)
  const setMintAmount = useSetAtom(mintAmountAtom)
  const setRedeemAmount = useSetAtom(redeemAmountAtom)
  const account = useAtomValue(walletAtom)
  const dustStartBalances = useAtomValue(dustStartBalancesAtom)
  const { quote, execution, operation } = useAsyncZap()
  const isMint = operation === 'mint'

  const { items: dustItems, totalUsd: dustTotalUsd } = useDust({
    quote,
    startBalances: dustStartBalances,
    account: account as Address | undefined,
    chainId,
    inputToken,
  })

  if (!indexDTF) return null

  const paidAmount = Number(isMint ? mintAmount : redeemAmount)
  // Mint: actual minted shares. Redeem: shares redeemed (the input).
  const mintedShares = execution.mintedShares ?? quote?.shares
  const sharesAmount = mintedShares
    ? Number(formatUnits(mintedShares, 18))
    : Number(redeemAmount) || 0
  const quoteTokenAmount = quote
    ? Number(formatUnits(quote.totalQuoteTokenAmount, inputToken.decimals))
    : 0

  // Big number: mint = shares received; redeem = quoteToken received.
  const receiveAmount = isMint ? sharesAmount : quoteTokenAmount
  const receiveSymbol = isMint ? indexDTF.token.symbol : inputToken.symbol
  const receiveAddress = isMint ? indexDTF.id : inputToken.address

  const unusedBuffer = isMint ? Math.max(paidAmount - quoteTokenAmount, 0) : 0
  const feePct = indexDTF.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  const handleNewOperation = () => {
    execution.reset()
    setMintAmount('')
    setRedeemAmount('')
    setStep('configure')
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full">
      <div className="grid w-full gap-0.5 lg:grid-cols-[480px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4 lg:col-start-1 lg:row-start-1">
          <Tabs value={operation}>
            <TabsList className="h-9">
              <TabsTrigger value="mint" className="px-3">
                Mint
              </TabsTrigger>
              <TabsTrigger value="redeem" className="px-3">
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
                    onClick={handleNewOperation}
                  >
                    <RotateCcw size={14} />
                    New {isMint ? 'mint' : 'redeem'}
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
                <div className="mb-3 text-base text-primary">
                  {isMint ? 'Mint Completed' : 'Redeem Completed'}
                </div>
                <div className="flex items-center gap-2">
                  <TokenLogo
                    address={receiveAddress}
                    symbol={receiveSymbol}
                    chain={chainId}
                    size="xl"
                  />
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-[40px] font-light text-primary leading-10">
                      {isMint
                        ? formatTokenAmount(receiveAmount)
                        : `$${formatCurrency(receiveAmount)}`}
                    </span>
                    <span className="text-[40px] font-light text-muted-foreground leading-10">
                      {receiveSymbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 flex flex-col gap-6 lg:flex-1">
            <div className="grid gap-3">
              {isMint ? (
                <>
                  <SummaryRow
                    label="Input amount"
                    value={`$${formatCurrency(paidAmount)} ${inputToken.symbol}`}
                  />
                  <SummaryRow
                    label="Spent"
                    value={`$${formatCurrency(quoteTokenAmount)} ${inputToken.symbol}`}
                    subvalue={`${formatTokenAmount(sharesAmount)} ${indexDTF.token.symbol}`}
                  />
                  <SummaryRow
                    label="Unused (returned)"
                    value={`$${formatCurrency(unusedBuffer)} ${inputToken.symbol}`}
                  />
                </>
              ) : (
                <>
                  <SummaryRow
                    label="Redeemed"
                    value={`${formatTokenAmount(paidAmount)} ${indexDTF.token.symbol}`}
                  />
                  <SummaryRow
                    label="Received"
                    value={`$${formatCurrency(quoteTokenAmount)} ${inputToken.symbol}`}
                  />
                </>
              )}
              <SummaryRow
                label={isMint ? 'Mint fee' : 'Redemption fee'}
                value={`${feePct}%`}
              />
            </div>

            {dustTotalUsd >= 0.01 && (
              <div className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-base">Leftover dust</div>
                    <p className="mt-1 text-sm font-light text-muted-foreground">
                      Swaps leave a small residue in your wallet.
                    </p>
                  </div>
                  <div className="text-right text-base font-medium">
                    ${formatCurrency(dustTotalUsd)}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {dustItems.map((item) => (
                    <div
                      key={item.token.address}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TokenLogoWithChain
                          address={item.token.address}
                          symbol={item.token.symbol}
                          chain={chainId}
                          size="sm"
                        />
                        <span className="font-light text-muted-foreground truncate">
                          {formatTokenAmount(item.amount)} {item.token.symbol}
                        </span>
                      </div>
                      <span className="font-medium">
                        ${formatCurrency(item.usd)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col animate-in fade-in duration-500">
          <div className="px-4 py-3">
            <h3 className="font-medium text-base">Activity history</h3>
            <p className="text-sm text-muted-foreground font-light">
              Collateral swaps for this {operation}.
            </p>
          </div>

          <div className="flex flex-col gap-1 px-2 pb-2 lg:flex-1">
            {Object.values(execution.ordersByLegId).length > 0 ? (
              Object.values(execution.ordersByLegId).map((order) => (
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
                      <span>{order.phase}</span>
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
