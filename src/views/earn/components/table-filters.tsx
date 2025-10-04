import CirclesIcon from 'components/icons/CirclesIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import TokenLogo from 'components/icons/TokenLogo'
import Ethereum from 'components/icons/logos/Ethereum'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { supportedChainList } from 'utils/constants'
import {
  filterOptionAtom,
  poolChainsFilterAtom,
  poolFilterAtom,
  poolSearchFilterAtom,
} from '../atoms'
import PoolsChainFilter from './pools-chain-filter'

// Includes Eth+
const ETH_ADDRESSES = [
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
  '0x18C14C2D707b2212e17d1579789Fc06010cfca23',
  '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff',
  '0x005F893EcD7bF9667195642f7649DA8163e23658',
  '0x0000000000000000000000000000000000000000',
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
]
const RSR_ADDRESSES = [RSR_ADDRESS[ChainId.Mainnet], RSR_ADDRESS[ChainId.Base]]

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
        filter: { stables: false, tokens: ETH_ADDRESSES },
      },
      {
        text: 'RSR',
        icon: <TokenLogo symbol="rsr" width="16px" />,
        filter: { stables: false, tokens: RSR_ADDRESSES },
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
      className="bg-card rounded-bl-3xl sm:rounded-3xl px-4 py-4 h-auto"
    >
      {options.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <span className="hidden sm:block ml-[6px]">{text}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const setPageSearchAtom = atom(null, (get, set, search: string) => {
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
  const setPageFilter = useSetAtom(setPageSearchAtom)
  const [searchParams] = useSearchParams()

  // Get default token to filter if any
  useEffect(() => {
    if (searchParams.get('underlying')) {
      setPageFilter((searchParams.get('underlying') || '').trim())
    }

    return () => {
      if (searchParams.get('underlying')) {
        setPageFilter('')
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
      <SearchInput
        placeholder="Search pool"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow [&_input]:border-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl sm:[&_input]:rounded-3xl"
      />
      <FilterOptions />
      <PoolsChainFilter />
    </div>
  )
}

export default TableFilters
