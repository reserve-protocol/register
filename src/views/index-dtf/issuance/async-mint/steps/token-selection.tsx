import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useERC20Balances } from '@/hooks/useERC20Balance'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Check } from 'lucide-react'
import { useEffect } from 'react'
import { Address } from 'viem'
import {
  inputTokenAtom,
  selectedCollateralsAtom,
  wizardStepAtom,
} from '../atoms'

const TokenSelection = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const [selected, setSelected] = useAtom(selectedCollateralsAtom)

  const { data: balances } = useERC20Balances(
    (basket || []).map((token) => ({
      address: token.address,
      chainId,
    }))
  )

  // Initialize selection: tokens with balance are on by default
  useEffect(() => {
    if (!basket || !balances || selected.size > 0) return
    const initial = new Set<Address>()
    basket.forEach((token, i) => {
      const balance = (balances as bigint[])?.[i] ?? 0n
      if (
        balance > 0n &&
        token.address.toLowerCase() !== inputToken.address.toLowerCase()
      ) {
        initial.add(token.address)
      }
    })
    setSelected(initial)
  }, [basket, balances, inputToken.address])

  const toggleToken = (address: Address) => {
    setSelected((prev: Set<Address>) => {
      const next = new Set(prev)
      if (next.has(address)) {
        next.delete(address)
      } else {
        next.add(address)
      }
      return next
    })
  }

  if (!basket) return null

  const isInputToken = (address: string) =>
    address.toLowerCase() === inputToken.address.toLowerCase()

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto my-4 flex flex-col max-h-[calc(100vh-120px-64px)] lg:max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 flex flex-col gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background h-8 w-8"
          onClick={() => setStep('collateral-decision')}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold text-primary">
            What should we use?
          </h2>
          <p className="text-base font-light">
            {inputToken.symbol} is always used. Choose which collateral tokens
            to include alongside it.
          </p>
        </div>
      </div>

      {/* Token rows */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-0.5">
          {basket.map((token) => {
            const isInput = isInputToken(token.address)
            const isSelected = selected.has(token.address)

            return (
              <div
                key={token.address}
                className="bg-background rounded-[20px] p-2"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TokenLogoWithChain
                      address={token.address}
                      symbol={token.symbol}
                      chain={chainId}
                      size="xl"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-base">
                        {token.name || token.symbol}
                      </span>
                      <span className="text-sm text-muted-foreground font-light">
                        {token.symbol}
                      </span>
                    </div>
                  </div>
                  {isInput ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-light">
                      <Check size={12} />
                      <span>Always included</span>
                    </div>
                  ) : (
                    <Switch
                      checked={isSelected}
                      onCheckedChange={() => toggleToken(token.address)}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Continue button */}
      <div className="p-1 pt-2 shrink-0">
        <Button
          size="lg"
          className="w-full h-[49px] rounded-[20px]"
          onClick={() => setStep('amount-input')}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default TokenSelection
