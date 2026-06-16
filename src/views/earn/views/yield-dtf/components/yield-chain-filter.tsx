import ChainLogo from '@/components/icons/ChainLogo'
import SquareStackedChainLogo from '@/components/icons/SquareStackedChainLogo'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useEffect, useState } from 'react'

interface YieldChainFilterProps {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

// Yield DTFs only support Ethereum and Base
const chains: {
  icon: React.ReactElement
  text: string
  label?: MessageDescriptor
  filter: string[]
}[] = [
  {
    icon: <SquareStackedChainLogo chains={[ChainId.Mainnet, ChainId.Base]} />,
    text: 'All chains',
    label: msg`All chains`,
    filter: [ChainId.Mainnet.toString(), ChainId.Base.toString()],
  },
  {
    icon: <ChainLogo chain={ChainId.Mainnet} className="h-5 w-5 rounded-md" />,
    text: 'Ethereum',
    filter: [ChainId.Mainnet.toString()],
  },
  {
    icon: <ChainLogo chain={ChainId.Base} className="h-5 w-5 rounded-md" />,
    text: 'Base',
    filter: [ChainId.Base.toString()],
  },
]

const getSelectedIndex = (currentFilter: string[]) => {
  if (currentFilter.length > 1) return '0' // All chains
  if (currentFilter[0] === ChainId.Mainnet.toString()) return '1'
  if (currentFilter[0] === ChainId.Base.toString()) return '2'
  return '0'
}

const YieldChainFilter = (props: YieldChainFilterProps) => {
  const { t } = useLingui()
  const { value: currentFilter, onChange: setFilters, className } = props
  const [selected, setSelected] = useState(getSelectedIndex(currentFilter))

  // Update selected when filter changes externally
  useEffect(() => {
    setSelected(getSelectedIndex(currentFilter))
  }, [currentFilter])

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(chains[Number(value)]?.filter ?? [])
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
        {chains.map(({ text, label, icon }, index) => (
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
            <span className="hidden sm:inline">
              {label ? t(label) : text}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default YieldChainFilter
