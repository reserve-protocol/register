import { useWeb3React } from '@web3-react/core'
import { MULTICALL_ADDRESS } from 'constants/addresses'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { callsAtom, multicallStateAtom } from 'state/atoms'
import { MulticallState, RawCall } from 'types'
import { addressEqual } from 'utils'
import { CHAIN_ID } from 'utils/chains'
import multicall from '../lib/multicall'

const latestFetchedBlockAtom = atom(0)

export const updateMulticallStateAtom = atom(
  (get) => get(multicallStateAtom),
  async (get, set, props) => {
    // TODO: Types
    const [calls, provider, blockNumber] = props as any
    const result = await multicall(
      provider,
      MULTICALL_ADDRESS[CHAIN_ID],
      blockNumber,
      calls
    )

    // avoid race conditions
    if (blockNumber > get(latestFetchedBlockAtom)) {
      set(multicallStateAtom, result)
      set(latestFetchedBlockAtom, blockNumber)
    }
  }
)

function getUniqueCalls(requests: RawCall[]) {
  const unique: RawCall[] = []
  for (const request of requests) {
    if (
      !unique.find(
        (x) =>
          addressEqual(x.address, request.address) && x.data === request.data
      )
    ) {
      unique.push(request)
    }
  }
  return unique
}

const MulticallUpdater = () => {
  const { provider } = useWeb3React()
  const calls = useDebounce(useAtomValue(callsAtom), 50)
  const blockNumber = useBlockNumber()
  const filteredCalls = useMemo(() => getUniqueCalls(calls), [calls])
  const performMulticall = useSetAtom(updateMulticallStateAtom)

  useEffect(() => {
    if (provider && blockNumber && calls.length) {
      performMulticall([filteredCalls, provider, blockNumber])
    }
  }, [JSON.stringify(filteredCalls), provider, blockNumber])

  return null
}

export default MulticallUpdater
