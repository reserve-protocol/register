import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import {
  formatCurrency,
  formatTokenAmount,
  getFolioRoute,
  shortenAddress,
} from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatEther, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  actualMintedSharesAtom,
  inputTokenAtom,
  leftoverCollateralAtom,
  mintAmountAtom,
  mintTxHashAtom,
  orderIdsAtom,
  recoveryChoiceAtom,
  resetWizardAtom,
  slippageAtom,
  tokenPricesAtom,
} from '../atoms'
import OrderRow from '../components/order-row'
import { useReverseOrders } from '../hooks/use-reverse-orders'

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

const MintHistoryRow = ({
  txHash,
  chainId,
  symbol,
  address,
  amount,
}: {
  txHash?: string
  chainId: number
  symbol?: string
  address?: string
  amount: number
}) => {
  const isValidTxHash = txHash && /^0x[a-fA-F0-9]{64}$/.test(txHash)
  const content = (
    <div className="flex items-center gap-4">
      <TokenLogo
        address={address}
        symbol={symbol || ''}
        chain={chainId}
        size="xl"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-base truncate">Minted {symbol}</div>
        <div className="flex items-center gap-1.5 text-sm font-light text-primary">
          <Check size={14} />
          <span>Mint complete</span>
        </div>
      </div>
      <div className="min-w-[156px] text-right">
        <div className="text-base font-medium">{formatTokenAmount(amount)}</div>
        <div className="text-sm text-muted-foreground font-light">{symbol}</div>
      </div>
      {isValidTxHash && (
        <div className="flex w-6 shrink-0 justify-end">
          <ArrowUpRight size={13} />
        </div>
      )}
    </div>
  )

  return (
    <div className="-mx-2 rounded-[18px] border border-primary/35 bg-primary/5 px-4 py-3">
      {isValidTxHash ? (
        <Link
          to={getExplorerLink(txHash, chainId, ExplorerDataType.TRANSACTION)}
          target="_blank"
          className="block"
        >
          {content}
        </Link>
      ) : (
        <>
          {content}
          {txHash && (
            <div className="mt-2 text-xs text-muted-foreground font-light">
              Bundle reference {shortenAddress(txHash)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const Success = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const slippage = useAtomValue(slippageAtom)
  const orderIds = useAtomValue(orderIdsAtom)
  const recoveryChoice = useAtomValue(recoveryChoiceAtom)
  const leftoverCollateral = useAtomValue(leftoverCollateralAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const mintTxHash = useAtomValue(mintTxHashAtom)
  const actualMintedShares = useAtomValue(actualMintedSharesAtom)
  const resetWizard = useSetAtom(resetWizardAtom)

  const [conversionDone, setConversionDone] = useState(false)
  const { reverseAsync, isPending: isConverting } = useReverseOrders()

  if (!indexDTF) return null

  const parsedAmount = Number(mintAmount)
  const dtfAmount =
    actualMintedShares > 0n
      ? Number(formatEther(actualMintedShares))
      : dtfPrice
        ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
        : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const slippagePct = Number(slippage) / 100
  const originalDtfAmount = dtfPrice ? parsedAmount / dtfPrice : 0
  const isReduced = recoveryChoice === 'mint-reduced'
  const mintFee = indexDTF.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'
  const estimatedUnusedBuffer = Math.max(parsedAmount - dtfValue, 0)
  const hasLeftovers = isReduced && Object.keys(leftoverCollateral).length > 0
  const leftoverCount = Object.keys(leftoverCollateral).length
  const leftoverValue = Object.entries(leftoverCollateral).reduce(
    (sum, [addr, amount]) => {
      const token = basket?.find(
        (t) => t.address.toLowerCase() === addr.toLowerCase()
      )
      const price = tokenPrices[addr.toLowerCase() as `0x${string}`] ?? 0
      const dec = token?.decimals ?? 18
      return sum + Number(formatUnits(amount, dec)) * price
    },
    0
  )
  const estimatedReturn = leftoverValue * (1 - slippagePct / 100)

  const handleConvert = async () => {
    try {
      await reverseAsync(leftoverCollateral)
      setConversionDone(true)
    } catch {
      // User rejected or tx failed; stay on success screen.
    }
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
                    onClick={() => resetWizard()}
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
                <div className="mb-3 text-base text-primary">
                  Mint Completed
                </div>
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
                <div className="mt-2 flex items-center gap-2 text-base text-muted-foreground font-light">
                  <span>${formatCurrency(dtfValue)}</span>
                  {isReduced && (
                    <span className="line-through">
                      {formatTokenAmount(originalDtfAmount)}{' '}
                      {indexDTF.token.symbol}
                    </span>
                  )}
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
                label="Final value"
                value={`$${formatCurrency(dtfValue)}`}
                subvalue={`${formatTokenAmount(dtfAmount)} ${indexDTF.token.symbol}`}
              />
              <SummaryRow
                label="Est. unused buffer"
                value={`$${formatCurrency(estimatedUnusedBuffer)}`}
                subvalue={`Includes price movement · -${spreadPct.toFixed(2)}%`}
              />
              <SummaryRow label="Mint fee" value={`${mintFee}%`} />
              <SummaryRow
                label="Rate"
                value={
                  dtfPrice
                    ? `${formatTokenAmount(1 / dtfPrice)} ${indexDTF.token.symbol} / $1`
                    : 'Unavailable'
                }
              />
            </div>

            {hasLeftovers && (
              <div className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-base">
                      Leftover collateral
                    </div>
                    <p className="mt-1 text-sm font-light text-muted-foreground">
                      {conversionDone
                        ? `Converted ${leftoverCount} leftover tokens.`
                        : `≈$${formatCurrency(leftoverValue)} can be swapped back to ${inputToken.symbol}.`}
                    </p>
                  </div>
                  <StackTokenLogo
                    tokens={(basket || [])
                      .filter((t) =>
                        Object.keys(leftoverCollateral).some(
                          (a) => a.toLowerCase() === t.address.toLowerCase()
                        )
                      )
                      .slice(0, 4)
                      .map((t) => ({ ...t, chain: indexDTF.chainId }))}
                    size={28}
                    overlap={8}
                    reverseStack
                    outsource
                  />
                </div>
                {!conversionDone && (
                  <Button
                    size="sm"
                    className="mt-4 rounded-full"
                    onClick={handleConvert}
                    disabled={isConverting}
                  >
                    {isConverting
                      ? 'Converting...'
                      : `Swap to ${inputToken.symbol}`}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
          <div className="px-4 py-3">
            <h3 className="font-medium text-base">Activity history</h3>
            <p className="text-sm text-muted-foreground font-light">
              Collateral acquisition and final mint execution.
            </p>
          </div>

          <div className="flex flex-col gap-6 px-2 pb-2 lg:flex-1">
            <div>
              <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Collateral acquisition
              </div>
              {orderIds.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {orderIds.map((id) => (
                    <OrderRow key={id} orderId={id} disableFetch />
                  ))}
                </div>
              ) : (
                <div className="-mx-2 rounded-[18px] border border-border/70 px-4 py-3 text-sm text-muted-foreground font-light">
                  No collateral swaps were needed for this mint.
                </div>
              )}
            </div>

            <div>
              <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mint execution
              </div>
              <MintHistoryRow
                txHash={mintTxHash}
                chainId={chainId}
                symbol={indexDTF.token.symbol}
                address={indexDTF.id}
                amount={dtfAmount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success
