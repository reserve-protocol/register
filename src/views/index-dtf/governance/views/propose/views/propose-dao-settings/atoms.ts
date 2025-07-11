import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { atom } from 'jotai'
import { Address, encodeFunctionData, Hex } from 'viem'
import {
  GovernanceChanges,
  ProposalData,
  GovernanceChangeDisplay,
  encodeVotingDelay,
  encodeVotingPeriod,
  encodeProposalThreshold,
  encodeQuorum,
  encodeExecutionDelay,
  humanizeTimeFromSeconds,
  proposalThresholdToPercentage,
} from '../../shared'

export const removedRewardTokensAtom = atom<Token[]>([])
export const currentRewardTokensAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const removed = get(removedRewardTokensAtom)

  if (!indexDTF) return undefined

  const removedMap = removed.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )

  return indexDTF?.stToken?.rewardTokens.filter(
    (token) => !removedMap[token.address]
  )
})
export const addedRewardTokensAtom = atom<Record<string, Token | undefined>>({})
export const rewardTokenAddressesAtom = atom<string[]>((get) => {
  const currentRewardTokens = get(currentRewardTokensAtom)
  const addedRewardTokens = Object.values(get(addedRewardTokensAtom))

  if (!currentRewardTokens || !addedRewardTokens) return []

  return [
    ...currentRewardTokens.map((token) => token.address.toLowerCase()),
    ...addedRewardTokens
      .filter((r) => r?.address)
      .map((r) => r?.address.toLowerCase() ?? ''),
  ]
})

export const isAddedRewardsTokenValidAtom = atom<boolean>((get) => {
  const currentRewardTokens = get(currentRewardTokensAtom)
  const addedRewardTokens = Object.values(get(addedRewardTokensAtom))
  const rewardTokenAddresses = get(rewardTokenAddressesAtom)

  if (!currentRewardTokens || !addedRewardTokens) return false

  // check if there is a duplicated address
  const uniqueAddresses = new Set(rewardTokenAddresses)
  if (uniqueAddresses.size !== rewardTokenAddresses.length) return false

  // Check if all the new reward tokens are valid
  return addedRewardTokens.every((token) => {
    if (!token) return false

    return true
  })
})

export const isProposalValidAtom = atom((get) => {
  const addedRewardTokens = Object.keys(get(addedRewardTokensAtom))
  const isAddedRewardsTokenValid = get(isAddedRewardsTokenValidAtom)
  const removedRewardTokens = get(removedRewardTokensAtom)
  const hasDaoGovernanceChanges = get(hasDaoGovernanceChangesAtom)
  const isFormValid = get(isFormValidAtom)

  // Check if there are any changes
  const hasRevenueTokenChanges = 
    (addedRewardTokens.length && isAddedRewardsTokenValid) || 
    removedRewardTokens.length > 0

  const hasAnyChanges = hasRevenueTokenChanges || hasDaoGovernanceChanges

  // Proposal is valid if there are changes AND form is valid
  return hasAnyChanges && isFormValid
})

export const validAddedRewardTokensAtom = atom<string[]>((get) => {
  const addedRewardTokens = get(addedRewardTokensAtom)

  return Object.keys(addedRewardTokens).filter((key) => {
    const token = addedRewardTokens[key]

    if (!token) return false

    return true
  })
})

export const isProposalConfirmedAtom = atom(false)

export const proposalDescriptionAtom = atom<string | undefined>(undefined)

// UI State
export const selectedSectionAtom = atom<string | undefined>(undefined)

// Governance changes atoms
export const daoGovernanceChangesAtom = atom<GovernanceChanges>({})

export const hasDaoGovernanceChangesAtom = atom((get) => {
  const changes = get(daoGovernanceChangesAtom)
  return Object.keys(changes).length > 0
})

// Atom for formatted governance changes for display
export const daoGovernanceChangesDisplayAtom = atom<GovernanceChangeDisplay[]>((get) => {
  const governanceChanges = get(daoGovernanceChangesAtom)
  const dtf = get(indexDTFAtom)

  if (!dtf?.stToken?.governance) return []

  const governance = dtf.stToken.governance
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

// Form validation atom
export const isFormValidAtom = atom(false)

export const daoSettingsProposalDataAtom = atom<ProposalData | undefined>((get) => {
  const isConfirmed = get(isProposalConfirmedAtom)
  const indexDTF = get(indexDTFAtom)
  const addedRewardTokens = get(addedRewardTokensAtom)
  const removedRewardTokens = get(removedRewardTokensAtom)
  const governanceChanges = get(daoGovernanceChangesAtom)

  if (!isConfirmed || !indexDTF || !indexDTF.stToken) return undefined

  const calldatas: Hex[] = []
  const targets: Address[] = []

  // 1. Handle reward token changes
  for (const token of removedRewardTokens) {
    calldatas.push(
      encodeFunctionData({
        abi: dtfIndexStakingVaultAbi,
        functionName: 'removeRewardToken',
        args: [token.address],
      })
    )
    targets.push(indexDTF.stToken.id as Address)
  }

  for (const token of Object.values(addedRewardTokens)) {
    if (!token) continue

    calldatas.push(
      encodeFunctionData({
        abi: dtfIndexStakingVaultAbi,
        functionName: 'addRewardToken',
        args: [token.address as `0x${string}`],
      })
    )
    targets.push(indexDTF.stToken.id as Address)
  }

  // 2. Handle governance parameter changes
  if (indexDTF.stToken.governance && Object.keys(governanceChanges).length > 0) {
    const governanceAddress = indexDTF.stToken.governance.id as Address
    const timelockAddress = indexDTF.stToken.governance.timelock?.id as Address

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
      calldatas.push(encodeProposalThreshold(governanceChanges.proposalThreshold))
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
})

// Backwards compatibility atom
export const vaultProposalCalldatasAtom = atom<Hex[] | undefined>((get) => {
  const proposalData = get(daoSettingsProposalDataAtom)
  return proposalData?.calldatas
})

// Reset atom for clearing all state
export const resetAtom = atom(null, (get, set) => {
  set(removedRewardTokensAtom, [])
  set(addedRewardTokensAtom, {})
  set(selectedSectionAtom, undefined)
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
  set(daoGovernanceChangesAtom, {})
  set(isFormValidAtom, false)
})
