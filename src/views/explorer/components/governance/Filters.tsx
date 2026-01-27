import VoteIcon from 'components/icons/VoteIcon'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { PROPOSAL_STATES } from 'utils/constants'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import TokenFilter from '../filters/TokenFilter'
import { filtersAtom } from './atoms'

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

const ProposalFilters = () => {
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <div className="flex items-center ml-1 gap-4">
      <TokenFilter
        selected={filters.tokens}
        onChange={(selected) => handleChange('tokens', selected)}
      />
      <ProposalStatusFilter
        selected={filters.status}
        onChange={(selected) => handleChange('status', selected)}
      />
    </div>
  )
}

export default ProposalFilters
