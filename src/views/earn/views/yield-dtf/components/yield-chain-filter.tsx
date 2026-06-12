import ChainLogo from '@/components/icons/ChainLogo'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChainId } from '@/utils/chains'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { LayoutGrid } from 'lucide-react'
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
    icon: <LayoutGrid />,
    text: 'All chains',
    label: msg`All chains`,
    filter: [
      ChainId.Mainnet.toString(),
      ChainId.Base.toString(),
    ],
  },
  {
    icon: <ChainLogo chain={ChainId.Mainnet} />,
    text: 'Ethereum',
    filter: [ChainId.Mainnet.toString()],
  },
  {
    icon: <ChainLogo chain={ChainId.Base} />,
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

  const displayClassName = className || "bg-card rounded-bl-3xl rounded-br-3xl lg:rounded-3xl px-4 py-4 h-auto"

  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={handleSelect}
      className={displayClassName}
    >
      {chains.map(({ text, label, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <span className="hidden md:block ml-[6px]">
            {label ? t(label) : text}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default YieldChainFilter