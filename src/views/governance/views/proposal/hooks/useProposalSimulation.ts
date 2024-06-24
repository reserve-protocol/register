import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { rTokenAtom, rTokenGovernanceAtom, rTokenStateAtom } from 'state/atoms'
import {
  SimulationConfig,
  StorageEncodingResponse,
  TenderlyPayload,
  TenderlySimulation,
} from 'types'
import { PublicClient, usePublicClient } from 'wagmi'
import { getContract } from 'wagmi/actions'
import useProposalTx from './useProposalTx'

import Governance from 'abis/Governance'
import {
  BLOCK_GAS_LIMIT,
  DEFAULT_FROM,
  TENDERLY_ACCESS_TOKEN,
  TENDERLY_ENCODE_URL,
  TENDERLY_SHARE_URL,
  TENDERLY_SIM_URL,
} from 'utils/constants'
import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  parseAbiParameters,
  parseEther,
  stringToBytes,
  toHex,
} from 'viem'
import { simulationStateAtom } from '../../proposal-detail/atom'
import { isTimeunitGovernance } from 'views/governance/utils'

/**
 * @notice Encode state overrides
 * @param payload State overrides to send
 */
const sendEncodeRequest = async (
  payload: any
): Promise<StorageEncodingResponse> => {
  try {
    const response: any = await fetch(
      TENDERLY_ENCODE_URL,
      getFetchOptions(payload)
    )

    return response.json() as StorageEncodingResponse
  } catch (err) {
    console.log('sendEncodeRequest error:', JSON.stringify(err, null, 2))
    console.log(JSON.stringify(payload))
    throw err
  }
}

/**
 * @notice Sends a transaction simulation request to the Tenderly API
 * @dev Uses a simple exponential backoff when requests fail, with the following parameters:
 *   - Initial delay is 1 second
 *   - We randomize the delay duration to avoid synchronization issues if client is sending multiple requests simultaneously
 *   - We double delay each time and throw an error if delay is over 8 seconds
 * @param payload Transaction simulation parameters
 * @param delay How long to wait until next simulation request after failure, in milliseconds
 */
const sendSimulation = async (
  payload: TenderlyPayload,
  delay = 1000
): Promise<TenderlySimulation> => {
  try {
    // Send simulation request
    const sim: any = await fetch(TENDERLY_SIM_URL, getFetchOptions(payload))
    return await sim.json()
  } catch (err) {
    console.log('err in sendSimulation: ', JSON.stringify(err))
    console.warn(
      `Simulation request failed with the above error, retrying in ~${delay} milliseconds. See request payload below`
    )
    await sleep(delay + 500)
    return await sendSimulation(payload, delay * 2)
  }
}

const getFetchOptions = (payload: any) => {
  const TENDERLY_FETCH_OPTIONS = {
    headers: {
      'X-Access-Key': TENDERLY_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  }
  return {
    method: 'POST',
    body: JSON.stringify(payload),
    ...TENDERLY_FETCH_OPTIONS,
  }
}

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay)) // delay in milliseconds

