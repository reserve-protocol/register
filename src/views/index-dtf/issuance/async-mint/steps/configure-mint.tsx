import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { formatUnits } from 'viem'
import {
  inputTokenAtom,
  mintAmountAtom,
  operationAtom,
  redeemAmountAtom,
  useExistingBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import { useWizardBalances } from '../hooks/use-wizard-balances'

const ConfigureMint = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const { balanceOf } = useWizardBalances()
  const [operation, setOperation] = useAtom(operationAtom)
  const [mintAmount, setMintAmount] = useAtom(mintAmountAtom)
  const [redeemAmount, setRedeemAmount] = useAtom(redeemAmountAtom)
  const [useExistingBalances, setUseExistingBalances] = useAtom(
    useExistingBalancesAtom
  )

  if (!indexDTF) return null

  const isMint = operation === 'mint'

  // Balances: input token for mint, DTF shares for redeem. Read locally so the
  // DTF share token + basket collaterals are covered (the global balancesAtom
  // doesn't track them on an Index DTF page) and stay live after a tx.
  const inputBalanceAmount = Number(
    formatUnits(balanceOf(inputToken.address), inputToken.decimals)
  )
  const dtfBalanceAmount = Number(formatUnits(balanceOf(indexDTF.id), 18))

  // Collaterals the user already holds (only those with balance > 0). On redeem
  // the input/output token (USDC/USDT) isn't a token we "use", so drop it.
  const heldCollaterals = (basket ?? [])
    .filter(
      (token) =>
        token.address.toLowerCase() !== inputToken.address.toLowerCase()
    )
    .map((token) => ({ token, value: balanceOf(token.address) }))
    .filter(({ value }) => value > 0n)

  const amount = isMint ? mintAmount : redeemAmount
  const setAmount = isMint ? setMintAmount : setRedeemAmount
  const parsedAmount = Number(amount) || 0
  const maxAmount = isMint ? inputBalanceAmount : dtfBalanceAmount
  const exceedsBalance = parsedAmount > maxAmount
  // Allow exceeding the balance so the user can still preview quotes; the
  // error stays visible and submission is blocked on the quote screen.
  // Redeem with "use my wallet balances" can run at 0 shares — it converts the
  // basket tokens already held in the wallet into the quote token.
  const isValid = parsedAmount > 0 || (!isMint && useExistingBalances)

  const handleMax = () => {
    // Use the exact on-chain balance string — Number(formatUnits()).toFixed
    // loses precision and can round above the real balance, which then trips
    // "Exceeds available balance" (mint) or reverts (redeem).
    const balance = isMint ? balanceOf(inputToken.address) : balanceOf(indexDTF.id)
    const decimals = isMint ? inputToken.decimals : 18
    if (balance > 0n) setAmount(formatUnits(balance, decimals))
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full">
      <div className="px-3 pt-3 pb-3">
        <Tabs
          value={operation}
          onValueChange={(v) => setOperation(v as 'mint' | 'redeem')}
        >
          <TabsList className="h-9 px-0.5">
            <TabsTrigger value="mint" className="px-3">
              Mint
            </TabsTrigger>
            <TabsTrigger value="redeem" className="px-3">
              Redeem
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-card rounded-2xl p-2 flex flex-col gap-2">
        <div className="px-4 py-3">
          <h3 className="font-medium text-base">
            {isMint ? 'Mint amount' : 'Redeem amount'}
          </h3>
          <p className="text-sm text-muted-foreground font-light">
            {isMint
              ? `Provide ${inputToken.symbol} to mint ${indexDTF.token.symbol}.`
              : `Redeem ${indexDTF.token.symbol} for ${inputToken.symbol}.`}
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{isMint ? 'You provide' : 'You redeem'}</span>
            <button
              className="text-primary hover:underline"
              onClick={handleMax}
            >
              Max:{' '}
              {isMint
                ? `${formatCurrency(maxAmount)} ${inputToken.symbol}`
                : `${formatTokenAmount(maxAmount)} ${indexDTF.token.symbol}`}
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <NumericalInput
              variant="transparent"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              className={cn(
                'min-w-0 flex-1 text-[32px] font-light',
                exceedsBalance && 'text-destructive'
              )}
            />
            <div className="flex shrink-0 items-center gap-2">
              <TokenLogo
                address={isMint ? inputToken.address : indexDTF.id}
                symbol={isMint ? inputToken.symbol : indexDTF.token.symbol}
                chain={chainId}
                size="xl"
              />
              <span className="text-[32px] font-light leading-8 text-muted-foreground">
                {isMint ? inputToken.symbol : indexDTF.token.symbol}
              </span>
            </div>
          </div>
          {exceedsBalance && (
            <div className="mt-2 text-sm text-destructive">
              Exceeds available balance
            </div>
          )}
        </div>

        {!isMint && (
          <>
            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-sm">Use my wallet balances</div>
                <p className="text-sm text-muted-foreground font-light">
                  Settle remaining basket tokens you already hold. Redeem 0 to
                  clear out just the dust.
                </p>
              </div>
              <Switch
                checked={useExistingBalances}
                onCheckedChange={setUseExistingBalances}
              />
            </div>

            {useExistingBalances && heldCollaterals.length > 0 && (
              <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
                <div className="text-sm text-muted-foreground mb-3">
                  Using your balances of
                </div>
                <div className="flex flex-col gap-3">
                  {heldCollaterals.map(({ token, value }) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TokenLogo
                          address={token.address}
                          symbol={token.symbol}
                          chain={chainId}
                          size="lg"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground font-light truncate">
                            {token.name}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium shrink-0">
                        {formatTokenAmount(
                          Number(formatUnits(value, token.decimals))
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Button
          size="lg"
          className="w-full h-[49px] rounded-[12px]"
          disabled={!isValid}
          onClick={() => setStep('quote-summary')}
        >
          Get Quote
        </Button>
      </div>
    </div>
  )
}

export default ConfigureMint
