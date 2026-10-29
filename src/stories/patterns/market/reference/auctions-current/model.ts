import {
  INITIAL_UNITS,
  type DataState,
  type Scenario,
  type SourceRecord,
  type Viewer,
  type Outcome,
} from './fixtures'

export type Operation =
  | 'idle'
  | 'wallet'
  | 'pending'
  | 'indexing'
  | 'rejected'
  | 'failed'
export interface WorkspaceState {
  now: number
  stage: 'preparing' | 'live' | 'finished'
  operation: Operation
  outcome: Outcome
  runs: number
  progress: number
  hasBids: boolean
  traded: bigint
  auctionStart: number
  auctionEnd: number
  weights: string[] | null
  limits: string[]
  editing: boolean
  draft: string[]
  draftLimits: string[]
  archived: boolean
  filler: 'running' | 'stopped' | 'error'
  orders: number
}
export type WorkspaceEvent =
  | {
      type: 'launch'
      viewer: Viewer
      network: boolean
      data: DataState
      record: SourceRecord
      outcome: Outcome
    }
  | { type: 'wallet-result'; rejected: boolean }
  | { type: 'receipt'; reverted: boolean }
  | { type: 'indexed'; duration: number }
  | { type: 'advance'; seconds: number; expires: number }
  | { type: 'edit' }
  | { type: 'units'; index: number; value: string }
  | { type: 'limit'; index: number; value: string }
  | { type: 'import'; units: string[] }
  | { type: 'save' }
  | { type: 'discard' }
  | { type: 'archive' }
  | { type: 'filler'; value: WorkspaceState['filler'] }
  | { type: 'filler-order' }
  | { type: 'bids' }
  | { type: 'complete' }

export function initialWorkspace(
  record: SourceRecord,
  scene: Scenario
): WorkspaceState {
  const phaseOffset = ['permissionless', 'live', 'no-bids', 'filler'].includes(
    scene
  )
    ? 60
    : -3600
  const finished = ['complete', 'expired', 'expired-complete'].includes(scene)
  const now = scene.startsWith('expired')
    ? record.identity.availableUntil + 1
    : record.identity.restrictedUntil + phaseOffset
  return {
    now,
    stage: finished
      ? 'finished'
      : ['live', 'no-bids', 'filler'].includes(scene)
        ? 'live'
        : 'preparing',
    operation: 'idle',
    outcome: 'success',
    runs: finished ? 3 : ['repeat', 'progressing'].includes(scene) ? 1 : 0,
    hasBids: ['live', 'filler'].includes(scene),
    traded: ['live', 'filler'].includes(scene)
      ? 123793332n
      : finished || ['repeat', 'progressing'].includes(scene)
        ? 8421000n
        : 0n,
    progress:
      scene === 'expired'
        ? 96.4
        : finished
          ? 100
          : ['repeat', 'progressing'].includes(scene)
            ? 62.8
            : ['live', 'filler'].includes(scene)
              ? 38.6
              : 0,
    auctionStart: now - (record.duration - 600),
    auctionEnd: now + 600,
    weights: null,
    limits: record.tokens.map(() => ''),
    editing: false,
    draft: [...INITIAL_UNITS],
    draftLimits: record.tokens.map(() => ''),
    archived: false,
    filler: 'running',
    orders: 0,
  }
}

export function mayLaunch(
  state: WorkspaceState,
  record: SourceRecord,
  viewer: Viewer,
  network: boolean,
  data: DataState
) {
  if (
    state.stage !== 'preparing' ||
    state.editing ||
    !['idle', 'rejected', 'failed'].includes(state.operation)
  )
    return false
  if (
    !network ||
    data !== 'ready' ||
    viewer === 'visitor' ||
    state.now >= record.identity.availableUntil
  )
    return false
  if (viewer !== 'launcher' && state.now < record.identity.restrictedUntil)
    return false
  return record.symbol !== 'LCAP' || state.runs > 0 || state.weights !== null
}

