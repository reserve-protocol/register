import CirclesIcon from 'components/icons/CirclesIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import TokenLogo from 'components/icons/TokenLogo'
import Ethereum from 'components/icons/logos/Ethereum'
import { SearchInput } from 'components/input'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import {
  filterOptionAtom,
  poolFilterAtom,
  poolSearchFilterAtom,
} from '../atoms'

// Includes Eth+
const ETH_ADDRESSES = [
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
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
        icon: <EarnNavIcon />,
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

  const handleSelect = (option: number) => {
    onSelect(option)
    setFilters(options[option]?.filter ?? 0)
  }

  return (
    <Box
      sx={{ borderRadius: borderRadius.boxes, background: 'border' }}
      variant="layout.verticalAlign"
      mx={3}
      p={1}
    >
      {options.map(({ text, icon }, index) => (
        <Box
          key={text}
          role="button"
          sx={{
            cursor: 'pointer',
            backgroundColor: index === selected ? 'background' : 'transparent',
            width: ['40px', 'auto'],
            height: '32px',
            borderRadius: borderRadius.inner,
            justifyContent: 'center',
          }}
          variant="layout.verticalAlign"
          py={1}
          px={2}
          onClick={() => handleSelect(index)}
        >
          {icon}{' '}
          <Text ml="2" sx={{ display: ['none', 'block'] }}>
            {text}
          </Text>
        </Box>
      ))}
    </Box>
  )
}

const setPageSearchAtom = atom(null, (get, set, search: string) => {
  set(filterOptionAtom, -1)
  set(poolFilterAtom, {
    stables: false,
    tokens: search ? search.split(',') : [],
  })
  set(poolSearchFilterAtom, '')
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
    <Box
      variant="layout.verticalAlign"
      sx={{ flexShrink: 0, minWidth: [200, 680, 'auto'] }}
      marginLeft={[0, 0, 'auto']}
    >
      <SearchInput
        placeholder="Search pool"
        p={2}
        value={search}
        onChange={setSearch}
        sx={{ maxWidth: ['auto', 200, 160], borderRadius: borderRadius.boxes }}
      />
      <FilterOptions />
    </Box>
  )
}

export default TableFilters
