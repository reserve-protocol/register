import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { Address, Hex } from 'viem'
import {
  GovernanceChanges,
  ProposalData,
  GovernanceChangeDisplay,
  humanizeTimeFromSeconds,
  proposalThresholdToPercentage,
  encodeVotingDelay,
  encodeVotingPeriod,
  encodeProposalThreshold,
  encodeQuorum,
  encodeExecutionDelay,
} from '../../shared'

// UI state atoms
export const isProposalConfirmedAtom = atom(false)
export const proposalDescriptionAtom = atom<string | undefined>(undefined)
export const isFormValidAtom = atom(false)

// Governance changes atom
export const basketGovernanceChangesAtom = atom<GovernanceChanges>({})

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
export const basketSettingsProposalDataAtom = atom<ProposalData | undefined>(
  (get) => {
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
        calldatas.push(encodeVotingDelay(governanceChanges.votingDelay))
        targets.push(governanceAddress)
      }

      // Set voting period
      if (governanceChanges.votingPeriod !== undefined) {
        calldatas.push(encodeVotingPeriod(governanceChanges.votingPeriod))
        targets.push(governanceAddress)
      }

      // Set proposal threshold
      if (governanceChanges.proposalThreshold !== undefined) {
        calldatas.push(
          encodeProposalThreshold(governanceChanges.proposalThreshold)
        )
        targets.push(governanceAddress)
      }

      // Set quorum votes
      if (governanceChanges.quorumPercent !== undefined) {
        calldatas.push(encodeQuorum(governanceChanges.quorumPercent))
        targets.push(governanceAddress)
      }

      // Set execution delay (timelock)
      if (governanceChanges.executionDelay !== undefined && timelockAddress) {
        calldatas.push(encodeExecutionDelay(governanceChanges.executionDelay))
        targets.push(timelockAddress)
      }
    }

    return calldatas.length > 0 ? { calldatas, targets } : undefined
  }
)

// Atom for formatted governance changes for display
export const basketGovernanceChangesDisplayAtom = atom<
  GovernanceChangeDisplay[]
>((get) => {
  const governanceChanges = get(basketGovernanceChangesAtom)
  const dtf = get(indexDTFAtom)

  if (!dtf?.tradingGovernance) return []

  const governance = dtf.tradingGovernance
  const changes = []

  if (governanceChanges.votingDelay !== undefined) {
    changes.push({
      key: 'votingDelay' as keyof GovernanceChanges,
      title: 'Voting Delay',
      current: humanizeTimeFromSeconds(Number(governance.votingDelay)),
      new: humanizeTimeFromSeconds(governanceChanges.votingDelay),
    })
  }

  if (governanceChanges.votingPeriod !== undefined) {
    changes.push({
      key: 'votingPeriod' as keyof GovernanceChanges,
      title: 'Voting Period',
      current: humanizeTimeFromSeconds(Number(governance.votingPeriod)),
      new: humanizeTimeFromSeconds(governanceChanges.votingPeriod),
    })
  }

  if (governanceChanges.proposalThreshold !== undefined) {
    changes.push({
      key: 'proposalThreshold' as keyof GovernanceChanges,
      title: 'Proposal Threshold',
      current: `${proposalThresholdToPercentage(governance.proposalThreshold).toFixed(2)}%`,
      new: `${governanceChanges.proposalThreshold.toFixed(2)}%`,
    })
  }

  if (governanceChanges.quorumPercent !== undefined) {
    changes.push({
      key: 'quorumPercent' as keyof GovernanceChanges,
      title: 'Voting Quorum',
      current: `${Number(governance.quorumNumerator)}%`,
      new: `${governanceChanges.quorumPercent}%`,
    })
  }

  if (governanceChanges.executionDelay !== undefined) {
    changes.push({
      key: 'executionDelay' as keyof GovernanceChanges,
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
