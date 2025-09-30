import { SimulationConfig } from '@/types'
import { useCallback, useMemo, useState } from 'react'
import {
  TenderlyPayload,
  TenderlySimulation,
} from 'types'
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

// Note: We no longer use Tenderly's encoding API for OZ v5.0.0 contracts
// because it doesn't support ERC-7201 namespaced storage.
// Instead, we calculate storage slots manually using the functions above.

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

// ERC-7201 namespaced storage locations for OZ v5.0.0
// TimelockController: keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.TimelockController")) - 1)) & ~bytes32(uint256(0xff))
const TIMELOCK_STORAGE_LOCATION = '0x9a37c2aa9d186a0969ff8a8267bf4e07e864c2f2768f5040949e28a624fb3600'

// Governor base storage (for _proposals mapping)
// openzeppelin.storage.Governor
const GOVERNOR_STORAGE_LOCATION = '0x7c712897014dbe49c045ef1299aa2d5f9e67e48eea4403efa21f1e0f3ac0cb00'

// GovernorCountingSimple storage (for _proposalVotes mapping)
// openzeppelin.storage.GovernorCountingSimple
const GOVERNOR_COUNTING_STORAGE_LOCATION = '0xa1cefa0f43667ef127a258e673c94202a79b656e62899531c4376d87a7f39800'

// GovernorTimelockControl storage (for _timelockIds mapping)
// openzeppelin.storage.GovernorTimelockControl
const GOVERNOR_TIMELOCK_STORAGE_LOCATION = '0x0d5829787b8befdbc6044ef7457d8a95c2a04bc99235349f1a212c063e59d400'

/**
 * Calculate storage slot for a mapping(bytes32 => uint256) at a namespaced location
 */
const getTimestampSlot = (id: `0x${string}`): `0x${string}` => {
  // _timestamps is at offset 0 in TimelockControllerStorage struct
  // Slot = keccak256(abi.encode(id, TIMELOCK_STORAGE_LOCATION + 0))
  const slot = keccak256(encodeAbiParameters(
    parseAbiParameters('bytes32, bytes32'),
    [id, TIMELOCK_STORAGE_LOCATION as `0x${string}`]
  ))
  return slot
}

/**
 * Calculate storage slot for Governor's _proposals mapping
 * mapping(uint256 => ProposalCore) _proposals
 */
const getProposalSlot = (proposalId: bigint): `0x${string}` => {
  // _proposals is at offset 0 in GovernorStorage struct
  const baseSlot = GOVERNOR_STORAGE_LOCATION
  const slot = keccak256(encodeAbiParameters(
    parseAbiParameters('uint256, bytes32'),
    [proposalId, baseSlot as `0x${string}`]
  ))
  return slot
}

/**
 * Calculate storage slot for Governor's _proposalVotes mapping
 * This is in the GovernorCountingSimple extension storage namespace
 */
const getProposalVotesSlot = (proposalId: bigint): `0x${string}` => {
  // _proposalVotes is at offset 0 in GovernorCountingSimpleStorage struct
  const baseSlot = GOVERNOR_COUNTING_STORAGE_LOCATION
  const slot = keccak256(encodeAbiParameters(
    parseAbiParameters('uint256, bytes32'),
    [proposalId, baseSlot as `0x${string}`]
  ))
  return slot
}

/**
 * Calculate storage slot for Governor's _timelockIds mapping
 * This is in the GovernorTimelockControl extension storage namespace
 */
