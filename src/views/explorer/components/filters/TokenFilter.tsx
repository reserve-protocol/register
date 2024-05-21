import rtokens from '@reserve-protocol/rtokens'
import { Trans } from '@lingui/macro'
import CirclesIcon from 'components/icons/CirclesIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import { supportedChainList } from 'utils/constants'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
  SelectOption,
} from '../MultiselectDropdown'

const TokenFilter = (props: Omit<IMultiselectDropdrown, 'options'>) => {
  const options = useMemo(() => {
    const items: SelectOption[] = []

    for (const chain of supportedChainList) {
      items.push(
        ...Object.values(rtokens[chain] || {}).map((v) => ({
          label: v.symbol,
          value: v.address.toLowerCase(),
          icon: <TokenLogo src={useRTokenLogo(v.address, chain)} />,
        }))
      )
    }

    return items
  }, [])

  return (
    <Box>
      <Text variant="legend">
        <Trans>Tokens</Trans>
      </Text>
      <MultiselectDropdrown mt={1} options={options} {...props} allOption>
        <CirclesIcon />
        <Text ml="2" variant="legend">
          {props.selected.length
            ? `${props.selected.length} RTokens`
            : 'All RTokens'}
        </Text>
      </MultiselectDropdrown>
    </Box>
  )
}

export default TokenFilter
