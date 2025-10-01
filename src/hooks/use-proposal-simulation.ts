import { SimulationConfig } from '@/types'
import { useCallback, useMemo, useState } from 'react'
import { TenderlyPayload, TenderlySimulation } from 'types'
import { Address } from 'viem'
import { useBlock, useReadContract } from 'wagmi'

import ERC20 from '@/abis/ERC20'
import Governance from 'abis/dtf-index-governance'
import {
  BLOCK_GAS_LIMIT,
  DEFAULT_FROM,
  TENDERLY_ACCESS_TOKEN,
  TENDERLY_SHARE_URL,
  TENDERLY_SIM_URL,
} from 'utils/constants'
import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  pad,
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

// ERC-7201 namespaced storage locations for OpenZeppelin v5.0.0
const GOVERNOR_STORAGE_LOCATION = '0x7c712897014dbe49c045ef1299aa2d5f9e67e48eea4403efa21f1e0f3ac0cb00'
const GOVERNOR_COUNTING_STORAGE_LOCATION = '0xa1cefa0f43667ef127a258e673c94202a79b656e62899531c4376d87a7f39800'
const GOVERNOR_TIMELOCK_STORAGE_LOCATION = '0x0d5829787b8befdbc6044ef7457d8a95c2a04bc99235349f1a212c063e59d400'
const TIMELOCK_STORAGE_LOCATION = '0x9a37c2aa9d186a0969ff8a8267bf4e07e864c2f2768f5040949e28a624fb3600'

/**
 * Calculate storage slot for Timelock's _timestamps mapping
 * Location: TimelockControllerStorageLocation + 0 (first field in struct)
 */
const getTimelockTimestampSlot = (operationId: bigint): `0x${string}` => {
  const baseSlot = BigInt(TIMELOCK_STORAGE_LOCATION) + 0n // offset 0
  return keccak256(encodeAbiParameters(
    parseAbiParameters('bytes32, uint256'),
    [toHex(operationId, { size: 32 }), baseSlot]
  ))
}

/**
 * Calculate storage slot for Governor's _proposals mapping
 * Location: GovernorStorageLocation + 1 (second field, after _name)
 */
const getProposalBaseSlot = (proposalId: bigint): `0x${string}` => {
  const baseSlot = BigInt(GOVERNOR_STORAGE_LOCATION) + 1n // offset 1
  return keccak256(encodeAbiParameters(
    parseAbiParameters('uint256, uint256'),
    [proposalId, baseSlot]
  ))
}

/**
 * Calculate storage slot for Governor's _proposalVotes mapping
 * Location: GovernorCountingSimpleStorageLocation + 0 (first field)
 */
const getProposalVotesBaseSlot = (proposalId: bigint): `0x${string}` => {
  const baseSlot = BigInt(GOVERNOR_COUNTING_STORAGE_LOCATION) + 0n // offset 0
  return keccak256(encodeAbiParameters(
    parseAbiParameters('uint256, uint256'),
    [proposalId, baseSlot]
  ))
}

/**
 * Calculate storage slot for Governor's _timelockIds mapping
 * Location: GovernorTimelockControlStorageLocation + 1 (second field, after _timelock)
 */
const getTimelockIdSlot = (proposalId: bigint): `0x${string}` => {
  const baseSlot = BigInt(GOVERNOR_TIMELOCK_STORAGE_LOCATION) + 1n // offset 1
  return keccak256(encodeAbiParameters(
    parseAbiParameters('uint256, uint256'),
    [proposalId, baseSlot]
  ))
}

/**
 * Pack ProposalCore struct into 2 storage slots
 *
 * Struct layout (38 bytes total):
 * - address proposer (20 bytes)
 * - uint48 voteStart (6 bytes)
 * - uint32 voteDuration (4 bytes)
 * - bool executed (1 byte)
 * - bool canceled (1 byte)
 * - uint48 etaSeconds (6 bytes)
 *
 * Storage layout:
 * Slot 0: proposer(160 bits) | voteStart(48 bits) | voteDuration(32 bits) | executed(1 bit) | canceled(1 bit)
 * Slot 1: etaSeconds(48 bits)
 */
