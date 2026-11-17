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
import ProposalSortMenu from '@/components/proposal-sort-menu'
import EnsName from '@/components/utils/ens-name'
import { X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { type DTFType, filtersAtom, proposalSortAtom } from './atoms'
import { useProposerFilter } from './use-proposals-data'

export const proposalStatus: Record<string, MessageDescriptor> = {
  [PROPOSAL_STATES.PENDING]: msg`Pending`,
  [PROPOSAL_STATES.ACTIVE]: msg`Active`,
  [PROPOSAL_STATES.DEFEATED]: msg`Defeated`,
  [PROPOSAL_STATES.EXECUTED]: msg`Executed`,
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: msg`Quorum not reached`,
  [PROPOSAL_STATES.CANCELED]: msg`Canceled`,
  [PROPOSAL_STATES.SUCCEEDED]: msg`Succeeded`,
  [PROPOSAL_STATES.QUEUED]: msg`Queued`,
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
  const [sort, setSort] = useAtom(proposalSortAtom)

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
      <div className="flex items-center gap-2">
        <span className="text-legend">{t`Sort by`}</span>
        <ProposalSortMenu value={sort} onChange={setSort} />
      </div>
      <ProposerFilterChip />
    </div>
  )
}

const ProposerFilterChip = () => {
  const { t } = useLingui()
  const proposer = useProposerFilter()
  const [, setSearchParams] = useSearchParams()

  if (!proposer) return null

  return (
    <div
      className="flex items-center gap-2 rounded-full bg-card py-1 pl-3 pr-1 text-sm"
      data-testid="explorer-proposer-filter"
    >
      <span className="text-legend">{t`Proposer`}</span>
      <EnsName address={proposer} className="font-medium" />
      <button
        type="button"
        aria-label={t`Clear proposer filter`}
        onClick={() =>
          setSearchParams((params) => {
            params.delete('proposer')
            return params
          })
        }
        className="flex h-7 w-7 items-center justify-center rounded-full text-legend hover:bg-secondary hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default ProposalFilters
