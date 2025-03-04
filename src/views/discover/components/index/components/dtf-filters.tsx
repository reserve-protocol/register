import { useSetAtom, useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { searchFilterAtom, chainFilterAtom } from '../atoms'
import { ChainId } from '@/utils/chains'
import ChainLogo from '@/components/icons/ChainLogo'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

const SingleToggleFilter = ({
  options,
  onValueChange,
  value,
  className,
}: {
  value: string
  options: {
    icon: React.ReactNode
    text: string
    filter: string[] | number[]
  }[]
  onValueChange: (value: string) => void
  className?: string
}) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className={cn(
        'bg-card rounded-bl-2xl rounded-br-2xl sm:rounded-3xl px-4 py-4',

        className
      )}
    >
      {options.map(({ text, icon }, index) => (
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

const ChainFilter = () => {
  const currentFilter = useAtomValue(chainFilterAtom)
  const [selected, setSelected] = useState(
    currentFilter.length > 1 ? '0' : currentFilter[0] === 1 ? '1' : '2'
  )
  const setFilters = useSetAtom(chainFilterAtom)

  const chains = [
    {
      icon: <LayoutGrid />,
      text: 'All chains',
      filter: [ChainId.Base, ChainId.Mainnet],
    },
    {
      icon: <ChainLogo chain={ChainId.Mainnet} />,
      text: 'Ethereum',
      filter: [ChainId.Mainnet],
    },
    {
      icon: <ChainLogo chain={ChainId.Base} />,
      text: 'Base',
      filter: [ChainId.Base],
    },
  ]

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(chains[Number(value)]?.filter ?? [])
  }

  return (
    <SingleToggleFilter
      value={selected}
      options={chains}
      onValueChange={handleSelect}
    />
  )
}

export const SearchFilter = () => {
  const [search, setSearch] = useAtom(searchFilterAtom)

  return (
    <SearchInput
      placeholder="Search by name, ticker, tag or collateral"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-grow [&_input]:border-none sm:[&_input]:rounded-3xl"
    />
  )
}

const DTFFilters = () => {
  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
      <SearchFilter />
      <ChainFilter />
    </div>
  )
}

export default DTFFilters
