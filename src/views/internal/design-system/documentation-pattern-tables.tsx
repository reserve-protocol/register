import { useCallback, useId, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

import { Button } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { Tabs, TabsContent } from '@/components/design-system-v1/tabs'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

import { historicalRebalances } from './auctions-browse/history-model'
import { HistoricalRebalancesTable } from './auctions-browse/history-table'
import {
  currentTableRows,
  TABLE_SCENARIOS,
  type TableScenario,
  type TableRow,
} from './auctions-current-table/model'
import { CurrentRebalancesTable } from './auctions-current-table/table'
import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import { GovernanceProposalRecord } from './governance-proposal-record'
import {
  CURRENT_PROPOSAL_FIXTURES,
  HISTORICAL_PROPOSAL_FIXTURES,
} from './governance-proposal-state-fixtures'
import { DefiTable } from './table-family/defi-table'
import { previewDiscover } from './table-family/discover-fixtures'
import { DiscoverTable } from './table-family/discover-table'
import { previewEarn } from './table-family/earn-fixtures'
import { EarnTable } from './table-family/earn-table'
import {
  POSITIONS,
  WITHDRAWALS,
  YIELD_POSITIONS,
} from './table-family/fixtures'
import {
  HOLDINGS,
  previewHoldings,
  type HoldingsTab,
} from './table-family/holdings-fixtures'
import { HoldingsTable } from './table-family/holdings-table'
import { previewOwned } from './table-family/owned-fixtures'
import { OwnedTable } from './table-family/owned-table'
import { Positions } from './table-family/positions'
import { Withdrawals, type WithdrawalPreview } from './table-family/withdrawals'
import { useDocumentationSpecimenState } from './use-documentation-specimen-state'

const VIEWPORT = {
  defaultValue: 'full',
  values: ['full', 'phone'],
} as const

const CURRENT_SCHEMA = {
  state: {
    defaultValue: 'ready',
    values: Object.keys(TABLE_SCENARIOS) as TableScenario[],
  },
  viewport: VIEWPORT,
} as const

const HISTORY_SCHEMA = {
  state: {
    defaultValue: 'default',
    values: [
      'default',
      'expired',
      'pressure',
      'metrics-loading',
      'unavailable',
      'zero',
      'loading',
      'empty',
    ],
  },
  viewport: VIEWPORT,
} as const

const CURRENT_STATE_LABELS: Record<TableScenario, MessageDescriptor> = {
  all: msg`All`,
  ready: msg`First auction · restricted`,
  permissionless: msg`First auction · permissionless`,
  hybrid: msg`Hybrid · weights required`,
  live: msg`Auction live · bids`,
  'no-bids': msg`Auction live · no bids`,
  repeat: msg`Next auction · prior run`,
  indexing: msg`Confirmed → indexing delayed`,
  complete: msg`Target reached · window open`,
  multiple: msg`Two current records`,
  empty: msg`No current rebalance`,
  loading: msg`Current records loading`,
}

type HistoryState = (typeof HISTORY_SCHEMA.state.values)[number]

const HISTORY_STATE_LABELS: Record<HistoryState, MessageDescriptor> = {
  default: msg`Default`,
  expired: msg`Expired`,
  pressure: msg`Pressure`,
  'metrics-loading': msg`Metrics loading`,
  unavailable: msg`Unavailable`,
  zero: msg`Zero`,
  loading: msg`Loading`,
  empty: msg`Empty`,
}

const PORTFOLIO_SCHEMA = {
  family: { defaultValue: 'index', values: ['index', 'yield'] },
  viewport: VIEWPORT,
} as const

const HOLDINGS_SCHEMA = {
  family: {
    defaultValue: 'exposure',
    values: ['exposure', 'collateral'],
  },
  viewport: VIEWPORT,
} as const

const DISCOVER_SCHEMA = { viewport: VIEWPORT } as const

const EARN_SCHEMA = {
  family: {
    defaultValue: 'index',
    values: ['index', 'yield', 'defi', 'owned-lock', 'owned-stake'],
  },
  viewport: VIEWPORT,
} as const

export const TABLE_DOCUMENTATION_SECTION_IDS = [
  'tables-current-rebalances',
  'tables-historical-rebalances',
  'tables-portfolio',
  'tables-holdings',
  'tables-discover',
  'tables-earn',
  'tables-governance',
] as const

type Choice = { value: string; label: string }

const ChoiceSelect = ({
  label,
  value,
  choices,
  onChange,
}: {
  label: string
  value: string
  choices: readonly Choice[]
  onChange: (value: string) => void
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger size="compact" className="w-56" aria-label={label}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {choices.map((choice) => (
        <SelectItem key={choice.value} value={choice.value}>
          {choice.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const ViewportControl = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  const { t } = useLingui()
  return (
    <ChoiceSelect
      label={t`Table viewport`}
      value={value}
      choices={[
        { value: 'full', label: t`Full width` },
        { value: 'phone', label: t`Phone width · 390px` },
      ]}
      onChange={onChange}
    />
  )
}

const TableSection = ({
  id,
  title,
  description,
  children,
}: {
  id: (typeof TABLE_DOCUMENTATION_SECTION_IDS)[number]
  title: ReactNode
  description: ReactNode
  children: ReactNode
}) => (
  <section
    id={id}
    data-testid="table-documentation-section"
    className="scroll-mt-24 space-y-4"
  >
    <div className="space-y-1">
      <h3 className={type.sectionTitle}>{title}</h3>
      <p className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}>
        {description}
      </p>
    </div>
    {children}
  </section>
)

const useCanvasHost = () => {
  const { t } = useLingui()
  return {
    name: t`Product records`,
    backgroundOwner: t`Product page`,
    insetOwner: t`Record surface`,
  }
}

const specimenWidth = (viewport: string) =>
  cn(
    'min-w-0 [container-type:inline-size]',
    viewport === 'phone' && 'max-w-[390px]'
  )

const useCanvasActions = ({
  isDefault,
  reset,
  href,
  label,
}: {
  isDefault: boolean
  reset: () => void
  href: string
  label: string
}) => {
  const { t } = useLingui()
  return {
    reset: (
      <Button disabled={isDefault} size="compact" tone="quiet" onClick={reset}>
        {t`Reset ${label}`}
      </Button>
    ),
    link: (
      <Link href={href} treatment="standalone">
        {t`Open this state`}
      </Link>
    ),
  }
}

const CurrentRebalancesDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const location = useLocation()
  const specimen = useDocumentationSpecimenState(
    'tables-current',
    CURRENT_SCHEMA
  )
  const params = new URLSearchParams(location.search)
  const legacyState = params.get('current')
  const resolvedState = params.has('tables-current.state')
    ? specimen.state.state
    : legacyState && Object.hasOwn(TABLE_SCENARIOS, legacyState)
      ? (legacyState as TableScenario)
      : specimen.state.state
  const rows = currentTableRows(resolvedState, 'launcher', 'ready', true)
  const hrefFor = useCallback(
    (row: TableRow) =>
      `/internal/design-system/components/table?current=${resolvedState}&rebalance-preview=${row.previewId}#auctions-current-table-review`,
    [resolvedState]
  )
  const actions = useCanvasActions({
    isDefault: specimen.isDefault && resolvedState === 'ready',
    reset: specimen.reset,
    href: `${specimen.href.split('#')[0]}#tables-current-rebalances`,
    label: t`current table`,
  })

  return (
    <TableSection
      id="tables-current-rebalances"
      title={t`Current rebalances`}
      description={t`Actionable rebalance records use the accepted current-table owner; the ready launcher state is the canonical default.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        controls={{
          state: (
            <ChoiceSelect
              label={t`Current rebalance state`}
              value={resolvedState}
              choices={Object.keys(TABLE_SCENARIOS).map((value) => {
                const scenario = value as TableScenario
                return {
                  value,
                  label: t(CURRENT_STATE_LABELS[scenario]),
                }
              })}
              onChange={(value) =>
                specimen.setValue('state', value as TableScenario)
              }
            />
          ),
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) =>
                specimen.setValue(
                  'viewport',
                  value as (typeof CURRENT_SCHEMA.viewport.values)[number]
                )
              }
            />
          ),
        }}
        {...actions}
        fallbacks={specimen.fallbacks}
        provenance={t`Accepted current rebalance table owner with frozen source-backed identities and illustrative state data.`}
      >
        <div
          data-testid="table-current-rebalances-canvas"
          data-resolved-state={resolvedState}
          className={specimenWidth(specimen.state.viewport)}
        >
          {rows.length ? (
            resolvedState === 'all' ? (
              <div className="space-y-6">
                {rows.map((row) => (
                  <CurrentRebalancesTable
                    key={row.previewId}
                    rows={[row]}
                    hrefFor={hrefFor}
                  />
                ))}
              </div>
            ) : (
              <CurrentRebalancesTable rows={rows} hrefFor={hrefFor} />
            )
          ) : (
            <p className="bg-card p-6 text-sm text-muted-foreground">
              {resolvedState === 'loading'
                ? t`Current rebalances are loading.`
                : t`No current rebalances found.`}
            </p>
          )}
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

const HistoricalRebalancesDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const specimen = useDocumentationSpecimenState(
    'tables-history',
    HISTORY_SCHEMA
  )
  const state = specimen.state.state
  const rows = historicalRebalances(state === 'loading' ? 'default' : state)
  const actions = useCanvasActions({
    isDefault: specimen.isDefault,
    reset: specimen.reset,
    href: `${specimen.href.split('#')[0]}#tables-historical-rebalances`,
    label: t`history table`,
  })

  return (
    <TableSection
      id="tables-historical-rebalances"
      title={t`Historical rebalances`}
      description={t`Completed and expired outcomes remain a static record family, independent from the actionable current table.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        controls={{
          state: (
            <ChoiceSelect
              label={t`Historical rebalance state`}
              value={state}
              choices={HISTORY_SCHEMA.state.values.map((value) => ({
                value,
                label: t(HISTORY_STATE_LABELS[value]),
              }))}
              onChange={(value) =>
                specimen.setValue(
                  'state',
                  value as (typeof HISTORY_SCHEMA.state.values)[number]
                )
              }
            />
          ),
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) =>
                specimen.setValue(
                  'viewport',
                  value as (typeof HISTORY_SCHEMA.viewport.values)[number]
                )
              }
            />
          ),
        }}
        {...actions}
        fallbacks={specimen.fallbacks}
        provenance={t`Accepted historical rebalance owner. Metrics are illustrative frozen fixtures; provenance links remain record-owned.`}
      >
        <div className={specimenWidth(specimen.state.viewport)}>
          <HistoricalRebalancesTable
            rows={rows}
            loading={state === 'loading'}
          />
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

const PortfolioDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const specimen = useDocumentationSpecimenState(
    'tables-portfolio',
    PORTFOLIO_SCHEMA
  )
  const [withdrawalStates, setWithdrawalStates] = useState<
    Record<string, WithdrawalPreview>
  >({})
  const [source, setSource] = useState<string>()
  const family = specimen.state.family
  const actions = useCanvasActions({
    isDefault: specimen.isDefault,
    reset: specimen.reset,
    href: `${specimen.href.split('#')[0]}#tables-portfolio`,
    label: t`portfolio tables`,
  })

  return (
    <TableSection
      id="tables-portfolio"
      title={t`Portfolio positions and withdrawals`}
      description={t`Portfolio records keep positions and pending withdrawals together while retaining their distinct actions and eligibility rules.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        controls={{
          family: (
            <ChoiceSelect
              label={t`Portfolio family`}
              value={family}
              choices={[
                { value: 'index', label: t`Index DTFs` },
                { value: 'yield', label: t`Yield DTFs` },
              ]}
              onChange={(value) =>
                specimen.setValue(
                  'family',
                  value as (typeof PORTFOLIO_SCHEMA.family.values)[number]
                )
              }
            />
          ),
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) =>
                specimen.setValue(
                  'viewport',
                  value as (typeof PORTFOLIO_SCHEMA.viewport.values)[number]
                )
              }
            />
          ),
        }}
        {...actions}
        fallbacks={specimen.fallbacks}
        provenance={t`Accepted Portfolio position and withdrawal owners. Values are frozen fixtures; actions only change local documentation state.`}
      >
        <div
          className={cn(
            specimenWidth(specimen.state.viewport),
            'grid gap-0.5 bg-secondary'
          )}
        >
          <Positions
            rows={family === 'yield' ? YIELD_POSITIONS : POSITIONS}
            family={family}
          />
          <Withdrawals
            rows={WITHDRAWALS}
            loading={false}
            states={withdrawalStates}
            onWithdraw={(row) =>
              setWithdrawalStates((previous) => ({
                ...previous,
                [row.id]: 'processing',
              }))
            }
            onSource={(row) => setSource(row.sourceLabel)}
          />
          {source ? (
            <p role="status" className="bg-card px-6 py-3 text-sm">
              <Trans>
                Source selected: {source}. Product details remain outside this
                specimen.
              </Trans>
            </p>
          ) : null}
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

const HoldingsDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const specimen = useDocumentationSpecimenState(
    'tables-holdings',
    HOLDINGS_SCHEMA
  )
  const panelId = useId()
  const family = specimen.state.family as HoldingsTab
  const actions = useCanvasActions({
    isDefault: specimen.isDefault,
    reset: specimen.reset,
    href: `${specimen.href.split('#')[0]}#tables-holdings`,
    label: t`holdings table`,
  })

  return (
    <TableSection
      id="tables-holdings"
      title={t`Holdings`}
      description={t`Exposure and collateral projections share the accepted holdings owner while preserving their distinct meanings.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        controls={{
          family: (
            <ChoiceSelect
              label={t`Holdings family`}
              value={family}
              choices={[
                { value: 'exposure', label: t`Exposure` },
                { value: 'collateral', label: t`Collateral` },
              ]}
              onChange={(value) =>
                specimen.setValue(
                  'family',
                  value as (typeof HOLDINGS_SCHEMA.family.values)[number]
                )
              }
            />
          ),
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) =>
                specimen.setValue(
                  'viewport',
                  value as (typeof HOLDINGS_SCHEMA.viewport.values)[number]
                )
              }
            />
          ),
        }}
        {...actions}
        fallbacks={specimen.fallbacks}
        provenance={t`Accepted holdings table owner using the CMC20 snapshot. Bridge details stay product-owned and are not recreated here.`}
      >
        <div className={cn(specimenWidth(specimen.state.viewport), 'bg-card')}>
          <Tabs
            value={family}
            onValueChange={(value) =>
              specimen.setValue(
                'family',
                value as (typeof HOLDINGS_SCHEMA.family.values)[number]
              )
            }
          >
            <TabsContent value={family} id={panelId}>
              <HoldingsTable
                rows={previewHoldings(HOLDINGS.cmc20, 'default')}
                tab={family}
                state="default"
                onBridge={() => undefined}
                panelId={panelId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

const DiscoverDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const specimen = useDocumentationSpecimenState(
    'tables-discover',
    DISCOVER_SCHEMA
  )
  const actions = useCanvasActions({
    isDefault: specimen.isDefault,
    reset: specimen.reset,
    href: `${specimen.href.split('#')[0]}#tables-discover`,
    label: t`Discover table`,
  })

  return (
    <TableSection
      id="tables-discover"
      title={t`Discover`}
      description={t`Browsing rows combine identity, classification, basket context, market values, and compact performance without becoming a universal row.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        controls={{
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) =>
                specimen.setValue(
                  'viewport',
                  value as (typeof DISCOVER_SCHEMA.viewport.values)[number]
                )
              }
            />
          ),
        }}
        {...actions}
        fallbacks={specimen.fallbacks}
        provenance={t`Accepted Discover table owner with five active DTFs from a recorded snapshot.`}
      >
        <div className={specimenWidth(specimen.state.viewport)}>
          <DiscoverTable rows={previewDiscover('default')} loading={false} />
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

const EarnDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const specimen = useDocumentationSpecimenState('tables-earn', EARN_SCHEMA)
  const [selected, setSelected] = useState<string>()
  const family = specimen.state.family
  const actions = useCanvasActions({
    isDefault: specimen.isDefault,
    reset: specimen.reset,
    href: `${specimen.href.split('#')[0]}#tables-earn`,
    label: t`earn table`,
  })

  return (
    <TableSection
      id="tables-earn"
      title={t`Earn, DeFi, and owned positions`}
      description={t`Opportunity browsing and wallet-owned records share foundations, not a single table or row API.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        controls={{
          family: (
            <ChoiceSelect
              label={t`Earn record family`}
              value={family}
              choices={[
                { value: 'index', label: t`Index governance` },
                { value: 'yield', label: t`Yield staking` },
                { value: 'defi', label: t`DeFi yield` },
                { value: 'owned-lock', label: t`Owned vote locks` },
                { value: 'owned-stake', label: t`Owned stakes` },
              ]}
              onChange={(value) => {
                setSelected(undefined)
                specimen.setValue(
                  'family',
                  value as (typeof EARN_SCHEMA.family.values)[number]
                )
              }}
            />
          ),
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) =>
                specimen.setValue(
                  'viewport',
                  value as (typeof EARN_SCHEMA.viewport.values)[number]
                )
              }
            />
          ),
        }}
        {...actions}
        fallbacks={specimen.fallbacks}
        provenance={t`Accepted Earn, DeFi Yield, and owned-position owners. Rates and wallet values are illustrative; no transactions are submitted.`}
      >
        <div className={cn(specimenWidth(specimen.state.viewport), 'bg-card')}>
          {family === 'defi' ? (
            <DefiTable state="default" />
          ) : family === 'owned-lock' || family === 'owned-stake' ? (
            <OwnedTable
              family={family === 'owned-lock' ? 'lock' : 'stake'}
              rows={previewOwned(
                family === 'owned-lock' ? 'lock' : 'stake',
                'default'
              )}
              onModify={(row) => setSelected(row.name)}
            />
          ) : (
            <EarnTable
              rows={previewEarn(family, 'default')}
              state="default"
              family={family}
              wallet={false}
              onOpen={(row) => setSelected(row.name)}
              onHelp={() => setSelected(t`Rate guidance`)}
            />
          )}
          {selected ? (
            <p
              role="status"
              className="border-t border-border px-6 py-3 text-sm"
            >
              <Trans>
                {selected} selected. Product transaction details remain outside
                this specimen.
              </Trans>
            </p>
          ) : null}
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

const GovernanceDocumentation = () => {
  const { t } = useLingui()
  const canvasHost = useCanvasHost()
  const groups = [
    [t`Current and actionable`, CURRENT_PROPOSAL_FIXTURES],
    [t`Historical and closed`, HISTORICAL_PROPOSAL_FIXTURES],
  ] as const

  return (
    <TableSection
      id="tables-governance"
      title={t`Governance records`}
      description={t`Governance records retain their own lifecycle, evidence, and current-versus-closed grouping.`}
    >
      <DocumentationSpecimenCanvas
        host={canvasHost}
        provenance={t`Accepted governance proposal record owner with standard, optimistic, contested, actionable, and closed fixtures.`}
      >
        <div className="grid min-w-[18rem] gap-8 p-0.5 xl:grid-cols-2">
          {groups.map(([title, records]) => (
            <section key={title} className="min-w-0 space-y-2">
              <h4 className="px-4 pt-4 text-sm font-medium">{title}</h4>
              <div className="space-y-px bg-secondary">
                {records.map((record) => (
                  <div key={record.state} className="bg-card">
                    <GovernanceProposalRecord record={record} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DocumentationSpecimenCanvas>
    </TableSection>
  )
}

export const DocumentationPatternTables = () => (
  <div className="space-y-16" data-testid="documentation-pattern-tables">
    <CurrentRebalancesDocumentation />
    <HistoricalRebalancesDocumentation />
    <PortfolioDocumentation />
    <HoldingsDocumentation />
    <DiscoverDocumentation />
    <EarnDocumentation />
    <GovernanceDocumentation />
  </div>
)

export default DocumentationPatternTables