export function workspaceReducer(
  state: WorkspaceState,
  event: WorkspaceEvent
): WorkspaceState {
  switch (event.type) {
    case 'launch':
      return mayLaunch(
        state,
        event.record,
        event.viewer,
        event.network,
        event.data
      )
        ? { ...state, operation: 'wallet', outcome: event.outcome }
        : state
    case 'wallet-result':
      return state.operation === 'wallet'
        ? { ...state, operation: event.rejected ? 'rejected' : 'pending' }
        : state
    case 'receipt':
      return state.operation === 'pending'
        ? { ...state, operation: event.reverted ? 'failed' : 'indexing' }
        : state
    case 'indexed':
      return state.operation === 'indexing'
        ? {
            ...state,
            operation: 'idle',
            stage: state.stage === 'finished' ? 'finished' : 'live',
            hasBids: false,
            auctionStart: state.now,
            auctionEnd: state.now + event.duration,
          }
        : state
    case 'advance': {
      const now = state.now + event.seconds
      const expired = now >= event.expires
      const ended =
        state.stage === 'live' && (now >= state.auctionEnd || expired)
      const next: WorkspaceState = ended
        ? {
            ...state,
            now,
            stage: 'preparing',
            runs: state.runs + 1,
            progress: state.hasBids
              ? Math.max(state.progress, 62.8)
              : state.progress,
            filler: 'stopped',
          }
        : { ...state, now }
      return expired
        ? { ...next, stage: 'finished', editing: false, filler: 'stopped' }
        : next
    }
    case 'edit':
      return state.stage === 'preparing' &&
        state.runs === 0 &&
        ['idle', 'rejected', 'failed'].includes(state.operation)
        ? {
            ...state,
            editing: true,
            draft: [...(state.weights ?? INITIAL_UNITS)],
            draftLimits: [...state.limits],
          }
        : state
    case 'units':
      return state.editing
        ? {
            ...state,
            draft: state.draft.map((v, i) =>
              i === event.index ? event.value : v
            ),
          }
        : state
    case 'limit':
      return state.editing
        ? {
            ...state,
            draftLimits: state.draftLimits.map((v, i) =>
              i === event.index ? event.value : v
            ),
          }
        : state
    case 'import':
      return state.editing ? { ...state, draft: event.units } : state
    case 'save':
      return state.editing && validDraft(state)
        ? {
            ...state,
            editing: false,
            weights: [...state.draft],
            limits: [...state.draftLimits],
          }
        : state
    case 'discard':
      return { ...state, editing: false }
    case 'archive':
      return state.stage === 'finished' &&
        !['wallet', 'pending', 'indexing'].includes(state.operation)
        ? { ...state, archived: true }
        : state
    case 'filler':
      return { ...state, filler: event.value }
    case 'filler-order':
      return state.stage === 'live' && state.filler === 'running'
        ? { ...state, orders: state.orders + 1 }
        : state
    case 'bids':
      return state.stage === 'live' && !state.hasBids
        ? {
            ...state,
            now: Math.max(
              state.now,
              Math.floor((state.auctionStart + state.auctionEnd) / 2)
            ),
            hasBids: true,
            progress: Math.max(state.progress, 38.6),
            traded: state.traded + 123793332n,
          }
        : state
    case 'complete':
      return state.stage === 'live' && state.hasBids
        ? {
            ...state,
            stage: 'finished',
            progress: 100,
            runs: state.runs + 1,
            filler: 'stopped',
          }
        : state
  }
}

export function validDecimal(value: string) {
  return /^(?:0|[1-9]\d{0,17})(?:\.\d{1,18})?$/.test(value)
}
export function validDraft(
  state: Pick<WorkspaceState, 'draft' | 'draftLimits'>
) {
  return (
    state.draft.length > 0 &&
    state.draft.every(validDecimal) &&
    state.draft.some((value) => /[1-9]/.test(value)) &&
    state.draftLimits.every((v) => v === '' || validDecimal(v))
  )
}
export function timeRemaining(seconds: number) {
  const remaining = Math.max(0, Math.floor(seconds))
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  if (days) return `${days}d ${hours}h`
  if (hours) return `${hours}h ${minutes}m`
  return `${minutes}m ${remaining % 60}s`
}
