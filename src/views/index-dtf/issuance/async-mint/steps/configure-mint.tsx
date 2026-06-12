import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { flushSync } from 'react-dom'
import { formatUnits } from 'viem'
import {
  inputTokenAtom,
  mintAmountAtom,
  operationAtom,
  redeemAmountAtom,
  useExistingBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import OndoLimitsBanner, {
  useOndoTradingPaused,
} from '../components/ondo-limits-banner'
import { useWizardBalances } from '../hooks/use-wizard-balances'

const upcomingStepRowClass = 'px-6 py-4 border-b border-secondary'

const ConfigureMint = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const { balanceOf } = useWizardBalances()
  const [operation, setOperation] = useAtom(operationAtom)
  const [mintAmount, setMintAmount] = useAtom(mintAmountAtom)
  const [redeemAmount, setRedeemAmount] = useAtom(redeemAmountAtom)
  const setUseExistingBalances = useSetAtom(useExistingBalancesAtom)
  const ondoTradingPaused = useOndoTradingPaused()

  if (!indexDTF) return null

  const isMint = operation === 'mint'

  // Balances: input token for mint, DTF shares for redeem. Read locally so the
  // DTF share token + basket collaterals are covered (the global balancesAtom
  // doesn't track them on an Index DTF page) and stay live after a tx.
  const inputBalanceAmount = Number(
    formatUnits(balanceOf(inputToken.address), inputToken.decimals)
  )
  const dtfBalanceAmount = Number(formatUnits(balanceOf(indexDTF.id), 18))

  const amount = isMint ? mintAmount : redeemAmount
  const setAmount = isMint ? setMintAmount : setRedeemAmount
  const parsedAmount = Number(amount) || 0
  const maxAmount = isMint ? inputBalanceAmount : dtfBalanceAmount
  const exceedsBalance = parsedAmount > maxAmount
  const inputUsdValue = isMint
    ? parsedAmount
    : indexDTFPrice
      ? parsedAmount * indexDTFPrice
      : undefined
  // Allow exceeding the balance so the user can still preview quotes; the
  // error stays visible and submission is blocked on the quote screen.
  const isValid = parsedAmount > 0 && !ondoTradingPaused

  const handleMax = () => {
    // Use the exact on-chain balance string — Number(formatUnits()).toFixed
    // loses precision and can round above the real balance, which then trips
    // "Exceeds available balance" (mint) or reverts (redeem).
    const balance = isMint
      ? balanceOf(inputToken.address)
      : balanceOf(indexDTF.id)
    const decimals = isMint ? inputToken.decimals : 18
    if (balance > 0n) setAmount(formatUnits(balance, decimals))
  }

  const handleGetQuote = () => {
    const goToQuoteSummary = () => {
      setUseExistingBalances(false)
      setStep('quote-summary')
    }
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }

    if (typeof transitionDocument.startViewTransition === 'function') {
      try {
        transitionDocument.startViewTransition(() => {
          flushSync(goToQuoteSummary)
        })
        return
      } catch {
        goToQuoteSummary()
      }
    } else {
      goToQuoteSummary()
    }
  }

  const upcomingSteps = isMint
    ? [
        [
          'Automatically acquire assets',
          `We use your ${inputToken.symbol} to get the assets needed for the mint.`,
        ],
        [
          `Mint ${indexDTF.token.symbol}`,
          'The acquired assets are used to mint your DTF.',
        ],
      ]
    : [
        [
          'Automatically sell collateral',
          `We redeem your ${indexDTF.token.symbol} and sell the collateral for ${inputToken.symbol}.`,
        ],
      ]

  return (
    <div className="w-full">
      <div className="flex min-h-[calc(100vh-136px)] w-full items-center lg:min-h-[calc(100vh-100px)]">
        <div className="w-full">
          <div className="p-3 flex justify-center">
            <Tabs
              value={operation}
              onValueChange={(v) => setOperation(v as 'mint' | 'redeem')}
            >
              <TabsList className="bg-card/40 border border-card p-0.5 h-fit rounded-full">
                <TabsTrigger value="mint" className="px-3.5 rounded-full">
                  Mint
                </TabsTrigger>
                <TabsTrigger value="redeem" className="px-3.5 rounded-full">
                  Redeem
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-3xl bg-card/50 border-2 border-card overflow-hidden flex flex-col">
            <div
              className="bg-card p-2 rounded-3xl flex flex-col gap-2"
              style={{ viewTransitionName: isMint ? 'async-mint-step-1' : '' }}
            >
              <OndoLimitsBanner />
              <div className="px-4 py-3">
                <h3 className="font-medium text-base">
                  {isMint
                    ? `Enter ${inputToken.symbol} amount`
                    : 'Redeem amount'}
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {isMint
                    ? `Choose how much ${inputToken.symbol} to use for this mint.`
                    : `Redeem ${indexDTF.token.symbol} for ${inputToken.symbol}.`}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-4 py-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{isMint ? 'You provide' : 'You redeem'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <NumericalInput
                    variant="transparent"
                    value={amount}
                    onChange={setAmount}
                    placeholder="0.00"
                    className={cn(
                      'min-w-0 flex-1 text-[32px] font-light text-primary',
                      exceedsBalance && 'text-destructive'
                    )}
                  />
                  <div className="flex shrink-0 items-center gap-2">
                    <TokenLogoWithChain
                      address={isMint ? inputToken.address : indexDTF.id}
                      symbol={
                        isMint ? inputToken.symbol : indexDTF.token.symbol
                      }
                      chain={chainId}
                      width={28}
                      height={28}
                      chainClassName="rounded-full border border-muted bg-muted"
                    />
                    <span className="text-[32px] font-light leading-8 text-muted-foreground">
                      {isMint ? inputToken.symbol : indexDTF.token.symbol}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {inputUsdValue === undefined
                      ? '-'
                      : `$${formatCurrency(inputUsdValue)}`}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-medium">
                      {isMint
                        ? formatCurrency(maxAmount)
                        : formatTokenAmount(maxAmount)}{' '}
                      {isMint ? inputToken.symbol : indexDTF.token.symbol}
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-6 rounded-full bg-primary/15 px-2 font-semibold text-primary/80 hover:bg-primary/15 hover:text-primary/80"
                      onClick={handleMax}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                {exceedsBalance && (
                  <div className="mt-2 text-sm text-destructive">
                    Exceeds available balance
                  </div>
                )}
              </div>

              <Button
                size="lg"
                className="w-full h-[49px] rounded-[12px]"
                disabled={!isValid}
                onClick={handleGetQuote}
              >
                Get quote
              </Button>
            </div>

            {upcomingSteps.map(([title, subtitle], index) => (
              <div
                key={title}
                className={upcomingStepRowClass}
                style={{ viewTransitionName: `async-mint-step-${index + 2}` }}
              >
                <div className="relative flex items-center">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">
                    {index + 2}
                  </span>
                  <div className="pl-3">
                    <div className="text-sm font-medium">{title}</div>
                    <div className="mt-px text-sm font-light text-muted-foreground">
                      {subtitle}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!isMint && (
            <div
              className={cn(upcomingStepRowClass, 'invisible')}
              aria-hidden="true"
            >
              <div className="relative flex items-center">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">
                  3
                </span>
                <div className="pl-3">
                  <div className="text-sm font-medium">
                    Mint layout height spacer
                  </div>
                  <div className="mt-px text-sm font-light text-muted-foreground">
                    Keeps the tabs and input card anchored while switching.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigureMint
