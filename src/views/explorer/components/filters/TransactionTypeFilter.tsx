import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import { PillLabel, PillValue } from '../kit/filter-pill'

export const entryTypes: Record<string, MessageDescriptor> = {
  MINT: msg`Mint`,
  REDEEM: msg`Redeem`,
  TRANSFER: msg`Transfer`,
  BURN: msg`Melt`,
  ISSUE: msg`Issue`,
  CLAIM: msg`Claim`,
  STAKE: msg`Stake`,
  UNSTAKE: msg`Unstake`,
  WITHDRAW: msg`Withdraw`,
  UNSTAKE_CANCELLED: msg`Unstake Cancelled`,
}

const TransactionTypeFilter = (
  props: Omit<IMultiselectDropdrown, 'options'>
) => {
  const { t } = useLingui()
  const options = useMemo(() => {
    return Object.entries(entryTypes).map(([key, value]) => ({
      label: t(value),
      value: key,
      icon: null,
    }))
  }, [t])

  return (
    <MultiselectDropdrown options={options} {...props} allOption>
      <PillLabel>
        <Trans>Type</Trans>
      </PillLabel>
      <PillValue>
        {props.selected.length ? t`${props.selected.length} selected` : t`All`}
      </PillValue>
    </MultiselectDropdrown>
  )
}

export default TransactionTypeFilter
