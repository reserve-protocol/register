import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import {
  callsAtom,
  multicallStateAtom,
} from 'state/providers/web3/components/MulticallUpdater'
import { Falsy, MulticallState, RawCall, RawCallResult } from 'types'
import { addressEqual } from 'utils'

function extractCallResult(
  state: MulticallState,
  call: RawCall
): RawCallResult {
  return state?.[call.address]?.[call.data]
}

// Ported from https://github.com/TrueFiEng/useDApp/blob/master/packages/core/src/hooks/useRawCalls.ts
/**
 * A low-level function that makes multiple calls to specific methods of specific contracts and returns values or error if present.
 * The hook will cause the component to refresh when values change.
 *
 * Calls will be combined into a single multicall across all uses of useChainCall, useChainCalls, useRawCall and useRawCalls.
 * It is recommended to use useCalls where applicable instead of this method.
 * @param calls List of calls, also see {@link ChainCall}. Calls need to be in the same order across component renders.
 * @returns
 */
export function useRawCalls(calls: (RawCall | Falsy)[]): RawCallResult[] {
  const [allCalls, setCalls] = useAtom(callsAtom)
  const multicallState = useAtomValue(multicallStateAtom)
  const callsString = JSON.stringify(calls)

  useEffect(() => {
    const filteredCalls = calls.filter(Boolean) as RawCall[]

    setCalls([...allCalls, ...filteredCalls])
    return () => {
      let finalState = allCalls
      for (const call of filteredCalls) {
        const index = finalState.findIndex(
          (x) => addressEqual(x.address, call.address) && x.data === call.data
        )
        if (index !== -1) {
          finalState = finalState.filter((_, i) => i !== index)
        }
      }
      setCalls(finalState)
    }
  }, [callsString])

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
 *
 * @param call a single call, also see {@link RawCall}.
 *             A call can be Falsy, as it is important to keep the same ordering of hooks even if in a given render cycle
 *             and there might be not enough information to perform a call.
 * @returns result of multicall call.
 */
export function useRawCall(call: RawCall | Falsy) {
  return useRawCalls([call])[0]
}
