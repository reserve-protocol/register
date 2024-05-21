import { Box, Text } from 'theme-ui'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import { useMemo } from 'react'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import { Trans } from '@lingui/macro'

const ChainFilter = (props: Omit<IMultiselectDropdrown, 'options'>) => {
  const options = useMemo(() => {
    return supportedChainList.map((chainId) => ({
      label: CHAIN_TAGS[chainId],
      value: chainId.toString(),
      icon: <ChainLogo chain={chainId} />,
    }))
  }, [])

  return (
    <Box>
      <Text variant="legend">
        <Trans>Networks</Trans>
      </Text>
      <MultiselectDropdrown mt={1} minLimit={1} options={options} {...props}>
        <StackedChainLogo chains={props.selected.map((v) => Number(v))} />
        <Text variant="legend">{props.selected.length} chains</Text>
      </MultiselectDropdrown>
    </Box>
  )
}

export default ChainFilter
