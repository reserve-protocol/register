import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input, NumericalInput } from '@/components/ui/input'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { formatCurrency } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowDown, ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import GaugeIcon from '../icons/GaugeIcon'

type TokenWithBalance = Token & { balance?: string }

type SwapItem = {
  title?: string
  price?: string
  address?: string
  symbol?: string
  balance?: string
  onMax?: () => void
  value?: string
  onChange?: (value: string) => void
  tokens?: TokenWithBalance[]
  onTokenSelect?: (token: Token) => void
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
  tokens,
  onTokenSelect,
  output = false,
}: Pick<
  SwapItem,
  'address' | 'symbol' | 'balance' | 'onMax' | 'tokens' | 'onTokenSelect'
> & { output?: boolean }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [open, setOpen] = React.useState(false)
  console.log(output)
  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center gap-1 font-semibold text-2xl">
          <TokenLogo
            size="lg"
            symbol={symbol}
            address={address}
            chain={chainId}
          />
          <span>{symbol}</span>
        </div>
        {!output && (
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
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-2xl gap-1 font-semibold h-auto hover:bg-accent px-2 justify-between"
          >
            <div className="flex items-center gap-1">
              <TokenLogo
                size="lg"
                symbol={symbol}
                address={address}
                chain={chainId}
              />
              <span>{symbol}</span>
            </div>
            {open ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          {tokens.map((token) => (
            <DropdownMenuItem
              key={token.address}
              onClick={() => onTokenSelect?.(token)}
              className="flex items-center justify-between gap-2 pr-2"
            >
              <div className="flex items-center gap-2">
                <TokenLogo
                  size="md"
                  symbol={token.symbol}
                  address={token.address}
                  chain={chainId}
                />
                <span className="text-lg font-semibold">{token.symbol}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {token?.balance
                  ? `${formatCurrency(Number(token.balance), 4)}`
                  : 0}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {!output && (
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
      )}
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
  return (
    <div className="p-4 bg-card rounded-xl border-border border">
      <h3>{to.title || 'You receive:'}</h3>
      <div className="flex items-center gap-1">
        <h4 className="text-3xl font-semibold mr-auto">{to.value || '0'}</h4>
        <TokenSelector {...to} output />
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

export const SlippageSelector = ({
  value,
  onChange,
  options = ['100', '200', '1000'],
  formatOption = (option) => `${(1 / Number(option)) * 100}%`,
}: {
  value: string
  onChange: (value: string) => void
  options?: string[]
  formatOption?: (option: string) => string
}) => {
  const [customValue, setCustomValue] = useState('')

  const handleCustomChange = (value: string) => {
    try {
      const parsedValue = 1 / (Number(value) / 100)
      setCustomValue(value)
      onChange(parsedValue.toString())
    } catch (error) {
      setCustomValue(value)
    }
  }

  const onSelectOption = (value: string) => {
    onChange(value)
    setCustomValue('')
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-muted justify-between">
      <div className="flex items-center gap-1">
        <GaugeIcon height={16} width={16} />
        <div className="text-sm font-semibold">Max slippage</div>
      </div>
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-lg justify-start w-max"
          value={customValue ? '' : value}
          onValueChange={onSelectOption}
        >
          {options.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option.toString()}
              aria-label={`Toggle ${option}`}
              className="px-3 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
              size="xs"
            >
              {formatOption(option)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="w-20" role="button">
          <Input
            placeholder="Custom"
            className="h-9 px-[10px] rounded-lg text-base [&:focus::placeholder]:opacity-0 [&:focus::placeholder]:transition-opacity focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-transparent active:border-transparent"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

const Swap = (props: SwapProps) => {
  return (
    <div className="flex flex-col">
      <TokenInputBox {...props} />
      <ArrowSeparator />
      <TokenOutputBox {...props} />
    </div>
  )
}

export default Swap
