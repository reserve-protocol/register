import { proposedRolesAtom } from './../atoms'
import { useAtomValue } from 'jotai'
import {
  rTokenGovernanceAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from 'state/atoms'
import {
  ProposalEvent,
  RoleKey,
  SimulationConfig,
  StorageEncodingResponse,
  TenderlyPayload,
  TenderlySimulation,
} from 'types'
import { useEffect, useMemo } from 'react'
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
  trim,
} from 'viem'
import useRToken from 'hooks/useRToken'
import Governance from 'abis/Governance'
import {
  BLOCK_GAS_LIMIT,
  TENDERLY_ACCESS_TOKEN,
  TENDERLY_SIM_URL,
} from 'utils/constants'

const DEFAULT_FROM = '0xD73a92Be73EfbFcF3854433A5FcbAbF9c1316073' // arbitrary EOA not used on-chain
const TENDERLY_FETCH_OPTIONS = {
  type: 'json',
  headers: { 'X-Access-Key': TENDERLY_ACCESS_TOKEN },
}

const simulateNew = async (config: SimulationConfig): Promise<any> => {
  // --- Validate config ---
  const {
    governorAddress,
    targets,
    values,
    signatures,
    calldatas,
    description,
  } = config

  const rToken = useRToken()
  const { stTokenSupply: votingTokenSupply } = useAtomValue(rTokenStateAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const client = usePublicClient()

  if (targets.length !== values.length)
    throw new Error('targets and values must be the same length')
  if (targets.length !== signatures.length)
    throw new Error('targets and signatures must be the same length')
  if (targets.length !== calldatas.length)
    throw new Error('targets and calldatas must be the same length')

  // --- Get details about the proposal we're simulating ---

  const blockNumberToUse = Number((await client.getBlock()).timestamp) - 3 // subtracting a few blocks to ensure tenderly has the block
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
    signatures,
    calldatas,
  }

  // Set `from` arbitrarily.
  const from = DEFAULT_FROM

  // Run simulation at the block right after the proposal ends.
  const simBlock = proposal.endBlock! + 100n

  const simTimestamp = latestBlock.timestamp + 1n
  const eta = simTimestamp // set proposal eta to be equal to the timestamp we simulate at

  // Generate the state object needed to mark the transactions as queued in the Timelock's storage
  const timelockStorageObj: Record<string, string> = {}

  timelockStorageObj[`_timestamps[${proposalId.toString()}]`] =
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
    [`${proposalVotesKey}.forVotes`]: votingTokenSupply.toString(),
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

  // --- Simulate it ---
  // We need the following state conditions to be true to successfully simulate a proposal:
  //   - proposalCount >= proposal.id
  //   - proposal.canceled == false
  //   - proposal.executed == false
  //   - block.number > proposal.endBlock
  //   - proposal.forVotes > proposal.againstVotes
  //   - proposal.forVotes > quorumVotes
  //   - proposal.eta !== 0
  //   - block.timestamp >= proposal.eta
  //   - block.timestamp <  proposal.eta + timelock.GRACE_PERIOD()
  //   - queuedTransactions[txHash] = true for each action in the proposal
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
      number: trim(toHex(simBlock)),
      timestamp: trim(toHex(simTimestamp)),
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
  writeFileSync('new-response.json', JSON.stringify(sim, null, 2))
  return { sim, proposal, latestBlock }
}

const useProposalSimulation = () => {
  const tx = useProposalTx()

  useEffect(() => {}, [tx])
}

/**
 * @notice Encode state overrides
 * @param payload State overrides to send
 */
async function sendEncodeRequest(
  payload: any
): Promise<StorageEncodingResponse> {
  try {
    const fetchOptions = {
      method: 'POST',
      data: payload,
      ...TENDERLY_FETCH_OPTIONS,
    }
    const response = await fetchUrl(TENDERLY_ENCODE_URL, fetchOptions)

    for (const [key, value] of Object.entries(payload.stateOverrides)) {
      console.log({ key, value })
    }
    console.log({ response })

    return response as StorageEncodingResponse
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
  const fetchOptions = {
    method: 'POST',
    data: payload,
    ...TENDERLY_FETCH_OPTIONS,
  }
  try {
    // Send simulation request
    const sim = <TenderlySimulation>(
      (<unknown>await fetch(TENDERLY_SIM_URL, fetchOptions))
    )
    // Post-processing to ensure addresses we use are checksummed (since ethers returns checksummed addresses)
    sim.transaction.addresses = sim.transaction.addresses.map(getAddress)
    sim.contracts.forEach(
      (contract) => (contract.address = getAddress(contract.address))
    )
    return sim
  } catch (err: any) {
    console.log('err in sendSimulation: ', JSON.stringify(err))
    const is429 = typeof err === 'object' && err?.statusCode === 429
    if (delay > 8000 || !is429) {
      console.warn(
        `Simulation request failed with the below request payload and error`
      )
      console.log(JSON.stringify(fetchOptions))
      throw err
    }
    console.warn(err)
    console.warn(
      `Simulation request failed with the above error, retrying in ~${delay} milliseconds. See request payload below`
    )
    console.log(JSON.stringify(payload))
    await sleep(delay + randomInt(0, 1000))
    return await sendSimulation(payload, delay * 2)
  }
}

export default useProposalSimulation
