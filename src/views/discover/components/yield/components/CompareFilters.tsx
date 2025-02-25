import { SearchInput } from '@/components/ui/input'
import ChainFilter from 'components/filters/chain/ChainFilter'
import CirclesIcon from 'components/icons/CirclesIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import Ethereum from 'components/icons/logos/Ethereum'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { TARGET_UNITS, supportedChainList } from 'utils/constants'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export const searchFilterAtom = atom('')

export const chainsFilterAtom = atom(
  supportedChainList.map((chain) => chain.toString())
)

export const targetFilterAtom = atom([TARGET_UNITS.ETH, TARGET_UNITS.USD])

const TargetFilter = () => {
  const [selected, setSelected] = useState('0')
  const setFilters = useSetAtom(targetFilterAtom)

  const options = useMemo(
    () => [
      {
        text: 'All',
        icon: <CirclesIcon />,
        filter: [TARGET_UNITS.ETH, TARGET_UNITS.USD],
      },
      {
        text: 'ETH',
        icon: <Ethereum />,
        filter: [TARGET_UNITS.ETH],
      },
      {
        text: 'USD',
        filter: [TARGET_UNITS.USD],
        icon: <EarnNavIcon className="mr-[-4px]" />,
      },
    ],
    []
  )

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(options[Number(value)]?.filter ?? [])
  }

  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={handleSelect}
      className="flex-grow bg-card rounded-br-2xl sm:rounded-2xl p-2"
    >
      {options.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="h-8 data-[state=on]:text-primary hover:text-primary"
        >
          {icon}
          <span className="hidden sm:inline">{text}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
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

const CompareFilters = () => {
  const [chains, setChains] = useAtom(chainsFilterAtom)

  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
      <SearchFilter />
      <div className="flex gap-[2px] sm:gap-1">
        <div className="rounded-bl-2xl sm:rounded-2xl basis-1/2 bg-card">
          <ChainFilter
            className="!border-none"
            height={48}
            rounded
            chains={chains}
            onChange={setChains}
          />
        </div>
        <TargetFilter />
      </div>
    </div>
  )
}

export default CompareFilters