const getTimelockIdsSlot = (proposalId: bigint): `0x${string}` => {
  // _timelockIds is at offset 0 in GovernorTimelockControlStorage struct
  const baseSlot = GOVERNOR_TIMELOCK_STORAGE_LOCATION
  const slot = keccak256(encodeAbiParameters(
    parseAbiParameters('uint256, bytes32'),
    [proposalId, baseSlot as `0x${string}`]
  ))
  return slot
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

  const timelockOperationId = keccak256(
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

  // Calculate the exact storage slot for _timestamps[timelockOperationId] using ERC-7201
  const timestampSlot = getTimestampSlot(timelockOperationId)

  // Set timelock timestamp to 1 day in the past to ensure execution delay has passed
  const timelockStorage: Record<string, string> = {
    [timestampSlot]: toHex(simTimestamp - 86400n, { size: 32 })
  }

  // Calculate exact storage slots for governor state using ERC-7201
  const proposalSlot = getProposalSlot(proposalId)
  const proposalVotesSlot = getProposalVotesSlot(proposalId)
  const timelockIdsSlot = getTimelockIdsSlot(proposalId)

  // OZ v5 ProposalCore struct layout (packed in ONE slot):
  // In Solidity storage, first field = LSB (rightmost), last field = MSB (leftmost)
  // struct ProposalCore {
  //   address proposer;      // bytes 0-19 (LSB/rightmost)
  //   uint48 voteStart;      // bytes 20-25
  //   uint32 voteDuration;   // bytes 26-29
  //   bool executed;         // byte 30
  //   bool canceled;         // byte 31 (MSB/leftmost)
  // }
  // Hex representation: 0x[canceled][executed][voteDuration][voteStart][proposer]

  const voteStartTime = simTimestamp - 200n
  const voteDuration = 100n

  // Pack all ProposalCore fields into a single 32-byte slot
  // Build from MSB to LSB (left to right in hex string)
  const proposerAddress = '0x0000000000000000000000000000000000000001' // dummy proposer
  const packedProposalCore =
    '00' +  // 1 byte canceled (false) - MSB/leftmost
    '00' +  // 1 byte executed (false)
    voteDuration.toString(16).padStart(8, '0') +    // 4 bytes voteDuration (uint32)
    voteStartTime.toString(16).padStart(12, '0') +  // 6 bytes voteStart (uint48)
    proposerAddress.slice(2).padStart(40, '0')      // 20 bytes proposer - LSB/rightmost

  // ProposalVotes struct layout:
  // struct ProposalVotes {
  //   uint256 againstVotes;  // slot+0
  //   uint256 forVotes;      // slot+1
  //   uint256 abstainVotes;  // slot+2
  // }
  const votesSlotBase = BigInt(proposalVotesSlot)

  const governorStorage: Record<string, string> = {
    // ProposalCore - all fields packed in one slot
    [proposalSlot]: `0x${packedProposalCore}`,

    // ProposalVotes - three separate uint256 slots (must be 32-byte hex strings)
    [toHex(votesSlotBase, { size: 32 })]: toHex(0n, { size: 32 }), // againstVotes
    [toHex(votesSlotBase + 1n, { size: 32 })]: toHex(voteTokenSupply, { size: 32 }), // forVotes
    [toHex(votesSlotBase + 2n, { size: 32 })]: toHex(0n, { size: 32 }), // abstainVotes

    // Link proposal to timelock operation
    [timelockIdsSlot]: timelockOperationId,
  }

  console.log('🔍 Storage calculation details:', {
    proposalId: proposalId.toString(),
    timelockOperationId,
    simTimestamp: simTimestamp.toString(),
    voteStartTime: voteStartTime.toString(),
    voteDuration: voteDuration.toString(),
  })

  console.log('🔍 Storage slots:', {
    timestampSlot,
    proposalSlot,
    proposalVotesSlot,
    timelockIdsSlot,
  })

  console.log('🔍 Storage values:', {
    timelockStorage,
    governorStorage,
  })

  console.log('🔍 Packed ProposalCore:', `0x${packedProposalCore}`)
  console.log('🔍 Decoded ProposalCore:', {
    canceled: packedProposalCore.slice(0, 2),
    executed: packedProposalCore.slice(2, 4),
    voteDuration: parseInt(packedProposalCore.slice(4, 12), 16),
    voteStart: parseInt(packedProposalCore.slice(12, 24), 16),
    proposer: '0x' + packedProposalCore.slice(24),
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
      // Use manually calculated storage slots (bypassing Tenderly's encoding API)
      [timelockAddress]: {
        storage: timelockStorage,
      },
      [governorAddress]: {
        storage: governorStorage,
      },
    },
  }
  console.log('📤 Simulation payload:', simulationPayload)
  const sim = await sendSimulation(simulationPayload)

  console.log('📥 Simulation response:', sim)

  // Check if simulation executed (even if the proposal call itself reverted)
  if (sim?.simulation?.id) {
    console.log('✅ Simulation created successfully!')
    console.log('Transaction status:', sim.transaction?.status)
    console.log('Error info:', sim.transaction?.error_info)

    if (!sim.transaction?.status && sim.transaction?.error_info) {
      console.warn('⚠️ Proposal call reverted (but simulation setup worked!):', {
        errorAddress: sim.transaction.error_info.address,
        errorMessage: sim.transaction.error_info.error_message,
      })
    }
  }

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
  console.log('ADASDASDASDASDASD', {
    governorAddress,
    timelockAddress,
    voteTokenAddress,
  })
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

      console.log('test', governorAddress, timelockAddress)

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
