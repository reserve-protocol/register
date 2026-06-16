import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chainFilterAtom, searchFilterAtom } from '../atoms'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'
import { ChainId } from '@/utils/chains'
import ChainLogo from '@/components/icons/ChainLogo'
import { cn } from '@/lib/utils'
import SquareStackedChainLogo from '@/components/icons/SquareStackedChainLogo'

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
    <div
      className={cn(
        'rounded-bl-3xl rounded-br-3xl bg-card px-4 py-4 sm:rounded-3xl',
        className
      )}
    >
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="w-full justify-start gap-0.5 overflow-x-auto rounded-full bg-muted p-0.5 sm:w-auto sm:justify-center"
      >
        {options.map(({ text, icon }, index) => (
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
            <span className="hidden sm:inline">{text}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
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
      icon: (
        <SquareStackedChainLogo
          chains={[ChainId.Mainnet, ChainId.Base, ChainId.BSC]}
        />
      ),
      text: 'All chains',
      filter: [ChainId.Base, ChainId.Mainnet, ChainId.BSC],
    },
    {
      icon: (
        <ChainLogo chain={ChainId.Mainnet} className="h-5 w-5 rounded-md" />
      ),
      text: 'Ethereum',
      filter: [ChainId.Mainnet],
    },
    {
      icon: <ChainLogo chain={ChainId.Base} className="h-5 w-5 rounded-md" />,
      text: 'Base',
      filter: [ChainId.Base],
    },
    {
      icon: <ChainLogo chain={ChainId.BSC} className="h-5 w-5 rounded-md" />,
      text: 'Binance',
      filter: [ChainId.BSC],
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
      className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl sm:[&_input]:rounded-3xl"
      inputClassName="h-[68px]"
    />
  )
}

const DiscoverFilters = () => (
  <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
    <SearchFilter />
    <ChainFilter />
  </div>
)

export default DiscoverFilters
