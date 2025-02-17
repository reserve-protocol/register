import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input, NumericalInput } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { formatCurrency } from '@/utils'
import { useAtomValue } from 'jotai'
import {
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader,
} from 'lucide-react'
import React, { ReactNode, useEffect, useState } from 'react'
import GaugeIcon from '../icons/GaugeIcon'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Skeleton } from './skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'
import { Separator } from './separator'
import Help from './help'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'

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
  onSwap?: () => void
  loading?: boolean
}

const TokenInput = ({
  value = '',
  onChange = () => {},
}: Pick<SwapItem, 'value' | 'onChange'>) => {
  return (
    <NumericalInput
      value={value}
      variant="transparent"
      placeholder="0"
      onChange={onChange}
      autoFocus
      className="placeholder:text-primary/70 text-primary"
    />
  )
}

const TokenSelector = ({
  address = '',
  symbol = '',
  tokens,
  onTokenSelect,
}: Pick<SwapItem, 'address' | 'symbol' | 'tokens' | 'onTokenSelect'>) => {
  const chainId = useAtomValue(chainIdAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const src =
    brand?.dtf?.icon && address.toLowerCase() === dtf?.id.toLowerCase()
      ? brand?.dtf?.icon
      : undefined
  const [open, setOpen] = React.useState(false)

  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex flex-col gap-1 justify-between items-end min-w-fit">
        <div className="flex items-center gap-1 text-2xl font-semibold">
          <TokenLogo
            size="lg"
            src={src}
            symbol={symbol}
            address={address}
            chain={chainId}
          />
          <span>{symbol}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between gap-1 mt-1 items-end min-w-fit -mr-1.5">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-2xl gap-2 h-auto hover:bg-accent px-1.5 justify-between"
            size="lg"
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
            <div className="flex items-center rounded-full bg-white p-0.5">
              {open ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
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
                <span className="text-lg">{token.symbol}</span>
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
    </div>
  )
}

const PriceValue = ({ price }: Pick<SwapItem, 'price'>) => (
  <div className="max-w-[120px] sm:max-w-[200px] overflow-hidden">
    <span className="text-legend block truncate">{price || '$0.00'}</span>
  </div>
)

const MaxButton = ({ balance, onMax }: Pick<SwapItem, 'balance' | 'onMax'>) => (
  <div className="flex items-center gap-1 text-base">
    <span className="text-legend">Balance</span>
    <span className="font-bold">{balance}</span>
    <Button
      variant="ghost"
      className="h-6 rounded-full ml-1 bg-primary/10 text-primary/80 hover:bg-primary/15 hover:text-primary/80 font-semibold"
      size="xs"
      onClick={onMax}
    >
      Max
    </Button>
  </div>
)

const TokenInputBox = ({ from }: Pick<SwapProps, 'from'>) => {
  return (
    <div className="flex flex-col gap-1 p-4 bg-muted rounded-xl">
      <div>
        <h3 className="text-primary">{from?.title || 'You use:'}</h3>
        <div className="flex gap-2">
          <TokenInput {...from} />
          <TokenSelector {...from} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 justify-between">
          <PriceValue price={from.price} />
          <MaxButton balance={from.balance} onMax={from.onMax} />
        </div>
      </div>
    </div>
  )
}

const SLOW_LOADING_TEXTS = [
  'Searching DEX Liquidity',
  'Assembling different routes',
  'Evaluating slippage',
  'Reducing potential dust',
  'Loading DTF',
]

const SlowLoading = ({ enabled }: { enabled: boolean }) => {
  const [countdown, setCountdown] = useState(60)
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setCountdown(60)
      setTextIndex(0)
      return
    }

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % SLOW_LOADING_TEXTS.length)
    }, 12000)

    return () => {
      clearInterval(countdownInterval)
      clearInterval(textInterval)
    }
  }, [enabled])

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-cover bg-center bg-[url('https://storage.reserve.org/degen.gif')] rounded-xl opacity-0",
        enabled ? 'animate-fade-in z-10' : '-z-10'
      )}
    >
      <div className="flex items-center gap-1 justify-between bg-card rounded-full px-3 py-2 text-sm text-primary border border-primary">
        <div className="flex items-center gap-1">
          <Loader size={16} className="animate-spin-slow" />
          {SLOW_LOADING_TEXTS[textIndex]}
        </div>
        <div
          className={cn(
            'text-muted-foreground',
            countdown > 0 ? 'min-w-4' : ''
          )}
        >
          {countdown > 0 && `${countdown}s`}
        </div>
      </div>
    </div>
  )
}

