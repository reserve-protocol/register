import CirclesIcon from 'components/icons/CirclesIcon'
import TokenLogo from 'components/icons/TokenLogo'
import Ethereum from 'components/icons/logos/Ethereum'
import { SearchInput } from 'components/input'
import { useAtom, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { poolFilterAtom, poolSearchFilterAtom } from '../atoms'

// Includes Eth+
const ETH_ADDRESSES = [
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
]
const RSR_ADDRESSES = [RSR_ADDRESS[ChainId.Mainnet], RSR_ADDRESS[ChainId.Base]]

const FilterOptions = () => {
  const [selected, onSelect] = useState(0)
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
        icon: (
          <Box
            sx={{
              borderRadius: '50%',
            }}
          >
            <Text variant="strong">$</Text>
          </Box>
        ),
      },
      {
        text: 'ETH',
        icon: <Ethereum />,
        filter: { stables: false, tokens: ETH_ADDRESSES },
      },
      {
        text: 'RSR',
        icon: <TokenLogo symbol="rsr" />,
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
      sx={{ borderRadius: borderRadius.boxes, background: 'contentBackground' }}
      variant="layout.verticalAlign"
      ml={3}
      p={1}
    >
      {options.map(({ text, icon }, index) => (
        <Box
          key={text}
          role="button"
          sx={{
            cursor: 'pointer',
            backgroundColor: index === selected ? 'background' : 'transparent',
            border: '1px solid',
            borderColor: index === selected ? 'primary' : 'transparent',
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
          <Text variant="strong" ml="2" sx={{ display: ['none', 'block'] }}>
            {text}
          </Text>
        </Box>
      ))}
    </Box>
  )
}

const TableFilters = () => {
  const [search, setSearch] = useAtom(poolSearchFilterAtom)

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
        sx={{ maxWidth: ['auto', 200, 160] }}
      />
      <FilterOptions />
    </Box>
  )
}

export default TableFilters
