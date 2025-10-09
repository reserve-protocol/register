/**
 * @fileoverview Index DTF Proposal Simulation using Tenderly API
 *
 * This hook enables simulation of governance proposals before execution using Tenderly's
 * transaction simulation service. Due to OpenZeppelin v5.0's ERC-7201 namespaced storage,
 * we manually calculate storage slots instead of using Tenderly's encoding API.
 *
 * @llm-context ERC-7201 Storage Layout
 * OpenZeppelin v5.0 uses ERC-7201 namespaced storage to prevent collisions in upgradeable contracts.
 * Storage locations are computed as: keccak256(abi.encode(uint256(keccak256(namespace)) - 1)) & ~0xff
 * This means storage variables aren't at predictable slots - they're offset by namespace locations.
 *
 * @llm-context Simulation Flow
 * 1. Calculate proposal ID from (targets, values, calldatas, descriptionHash)
 * 2. Calculate timelock operation ID using XOR salt (governor ⊕ descriptionHash)
 * 3. Manually calculate ERC-7201 storage slots for all required state
 * 4. Pack ProposalCore struct into 2 slots using bitwise operations
 * 5. Send simulation request to Tenderly with manipulated storage
 * 6. Tenderly executes governor.execute() with pre-configured state
 *
 * @see https://eips.ethereum.org/EIPS/eip-7201 - ERC-7201 Namespaced Storage Layout
 */

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

// Maximum delay (in ms) before aborting exponential back-off for failed simulations
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
  new Promise((resolve) => setTimeout(resolve, delay))

/**
 * ERC-7201 Namespaced Storage Locations for OpenZeppelin v5.0.0
 *
 * These constants define the base storage locations for different contract facets.
 * Each location is calculated as: keccak256(abi.encode(uint256(keccak256(namespace)) - 1)) & ~0xff
 *
 * @llm-context Storage Namespace Structure
 * - GovernorStorage: Contains _name (string), _proposals (mapping), _governanceCall (deque)
 * - GovernorCountingSimpleStorage: Contains _proposalVotes (mapping)
 * - GovernorTimelockControlStorage: Contains _timelock (address), _timelockIds (mapping)
 * - TimelockControllerStorage: Contains _timestamps (mapping), _minDelay (uint256)
 */

// Base location for GovernorStorage (namespace: "openzeppelin.storage.Governor")
const GOVERNOR_STORAGE_LOCATION =
  '0x7c712897014dbe49c045ef1299aa2d5f9e67e48eea4403efa21f1e0f3ac0cb00'

// Base location for GovernorCountingSimpleStorage (namespace: "openzeppelin.storage.GovernorCountingSimple")
const GOVERNOR_COUNTING_STORAGE_LOCATION =
  '0xa1cefa0f43667ef127a258e673c94202a79b656e62899531c4376d87a7f39800'

// Base location for GovernorTimelockControlStorage (namespace: "openzeppelin.storage.GovernorTimelockControl")
const GOVERNOR_TIMELOCK_STORAGE_LOCATION =
  '0x0d5829787b8befdbc6044ef7457d8a95c2a04bc99235349f1a212c063e59d400'

// Base location for TimelockControllerStorage (namespace: "openzeppelin.storage.TimelockController")
const TIMELOCK_STORAGE_LOCATION =
  '0x9a37c2aa9d186a0969ff8a8267bf4e07e864c2f2768f5040949e28a624fb3600'

/**
 * Calculate storage slot for Timelock's _timestamps mapping
 *
 * @param operationId - The timelock operation ID (bytes32)
 * @returns Storage slot where the timestamp is stored
 *
 * @llm-context Mapping Storage Calculation
 * For mappings in Solidity: slot = keccak256(abi.encode(key, baseSlot))
 * The _timestamps mapping is at offset 0 in TimelockControllerStorage struct
 *
 * @example
 * // If operationId = 0x1234...
 * // baseSlot = TIMELOCK_STORAGE_LOCATION + 0
 * // slot = keccak256(encode(0x1234..., baseSlot))
 */
const getTimelockTimestampSlot = (operationId: bigint): `0x${string}` => {
  const baseSlot = BigInt(TIMELOCK_STORAGE_LOCATION) + 0n // offset 0: _timestamps is first field
  return keccak256(
    encodeAbiParameters(parseAbiParameters('bytes32, uint256'), [
      toHex(operationId, { size: 32 }),
      baseSlot,
    ])
  )
}

/**
 * Calculate storage slot for Governor's _proposals mapping
 *
 * @param proposalId - The proposal ID (uint256)
 * @returns Storage slot where ProposalCore struct begins (spans 2 slots)
 *
 * @llm-context Field Offset
 * The _proposals mapping is at offset 1 in GovernorStorage because:
 * - Offset 0: string _name (takes 1 slot)
 * - Offset 1: mapping _proposals ← we want this
 */
