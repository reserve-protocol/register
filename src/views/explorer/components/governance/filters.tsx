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

export const proposalStatus = {
  [PROPOSAL_STATES.ACTIVE]: 'Active',
  [PROPOSAL_STATES.DEFEATED]: 'Defeated',
  [PROPOSAL_STATES.EXECUTED]: 'Executed',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'Quorum not reached',
  [PROPOSAL_STATES.CANCELED]: 'Canceled',
  [PROPOSAL_STATES.SUCCEEDED]: 'Succeeded',
  [PROPOSAL_STATES.EXPIRED]: 'Expired',
}

const ProposalStatusFilter = (
  props: Omit<IMultiselectDropdrown, 'options'>
) => {
  const options = useMemo(() => {
    return Object.entries(proposalStatus).map(([key, value]) => ({
      label: value,
      value: key,
      icon: null,
    }))
  }, [])

  return (
    <div>
      <span className="text-legend">Status</span>
      <MultiselectDropdrown className="mt-1" options={options} {...props} allOption>
        <VoteIcon width={18} />
        <span className="ml-2 text-legend">
          {props.selected.length
            ? `${props.selected.length} selected`
            : 'All statuses'}
        </span>
      </MultiselectDropdrown>
    </div>
  )
}

const TYPE_ITEMS = [
  { key: 'all', label: 'All' },
  { key: 'yield', label: 'Yield' },
  { key: 'index', label: 'Index' },
]

const ProposalFilters = () => {
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
        items={TYPE_ITEMS}
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
