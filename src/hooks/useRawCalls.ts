import { atom, useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { callsAtom, multicallStateAtom } from 'state/atoms'
import { Falsy, MulticallState, RawCall, RawCallResult } from 'types'
import { addressEqual } from 'utils'

function extractCallResult(
  state: MulticallState,
  call: RawCall
): RawCallResult {
  return state?.[call.address]?.[call.data]
}

const setCallsAtom = atom(null, (get, set, calls: any) => {
  set(callsAtom, [...get(callsAtom), ...calls])
})

const removeCallsAtom = atom(null, (get, set, calls: any) => {
  let finalState = get(callsAtom)
  for (const call of calls) {
    const index = finalState.findIndex(
      (x) => addressEqual(x.address, call.address) && x.data === call.data
    )
    if (index !== -1) {
      finalState = finalState.filter((_, i) => i !== index)
    }
  }
  set(callsAtom, finalState)
})

// Ported from https://github.com/TrueFiEng/useDApp/blob/master/packages/core/src/hooks/useRawCalls.ts
/**
 * A low-level function that makes multiple calls to specific methods of specific contracts and returns values or error if present.
 * The hook will cause the component to refresh when values change.
 */
export function useRawCalls(calls: (RawCall | Falsy)[]): RawCallResult[] {
  const setCalls = useUpdateAtom(setCallsAtom)
  const removeCalls = useUpdateAtom(removeCallsAtom)
  const multicallState = useAtomValue(multicallStateAtom)
  const callsString = JSON.stringify(calls)

  useEffect(() => {
    const filteredCalls = calls.filter(Boolean) as RawCall[]
    setCalls(filteredCalls)
    return () => {
      removeCalls(filteredCalls)
    }
  }, [callsString, setCalls])

  // TODO: Multichain support
  return useMemo(
    () =>
      calls.map((call) =>
        call ? extractCallResult(multicallState, call) : undefined
      ),
    [callsString, multicallState]
  )
}

/**
 * A low-level function that makes a call to a specific method of a specific contract and returns the value or error if present.
 * The hook will cause the component to refresh whenever a new block is mined and the value is changed.
 *
 * Calls will be combined into a single multicall across all uses of useChainCall, useChainCalls, useRawCall and useRawCalls.
 * It is recommended to use useCall where applicable instead of this method.
 */
export function useRawCall(call: RawCall | Falsy) {
  return useRawCalls([call])[0]
}
