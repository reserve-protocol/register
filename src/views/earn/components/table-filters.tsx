import CirclesIcon from 'components/icons/CirclesIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import TokenLogo from 'components/icons/TokenLogo'
import Ethereum from 'components/icons/logos/Ethereum'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  supportedChainList,
  ETH_FILTER_ADDRESSES,
  RSR_FILTER_ADDRESSES,
} from 'utils/constants'
import {
  filterOptionAtom,
  poolChainsFilterAtom,
  poolFilterAtom,
  poolSearchFilterAtom,
} from '../atoms'
import PoolsChainFilter from './pools-chain-filter'

const FilterOptions = () => {
  const [selected, onSelect] = useAtom(filterOptionAtom)
  const setFilters = useSetAtom(poolFilterAtom)

  const options = useMemo(
    () => [
      {
        text: 'All',
        icon: <CirclesIcon />,
        filter: { stables: false, tokens: [] },
      },
      {
        text: 'Stables',
        filter: { stables: true, tokens: [] },
        icon: <EarnNavIcon style={{ margin: '0 -3px 0 -3px' }} />,
      },
      {
        text: 'ETH',
        icon: <Ethereum />,
        filter: { stables: false, tokens: ETH_FILTER_ADDRESSES },
      },
      {
        text: 'RSR',
        icon: <TokenLogo symbol="rsr" width="16px" />,
        filter: { stables: false, tokens: RSR_FILTER_ADDRESSES },
      },
    ],
    []
  )

  const handleSelect = (value: string) => {
    const option = Number(value)
    onSelect(option)
    setFilters(options[option]?.filter ?? 0)
  }

  return (
    <ToggleGroup
      type="single"
      value={selected.toString()}
      onValueChange={handleSelect}
      className="bg-card rounded-3xl px-4 py-4 h-auto"
    >
      {options.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <span className="hidden lg:block ml-[6px]">{text}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const resetFiltersAtom = atom(null, (get, set, search: string) => {
  set(filterOptionAtom, -1)
  set(poolFilterAtom, {
    stables: false,
    tokens: search ? search.split(',') : [],
  })
  set(poolSearchFilterAtom, '')
  set(
    poolChainsFilterAtom,
    supportedChainList.map((chain) => chain.toString())
  )
})

const TableFilters = () => {
  const [search, setSearch] = useAtom(poolSearchFilterAtom)
  const resetFilters = useSetAtom(resetFiltersAtom)
  const [searchParams] = useSearchParams()

  // Get default token to filter if any
  useEffect(() => {
    if (searchParams.get('underlying')) {
      resetFilters((searchParams.get('underlying') || '').trim())
    }

    return () => {
      if (searchParams.get('underlying')) {
        resetFilters('')
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-stretch lg:flex-row lg:items-center gap-[2px] lg:gap-1">
      <SearchInput
        placeholder="Search pool"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl lg:[&_input]:rounded-3xl"
      />
      <div className="hidden lg:flex">
        <FilterOptions />
      </div>
      <PoolsChainFilter />
    </div>
  )
}

export default TableFilters
