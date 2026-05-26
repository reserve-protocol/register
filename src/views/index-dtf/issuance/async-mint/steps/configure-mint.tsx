import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { balancesAtom, chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
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

const ConfigureMint = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const balances = useAtomValue(balancesAtom)
  const [operation, setOperation] = useAtom(operationAtom)
  const [mintAmount, setMintAmount] = useAtom(mintAmountAtom)
  const [redeemAmount, setRedeemAmount] = useAtom(redeemAmountAtom)
  const [useExistingBalances, setUseExistingBalances] = useAtom(
    useExistingBalancesAtom
  )

  if (!indexDTF) return null

  const isMint = operation === 'mint'

  // Balances: input token for mint, DTF shares for redeem.
  const inputBalance = balances[inputToken.address]
  const inputBalanceAmount = inputBalance
    ? Number(formatUnits(inputBalance.value ?? 0n, inputToken.decimals))
    : 0
  const dtfBalance = balances[indexDTF.id]
  const dtfBalanceAmount = dtfBalance
    ? Number(formatUnits(dtfBalance.value ?? 0n, 18))
    : 0

  const amount = isMint ? mintAmount : redeemAmount
  const setAmount = isMint ? setMintAmount : setRedeemAmount
  const parsedAmount = Number(amount) || 0
  const maxAmount = isMint ? inputBalanceAmount : dtfBalanceAmount
  const exceedsBalance = parsedAmount > maxAmount
  // Allow exceeding the balance so the user can still preview quotes; the
  // error stays visible and submission is blocked on the quote screen.
  const isValid = parsedAmount > 0

  const handleMax = () => {
    if (maxAmount > 0) {
      setAmount(
        isMint ? maxAmount.toFixed(2) : maxAmount.toFixed(18).replace(/\.?0+$/, '')
      )
    }
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full">
      <div className="px-5 pt-5 pb-3">
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
                ? `$${formatCurrency(maxAmount)}`
                : `${formatTokenAmount(maxAmount)} ${indexDTF.token.symbol}`}
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <NumericalInput
              variant="transparent"
              value={amount}
              onChange={setAmount}
              placeholder={isMint ? '$0.00' : '0.00'}
              className={cn(
                'text-[32px] font-light',
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

        <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-sm">Use my wallet balances</div>
            <p className="text-sm text-muted-foreground font-light">
              {isMint
                ? `Use basket tokens you already hold to reduce swaps.`
                : `Settle remaining basket tokens you already hold.`}
            </p>
          </div>
          <Switch
            checked={useExistingBalances}
            onCheckedChange={setUseExistingBalances}
          />
        </div>

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
