import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import {
  CHAIN_TO_NETWORK,
  NETWORKS,
  capitalize,
  supportedChainList,
} from 'utils/constants'
import MultiselectDropdrown from 'views/explorer/components/MultiselectDropdown'
import { poolChainsFilterAtom } from '../atoms'

const PoolsChainFilter = () => {
  const [chains, setChains] = useAtom(poolChainsFilterAtom)

  const options = useMemo(
    () =>
      Object.keys(NETWORKS).map((chain) => ({
        label: capitalize(chain),
        value: NETWORKS[chain].toString(),
        icon: <ChainLogo chain={NETWORKS[chain]} />,
      })),
    []
  )

  const chainsLogos = useMemo(
    () =>
      options
        .filter(({ value }) => chains.includes(value))
        .map(({ value }) => Number(value)),
    [options, chains]
  )

  const onChange = (selected: string[]) => setChains(selected)

  return (
    <Box sx={{ minWidth: '162px' }}>
      <MultiselectDropdrown
        options={options}
        selected={chains}
        onChange={onChange}
        sx={{
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '8px',
          px: '10px',
          py: '6px',
        }}
      >
        {Boolean(chainsLogos.length) && (
          <StackedChainLogo chains={chainsLogos} />
        )}
        {chains.length === 0 && <Text variant="legend">Select a chain</Text>}
        {chains.length == 1 && (
          <Text variant="legend">
            {capitalize(CHAIN_TO_NETWORK[Number(chains[0])])}
          </Text>
        )}
        {chains.length > 1 && chains.length !== supportedChainList.length && (
          <Text variant="legend">{chains.length} chains</Text>
        )}
        {chains.length === supportedChainList.length && (
          <Text variant="legend">All Chains</Text>
        )}
      </MultiselectDropdrown>
    </Box>
  )
}

export default PoolsChainFilter
