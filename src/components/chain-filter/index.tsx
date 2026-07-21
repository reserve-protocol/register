import ChainLogo from '@/components/icons/ChainLogo'
import SquareStackedChainLogo from '@/components/icons/SquareStackedChainLogo'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useEffect, useMemo, useState } from 'react'

const CHAIN_LABELS: Record<number, string> = {
  [ChainId.Mainnet]: 'Ethereum',
  [ChainId.Base]: 'Base',
  [ChainId.BSC]: 'Binance',
  [ChainId.Arbitrum]: 'Arbitrum',
}

interface ChainFilterProps {
  value: string[]
  onChange: (value: string[]) => void
  // Caller-owned: Index and Yield chain sets differ — never hardcode one domain's.
  supportedChains: readonly number[]
  className?: string
}

const ChainFilter = ({
  value: currentFilter,
  onChange: setFilters,
  supportedChains,
  className,
}: ChainFilterProps) => {
  const { t } = useLingui()

  const options = useMemo(
    () => [
      {
        icon: <SquareStackedChainLogo chains={[...supportedChains]} />,
        label: msg`All chains`,
        text: 'All chains',
        filter: supportedChains.map(String),
      },
      ...supportedChains.map((chain) => ({
        icon: <ChainLogo chain={chain} className="h-5 w-5 rounded-md" />,
        label: undefined,
        text: CHAIN_LABELS[chain] ?? String(chain),
        filter: [String(chain)],
      })),
    ],
    [supportedChains]
  )

  const getSelectedIndex = (filter: string[]) => {
    if (filter.length !== 1) return '0' // All chains (or empty)
    const idx = supportedChains.findIndex((c) => String(c) === filter[0])
    return idx === -1 ? '0' : String(idx + 1)
  }

  const [selected, setSelected] = useState(getSelectedIndex(currentFilter))

  useEffect(() => {
    setSelected(getSelectedIndex(currentFilter))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter, supportedChains])

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(options[Number(value)]?.filter ?? [])
  }

  return (
    <div
      className={cn(
        'rounded-bl-3xl rounded-br-3xl bg-card px-4 py-4 lg:rounded-3xl',
        className
      )}
    >
      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={handleSelect}
        className="w-full justify-start gap-0.5 overflow-x-auto rounded-full bg-muted p-0.5 sm:w-auto lg:justify-center"
      >
        {options.map(({ text, label, icon }, index) => (
          <ToggleGroupItem
            key={text}
            value={index.toString()}
            className={cn(
              'h-8 min-w-0 flex-1 gap-1.5 rounded-full px-3 text-sm font-medium text-legend transition-[background-color,color] sm:flex-none',
              'data-[state=off]:hover:bg-foreground/5 data-[state=off]:hover:text-foreground',
              'data-[state=on]:bg-card data-[state=on]:text-foreground',
              'dark:data-[state=on]:bg-card dark:data-[state=on]:text-foreground'
            )}
          >
            {icon}
            <span className="hidden sm:inline">{label ? t(label) : text}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default ChainFilter
