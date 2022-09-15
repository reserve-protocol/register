import { Contract } from '@ethersproject/contracts'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { extractCallResult } from 'hooks/useRawCalls'
import { ContractCall, MulticallState, RawCall } from 'types'
import { MULTICALL_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

const ABI = [
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public view returns (tuple(bool success, bytes returnData)[])',
]

/**
 * Multicall2
 */
async function multicall(
  provider: Provider,
  multicallAddress: string,
  requests: RawCall[]
): Promise<MulticallState> {
  if (requests.length === 0) {
    return {}
  }
  const contract = new Contract(multicallAddress, ABI, provider)
  const blockNumber = await provider.getBlockNumber()
  try {
    const results: [boolean, string][] = await contract.tryAggregate(
      false,
      requests.map(({ address, data }) => [address, data]),
      { blockTag: blockNumber }
    )
    const state: MulticallState = {}
    for (let i = 0; i < requests.length; i++) {
      const { address, data } = requests[i]
      const [success, value] = results[i]
      const stateForAddress = state[address] ?? {}
      stateForAddress[data] = { success, value }
      state[address] = stateForAddress
    }
    return state
  } catch (e) {
    console.error('error fetching results', e)
  }

  return {}
}

// Don't expecting failure calls
export const promiseMulticall = async (
  calls: ContractCall[],
  provider: Web3Provider
): Promise<any[]> => {
  const rawCalls = calls.map((call) => ({
    address: call.address,
    data: call.abi.encodeFunctionData(call.method, call.args),
  }))

  const state = await multicall(provider, MULTICALL_ADDRESS[CHAIN_ID], rawCalls)

  return rawCalls.map((call, i) => {
    const result = extractCallResult(state, call)

    if (!result || !result.success) {
      throw new Error('Error running multicall')
    }

    const decodedResult = calls[i].abi.decodeFunctionResult(
      calls[i].method,
      result.value
    )

    return decodedResult.length === 1 ? decodedResult[0] : decodedResult
  })
}

export default multicall
