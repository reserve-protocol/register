import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import EnsName from '@/components/utils/ens-name'
import { type ProposalSort } from '@/lib/proposal-sort'
import { cn } from '@/lib/utils'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom } from 'jotai'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PROPOSAL_STATES } from 'utils/constants'
import { isAddress } from 'viem'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import TokenFilter from '../filters/token-filter'
import { ExplorerToolbar } from '../kit/explorer-layout'
import {
  PillChevron,
  PillLabel,
  PillValue,
  SelectPill,
  menuClassName,
  pillClassName,
} from '../kit/filter-pill'
import Segmented from '../kit/segmented'
import { type DTFType, filtersAtom, proposalSortAtom } from './atoms'
import { DEFAULT_PERIOD, type Period } from './period'
import { usePeriodFilter, useProposerFilter } from './use-proposals-data'

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

export const periodLabels: Record<Period, MessageDescriptor> = {
  '1w': msg`Last week`,
  '1m': msg`Last month`,
  '3m': msg`Last 3 months`,
  '1y': msg`Last year`,
  all: msg`All`,
}

const TYPE_ITEMS: { value: DTFType; label: MessageDescriptor }[] = [
  { value: 'all', label: msg`All` },
  { value: 'yield', label: msg`Yield` },
  { value: 'index', label: msg`Index` },
]

const SORT_ITEMS: { value: ProposalSort; label: MessageDescriptor }[] = [
  { value: 'status', label: msg`Status` },
  { value: 'newest', label: msg`Newest` },
]

export const useSetGovernanceParam = () => {
  const [, setSearchParams] = useSearchParams()

  return (key: 'proposer' | 'period', value: string | null) =>
    setSearchParams((params) => {
      if (value) params.set(key, value)
      else params.delete(key)
      return params
    })
}

const ProposalStatusFilter = (
  props: Omit<IMultiselectDropdrown, 'options'>
) => {
  const { t } = useLingui()
  const options = useMemo(
    () =>
      Object.entries(proposalStatus).map(([key, value]) => ({
        label: t(value),
        value: key,
        icon: null,
      })),
    [t]
  )

  return (
    <MultiselectDropdrown options={options} {...props} allOption>
      <PillLabel>
        <Trans>Status</Trans>
      </PillLabel>
      <PillValue>
        {props.selected.length ? t`${props.selected.length} selected` : t`All`}
      </PillValue>
    </MultiselectDropdrown>
  )
}

const ProposerFilter = () => {
  const { t } = useLingui()
  const proposer = useProposerFilter()
  const setParam = useSetGovernanceParam()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const isValid = isAddress(draft.trim())

  if (proposer) {
    return (
      <div
        className="col-span-2 flex h-11 min-w-0 items-center gap-2 rounded-full bg-accent pl-3.5 pr-0.5 text-sm text-primary sm:h-10"
        data-testid="explorer-proposer-filter"
      >
        <span className="shrink-0">{t`Proposer`}</span>
        <EnsName address={proposer} className="truncate font-semibold" />
        <button
          type="button"
          aria-label={t`Clear proposer filter`}
          onClick={() => setParam('proposer', null)}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-card/60 sm:h-9 sm:w-9"
        >
          <X size={14} aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={pillClassName}
          data-testid="explorer-proposer-trigger"
        >
          <PillLabel>
            <Trans>Proposer</Trans>
          </PillLabel>
          <PillValue>
            <Trans>Any</Trans>
          </PillValue>
          <PillChevron />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn(menuClassName, 'w-80 p-3.5')}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (!isValid) return
            setParam('proposer', draft.trim().toLowerCase())
            setDraft('')
            setOpen(false)
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-legend">
              <Trans>Proposer address</Trans>
            </span>
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="0x…"
              className="h-10 rounded-full bg-card px-3.5"
              aria-invalid={!!draft && !isValid}
            />
          </label>
          {!!draft && !isValid && (
            <span className="text-sm text-destructive">
              <Trans>Enter a valid address</Trans>
            </span>
          )}
          <Button
            type="submit"
            variant="accent"
            className="h-10 rounded-full font-semibold"
            disabled={!isValid}
          >
            <Trans>Apply</Trans>
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

const ProposalFilters = () => {
  const { t } = useLingui()
  const [filters, setFilters] = useAtom(filtersAtom)
  const [sort, setSort] = useAtom(proposalSortAtom)
  const period = usePeriodFilter()
  const setParam = useSetGovernanceParam()

  const handleChange = (key: 'tokens' | 'status', selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <ExplorerToolbar>
      <Segmented
        label={t`DTF type`}
        items={TYPE_ITEMS.map((item) => ({ ...item, label: t(item.label) }))}
        value={filters.type}
        onChange={(type) => setFilters((prev) => ({ ...prev, type, tokens: [] }))}
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
      <SelectPill
        testId="explorer-period-filter"
        label={<Trans>Period</Trans>}
        value={period}
        options={Object.entries(periodLabels).map(([value, label]) => ({
          value: value as Period,
          label: t(label),
        }))}
        onChange={(next) =>
          setParam('period', next === DEFAULT_PERIOD ? null : next)
        }
      />
      <SelectPill
        className="sm:order-last sm:ml-auto"
        label={<Trans>Sort</Trans>}
        value={sort}
        options={SORT_ITEMS.map((item) => ({ ...item, label: t(item.label) }))}
        onChange={setSort}
        highlighted
      />
      <ProposerFilter />
    </ExplorerToolbar>
  )
}

export default ProposalFilters