const getProposalBaseSlot = (proposalId: bigint): `0x${string}` => {
  const baseSlot = BigInt(GOVERNOR_STORAGE_LOCATION) + 1n // offset 1: after _name
  return keccak256(
    encodeAbiParameters(parseAbiParameters('uint256, uint256'), [
      proposalId,
      baseSlot,
    ])
  )
}

/**
 * Calculate storage slot for Governor's _proposalVotes mapping
 *
 * @param proposalId - The proposal ID (uint256)
 * @returns Storage slot where ProposalVote struct begins (spans 3+ slots)
 *
 * @llm-context
 * The _proposalVotes mapping is at offset 0 (first and only field) in GovernorCountingSimpleStorage
 */
const getProposalVotesBaseSlot = (proposalId: bigint): `0x${string}` => {
  const baseSlot = BigInt(GOVERNOR_COUNTING_STORAGE_LOCATION) + 0n // offset 0: first field
  return keccak256(
    encodeAbiParameters(parseAbiParameters('uint256, uint256'), [
      proposalId,
      baseSlot,
    ])
  )
}

/**
 * Calculate storage slot for Governor's _timelockIds mapping
 *
 * @param proposalId - The proposal ID (uint256)
 * @returns Storage slot where the timelock operation ID (bytes32) is stored
 *
 * @llm-context Field Offset
 * The _timelockIds mapping is at offset 1 in GovernorTimelockControlStorage because:
 * - Offset 0: TimelockControllerUpgradeable _timelock (address, 1 slot)
 * - Offset 1: mapping _timelockIds ← we want this
 */
const getTimelockIdSlot = (proposalId: bigint): `0x${string}` => {
  const baseSlot = BigInt(GOVERNOR_TIMELOCK_STORAGE_LOCATION) + 1n // offset 1: after _timelock
  return keccak256(
    encodeAbiParameters(parseAbiParameters('uint256, uint256'), [
      proposalId,
      baseSlot,
    ])
  )
}

/**
 * Pack ProposalCore struct into 2 storage slots using bitwise operations
 *
 * @param proposer - Proposal creator address (20 bytes)
 * @param voteStart - Voting start timestamp (48 bits)
 * @param voteDuration - Voting period duration (32 bits)
 * @param executed - Whether proposal was executed (1 bit)
 * @param canceled - Whether proposal was canceled (1 bit)
 * @param etaSeconds - Execution ETA timestamp (48 bits)
 * @returns Two 32-byte hex strings representing the packed storage slots
 *
 * @llm-context Solidity Struct Packing
 * Solidity packs struct fields tightly to save gas. Multiple small fields
 * can share a single 32-byte storage slot if their combined size <= 32 bytes.
 *
 * ProposalCore struct (38 bytes total, spans 2 slots):
 * ```
 * struct ProposalCore {
 *   address proposer;    // 20 bytes (160 bits)
 *   uint48 voteStart;    // 6 bytes  (48 bits)
 *   uint32 voteDuration; // 4 bytes  (32 bits)
 *   bool executed;       // 1 byte   (8 bits, but we use 1 bit)
 *   bool canceled;       // 1 byte   (8 bits, but we use 1 bit)
 *   uint48 etaSeconds;   // 6 bytes  (48 bits) → overflows to slot 1
 * }
 * ```
 *
 * Bit-level layout:
 * ```
 * Slot 0: [proposer:160][voteStart:48][voteDuration:32][executed:1][canceled:1][unused:14]
 *         └─bits 0-159─┘└─160-207─┘└───208-239────┘└───240──┘└───241──┘
 *
 * Slot 1: [etaSeconds:48][unused:208]
 *         └──bits 0-47──┘
 * ```
 *
 * @example
 * packProposalCore(
 *   "0x0000...0000",
 *   1234567890n,  // voteStart
 *   100n,         // voteDuration
 *   false,        // executed
 *   false,        // canceled
 *   0n            // etaSeconds
 * )
 * // Returns: { slot0: "0x...", slot1: "0x..." }
 */
