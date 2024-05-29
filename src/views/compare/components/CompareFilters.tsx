import ChainFilter from 'components/filters/chain/ChainFilter'
import CirclesIcon from 'components/icons/CirclesIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import Ethereum from 'components/icons/logos/Ethereum'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { TARGET_UNITS, supportedChainList } from 'utils/constants'

export const chainsFilterAtom = atom(
  supportedChainList.map((chain) => chain.toString())
)

export const targetFilterAtom = atom([TARGET_UNITS.ETH, TARGET_UNITS.USD])

const TargetFilter = () => {
  const [selected, setSelected] = useState(0)
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
        icon: <EarnNavIcon style={{ marginRight: '-4px' }} />,
      },
    ],
    []
  )

  const handleSelect = (option: number) => {
    setSelected(option)
    setFilters(options[option]?.filter ?? [])
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

const CompareFilters = () => {
  const [chains, setChains] = useAtom(chainsFilterAtom)

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
      <ChainFilter chains={chains} onChange={setChains} />
      <TargetFilter />
    </Box>
  )
}

export default CompareFilters
