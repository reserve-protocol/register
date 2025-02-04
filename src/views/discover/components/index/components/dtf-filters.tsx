import { useSetAtom, useAtom } from 'jotai'
import { useState } from 'react'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  searchFilterAtom,
  chainFilterAtom,
} from '@/views/discover/components/index/atoms/filter'
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
        'bg-card rounded-bl-2xl rounded-br-2xl sm:rounded-2xl px-4 py-2',
        className
      )}
    >
      {options.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-[#f2f2f2] data-[state=on]:text-primary hover:text-primary hover:bg-[#f2f2f2]"
        >
          {icon}
          <div className="hidden sm:block ml-[6px]">{text}</div>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const ChainFilter = () => {
  const [selected, setSelected] = useState('0')
  const setFilters = useSetAtom(chainFilterAtom)

  const chains = [
    {
      icon: <LayoutGrid />,
      text: 'All chains',
      filter: [ChainId.Base],
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
      placeholder="Search by name, ticker or collateral"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-grow [&_input]:rounded-bl-none [&_input]:rounded-br-none [&_input]:border-none sm:[&_input]:rounded-2xl"
    />
  )
}

const DTFFilters = () => {
  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
      <SearchFilter />
      {/* <ChainFilter /> */}
    </div>
  )
}

export default DTFFilters