const TokenOutputBox = ({ to, loading }: Pick<SwapProps, 'to' | 'loading'>) => {
  const [slowLoading, setSlowLoading] = useState(false)

  useEffect(() => {
    let slowLoadingTimeout: NodeJS.Timeout | undefined
    let minimumDisplayTimeout: NodeJS.Timeout | undefined

    if (loading) {
      slowLoadingTimeout = setTimeout(() => {
        setSlowLoading(true)
        minimumDisplayTimeout = setTimeout(() => {
          if (!loading) {
            setSlowLoading(false)
          }
        }, 3000)
      }, 3000)
    } else {
      clearTimeout(slowLoadingTimeout)
      clearTimeout(minimumDisplayTimeout)
      setSlowLoading(false)
    }

    return () => {
      clearTimeout(slowLoadingTimeout)
      clearTimeout(minimumDisplayTimeout)
    }
  }, [loading])

  return (
    <div className="relative flex flex-col gap-1 p-4 bg-card rounded-xl border-border border">
      <SlowLoading enabled={slowLoading} />
      <div>
        <h3>{to.title || 'You receive:'}</h3>
        <div className="flex items-center gap-2 justify-between">
          {loading ? (
            <Skeleton className="w-full h-[40px]" />
          ) : (
            <NumericalInput
              value={to.value || '0'}
              variant="transparent"
              placeholder="0"
              onChange={() => {}}
              autoFocus
              disabled
              className="disabled:cursor-auto disabled:opacity-100"
            />
          )}
          <TokenSelector {...to} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-[60%] h-[24px]" />
      ) : (
        <PriceValue price={to.price} />
      )}
    </div>
  )
}

const ArrowSeparator = ({ onSwap }: Pick<SwapProps, 'onSwap'>) => {
  if (onSwap) {
    return (
      <Button
        className="h-8 px-[6px] rounded-xl w-max mx-auto border-white border-2 -mt-4 -mb-4 z-20 text-foreground bg-muted hover:bg-border"
        onClick={onSwap}
      >
        <ArrowUpDown size={16} />
      </Button>
    )
  }
  return (
    <div className="rounded-xl bg-muted w-max p-2 mx-auto border-white border-2 -mt-4 -mb-4 z-20">
      <ArrowDown size={16} />
    </div>
  )
}

export const SlippageSelector = ({
  value,
  onChange,
  options = ['100', '200', '1000'],
  formatOption = (option) => `${(1 / Number(option)) * 100}%`,
  hideTitle = false,
}: {
  value: string
  onChange: (value: string) => void
  options?: string[]
  formatOption?: (option: string) => string
  hideTitle?: boolean
}) => {
  const [customValue, setCustomValue] = useState(
    (1 / (Number(value) / 100)).toFixed(3)
  )

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
    const parsedValue = 1 / (Number(value) / 100)
    setCustomValue(parsedValue.toFixed(3))
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl justify-between',
        hideTitle ? '' : 'bg-muted p-2'
      )}
    >
      {!hideTitle && (
        <div className="flex items-center gap-1">
          <GaugeIcon height={16} width={16} />
          <div className="text-sm font-semibold">
            <span className="inline-block sm:hidden">Slippage</span>
            <span className="hidden sm:inline-block">Max slippage</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-lg justify-start w-max"
          value={value}
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
        <div className="w-20 hidden sm:block" role="button">
          <div className="relative">
            <Input
              placeholder="Custom"
              className={cn(
                'h-9 px-[10px] rounded-lg text-base [&:focus::placeholder]:opacity-0 [&:focus::placeholder]:transition-opacity focus-visible:ring-0 focus-visible:ring-offset-0 ',
                customValue && 'pl-2 pr-6'
              )}
              value={customValue}
              type="text"
              pattern="^(?:100|[0-9]{1,2})(?:\.[0-9]{1,3})?$"
              onChange={(e) => {
                const value = e.target.value
                if (
                  value === '' ||
                  (/^\d*\.?\d{0,3}$/.test(value) &&
                    Number(value) >= 0 &&
                    Number(value) <= 100)
                ) {
                  handleCustomChange(value)
                }
              }}
            />
            {customValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type SwapDetailItem = {
  left: ReactNode
  right?: ReactNode
  help?: ReactNode
}

const SwapDetailItem = ({ left, right, help }: SwapDetailItem) => {
  return (
    <div className="flex gap-1 items-center justify-between flex-1 px-1">
      <div className="flex gap-1 items-center">
        <div>{left}</div>
        {!!help && <Help content={help} className="text-muted-foreground" />}
      </div>
      {!!right && <div className="animate-fade-in">{right}</div>}
    </div>
  )
}

type SwapDetailsProps = {
  visible: SwapDetailItem
  details: SwapDetailItem[]
}

export const SwapDetails = ({ visible, details }: SwapDetailsProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Accordion
      type="single"
      collapsible
      value={String(open)}
      onValueChange={(value) => setOpen(Boolean(value))}
    >
      <AccordionItem value="true" className="border-b-0">
        <AccordionTrigger className="px-3 py-2 font-light">
          <SwapDetailItem
            left={visible.left}
            right={open ? undefined : visible.right}
          />
        </AccordionTrigger>
        <AccordionContent>
          <Separator className="mt-2" />
          <div className="px-3 pt-4 pb-2 flex flex-col gap-2">
            {details.map((detail) => (
              <SwapDetailItem {...detail} key={detail?.left?.toString()} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const Swap = (props: SwapProps) => {
  return (
    <div className={cn('flex flex-col', props.onSwap ? 'gap-0.5' : 'gap-0')}>
      <TokenInputBox {...props} />
      <ArrowSeparator {...props} />
      <TokenOutputBox {...props} />
    </div>
  )
}

export default Swap
