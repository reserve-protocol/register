import { Trans } from '@lingui/macro'
import { useMemo } from 'react'
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
    <div>
      <span className="text-legend">
        <Trans>Tx Type</Trans>
      </span>
      <MultiselectDropdrown className="mt-1" options={options} {...props} allOption>
        <TransactionsIcon width={18} />
        <span className="ml-2 text-legend">
          {props.selected.length
            ? `${props.selected.length} selected`
            : 'All types'}
        </span>
      </MultiselectDropdrown>
    </div>
  )
}

export default TransactionTypeFilter
