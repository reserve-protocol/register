import { proposedRolesAtom } from './../atoms'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, rTokenManagersAtom } from 'state/atoms'
import { RoleKey } from 'types'
import { useEffect, useMemo } from 'react'
import useProposalTx from './useProposalTx'
import { usePublicClient } from 'wagmi'
import {
  getContract,
  keccak256,
  stringToBytes,
  encodeAbiParameters,
  parseAbiParameters,
} from 'viem'
import useRToken from 'hooks/useRToken'
import Governance from 'abis/Governance'

const simulateNew = async (config: any): Promise<any> => {
  // --- Validate config ---
  const {
    governorAddress,
    governorType,
    targets,
    values,
    signatures,
    calldatas,
    description,
  } = config

  const rToken = useRToken()
  const governance = useAtomValue(rTokenGovernanceAtom)
  const client = usePublicClient()

  if (targets.length !== values.length)
    throw new Error('targets and values must be the same length')
  if (targets.length !== signatures.length)
    throw new Error('targets and signatures must be the same length')
  if (targets.length !== calldatas.length)
    throw new Error('targets and calldatas must be the same length')

  // --- Get details about the proposal we're simulating ---
  const network = await client.getChainId()

  const latestBlock = Number((await client.getBlock()).timestamp) - 3 // subtracting a few blocks to ensure tenderly has the block
  const governor = getContract({
    address: governance.governor!,
    abi: Governance,
  })

  const proposalId = BigInt(
    keccak256(
      encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32'),
        [targets, values, calldatas, keccak256(stringToBytes(description))]
      )
    )
  )

  const startBlock = BigInt(latestBlock - 100) // arbitrarily subtract 100
  const proposal: ProposalEvent = {
    id: proposalId, // Bravo governor
    proposalId, // OZ governor (for simplicity we just include both ID formats)
    proposer: DEFAULT_FROM,
    startBlock,
    endBlock: startBlock.add(1),
    description,
    targets,
    values: values.map(BigNumber.from),
    signatures,
    calldatas,
  }

  // --- Prepare simulation configuration ---
  // Get voting token and total supply
  const votingToken = await getVotingToken(
    governorType,
    governorAddress,
    proposalId
  )
  const votingTokenSupply = <BigNumber>await votingToken.totalSupply() // used to manipulate vote count

  // Set `from` arbitrarily.
  const from = DEFAULT_FROM

  // Run simulation at the block right after the proposal ends.
  const simBlock = proposal.endBlock!.add(100)

  // For OZ governors we arbitrarily choose execution time. For Bravo governors, we
  // compute the approximate earliest possible execution time based on governance parameters. This
  // can only be approximate because voting period is defined in blocks, not as a timestamp. We
  // assume 12 second block times to prefer underestimating timestamp rather than overestimating,
  // and we prefer underestimating to avoid simulations reverting in cases where governance
  // proposals call methods that pass in a start timestamp that must be lower than the current
  // block timestamp (represented by the `simTimestamp` variable below)
  const simTimestamp =
    governorType === 'bravo'
      ? BigNumber.from(latestBlock.timestamp).add(
          simBlock.sub(proposal.endBlock!).mul(12)
        )
      : BigNumber.from(latestBlock.timestamp + 1)
  const eta = simTimestamp // set proposal eta to be equal to the timestamp we simulate at

  // Compute transaction hashes used by the Timelock
  const txHashes = targets.map((target, i) => {
    const [val, sig, calldata] = [values[i], signatures[i], calldatas[i]]
    return keccak256(
      defaultAbiCoder.encode(
        ['address', 'uint256', 'string', 'bytes', 'uint256'],
        [target, val, sig, calldata, eta]
      )
    )
  })

  // Generate the state object needed to mark the transactions as queued in the Timelock's storage
  const timelockStorageObj: Record<string, string> = {}

  if (governorType === 'bravo') {
    txHashes.forEach((hash) => {
      timelockStorageObj[`queuedTransactions[${hash}]`] = 'true'
    })
  }

  if (governorType === 'oz') {
    const id = hashOperationBatchOz(
      targets,
      values,
      calldatas,
      HashZero,
      keccak256(toUtf8Bytes(description))
    )
    timelockStorageObj[`_timestamps[${id.toHexString()}]`] =
      simTimestamp.toString()
  }

  // Use the Tenderly API to get the encoded state overrides for governor storage
  let governorStateOverrides: Record<string, string> = {}
  if (governorType === 'bravo') {
    const proposalKey = `proposals[${proposalId.toString()}]`
    governorStateOverrides = {
      proposalCount: proposalId.toString(),
      [`${proposalKey}.id`]: proposalId.toString(),
      [`${proposalKey}.proposer`]: DEFAULT_FROM,
      [`${proposalKey}.eta`]: eta.toString(),
      [`${proposalKey}.startBlock`]: proposal.startBlock.toString(),
      [`${proposalKey}.endBlock`]: proposal.endBlock.toString(),
      [`${proposalKey}.canceled`]: 'false',
      [`${proposalKey}.executed`]: 'false',
      [`${proposalKey}.forVotes`]: votingTokenSupply.toString(),
      [`${proposalKey}.againstVotes`]: '0',
      [`${proposalKey}.abstainVotes`]: '0',
    }

    targets.forEach((target, i) => {
      const value = BigNumber.from(values[i]).toString()
      governorStateOverrides[`${proposalKey}.targets[${i}]`] = target
      governorStateOverrides[`${proposalKey}.values[${i}]`] = value
      governorStateOverrides[`${proposalKey}.signatures[${i}]`] = signatures[i]
      governorStateOverrides[`${proposalKey}.calldatas[${i}]`] = calldatas[i]
    })
  } else if (governorType === 'oz') {
    const proposalCoreKey = `_proposals[${proposalId.toString()}]`
    const proposalVotesKey = `_proposalVotes[${proposalId.toString()}]`
    governorStateOverrides = {
      [`${proposalCoreKey}.voteEnd._deadline`]: simBlock.sub(1).toString(),
      [`${proposalCoreKey}.voteStart._deadline`]: simBlock.sub(1).toString(),
      [`${proposalCoreKey}.canceled`]: 'false',
      [`${proposalCoreKey}.executed`]: 'false',
      [`${proposalVotesKey}.forVotes`]: votingTokenSupply.toString(),
      [`${proposalVotesKey}.againstVotes`]: '0',
      [`${proposalVotesKey}.abstainVotes`]: '0',
    }
  } else {
    throw new Error(
      `Cannot generate overrides for unknown governor type: ${governorType}`
    )
  }

  const stateOverrides = {
    networkID: '1',
    stateOverrides: {
      [timelock.address]: {
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
  const descriptionHash = keccak256(toUtf8Bytes(description))
  const executeInputs =
    governorType === 'bravo'
      ? [proposalId.toString()]
      : [targets, values, calldatas, descriptionHash]
  const simulationPayload: TenderlyPayload = {
    network_id: '1',
    // this field represents the block state to simulate against, so we use the latest block number
    block_number: latestBlock.number,
    from: DEFAULT_FROM,
    to: governor.address,
    input: governor.interface.encodeFunctionData('execute', executeInputs),
    gas: BLOCK_GAS_LIMIT,
    gas_price: '0',
    value: '0', // TODO Support sending ETH in local simulations like we do below in `simulateProposed`.
    save_if_fails: true, // Set to true to save the simulation to your Tenderly dashboard if it fails.
    save: true, // Set to true to save the simulation to your Tenderly dashboard if it succeeds.
    generate_access_list: true, // not required, but useful as a sanity check to ensure consistency in the simulation response
    block_header: {
      // this data represents what block.number and block.timestamp should return in the EVM during the simulation
      number: hexStripZeros(simBlock.toHexString()),
      timestamp: hexStripZeros(simTimestamp.toHexString()),
    },
    state_objects: {
      // Since gas price is zero, the sender needs no balance.
      // TODO Support sending ETH in local simulations like we do below in `simulateProposed`.
      [from]: { balance: '0' },
      // Ensure transactions are queued in the timelock
      [timelock.address]: {
        storage:
          storageObj.stateOverrides[timelock.address.toLowerCase()].value,
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

export default useProposalSimulation
