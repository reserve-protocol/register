import ChainLogo from '@/components/icons/ChainLogo'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChainId } from '@/utils/chains'
import { LayoutGrid } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SetStateAction, WritableAtom } from 'jotai'
import { useAtom } from 'jotai'

interface ChainFilterPropsWithAtom {
  atom: WritableAtom<string[], [SetStateAction<string[]>], void>
  className?: string
}

interface ChainFilterPropsWithValue {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

type ChainFilterProps = ChainFilterPropsWithAtom | ChainFilterPropsWithValue

const chains = [
  {
    icon: <LayoutGrid />,
    text: 'All chains',
    filter: [
      ChainId.Base.toString(),
      ChainId.Mainnet.toString(),
      ChainId.BSC.toString(),
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
  {
    icon: <ChainLogo chain={ChainId.BSC} />,
    text: 'Binance',
    filter: [ChainId.BSC.toString()],
  },
]

const getSelectedIndex = (currentFilter: string[]) => {
  if (currentFilter.length > 1) return '0' // All chains
  if (currentFilter[0] === ChainId.Mainnet.toString()) return '1'
  if (currentFilter[0] === ChainId.Base.toString()) return '2'
  if (currentFilter[0] === ChainId.BSC.toString()) return '3'
  return '0'
}

function isPropsWithAtom(props: ChainFilterProps): props is ChainFilterPropsWithAtom {
  return 'atom' in props
}

const ChainFilter = (props: ChainFilterProps) => {
  // Handle both atom-based and value/onChange patterns
  const [atomValue, setAtomValue] = isPropsWithAtom(props)
    ? useAtom(props.atom)
    : [null, null]

  const currentFilter = isPropsWithAtom(props)
    ? atomValue!
    : props.value

  const setFilters = isPropsWithAtom(props)
    ? setAtomValue!
    : props.onChange

  const [selected, setSelected] = useState(getSelectedIndex(currentFilter))

  // Update selected when filter changes externally
  useEffect(() => {
    setSelected(getSelectedIndex(currentFilter))
  }, [currentFilter])

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(chains[Number(value)]?.filter ?? [])
  }

  const className = props.className || "bg-card rounded-bl-3xl rounded-br-3xl lg:rounded-3xl px-4 py-4 h-auto"

  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={handleSelect}
      className={className}
    >
      {chains.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <span className="hidden md:block ml-[6px]">{text}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default ChainFilter