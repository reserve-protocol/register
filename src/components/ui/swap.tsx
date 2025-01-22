import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { ArrowDown } from 'lucide-react'
import { ReactNode } from 'react'

type SwapItem = {
  title?: string
  price?: string
  icon?: ReactNode
  symbol?: string
  balance?: string
  onMax?: () => void
}

type SwapProps = {
  from: SwapItem
  to: SwapItem
}

const TokenInput = ({ price = '' }: Pick<SwapItem, 'price'>) => {
  return (
    <div className="flex flex-col flex-grow">
      <NumericalInput
        variant="transparent"
        placeholder="0"
        onChange={() => {}}
        autoFocus
      />
      <span className="text-legend mt-1.5">{price}</span>
    </div>
  )
}

const TokenSelector = ({
  balance = '',
  onMax = () => {},
}: Pick<SwapItem, 'balance' | 'onMax'>) => {
  return (
    <div className="flex flex-col gap-1 items-end">
      {/* Replace this with a dropdown */}
      <div className="flex items-center gap-1 text-2xl">
        <TokenLogo size="lg" />
        <span>USDC</span>
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

const TokenInputBox = ({
  from: { title = 'You use:', price, balance, onMax },
}: Pick<SwapProps, 'from'>) => {
  return (
    <div className="p-4 bg-muted rounded-xl">
      <h3>{title}</h3>
      <div className="flex gap-2">
        <TokenInput price={price} />
        <TokenSelector balance={balance} onMax={onMax} />
      </div>
    </div>
  )
}

const TokenOutputBox = ({
  to: { title = 'You receive:', price = '' },
}: Pick<SwapProps, 'to'>) => {
  return (
    <div className="p-4 bg-card rounded-xl border-border border">
      <h3>{title}</h3>
      <div className="flex items-center gap-2">
        <h4 className="text-3xl font-semibold mr-auto">0</h4>
        <TokenLogo size="lg" />
        <h4 className="text-2xl font-semibold">DTF</h4>
      </div>
      <div className="flex items-center text-legend">{price}</div>
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
