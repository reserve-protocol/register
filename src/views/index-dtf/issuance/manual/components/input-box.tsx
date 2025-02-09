import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { formatEther } from 'viem'
import { amountAtom, maxAmountAtom, modeAtom, usdAmountAtom } from '../atoms'
import { useEffect } from 'react'

const DTFMaxAmount = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const maxAmount = useAtomValue(maxAmountAtom)
  const setMaxAmount = useSetAtom(amountAtom)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        <TokenLogo size="xl" />
        <h2 className="text-2xl max-w-52 break-words font-bold">
          {indexDTF?.token.symbol ?? 'DTF'}
        </h2>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-legend">Max:</span>
        <span className="font-bold">
          {formatCurrency(Number(formatEther(maxAmount)), 2, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
        <Button
          variant="outline-primary"
          className="bg-primary/10 rounded-full border-primary/10"
          size="xs"
          onClick={() => setMaxAmount(formatEther(maxAmount))}
        >
          Use
        </Button>
      </div>
    </div>
  )
}

const AmountInput = () => {
  const mode = useAtomValue(modeAtom)
  const [amount, setAmount] = useAtom(amountAtom)
  const usdAmount = useAtomValue(usdAmountAtom)

  useEffect(() => {
    setAmount('')
  }, [])

  return (
    <div className="flex flex-col">
      <label htmlFor="manual-input">
        {mode === 'buy' ? 'Mint Amount:' : 'Redeem Amount:'}
      </label>

      <div className="flex items-center">
        <div className="flex flex-col flex-grow min-w-0">
          <NumericalInput
            value={amount}
            variant="transparent"
            placeholder="0"
            onChange={setAmount}
            autoFocus
          />
          <div className="w-full overflow-hidden">
            <span className="text-legend mt-1.5 block max-w-52 truncate">
              ${formatCurrency(usdAmount, 2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const InputBox = () => (
  <div className="p-4 bg-muted rounded-3xl grid grid-cols-[1fr_auto] overflow-hidden items-end gap-4">
    <AmountInput />
    <DTFMaxAmount />
  </div>
)

export default InputBox
