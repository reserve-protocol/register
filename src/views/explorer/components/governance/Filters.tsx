import VoteIcon from 'components/icons/VoteIcon'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
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
    <Box>
      <Text variant="legend">Status</Text>
      <MultiselectDropdrown mt={1} options={options} {...props} allOption>
        <VoteIcon width={18} />
        <Text ml="2" variant="legend">
          {props.selected.length
            ? `${props.selected.length} selected`
            : 'All statuses'}
        </Text>
      </MultiselectDropdrown>
    </Box>
  )
}

const ProposalFilters = () => {
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <Box variant="layout.verticalAlign" ml="1" sx={{ gap: 3 }}>
      <TokenFilter
        selected={filters.tokens}
        onChange={(selected) => handleChange('tokens', selected)}
      />
      <ProposalStatusFilter
        selected={filters.status}
        onChange={(selected) => handleChange('status', selected)}
      />
    </Box>
  )
}

export default ProposalFilters
