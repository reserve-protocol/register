import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { ArrowDown } from 'lucide-react'

type SwapItem = {
  title?: string
  price?: string
  address?: string
  symbol?: string
  balance?: string
  onMax?: () => void
  value?: string
  onChange?: (value: string) => void
}

type SwapProps = {
  from: SwapItem
  to: SwapItem
}

const TokenInput = ({
  price = '',
  value = '',
  onChange = () => {},
}: Pick<SwapItem, 'price' | 'value' | 'onChange'>) => {
  return (
    <div className="flex flex-col flex-grow">
      <NumericalInput
        value={value}
        variant="transparent"
        placeholder="0"
        onChange={onChange}
        autoFocus
      />
      <span className="text-legend mt-1.5">{price}</span>
    </div>
  )
}

const TokenSelector = ({
  address = '',
  symbol = '',
  balance = '',
  onMax = () => {},
}: Pick<SwapItem, 'address' | 'symbol' | 'balance' | 'onMax'>) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex flex-col gap-1 items-end">
      {/* Replace this with a dropdown */}
      <div className="flex items-center gap-1 text-2xl">
        <TokenLogo size="lg" address={address} chain={chainId} />
        <span>{symbol}</span>
      </div>
      <div className="flex items-center gap-1 text-base">
        <span className="text-legend">Balance</span>
        <span className="font-bold">{balance}</span>
        <Button
          variant="ghost"
          className="rounded-[40px] ml-1 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          size="xs"
          onClick={onMax}
        >
          Max
        </Button>
      </div>
    </div>
  )
}

const TokenInputBox = ({ from }: Pick<SwapProps, 'from'>) => {
  return (
    <div className="p-4 bg-muted rounded-xl">
      <h3>{from?.title || 'You use:'}</h3>
      <div className="flex gap-2">
        <TokenInput {...from} />
        <TokenSelector {...from} />
      </div>
    </div>
  )
}

const TokenOutputBox = ({ to }: Pick<SwapProps, 'to'>) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="p-4 bg-card rounded-xl border-border border">
      <h3>{to.title || 'You receive:'}</h3>
      <div className="flex items-center gap-2">
        <h4 className="text-3xl font-semibold mr-auto">{to.value || '0'}</h4>
        <TokenLogo size="lg" address={to.address} chain={chainId} />
        <h4 className="text-2xl font-semibold">{to.symbol}</h4>
      </div>
      <div className="flex items-center text-legend">{to.price}</div>
    </div>
  )
}

const ArrowSeparator = () => (
  <div className="rounded-xl bg-muted w-max p-2 mx-auto border-white border-2 -mt-4 -mb-4 z-10">
    <ArrowDown size={16} />
  </div>
)

const Swap = (props: SwapProps) => {
  return (
    <div className="flex flex-col h-full">
      <TokenInputBox {...props} />
      <ArrowSeparator />
      <TokenOutputBox {...props} />
    </div>
  )
}

export default Swap
