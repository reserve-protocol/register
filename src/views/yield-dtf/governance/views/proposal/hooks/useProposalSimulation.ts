import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { chainIdAtom, rTokenGovernanceAtom, rTokenStateAtom } from 'state/atoms'
import {
  SimulationConfig,
  StorageEncodingResponse,
  TenderlyPayload,
  TenderlySimulation,
} from 'types'
import useProposalTx from './useProposalTx'

import Governance from 'abis/Governance'
import { wagmiConfig } from 'state/chain'
import { AvailableChain } from 'utils/chains'
import {
  BLOCK_GAS_LIMIT,
  DEFAULT_FROM,
  TENDERLY_ACCESS_TOKEN,
  TENDERLY_ENCODE_URL,
  TENDERLY_SHARE_URL,
  TENDERLY_SIM_URL,
} from 'utils/constants'
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  pad,
  parseAbiParameters,
  parseEther,
  stringToBytes,
  toHex,
} from 'viem'
import { useBlock } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { simulationStateAtom } from '../../proposal-detail/atom'

// Maximum delay (in ms) before aborting the exponential back-off
const MAX_BACKOFF_DELAY = 8_000

/**
 * @notice Encode state overrides via Tenderly API
 * @param payload State overrides to send
 */
const sendEncodeRequest = async (
  payload: any
): Promise<StorageEncodingResponse> => {
  const response: any = await fetch(
    TENDERLY_ENCODE_URL,
    getFetchOptions(payload)
  )

  if (!response.ok) {
    throw new Error(`Tenderly encode failed: ${response.status}`)
  }

  return response.json() as StorageEncodingResponse
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

// --- Tenderly encode API path (works for older OZ contracts) ---

const buildStorageViaEncodeApi = async (
  proposalId: bigint,
  timelockOperationId: bigint,
  simTimestamp: bigint,
  votingTokenSupply: number,
  governorAddress: Address,
  timelockAddr: Address,
  chainId: AvailableChain,
  blockNumber: number
): Promise<{
  governorStorage: Record<string, string>
  timelockStorage: Record<string, string>
}> => {
  const timelockStorageObj: Record<string, string> = {
    [`_timestamps[${toHex(timelockOperationId, { size: 32 })}]`]:
      simTimestamp.toString(),
  }

  const proposalCoreKey = `_proposals[${proposalId.toString()}]`
  const proposalVotesKey = `_proposalVotes[${proposalId.toString()}]`
  const voteTimestamp = (simTimestamp - 100n).toString()
  const governorStateOverrides: Record<string, string> = {
    [`${proposalCoreKey}.voteEnd`]: voteTimestamp,
    [`${proposalCoreKey}.voteStart`]: voteTimestamp,
    [`${proposalCoreKey}.proposedAt`]: voteTimestamp,
    [`${proposalCoreKey}.executed`]: 'false',
    [`${proposalCoreKey}.canceled`]: 'false',
    [`${proposalVotesKey}.forVotes`]: parseEther(
      votingTokenSupply.toString()
    ).toString(),
    [`${proposalVotesKey}.againstVotes`]: '0',
    [`${proposalVotesKey}.abstainVotes`]: '0',
  }

  const storageObj = await sendEncodeRequest({
    networkID: chainId.toString(),
    stateOverrides: {
      [timelockAddr]: { value: timelockStorageObj },
      [governorAddress]: { value: governorStateOverrides },
    },
    blockNumber,
  })

  return {
    governorStorage:
      storageObj.stateOverrides[governorAddress.toLowerCase()].value,
    timelockStorage:
      storageObj.stateOverrides[timelockAddr.toLowerCase()].value,
  }
}

// --- Manual storage slot path (for OZ v4.9.3 retyped struct) ---

// OZ v4.9.3 storage slot constants for Governor Anastasius
// Governor._proposals mapping is at slot 3 (after EIP712 fallbacks + _name)
const GOV_PROPOSALS_SLOT = 3n
// GovernorCountingSimple._proposalVotes mapping is at slot 9
const GOV_PROPOSAL_VOTES_SLOT = 9n
// GovernorTimelockControl._timelockIds mapping is at slot 13
const GOV_TIMELOCK_IDS_SLOT = 13n
// TimelockController._timestamps mapping is at slot 1 (after AccessControl._roles)
const TIMELOCK_TIMESTAMPS_SLOT = 1n

// OZ v4.9.3 ProposalCore struct layout (3 slots):
// Slot +0: [uint64 voteStart | address proposer | bytes4 __gap] = 32 bytes
// Slot +1: [uint64 voteEnd | bytes24 __gap] = 32 bytes
// Slot +2: [bool executed | bool canceled] = 2 bytes
const getMappingSlot = (
  key: bigint | `0x${string}`,
  mappingSlot: bigint,
  keyType: 'uint256' | 'bytes32' = 'uint256'
): `0x${string}` => {
  const keyValue =
    keyType === 'bytes32'
      ? typeof key === 'bigint'
        ? toHex(key, { size: 32 })
        : key
      : key

  return keccak256(
    encodeAbiParameters(parseAbiParameters(`${keyType}, uint256`), [
      keyValue as never,
      mappingSlot,
    ])
  )
}

const buildStorageViaManualSlots = (
  proposalId: bigint,
  timelockOperationId: `0x${string}`,
  simTimestamp: bigint,
  votingTokenSupply: number
): {
  governorStorage: Record<string, `0x${string}`>
  timelockStorage: Record<string, `0x${string}`>
} => {
  const voteStart = simTimestamp - 200n
  const voteEnd = simTimestamp - 100n

  // Governor storage: _proposals[proposalId] (3 slots)
  const proposalBase = getMappingSlot(proposalId, GOV_PROPOSALS_SLOT)
  const proposalSlot1 = toHex(BigInt(proposalBase) + 1n)
  const proposalSlot2 = toHex(BigInt(proposalBase) + 2n)

  // Governor storage: _proposalVotes[proposalId] (3 slots)
  const votesBase = getMappingSlot(proposalId, GOV_PROPOSAL_VOTES_SLOT)
  const votesSlot1 = toHex(BigInt(votesBase) + 1n)
  const votesSlot2 = toHex(BigInt(votesBase) + 2n)

  // Governor storage: _timelockIds[proposalId]
  const timelockIdSlot = getMappingSlot(proposalId, GOV_TIMELOCK_IDS_SLOT)

  // Timelock storage: _timestamps[operationId]
  const timelockTimestampSlot = getMappingSlot(
    timelockOperationId,
    TIMELOCK_TIMESTAMPS_SLOT,
    'bytes32'
  )

  return {
    governorStorage: {
      // ProposalCore slot 0: uint64 voteStart (low 8 bytes), rest 0
      [proposalBase]: pad(toHex(voteStart & ((1n << 64n) - 1n)), { size: 32 }),
      // ProposalCore slot 1: uint64 voteEnd (low 8 bytes)
      [proposalSlot1]: pad(toHex(voteEnd & ((1n << 64n) - 1n)), { size: 32 }),
      // ProposalCore slot 2: executed=false, canceled=false
      [proposalSlot2]: pad(toHex(0n), { size: 32 }),
      // ProposalVote: againstVotes, forVotes, abstainVotes
      [votesBase]: pad(toHex(0n), { size: 32 }),
      [votesSlot1]: pad(toHex(parseEther(votingTokenSupply.toString())), {
        size: 32,
      }),
      [votesSlot2]: pad(toHex(0n), { size: 32 }),
      // _timelockIds: link proposal to timelock operation
      [timelockIdSlot]: timelockOperationId,
    },
    timelockStorage: {
      // _timestamps[operationId] = simTimestamp (makes operation "ready")
      [timelockTimestampSlot]: pad(toHex(simTimestamp), { size: 32 }),
    },
  }
}

// --- Main simulation function ---

/**
 * Simulate a Yield DTF governance proposal.
 * Tries Tenderly's encode-states API first (works for older OZ contracts),
 * falls back to manual OZ v4.9.3 storage slot calculation if encode fails.
 */
const simulateProposal = async (
  config: SimulationConfig,
  votingTokenSupply: number,
  chainId: AvailableChain,
  blockNumber: number,
  blockTimestamp: bigint,
  governorAddress: Address
): Promise<TenderlySimulation> => {
  const { targets, values, calldatas, description } = config
  const blockNumberToUse = blockNumber - 20

  const timelockAddr = await readContract(wagmiConfig, {
    address: governorAddress,
    abi: Governance,
    chainId,
    functionName: 'timelock',
  })
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

  // Timelock operation ID: hashOperationBatch(targets, values, calldatas, 0, descriptionHash)
  const timelockOperationId = keccak256(
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

  // Try Tenderly encode API first, fall back to manual slots
  let storageOverrides: {
    governorStorage: Record<string, string>
    timelockStorage: Record<string, string>
  }

  try {
    storageOverrides = await buildStorageViaEncodeApi(
      proposalId,
      BigInt(timelockOperationId),
      simTimestamp,
      votingTokenSupply,
      governorAddress,
      timelockAddr,
      chainId,
      blockNumber
    )
  } catch (err) {
    console.warn('Tenderly encode API failed, using manual slots:', err)
    storageOverrides = buildStorageViaManualSlots(
      proposalId,
      timelockOperationId,
      simTimestamp,
      votingTokenSupply
    )
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
      [timelockAddr]: { storage: storageOverrides.timelockStorage },
      [governorAddress]: { storage: storageOverrides.governorStorage },
    },
  }

  const sim = await sendSimulation(simulationPayload)
  if (sim?.simulation?.id) {
    await fetch(TENDERLY_SHARE_URL(sim?.simulation?.id), getFetchOptions({}))
    return sim
  } else {
    throw new Error('Failed to generate simulation')
  }
}

const useProposalSimulation = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { data: block } = useBlock({ chainId })
  const { stTokenSupply: votingTokenSupply } = useAtomValue(rTokenStateAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const [simState, setSimState] = useAtom(simulationStateAtom)
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
      const result = await simulateProposal(
        config,
        votingTokenSupply,
        chainId,
        Number(block?.number ?? 0n),
        block?.timestamp ?? 0n,
        governance.governor as Address
      )
      setSimState({ data: result, loading: false, error: null })
    } catch (err: any) {
      setSimState({ data: null, loading: false, error: err })
    }
  }, [config, votingTokenSupply, governance])

  return {
    sim: simState.data,
    isLoading: simState.loading,
    error: simState.error,
    handleSimulation,
  }
}

export default useProposalSimulation
