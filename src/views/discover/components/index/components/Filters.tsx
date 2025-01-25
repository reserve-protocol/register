import { useSetAtom, useAtom } from 'jotai'
import { useState, useMemo } from 'react'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  searchFilterAtom,
  categoryFilterAtom,
  chainFilterAtom,
} from '@/views/discover/components/index/atoms/filter'
import { DTF_CATEGORIES } from '@/utils/constants'
import AsteriskIcon from '@/components/icons/AsteriskIcon'
import { ChainId } from '@/utils/chains'

const SingleToggleFilter = ({
  options,
  onValueChange,
  value,
}: {
  value: string
  options: { text: string; filter: string[] | number[] }[]
  onValueChange: (value: string) => void
}) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className="bg-card rounded-2xl px-4 py-2"
    >
      {options.map(({ text }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-[#f2f2f2] data-[state=on]:text-primary hover:text-primary"
        >
          <div className="[&_svg]:h-[12px] [&_svg]:w-[12px] [&_path]:stroke-[1.5]">
            <AsteriskIcon />
          </div>
          <div className="hidden sm:inline ml-[6px]">{text}</div>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const categories = [
  {
    text: 'All',
    filter: Object.keys(DTF_CATEGORIES),
  },
  {
    text: 'Memes',
    filter: [DTF_CATEGORIES.MEMES],
  },
  {
    text: 'DeFi',
    filter: [DTF_CATEGORIES.DEFI],
  },
  {
    text: 'AI',
    filter: [DTF_CATEGORIES.AI],
  },
  {
    text: 'RWA',
    filter: [DTF_CATEGORIES.RWA],
  },
]

const CategoryFilter = () => {
  const [selected, setSelected] = useState('0')
  const setFilters = useSetAtom(categoryFilterAtom)

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(categories[Number(value)]?.filter ?? [])
  }

  return (
    <SingleToggleFilter
      value={selected}
      options={categories}
      onValueChange={handleSelect}
    />
  )
}

const chains = [
  {
    text: 'All chains',
    filter: [ChainId.Base],
  },
  {
    text: 'Base',
    filter: [ChainId.Base],
  },
]

const ChainFilter = () => {
  const [selected, setSelected] = useState('0')
  const setFilters = useSetAtom(chainFilterAtom)

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
      className="flex-grow rounded-2xl [&_input]:rounded-2xl"
    />
  )
}

const DTFFilters = () => {
  return (
    <div className="flex items-center gap-1">
      <SearchFilter />
      <CategoryFilter />
      <ChainFilter />
    </div>
  )
}

export default DTFFilters