const packProposalCore = (
  proposer: Address,
  voteStart: bigint,
  voteDuration: bigint,
  executed: boolean,
  canceled: boolean,
  etaSeconds: bigint
): { slot0: `0x${string}`; slot1: `0x${string}` } => {
  // Slot 0: Pack proposer + voteStart + voteDuration + executed + canceled
  const slot0 =
    (BigInt(proposer) & ((1n << 160n) - 1n)) | // Mask to 160 bits, position at bits 0-159
    ((voteStart & ((1n << 48n) - 1n)) << 160n) | // Mask to 48 bits, shift to bits 160-207
    ((voteDuration & ((1n << 32n) - 1n)) << 208n) | // Mask to 32 bits, shift to bits 208-239
    ((executed ? 1n : 0n) << 240n) | // Boolean as 1 bit at position 240
    ((canceled ? 1n : 0n) << 241n) // Boolean as 1 bit at position 241

  // Slot 1: Only etaSeconds (remaining 6 bytes)
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

  /**
   * Manual ERC-7201 storage slot calculation
   *
   * We need to manually manipulate contract storage to simulate a proposal in "Queued" state.
   * This involves setting up:
   * 1. Timelock: Mark operation as ready (timestamp in the past)
   * 2. Governor: Create proposal in memory with:
   *    - voteStart/voteDuration set so voting period has passed
   *    - All votes counted as "for" (using total supply)
   *    - Link to timelock operation via _timelockIds mapping
   */
  const voteStartTime = simTimestamp - 200n // Voting started 200 seconds ago
  const voteDuration = 100n // 100 second voting period (already passed)

  // Calculate all required storage slots
  const timelockTimestampSlot = getTimelockTimestampSlot(timelockOperationId)
  const proposalBaseSlot = getProposalBaseSlot(proposalId)
  const proposalVotesBaseSlot = getProposalVotesBaseSlot(proposalId)
  const timelockIdSlot = getTimelockIdSlot(proposalId)

  // Pack ProposalCore struct into 2 slots
  const proposalCore = packProposalCore(
    '0x0000000000000000000000000000000000000000', // proposer (unused in simulation)
    voteStartTime,
    voteDuration,
    false, // executed = false (proposal not yet executed)
    false, // canceled = false (proposal not canceled)
    0n // etaSeconds (unused for now)
  )

  // Build storage overrides for Timelock contract
  const timelockStorage: Record<string, `0x${string}`> = {
    // Set _timestamps[operationId] = simTimestamp
    // This makes the operation "ready" since timestamp <= block.timestamp
    [timelockTimestampSlot]: pad(toHex(simTimestamp), { size: 32 }),
  }

  // Build storage overrides for Governor contract
  const governorStorage: Record<string, `0x${string}`> = {
    // ProposalCore struct (2 slots)
    [proposalBaseSlot]: proposalCore.slot0,
    [toHex(BigInt(proposalBaseSlot) + 1n)]: proposalCore.slot1,

    // ProposalVote struct (3 slots)
    [proposalVotesBaseSlot]: pad(toHex(0n), { size: 32 }), // againstVotes = 0
    [toHex(BigInt(proposalVotesBaseSlot) + 1n)]: pad(toHex(voteTokenSupply), { size: 32 }), // forVotes = total supply
    [toHex(BigInt(proposalVotesBaseSlot) + 2n)]: pad(toHex(0n), { size: 32 }), // abstainVotes = 0

    // Link proposal to timelock operation
    [timelockIdSlot]: pad(toHex(timelockOperationId, { size: 32 }), { size: 32 }),
  }

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

  const sim = await sendSimulation(simulationPayload)

  if (sim?.simulation?.id) {
    // Share simulation first
    await fetch(TENDERLY_SHARE_URL(sim?.simulation?.id), getFetchOptions({}))
    return sim
  } else {
    throw new Error('Failed to generate simulation')
  }
}

/**
 * Hook for simulating Index DTF governance proposals using Tenderly
 *
 * @param governorAddress - Address of the Governor contract (owner or trading governance)
 * @param timelockAddress - Address of the Timelock contract
 * @param voteTokenAddress - Address of the voting token (stToken)
 * @param chainId - Chain ID (8453 for Base, 1 for Ethereum)
 *
 * @returns Simulation state and control functions
 *
 * @example
 * ```ts
 * const { data, loading, error, isReady, handleSimulation, resetSimulation } = useProposalSimulation(
 *   governorAddr,
 *   timelockAddr,
 *   voteTokenAddr,
 *   8453
 * )
 *
 * // Trigger simulation
 * handleSimulation({
 *   targets: [dtfAddress],
 *   values: [0n],
 *   calldatas: ['0x...'],
 *   description: 'Test proposal'
 * })
 *
 * // Reset simulation state
 * resetSimulation()
 * ```
 */
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

  /**
   * Trigger a new proposal simulation
   */
  const handleSimulation = useCallback(
    async (config: SimulationConfig) => {
      // Dependencies not ready
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

  /**
   * Reset simulation state (useful when proposal is edited)
   */
  const resetSimulation = useCallback(() => {
    setSimState({
      data: undefined,
      loading: false,
      error: undefined,
    })
  }, [])

  return useMemo(
    () => ({
      ...simState,
      isReady: !!block?.number && !!voteTokenSupply,
      handleSimulation,
      resetSimulation,
    }),
    [handleSimulation, resetSimulation, simState, block?.number, voteTokenSupply]
  )
}

export default useProposalSimulation
