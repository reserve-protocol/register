import { useEffect, useReducer } from 'react'
import { initialWorkspace, workspaceReducer } from './model'
import type { Outcome, Scenario, SourceRecord } from './fixtures'

export function useWorkspace(
  record: SourceRecord,
  scenario: Scenario,
  _outcome: Outcome,
  playing: boolean
) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, () =>
    initialWorkspace(record, scenario)
  )
  useEffect(() => {
    const selected = state.outcome
    const event =
      state.operation === 'wallet'
        ? { type: 'wallet-result' as const, rejected: selected === 'reject' }
        : state.operation === 'pending'
          ? { type: 'receipt' as const, reverted: selected === 'revert' }
          : state.operation === 'indexing' && selected !== 'indexing'
            ? { type: 'indexed' as const, duration: record.duration }
            : null
    if (!event) return
    const timer = window.setTimeout(() => dispatch(event), 1200)
    return () => window.clearTimeout(timer)
  }, [state.operation, record.duration, state.outcome])
  useEffect(() => {
    if (!playing || state.archived) return
    const timer = window.setInterval(
      () =>
        dispatch({
          type: 'advance',
          seconds: 1,
          expires: record.identity.availableUntil,
        }),
      1000
    )
    return () => window.clearInterval(timer)
  }, [playing, record.identity.availableUntil, state.archived])
  return { state, dispatch }
}
