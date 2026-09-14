import type { LifecycleStatusRole } from '@/components/lifecycle-status'
import { REBALANCE_IDENTITIES } from '../auctions-browse/fixtures'
import { timeRemaining } from '../auctions-current/model'
import {
  SOURCE_RECORDS,
  DATA_STATES,
  VIEWERS,
  type SourceRecord,
  type Viewer,
  type DataState,
} from '../auctions-current/fixtures'

export const TABLE_SCENARIOS = {
  all: 'All',
  ready: 'First auction · restricted',
  permissionless: 'First auction · permissionless',
  hybrid: 'Hybrid · weights required',
  live: 'Auction live · bids',
  'no-bids': 'Auction live · no bids',
  repeat: 'Next auction · prior run',
  indexing: 'Confirmed → indexing delayed',
  complete: 'Target reached · window open',
  multiple: 'Two current records',
  empty: 'No current rebalance',
  loading: 'Current records loading',
} as const
export type TableScenario = keyof typeof TABLE_SCENARIOS
export type TableRow = {
  previewId: string
  previewLabel: string
  record: SourceRecord
  scenario: TableScenario
  round: number | null
  status: string
  role: LifecycleStatusRole
  launchAccess: 'launcher' | 'anyone'
  instruction: string | null
  instructionPlacement: 'status' | 'auction' | 'detail'
  event: { label: string; value: string } | null
  expiry: string
}

export function currentTableRows(
  scenario: TableScenario,
  viewer: Viewer,
  data: DataState,
  network: boolean
): TableRow[] {
  if (scenario === 'all') return allStateRows()
  if (scenario === 'empty' || scenario === 'loading') return []
  if (scenario === 'multiple') {
    const extra = {
      ...SOURCE_RECORDS.cmc20,
      identity: {
        ...REBALANCE_IDENTITIES[1],
        availableUntil: SOURCE_RECORDS.cmc20.identity.availableUntil,
        restrictedUntil: SOURCE_RECORDS.cmc20.identity.restrictedUntil,
      },
    }
    return [
      projectRow(SOURCE_RECORDS.cmc20, 'live', viewer, data, network),
      projectRow(extra, 'ready', viewer, data, network),
    ]
  }
  return [
    projectRow(
      SOURCE_RECORDS[scenario === 'hybrid' ? 'lcap' : 'cmc20'],
      scenario,
      viewer,
      data,
      network
    ),
  ]
}

function projectRow(
  record: SourceRecord,
  scenario: TableScenario,
  viewer: Viewer,
  data: DataState,
  network: boolean
): TableRow {
  const live = scenario === 'live' || scenario === 'no-bids'
  const restricted = !live && scenario !== 'permissionless'
  const noCommunity =
    record.identity.restrictedUntil === record.identity.availableUntil
  const row: TableRow = {
    previewId: record.identity.id,
    previewLabel: TABLE_SCENARIOS[scenario],
    record,
    scenario,
    round: scenario === 'repeat' ? 2 : 1,
    status: 'Ready to start',
    role: 'actionable',
    launchAccess: restricted || noCommunity ? 'launcher' : 'anyone',
    instruction: null,
    instructionPlacement: 'detail',
    event:
      restricted && !noCommunity && viewer !== 'launcher'
        ? { label: 'Anyone can launch in', value: '1h 0m' }
        : { label: 'Duration', value: `${record.duration / 60} minutes` },
    expiry: timeRemaining(
      record.identity.availableUntil -
        record.identity.restrictedUntil +
        (restricted ? 3600 : -60)
    ),
  }
  if (data === 'auction-error') {
    return {
      ...row,
      round: null,
      status: 'Unavailable',
      role: 'waiting',
      instruction: DATA_STATES[data],
      instructionPlacement: 'status',
      event: null,
    }
  }
  if (scenario === 'indexing') {
    return {
      ...row,
      status: 'Launching...',
      role: 'processing',
      instruction:
        'Lab: launch confirmed; waiting for auction data. Launch remains disabled.',
      instructionPlacement: 'status',
      event: null,
    }
  }
  if (live) {
    return {
      ...row,
      status: 'Ongoing',
      role: 'active',
      instruction: `Bids · ${scenario === 'no-bids' ? 0 : 2}`,
      instructionPlacement: 'auction',
      event: { label: 'Ends in', value: '10m 0s' },
    }
  }
  if (data !== 'ready') {
    return {
      ...row,
      status: data === 'pending' ? 'Loading' : 'Unavailable',
      role: 'waiting',
      instruction: DATA_STATES[data],
      instructionPlacement: 'status',
    }
  }
  if (scenario === 'complete') {
    return {
      ...row,
      round: null,
      status: 'Completed',
      role: 'closed',
      instruction: 'Rebalance Finished',
      event: null,
    }
  }
  if (scenario === 'hybrid') {
    row.status = 'Confirm target weights'
    row.instruction = 'Manage Weights'
  } else row.instruction = `Start auction ${row.round}`
  if (viewer === 'visitor') row.instruction = 'Connect wallet'
  else if (!network)
    row.instruction = `Switch to ${record.chainId === 56 ? 'BNB Smart Chain' : 'Base'}`
  else if (restricted && viewer !== 'launcher') {
    row.instructionPlacement = scenario === 'hybrid' ? 'status' : 'detail'
    row.instruction = noCommunity
      ? 'Community launch is not available for this rebalance'
      : 'Only the auction launcher can start auctions'
  }
  return row
}

function allStateRows(): TableRow[] {
  const cases: {
    id: string
    label?: string
    scenario: TableScenario
    viewer?: Viewer
    data?: DataState
    network?: boolean
  }[] = [
    { id: 'ready', scenario: 'ready' },
    { id: 'permissionless', scenario: 'permissionless', viewer: 'member' },
    {
      id: 'restricted',
      label: VIEWERS.member,
      scenario: 'ready',
      viewer: 'member',
    },
    {
      id: 'visitor',
      label: VIEWERS.visitor,
      scenario: 'ready',
      viewer: 'visitor',
    },
    {
      id: 'network',
      label: 'Wrong network',
      scenario: 'ready',
      network: false,
    },
    { id: 'hybrid', scenario: 'hybrid' },
    {
      id: 'hybrid-restricted',
      label: `${TABLE_SCENARIOS.hybrid} · ${VIEWERS.member}`,
      scenario: 'hybrid',
      viewer: 'member',
    },
    { id: 'live', scenario: 'live' },
    { id: 'no-bids', scenario: 'no-bids' },
    { id: 'repeat', scenario: 'repeat' },
    { id: 'indexing', scenario: 'indexing' },
    ...(
      [
        'pending',
        'price-error',
        'auction-error',
        'metadata-error',
        'bounds',
        'error',
      ] as const
    ).map((data) => ({
      id: data,
      label: DATA_STATES[data],
      scenario: 'ready' as const,
      data,
    })),
    { id: 'complete', scenario: 'complete' },
  ]
  return cases.map(
    ({
      id,
      scenario,
      label = TABLE_SCENARIOS[scenario],
      viewer = 'launcher',
      data = 'ready',
      network = true,
    }) => ({
      ...projectRow(
        SOURCE_RECORDS[scenario === 'hybrid' ? 'lcap' : 'cmc20'],
        scenario,
        viewer,
        data,
        network
      ),
      previewId: `all-${id}`,
      previewLabel: label,
    })
  )
}