const simulateNew = async (
  config: SimulationConfig,
  votingTokenSupply: number,
  governance: any,
  client: PublicClient,
  isTimeUnitGovernance: boolean
): Promise<TenderlySimulation> => {
  const { targets, values, calldatas, description } = config

  const blockNumberToUse = Number((await client.getBlock()).number) - 20 // ensure tenderly has the block

  const latestBlock = await client.getBlock({
    blockNumber: BigInt(blockNumberToUse),
  })
  const governor = getContract({
    address: governance.governor!,
    abi: Governance,
    chainId: client.chain.id,
  })

  const timelockAddr = await governor.read.timelock()
  const descriptionHash = keccak256(stringToBytes(description))

  const proposalId = BigInt(
    keccak256(
      encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32'),
        [targets, values, calldatas, descriptionHash]
      )
    )
  )

  const simTimestamp = latestBlock.timestamp + 1n

  // Generate the state object needed to mark the transactions as queued in the Timelock's storage
  const timelockStorageObj: Record<string, string> = {}

  const id = BigInt(
    keccak256(
      encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
        [
          targets,
          values,
          calldatas,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          descriptionHash,
        ]
      )
    )
  )

  timelockStorageObj[`_timestamps[${toHex(id, { size: 32 })}]`] =
    simTimestamp.toString()

  // Use the Tenderly API to get the encoded state overrides for governor storage
  let governorStateOverrides: Record<string, string> = {}

  const proposalCoreKey = `_proposals[${proposalId.toString()}]`
  const proposalVotesKey = `_proposalVotes[${proposalId.toString()}]`
  governorStateOverrides = {
    ...(isTimeUnitGovernance
      ? {
          [`${proposalCoreKey}.voteEnd`]: (simTimestamp - 100n).toString(),
          [`${proposalCoreKey}.voteStart`]: (simTimestamp - 100n).toString(),
        }
      : {
          [`${proposalCoreKey}.voteEnd._deadline`]: (
            BigInt(blockNumberToUse) - 1n
          ).toString(),
          [`${proposalCoreKey}.voteStart._deadline`]: (
            BigInt(blockNumberToUse) - 1n
          ).toString(),
        }),
    [`${proposalCoreKey}.executed`]: 'false',
    [`${proposalCoreKey}.canceled`]: 'false',
    [`${proposalVotesKey}.forVotes`]: parseEther(
      votingTokenSupply.toString()
    ).toString(),
    [`${proposalVotesKey}.againstVotes`]: '0',
    [`${proposalVotesKey}.abstainVotes`]: '0',
  }

  const stateOverrides = {
    networkID: client.chain.id.toString(),
    stateOverrides: {
      [timelockAddr]: {
        value: timelockStorageObj,
      },
      [governor.address]: {
        value: governorStateOverrides,
      },
    },
    blockNumber: Number(latestBlock.number),
  }

  const storageObj = await sendEncodeRequest(stateOverrides)

  const executeInputs: [
    readonly `0x${string}`[],
    readonly bigint[],
    readonly `0x${string}`[],
    `0x${string}`
  ] = [targets, values, calldatas, descriptionHash]
  const simulationPayload: TenderlyPayload = {
    network_id: client.chain.id,
    block_number: Number(latestBlock.number),
    from: DEFAULT_FROM,
    to: governor.address,
    input: encodeFunctionData({
      abi: Governance,
      functionName: 'execute',
      args: executeInputs,
    }),
    gas: BLOCK_GAS_LIMIT,
    gas_price: '0',
    value: '0',
    save_if_fails: true,
    save: true,
    generate_access_list: true,
    block_header: {
      number: toHex(blockNumberToUse),
      timestamp: toHex(simTimestamp),
    },
    state_objects: {
      [DEFAULT_FROM]: { balance: '0' },
      // Ensure transactions are queued in the timelock
      [timelockAddr]: {
        storage: storageObj.stateOverrides[timelockAddr.toLowerCase()].value,
      },
      // Ensure governor storage is properly configured so `state(proposalId)` returns `Queued`
      [governor.address]: {
        storage:
          storageObj.stateOverrides[governor.address.toLowerCase()].value,
      },
    },
  }
  const sim = await sendSimulation(simulationPayload)
  if (sim?.simulation?.id) {
    // Share simulation first
    await fetch(TENDERLY_SHARE_URL(sim?.simulation?.id), getFetchOptions({}))
    return sim
  } else {
    throw new Error('Failed to generate simulation')
  }
}

const useProposalSimulation = () => {
  const rToken = useAtomValue(rTokenAtom)
  const { stTokenSupply: votingTokenSupply } = useAtomValue(rTokenStateAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const [simState, setSimState] = useAtom(simulationStateAtom)
  const client = usePublicClient({ chainId: rToken?.chainId })
  const isTimeUnitGovernance = isTimeunitGovernance(governance.name)
  const tx = useProposalTx()

  const [targets, values, calldatas, description] = tx?.args!

  const config: SimulationConfig = {
    targets,
    values,
    calldatas,
    description,
  }

  const handleSimulation = useCallback(async () => {
    setSimState((prev) => ({ ...prev, loading: true }))
    try {
      const result = await simulateNew(
        config,
        votingTokenSupply,
        governance,
        client,
        isTimeUnitGovernance
      )
      setSimState({ data: result, loading: false, error: null })
    } catch (err: any) {
      setSimState({ data: null, loading: false, error: err })
    }
  }, [config, votingTokenSupply, governance, client])

  return {
    sim: simState.data,
    isLoading: simState.loading,
    error: simState.error,
    handleSimulation,
  }
}

export default useProposalSimulation
