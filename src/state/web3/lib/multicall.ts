import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import { MulticallState, RawCall } from 'types'

const ABI = [
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public view returns (tuple(bool success, bytes returnData)[])',
]

/**
 * Multicall2
 */
async function multicall(
  provider: Provider,
  multicallAddress: string,
  blockNumber: number,
  requests: RawCall[]
): Promise<MulticallState> {
  if (requests.length === 0) {
    return {}
  }
  const contract = new Contract(multicallAddress, ABI, provider)
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

export default multicall
