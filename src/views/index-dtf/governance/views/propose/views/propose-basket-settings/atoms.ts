import timelockAbi from '@/abis/Timelock'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { Address, encodeFunctionData, Hex, keccak256, toBytes } from 'viem'
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
export const selectedSectionAtom = atom<string | undefined>(undefined)

// Calculated quorum percentage atom
export const currentQuorumPercentageAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  if (!dtf?.tradingGovernance) return 0
  
  const { quorumNumerator, quorumDenominator } = dtf.tradingGovernance
  return (Number(quorumNumerator) / Number(quorumDenominator)) * 100
})

// Governance changes atom
export const basketGovernanceChangesAtom = atom<GovernanceChanges>({})

// Check if there are governance changes
export const hasBasketGovernanceChangesAtom = atom((get) => {
  const changes = get(basketGovernanceChangesAtom)
  return Object.keys(changes).length > 0
})

// Role changes atoms
export const rolesChangesAtom = atom<{
  guardians?: Address[]
}>({})

export const hasRolesChangesAtom = atom((get) => {
  const changes = get(rolesChangesAtom)
  return changes.guardians !== undefined
})

// Check if proposal is valid (has changes)
export const isProposalValidAtom = atom((get) => {
  return get(hasBasketGovernanceChangesAtom) || get(hasRolesChangesAtom)
})

// CANCELLER_ROLE for timelock guardian
const CANCELLER_ROLE = keccak256(toBytes('CANCELLER_ROLE'))

// Generate proposal calldatas and targets
export const basketSettingsProposalDataAtom = atom<ProposalData | undefined>(
  (get) => {
    const governanceChanges = get(basketGovernanceChangesAtom)
    const rolesChanges = get(rolesChangesAtom)
    const dtf = get(indexDTFAtom)

    if (!dtf || !dtf.tradingGovernance) return undefined

    try {
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
          calldatas.push(encodeQuorum(
            governanceChanges.quorumPercent,
            dtf.tradingGovernance.quorumDenominator
          ))
          targets.push(governanceAddress)
        }

        // Set execution delay (timelock)
        if (governanceChanges.executionDelay !== undefined && timelockAddress) {
          calldatas.push(encodeExecutionDelay(governanceChanges.executionDelay))
          targets.push(timelockAddress)
        }
      }

      // Handle guardian role changes
      if (rolesChanges.guardians && dtf.tradingGovernance.timelock?.id) {
        const timelockAddress = dtf.tradingGovernance.timelock.id as Address
        const currentGuardians = dtf.tradingGovernance.timelock.guardians || []
        const newGuardians = rolesChanges.guardians

        // Revoke removed guardians
        for (const guardian of currentGuardians) {
          if (!newGuardians.some(newGuardian => 
            newGuardian.toLowerCase() === guardian.toLowerCase()
          )) {
            calldatas.push(
              encodeFunctionData({
                abi: timelockAbi,
                functionName: 'revokeRole',
                args: [CANCELLER_ROLE, guardian as Address],
              })
            )
            targets.push(timelockAddress)
          }
        }

        // Grant new guardians
        for (const guardian of newGuardians) {
          if (!currentGuardians.some(currentGuardian => 
            currentGuardian.toLowerCase() === guardian.toLowerCase()
          )) {
            calldatas.push(
              encodeFunctionData({
                abi: timelockAbi,
                functionName: 'grantRole',
                args: [CANCELLER_ROLE, guardian],
              })
            )
            targets.push(timelockAddress)
          }
        }
      }

      return calldatas.length > 0 ? { calldatas, targets } : undefined
    } catch (error) {
      // Return undefined if encoding fails (e.g., during typing)
      console.error('Failed to encode proposal data:', error)
      return undefined
    }
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
      new: `${Number(governanceChanges.proposalThreshold).toFixed(2)}%`,
    })
  }

  if (governanceChanges.quorumPercent !== undefined) {
    const quorumNumerator = Number(governance.quorumNumerator)
    const quorumDenominator = Number(governance.quorumDenominator)
    const currentQuorum = quorumDenominator > 0 ? (quorumNumerator / quorumDenominator) * 100 : 0
    changes.push({
      key: 'quorumPercent' as keyof GovernanceChanges,
      title: 'Voting Quorum',
      current: `${currentQuorum.toFixed(2)}%`,
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
export const resetAtom = atom(null, (_, set) => {
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
  set(basketGovernanceChangesAtom, {})
  set(rolesChangesAtom, {})
  set(selectedSectionAtom, undefined)
  set(isFormValidAtom, false)
})
