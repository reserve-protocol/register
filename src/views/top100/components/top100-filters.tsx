import ChainLogo from '@/components/icons/ChainLogo'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChainId } from '@/utils/chains'
import { useAtom, useSetAtom } from 'jotai'
import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { chainFilterAtom, searchFilterAtom } from '../atoms'
import { ACTIVE_CHAINS } from '../constants'

const CHAIN_OPTIONS: {
  icon: React.ReactNode
  text: string
  filter: number[]
}[] = [
  // Only add "All chains" if multiple chains are active
  ...(ACTIVE_CHAINS.length > 1
    ? [
        {
          icon: <LayoutGrid />,
          text: 'All chains',
          filter: ACTIVE_CHAINS,
        },
      ]
    : []),
  // Add individual chain toggles for active chains
  ...(ACTIVE_CHAINS.includes(ChainId.Mainnet)
    ? [
        {
          icon: <ChainLogo chain={ChainId.Mainnet} />,
          text: 'Ethereum',
          filter: [ChainId.Mainnet],
        },
      ]
    : []),
  ...(ACTIVE_CHAINS.includes(ChainId.Base)
    ? [
        {
          icon: <ChainLogo chain={ChainId.Base} />,
          text: 'Base',
          filter: [ChainId.Base],
        },
      ]
    : []),
  ...(ACTIVE_CHAINS.includes(ChainId.BSC)
    ? [
        {
          icon: <ChainLogo chain={ChainId.BSC} />,
          text: 'Binance',
          filter: [ChainId.BSC],
        },
      ]
    : []),
]

const ChainFilter = () => {
  const [selected, setSelected] = useState('0')
  const setFilters = useSetAtom(chainFilterAtom)

  const handleSelect = (value: string) => {
    if (!value) return
    setSelected(value)
    setFilters(CHAIN_OPTIONS[Number(value)]?.filter ?? ACTIVE_CHAINS)
  }

  // Don't render chain toggle if only one chain
  if (CHAIN_OPTIONS.length <= 1) return null

  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={handleSelect}
      className="bg-card rounded-bl-3xl rounded-br-3xl sm:rounded-3xl px-4 py-4"
    >
      {CHAIN_OPTIONS.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <div className="hidden sm:block ml-[6px]">{text}</div>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const SearchFilter = () => {
  const [search, setSearch] = useAtom(searchFilterAtom)

  return (
    <SearchInput
      placeholder="Search by name, ticker or collateral"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl sm:[&_input]:rounded-3xl"
    />
  )
}

const Top100Filters = () => {
  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
      <SearchFilter />
      <ChainFilter />
    </div>
  )
}

export default Top100Filters
