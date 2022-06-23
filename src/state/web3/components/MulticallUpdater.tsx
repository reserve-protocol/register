import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import useBlockNumber from 'hooks/useBlockNumber'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { callsAtom, multicallStateAtom } from 'state/atoms'
import { RawCall } from 'types'
import { addressEqual } from 'utils'
import { MULTICALL_ADDRESS } from 'utils/addresses'
import { CHAINS } from 'utils/chains'
import multicall from '../lib/multicall'

const latestFetchedBlockAtom = atom<{ [x: string]: number }>({})

export const updateMulticallStateAtom = atom(
  (get) => get(multicallStateAtom),
  async (get, set, props: [RawCall[], Web3Provider, number, number]) => {
    const [calls, provider, blockNumber, chainId] = props
    const result = await multicall(provider, MULTICALL_ADDRESS[chainId], calls)

    const latestBlock = get(latestFetchedBlockAtom)[chainId] || -1

    // avoid race conditions
    if (blockNumber >= latestBlock) {
      set(multicallStateAtom, result)
      set(latestFetchedBlockAtom, { [chainId]: blockNumber })
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
  const { provider, chainId } = useWeb3React()
  const calls = useDebounce(useAtomValue(callsAtom), 50)
  const blockNumber = useBlockNumber()
  const filteredCalls = useMemo(() => getUniqueCalls(calls), [calls])
  const performMulticall = useSetAtom(updateMulticallStateAtom)

  useEffect(() => {
    if (provider && blockNumber && calls.length && chainId && CHAINS[chainId]) {
      performMulticall([filteredCalls, provider, blockNumber, chainId])
    }
  }, [filteredCalls, blockNumber])

  return null
}

export default MulticallUpdater
