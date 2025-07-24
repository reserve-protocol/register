import { SimulationConfig } from '@/types'
import { useCallback, useMemo, useState } from 'react'
import {
  StorageEncodingResponse,
  TenderlyPayload,
  TenderlySimulation,
} from 'types'
import { Address } from 'viem'
import { useBlock, useReadContract } from 'wagmi'

import ERC20 from '@/abis/ERC20'
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
  stringToBytes,
  toHex,
} from 'viem'

// Maximum delay (in ms) before aborting the exponential back-off
const MAX_BACKOFF_DELAY = 8_000

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
    // Stop trying after the maximum delay threshold is reached
    if (delay > MAX_BACKOFF_DELAY) {
      throw err
    }
    console.warn(
      `Simulation request failed with the above error, retrying in ~${delay} milliseconds. See request payload below`
    )
    // Add a small jitter to avoid thundering-herd
    const jitter = Math.floor(Math.random() * 500)
    await sleep(delay + jitter)
    return await sendSimulation(payload, delay * 2)
  }
}

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay)) // delay in milliseconds

const simulateNew = async (
  config: SimulationConfig,
  voteTokenSupply: bigint,
  chainId: number,
  blockNumber: number,
  blockTimestamp: bigint,
  governorAddress: Address,
  timelockAddress: Address
): Promise<TenderlySimulation> => {
  const { targets, values, calldatas, description } = config

  const blockNumberToUse = blockNumber - 20 // ensure tenderly has the block
  const descriptionHash = keccak256(stringToBytes(description))

  const proposalId = BigInt(
    keccak256(
      encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32'),
        [targets, values, calldatas, descriptionHash]
      )
    )
  )

  const simTimestamp = blockTimestamp + 1n

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
    [`${proposalCoreKey}.voteEnd`]: (simTimestamp - 100n).toString(),
    [`${proposalCoreKey}.voteStart`]: (simTimestamp - 100n).toString(),
    [`${proposalCoreKey}.executed`]: 'false',
    [`${proposalCoreKey}.canceled`]: 'false',
    [`${proposalVotesKey}.forVotes`]: voteTokenSupply.toString(),
    [`${proposalVotesKey}.againstVotes`]: '0',
    [`${proposalVotesKey}.abstainVotes`]: '0',
  }

  const stateOverrides = {
    networkID: chainId.toString(),
    stateOverrides: {
      [timelockAddress]: {
        value: timelockStorageObj,
      },
      [governorAddress]: {
        value: governorStateOverrides,
      },
    },
    blockNumber,
  }

  const storageObj = await sendEncodeRequest(stateOverrides)

  const executeInputs: [
    readonly `0x${string}`[],
    readonly bigint[],
    readonly `0x${string}`[],
    `0x${string}`,
  ] = [targets, values, calldatas, descriptionHash]

  const simulationPayload: TenderlyPayload = {
    network_id: chainId,
    block_number: blockNumber,
    from: DEFAULT_FROM,
    to: governorAddress,
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
      [timelockAddress]: {
        storage: storageObj.stateOverrides[timelockAddress.toLowerCase()].value,
      },
      // Ensure governor storage is properly configured so `state(proposalId)` returns `Queued`
      [governorAddress]: {
        storage: storageObj.stateOverrides[governorAddress.toLowerCase()].value,
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

const useProposalSimulation = (
  governorAddress: Address,
  timelockAddress: Address,
  voteTokenAddress: Address,
  chainId: number
) => {
  const { data: block } = useBlock({ chainId })
  const { data: voteTokenSupply } = useReadContract({
    address: voteTokenAddress,
    abi: ERC20,
    chainId,
    functionName: 'totalSupply',
  })
  const [simState, setSimState] = useState({
    data: undefined as TenderlySimulation | undefined,
    loading: false,
    error: undefined,
  })

  const handleSimulation = useCallback(
    async (config: SimulationConfig) => {
      // fn not ready
      if (!block?.number || !voteTokenSupply) {
        return
      }

      setSimState((prev) => ({ ...prev, loading: true }))
      try {
        const result = await simulateNew(
          config,
          voteTokenSupply,
          chainId,
          Number(block.number),
          block.timestamp,
          governorAddress,
          timelockAddress
        )
        setSimState({ data: result, loading: false, error: undefined })
      } catch (err: any) {
        setSimState({ data: undefined, loading: false, error: err })
      }
    },
    [
      governorAddress,
      voteTokenSupply,
      timelockAddress,
      block,
      setSimState,
      chainId,
    ]
  )

  return useMemo(
    () => ({
      ...simState,
      isReady: !!block?.number && !!voteTokenSupply,
      handleSimulation,
    }),
    [handleSimulation, simState, block?.number, voteTokenSupply]
  )
}

export default useProposalSimulation
