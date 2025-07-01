import dtfGovernanceAbi from '@/abis/dtf-index-governance'
import timelockAbi from '@/abis/Timelock'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { Address, encodeFunctionData, Hex, parseEther } from 'viem'

// UI state atoms
export const isProposalConfirmedAtom = atom(false)
export const proposalDescriptionAtom = atom<string | undefined>(undefined)
export const isFormValidAtom = atom(false)

// Governance changes atom
export const basketGovernanceChangesAtom = atom<{
  votingDelay?: number
  votingPeriod?: number
  quorumPercent?: number
  proposalThreshold?: number
  executionDelay?: number
}>({})

// Check if there are governance changes
export const hasBasketGovernanceChangesAtom = atom((get) => {
  const changes = get(basketGovernanceChangesAtom)
  return Object.keys(changes).length > 0
})

// Check if proposal is valid (has changes)
export const isProposalValidAtom = atom((get) => {
  return get(hasBasketGovernanceChangesAtom)
})

// Generate proposal calldatas and targets
export const basketSettingsProposalDataAtom = atom<
  { calldatas: Hex[]; targets: Address[] } | undefined
>((get) => {
  const governanceChanges = get(basketGovernanceChangesAtom)
  const dtf = get(indexDTFAtom)

  if (!dtf || !dtf.tradingGovernance) return undefined

  const calldatas: Hex[] = []
  const targets: Address[] = []

  const governanceAddress = dtf.tradingGovernance.id
  const timelockAddress = dtf.tradingGovernance.timelock?.id

  // Add governance parameter changes
  if (Object.keys(governanceChanges).length > 0) {
    // Set voting delay
    if (governanceChanges.votingDelay !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfGovernanceAbi,
          functionName: 'setVotingDelay',
          args: [governanceChanges.votingDelay],
        })
      )
      targets.push(governanceAddress)
    }

    // Set voting period
    if (governanceChanges.votingPeriod !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfGovernanceAbi,
          functionName: 'setVotingPeriod',
          args: [governanceChanges.votingPeriod],
        })
      )
      targets.push(governanceAddress)
    }

    // Set proposal threshold
    if (governanceChanges.proposalThreshold !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfGovernanceAbi,
          functionName: 'setProposalThreshold',
          args: [
            parseEther((governanceChanges.proposalThreshold / 100).toString()),
          ],
        })
      )
      targets.push(governanceAddress)
    }

    // Set quorum votes
    if (governanceChanges.quorumPercent !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfGovernanceAbi,
          functionName: 'updateQuorumNumerator',
          args: [BigInt(governanceChanges.quorumPercent)],
        })
      )
      targets.push(governanceAddress)
    }

    // Set execution delay (timelock)
    if (governanceChanges.executionDelay !== undefined && timelockAddress) {
      calldatas.push(
        encodeFunctionData({
          abi: timelockAbi,
          functionName: 'updateDelay',
          args: [BigInt(governanceChanges.executionDelay)],
        })
      )
      targets.push(timelockAddress)
    }
  }

  return calldatas.length > 0 ? { calldatas, targets } : undefined
})

// Convert seconds to days for display
const secondsToDays = (seconds: number) => seconds / 86400

// Humanize time from seconds
const humanizeTimeFromSeconds = (seconds: number) => {
  const days = secondsToDays(seconds)
  if (days < 1) {
    const hours = seconds / 3600
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${days} day${days !== 1 ? 's' : ''}`
}

// Atom for formatted governance changes for display
export const basketGovernanceChangesDisplayAtom = atom((get) => {
  const governanceChanges = get(basketGovernanceChangesAtom)
  const dtf = get(indexDTFAtom)

  if (!dtf?.tradingGovernance) return []

  const governance = dtf.tradingGovernance
  const changes = []

  if (governanceChanges.votingDelay !== undefined) {
    changes.push({
      key: 'votingDelay',
      title: 'Voting Delay',
      current: humanizeTimeFromSeconds(Number(governance.votingDelay)),
      new: humanizeTimeFromSeconds(governanceChanges.votingDelay),
    })
  }

  if (governanceChanges.votingPeriod !== undefined) {
    changes.push({
      key: 'votingPeriod',
      title: 'Voting Period',
      current: humanizeTimeFromSeconds(Number(governance.votingPeriod)),
      new: humanizeTimeFromSeconds(governanceChanges.votingPeriod),
    })
  }

  if (governanceChanges.proposalThreshold !== undefined) {
    changes.push({
      key: 'proposalThreshold',
      title: 'Proposal Threshold',
      current: `${(Number(governance.proposalThreshold) / 1e18).toFixed(2)}%`,
      new: `${governanceChanges.proposalThreshold.toFixed(2)}%`,
    })
  }

  if (governanceChanges.quorumPercent !== undefined) {
    changes.push({
      key: 'quorumPercent',
      title: 'Voting Quorum',
      current: `${Number(governance.quorumNumerator)}%`,
      new: `${governanceChanges.quorumPercent}%`,
    })
  }

  if (governanceChanges.executionDelay !== undefined) {
    changes.push({
      key: 'executionDelay',
      title: 'Execution Delay',
      current: humanizeTimeFromSeconds(
        Number(governance.timelock?.executionDelay || 0)
      ),
      new: humanizeTimeFromSeconds(governanceChanges.executionDelay),
    })
  }

  return changes
})

// Reset atom for clearing all state
export const resetAtom = atom(null, (get, set) => {
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
  set(basketGovernanceChangesAtom, {})
  set(isFormValidAtom, false)
})