const packProposalCore = (
  proposer: Address,
  voteStart: bigint,
  voteDuration: bigint,
  executed: boolean,
  canceled: boolean,
  etaSeconds: bigint
): { slot0: `0x${string}`; slot1: `0x${string}` } => {
  // Slot 0: Pack all fields except etaSeconds
  const slot0 =
    (BigInt(proposer) & ((1n << 160n) - 1n)) | // proposer at bits 0-159
    ((voteStart & ((1n << 48n) - 1n)) << 160n) | // voteStart at bits 160-207
    ((voteDuration & ((1n << 32n) - 1n)) << 208n) | // voteDuration at bits 208-239
    ((executed ? 1n : 0n) << 240n) | // executed at bit 240
    ((canceled ? 1n : 0n) << 241n) // canceled at bit 241

  // Slot 1: etaSeconds only
  const slot1 = etaSeconds & ((1n << 48n) - 1n)

  return {
    slot0: pad(toHex(slot0), { size: 32 }),
    slot1: pad(toHex(slot1), { size: 32 }),
  }
}

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

  // Index DTF governance uses XOR of governor address and description hash as the salt
  // This matches the logic in the governance contract and cancel button
  const governorBytes32 = pad(governorAddress, { size: 32, dir: 'right' })
  const governorBuffer = Buffer.from(governorBytes32.slice(2), 'hex')
  const descHashBuffer = Buffer.from(descriptionHash.slice(2), 'hex')

  const saltBuffer = Buffer.alloc(32)
  for (let i = 0; i < 32; i++) {
    saltBuffer[i] = governorBuffer[i] ^ descHashBuffer[i]
  }
  const timelockSalt = `0x${saltBuffer.toString('hex')}` as Address

  const timelockOperationId = BigInt(
    keccak256(
      encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
        [
          targets,
          values,
          calldatas,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          timelockSalt,
        ]
      )
    )
  )

  // Manual ERC-7201 storage slot calculation (Tenderly encoding API doesn't support this)
  const voteStartTime = simTimestamp - 200n
  const voteDuration = 100n

  // Calculate all required storage slots
  const timelockTimestampSlot = getTimelockTimestampSlot(timelockOperationId)
  const proposalBaseSlot = getProposalBaseSlot(proposalId)
  const proposalVotesBaseSlot = getProposalVotesBaseSlot(proposalId)
  const timelockIdSlot = getTimelockIdSlot(proposalId)

  // Pack ProposalCore struct
  const proposalCore = packProposalCore(
    '0x0000000000000000000000000000000000000000', // proposer (unused in simulation)
    voteStartTime,
    voteDuration,
    false, // executed
    false, // canceled
    0n // etaSeconds (unused)
  )

  // Build storage overrides for both contracts
  const timelockStorage: Record<string, `0x${string}`> = {
    // _timestamps[operationId] = simTimestamp
    [timelockTimestampSlot]: pad(toHex(simTimestamp), { size: 32 }),
  }

  const governorStorage: Record<string, `0x${string}`> = {
    // ProposalCore struct (2 slots)
    [proposalBaseSlot]: proposalCore.slot0,
    [toHex(BigInt(proposalBaseSlot) + 1n)]: proposalCore.slot1,

    // ProposalVote struct (3 slots: againstVotes, forVotes, abstainVotes)
    [proposalVotesBaseSlot]: pad(toHex(0n), { size: 32 }), // againstVotes
    [toHex(BigInt(proposalVotesBaseSlot) + 1n)]: pad(toHex(voteTokenSupply), { size: 32 }), // forVotes
    [toHex(BigInt(proposalVotesBaseSlot) + 2n)]: pad(toHex(0n), { size: 32 }), // abstainVotes

    // _timelockIds[proposalId] = operationId
    [timelockIdSlot]: pad(toHex(timelockOperationId, { size: 32 }), { size: 32 }),
  }

  console.log('🔍 Calculated storage slots:', {
    timelockTimestampSlot,
    proposalBaseSlot,
    proposalVotesBaseSlot,
    timelockIdSlot,
    proposalCore,
  })

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
      // Use manually calculated ERC-7201 storage slots
      [timelockAddress]: {
        storage: timelockStorage,
      },
      [governorAddress]: {
        storage: governorStorage,
      },
    },
  }

  console.log('📤 Simulation payload with manual storage:', {
    timelockStorage,
    governorStorage,
  })
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
