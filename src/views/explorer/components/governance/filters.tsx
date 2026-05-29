import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import VoteIcon from 'components/icons/VoteIcon'
import TabMenu from 'components/tab-menu'
import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { PROPOSAL_STATES } from 'utils/constants'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import TokenFilter from '../filters/token-filter'
import { type DTFType, filtersAtom } from './atoms'

export const proposalStatus: Record<string, MessageDescriptor> = {
  [PROPOSAL_STATES.PENDING]: msg`Pending`,
  [PROPOSAL_STATES.ACTIVE]: msg`Active`,
  [PROPOSAL_STATES.DEFEATED]: msg`Defeated`,
  [PROPOSAL_STATES.EXECUTED]: msg`Executed`,
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: msg`Quorum not reached`,
  [PROPOSAL_STATES.CANCELED]: msg`Canceled`,
  [PROPOSAL_STATES.SUCCEEDED]: msg`Succeeded`,
  [PROPOSAL_STATES.EXPIRED]: msg`Expired`,
}

const ProposalStatusFilter = (
  props: Omit<IMultiselectDropdrown, 'options'>
) => {
  const { t } = useLingui()
  const options = useMemo(() => {
    return Object.entries(proposalStatus).map(([key, value]) => ({
      label: t(value),
      value: key,
      icon: null,
    }))
  }, [t])

  return (
    <div>
      <span className="text-legend">{t`Status`}</span>
      <MultiselectDropdrown className="mt-1" options={options} {...props} allOption>
        <VoteIcon width={18} />
        <span className="ml-2 text-legend">
          {props.selected.length
            ? t`${props.selected.length} selected`
            : t`All statuses`}
        </span>
      </MultiselectDropdrown>
    </div>
  )
}

const TYPE_ITEMS: { key: string; label: MessageDescriptor }[] = [
  { key: 'all', label: msg`All` },
  { key: 'yield', label: msg`Yield` },
  { key: 'index', label: msg`Index` },
]

const ProposalFilters = () => {
  const { t } = useLingui()
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: 'tokens' | 'status', selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  const handleTypeChange = useCallback(
    (key: string) => {
      setFilters((prev) => ({ ...prev, type: key as DTFType, tokens: [] }))
    },
    [setFilters]
  )

  return (
    <div className="flex items-end ml-1 gap-4 flex-wrap">
      <TabMenu
        active={filters.type}
        items={TYPE_ITEMS.map((item) => ({ ...item, label: t(item.label) }))}
        onMenuChange={handleTypeChange}
      />
      <TokenFilter
        selected={filters.tokens}
        onChange={(selected) => handleChange('tokens', selected)}
        dtfType={filters.type}
      />
      <ProposalStatusFilter
        selected={filters.status}
        onChange={(selected) => handleChange('status', selected)}
      />
    </div>
  )
}

export default ProposalFilters
