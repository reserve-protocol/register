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
import { supportedChainList } from 'utils/constants'
import {
  filterOptionAtom,
  poolChainsFilterAtom,
  poolFilterAtom,
  poolSearchFilterAtom,
} from '../atoms'
import PoolsChainFilter from './PoolsChainFilter'

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

  const handleSelect = (option: number) => {
    onSelect(option)
    setFilters(options[option]?.filter ?? 0)
  }

  return (
    <Box
      sx={{ borderRadius: borderRadius.inputs, background: 'inputBackground' }}
      variant="layout.verticalAlign"
      p={'2px'}
    >
      {options.map(({ text, icon }, index) => (
        <Box
          key={text}
          role="button"
          sx={{
            cursor: 'pointer',
            backgroundColor:
              index === selected ? 'backgroundNested' : 'transparent',
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
          <Text ml="6px" sx={{ display: ['none', 'block'] }}>
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
    <Box sx={{ backgroundColor: 'backgroundNested', width: '100%' }} p="2">
      <Box
        variant="layout.verticalAlign"
        sx={{
          width: '100%',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box mr="auto">
          <SearchInput
            placeholder="Search pool"
            p={1}
            value={search}
            onChange={setSearch}
            sx={{
              maxWidth: ['auto', 200],
              borderRadius: borderRadius.inputs,
            }}
          />
        </Box>

        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <FilterOptions />
          <PoolsChainFilter />
        </Box>
      </Box>
    </Box>
  )
}

export default TableFilters
