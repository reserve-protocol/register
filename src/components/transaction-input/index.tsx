import { NumericalInput } from 'components'
import Help from 'components/help'
import { useAtom } from 'jotai'
import { formatCurrency } from 'utils'
import { cn } from '@/lib/utils'

export interface TransactionInputProps {
  title?: string
  placeholder?: string
  compact?: boolean
  amountAtom: any
  maxAmount: string
  disabled?: boolean
  autoFocus?: boolean
  hasThrottle?: boolean
  className?: string
}

interface MaxLabelProps {
  text: string
  compact: boolean
  clickable: boolean
  help?: string
  handleClick: () => void
}

export const MaxLabel = ({
  text,
  compact,
  clickable,
  help = '',
  handleClick,
}: MaxLabelProps) => (
  <div className="flex items-center">
    <span
      onClick={handleClick}
      className={cn(
        'block ml-auto mr-2',
        compact ? 'text-sm' : 'text-base',
        clickable ? 'text-primary cursor-pointer hover:underline' : 'text-legend'
      )}
    >
      {text}
    </span>
    {!!help && <Help content={help} />}
  </div>
)

const TransactionInput = ({
  title = '',
  placeholder = '',
  amountAtom,
  maxAmount,
  disabled = false,
  compact = true,
  autoFocus = false,
  hasThrottle = false,
  className,
}: TransactionInputProps) => {
  const [amount, setAmount] = useAtom(amountAtom)

  const maxLabel = (
    <span
      onClick={() => setAmount(maxAmount)}
      className={cn(
        'block ml-auto mr-2 text-primary cursor-pointer hover:underline',
        compact ? 'text-sm' : 'text-base'
      )}
    >
      Max: {formatCurrency(+maxAmount, 5)}
    </span>
  )

  return (
    <div className={className}>
      <div className="flex items-center mb-2">
        <label className="text-legend ml-4">{title}</label>
        {compact && <div className="ml-auto">{maxLabel}</div>}
      </div>
      <NumericalInput
        disabled={disabled}
        placeholder={placeholder}
        value={amount as string}
        onChange={setAmount}
        autoFocus={autoFocus}
      />
      {!compact && <div className="flex mt-2 ml-auto">{maxLabel}</div>}
    </div>
  )
}

export default TransactionInput
