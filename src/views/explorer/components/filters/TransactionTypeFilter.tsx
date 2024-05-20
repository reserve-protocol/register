import { Trans } from '@lingui/macro'
import CirclesIcon from 'components/icons/CirclesIcon'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import TransactionsIcon from 'components/icons/TransactionsIcon'

export const entryTypes = {
  MINT: `Mint`,
  REDEEM: `Redeem`,
  TRANSFER: `Transfer`,
  BURN: `Melt`,
  ISSUE: `Issue`,
  CLAIM: `Claim`,
  STAKE: `Stake`,
  UNSTAKE: `Unstake`,
  WITHDRAW: `Withdraw`,
  UNSTAKE_CANCELLED: `Unstake Cancelled`,
}

const TransactionTypeFilter = (
  props: Omit<IMultiselectDropdrown, 'options'>
) => {
  const options = useMemo(() => {
    return Object.entries(entryTypes).map(([key, value]) => ({
      label: value,
      value: key,
      icon: null,
    }))
  }, [])

  return (
    <Box>
      <Text variant="legend">
        <Trans>Tx Type</Trans>
      </Text>
      <MultiselectDropdrown mt={1} options={options} {...props} allOption>
        <TransactionsIcon width={18} />
        <Text ml="2" variant="legend">
          {props.selected.length
            ? `${props.selected.length} selected`
            : 'All types'}
        </Text>
      </MultiselectDropdrown>
    </Box>
  )
}

export default TransactionTypeFilter
