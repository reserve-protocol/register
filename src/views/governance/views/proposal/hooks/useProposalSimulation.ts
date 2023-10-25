import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, rTokenStateAtom } from 'state/atoms'
import {
  ProposalEvent,
  SimulationConfig,
  StorageEncodingResponse,
  TenderlyPayload,
  TenderlySimulation,
} from 'types'
import { useCallback } from 'react'
import useProposalTx from './useProposalTx'
import { usePublicClient } from 'wagmi'
import { getContract } from 'wagmi/actions'

import {
  keccak256,
  stringToBytes,
  encodeAbiParameters,
  parseAbiParameters,
  toHex,
  encodeFunctionData,
  parseEther,
} from 'viem'
import Governance from 'abis/Governance'
import {
  BLOCK_GAS_LIMIT,
  TENDERLY_ACCESS_TOKEN,
  TENDERLY_ENCODE_URL,
  TENDERLY_SHARE_URL,
  TENDERLY_SIM_URL,
} from 'utils/constants'

const DEFAULT_FROM = '0xD73a92Be73EfbFcF3854433A5FcbAbF9c1316073' // arbitrary EOA not used on-chain

const getFetchOptions = (payload: TenderlyPayload) => {
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
  votingTokenSupply: any, // specify the correct type
  governance: any, // specify the correct type
  client: any // specify the correct type
): Promise<any> => {
  // --- Validate config ---
  const { targets, values, calldatas, description } = config

  // --- Get details about the proposal we're simulating ---

  const blockNumberToUse = Number((await client.getBlock()).number) - 20 // ensure tenderly has the block

  const latestBlock = await client.getBlock({
    blockNumber: BigInt(blockNumberToUse),
  })
  const governor = getContract({
    address: governance.governor!,
    abi: Governance,
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

  const startBlock = BigInt(blockNumberToUse - 100) // arbitrarily subtract 100
  const proposal: ProposalEvent = {
    id: proposalId, // Bravo governor
    proposalId, // OZ governor (for simplicity we just include both ID formats)
    proposer: DEFAULT_FROM,
    startBlock,
    endBlock: startBlock + 1n,
    description,
    targets,
    values: values.map((_) => BigInt(0)),
    calldatas,
  }

  // Set `from` arbitrarily.
  const from = DEFAULT_FROM

  // Run simulation at the block right after the proposal ends.
  const simBlock = proposal.endBlock! + 100n

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
    [`${proposalCoreKey}.voteEnd._deadline`]: (simBlock - 1n).toString(),
    [`${proposalCoreKey}.voteStart._deadline`]: (simBlock - 1n).toString(),
    [`${proposalCoreKey}.canceled`]: 'false',
    [`${proposalCoreKey}.executed`]: 'false',
    [`${proposalVotesKey}.forVotes`]: parseEther(
      votingTokenSupply.toString()
    ).toString(),
    [`${proposalVotesKey}.againstVotes`]: '0',
    [`${proposalVotesKey}.abstainVotes`]: '0',
  }

  const stateOverrides = {
    networkID: '1',
    stateOverrides: {
      [timelockAddr]: {
        value: timelockStorageObj,
      },
      [governor.address]: {
        value: governorStateOverrides,
      },
    },
  }

  const storageObj = await sendEncodeRequest(stateOverrides)
  const executeInputs: [
    readonly `0x${string}`[],
    readonly bigint[],
    readonly `0x${string}`[],
    `0x${string}`
  ] = [targets, values, calldatas, descriptionHash]
  const simulationPayload: TenderlyPayload = {
    network_id: '1',
    // this field represents the block state to simulate against, so we use the latest block number
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
    value: '0', // TODO Support sending ETH in local simulations like we do below in `simulateProposed`.
    save_if_fails: true, // Set to true to save the simulation to your Tenderly dashboard if it fails.
    save: true, // Set to true to save the simulation to your Tenderly dashboard if it succeeds.
    generate_access_list: true, // not required, but useful as a sanity check to ensure consistency in the simulation response
    block_header: {
      // this data represents what block.number and block.timestamp should return in the EVM during the simulation
      number: toHex(simBlock),
      timestamp: toHex(simTimestamp),
    },
    state_objects: {
      // Since gas price is zero, the sender needs no balance.
      // TODO Support sending ETH in local simulations like we do below in `simulateProposed`.
      [from]: { balance: '0' },
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
    await fetch(
      TENDERLY_SHARE_URL(sim?.simulation?.id),
      getFetchOptions({} as TenderlyPayload)
    )
  }
  const sharedSimulationUrl = `https://dashboard.tenderly.co/shared/simulation/${sim?.simulation.id}`

  console.log({ sharedSimulationUrl })
  return { sim, sharedSimulationUrl }
}

/**
 * @notice Encode state overrides
 * @param payload State overrides to send
 */
async function sendEncodeRequest(
  payload: any
): Promise<StorageEncodingResponse> {
  try {
    const response: any = await fetch(
      TENDERLY_ENCODE_URL,
      getFetchOptions(payload)
    )

    return response.json() as StorageEncodingResponse
  } catch (err) {
    console.log('logging sendEncodeRequest error')
    console.log(JSON.stringify(err, null, 2))
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
async function sendSimulation(
  payload: TenderlyPayload,
  delay = 1000
): Promise<TenderlySimulation> {
  try {
    // Send simulation request
    const sim: any = await fetch(TENDERLY_SIM_URL, getFetchOptions(payload))
    return await sim.json()
  } catch (err: any) {
    console.log('err in sendSimulation: ', JSON.stringify(err))
    const is429 = typeof err === 'object' && err?.statusCode === 429
    if (delay > 8000 || !is429) {
      console.warn(
        `Simulation request failed with the below request payload and error`
      )
      throw err
    }
    console.warn(err)
    console.warn(
      `Simulation request failed with the above error, retrying in ~${delay} milliseconds. See request payload below`
    )
    await sleep(delay + 500)
    return await sendSimulation(payload, delay * 2)
  }
}

const useProposalSimulation = () => {
  // Call your hooks here
  const { stTokenSupply: votingTokenSupply } = useAtomValue(rTokenStateAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const client = usePublicClient()
  const tx = useProposalTx() // Call your hook here at the top level

  const config = {
    governorAddress: tx?.address!,
    targets: tx?.args[0]!,
    values: tx?.args[1]!,
    calldatas: tx?.args[2]!,
    description: tx?.args[3]!,
  }

  const simulateNewFunction = useCallback(
    async () => {
      // Pass the hook values to simulateNew
      await simulateNew(config, votingTokenSupply, governance, client)
    },
    [votingTokenSupply, governance, client] // add dependencies here
  )

  return {
    simulateNew: simulateNewFunction,
  }
}

export default useProposalSimulation
