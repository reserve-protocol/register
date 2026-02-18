import dtfIndexAbi from '@/abis/dtf-index-abi-v1'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import timelockAbi from '@/abis/Timelock'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { BIGINT_MAX, getPlatformFee } from '@/utils/constants'
import { atom } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { Address, encodeFunctionData, Hex, parseEther } from 'viem'
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

// UI
export const selectedSectionAtom = atom<string | undefined>(undefined)

// Change detection atoms
export const tokenNameChangeAtom = atom<string | undefined>(undefined)
export const mandateChangeAtom = atom<string | undefined>(undefined)

export const rolesChangesAtom = atom<{
  guardians?: Address[]
  brandManagers?: Address[]
  auctionLaunchers?: Address[]
}>({})

export const revenueDistributionChangesAtom = atom<{
  governanceShare?: number
  deployerShare?: number
  additionalRecipients?: { address: string; share: number }[]
}>({})

export const dtfRevenueChangesAtom = atom<{
  mintFee?: number
  tvlFee?: number
}>({})

export const auctionLengthChangeAtom = atom<number | undefined>(undefined)

export const weightControlChangeAtom = atom<boolean | undefined>(undefined)

export const bidsEnabledChangeAtom = atom<boolean | undefined>(undefined)

export const governanceChangesAtom = atom<GovernanceChanges>({})

// Has changes atoms for easy checking
export const hasTokenNameChangeAtom = atom((get) => {
  const change = get(tokenNameChangeAtom)
  return change !== undefined
})

export const hasMandateChangeAtom = atom((get) => {
  const change = get(mandateChangeAtom)
  return change !== undefined
})

export const hasRolesChangesAtom = atom((get) => {
  const changes = get(rolesChangesAtom)
  return !!(
    changes.guardians ||
    changes.brandManagers ||
    changes.auctionLaunchers
  )
})

export const hasRevenueDistributionChangesAtom = atom((get) => {
  const changes = get(revenueDistributionChangesAtom)
  return !!(
    changes.governanceShare !== undefined ||
    changes.deployerShare !== undefined ||
    changes.additionalRecipients
  )
})

export const hasDtfRevenueChangesAtom = atom((get) => {
  const changes = get(dtfRevenueChangesAtom)
  return !!(changes.mintFee !== undefined || changes.tvlFee !== undefined)
})

export const hasAuctionLengthChangeAtom = atom((get) => {
  const change = get(auctionLengthChangeAtom)
  return change !== undefined
})

export const hasWeightControlChangeAtom = atom((get) => {
  const change = get(weightControlChangeAtom)
  return change !== undefined
})

export const hasBidsEnabledChangeAtom = atom((get) => {
  const change = get(bidsEnabledChangeAtom)
  return change !== undefined
})

export const hasGovernanceChangesAtom = atom((get) => {
  const changes = get(governanceChangesAtom)
  return !!(
    changes.votingDelay !== undefined ||
    changes.votingPeriod !== undefined ||
    changes.proposalThreshold !== undefined ||
    changes.quorumPercent !== undefined ||
    changes.executionDelay !== undefined
  )
})

// remove-dust-tokens
export const removedBasketTokensAtom = atom<Token[]>([])
export const currentBasketTokensAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const basket = get(indexDTFBasketAtom)
  const removed = get(removedBasketTokensAtom)
  const shares = get(indexDTFBasketSharesAtom)

  if (!indexDTF || !basket) return undefined

  const removedMap = removed.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )

  return basket.filter(
    (token) =>
      !removedMap[token.address.toLowerCase()] &&
      shares[token.address] &&
      shares[token.address] === '0.00'
  )
})

// Atom to track form validation state
export const isFormValidAtom = atom(true)

export const isProposalValidAtom = atom((get) => {
  const removedBasketTokens = get(removedBasketTokensAtom)
  const hasTokenNameChange = get(hasTokenNameChangeAtom)
  const hasMandateChange = get(hasMandateChangeAtom)
  const hasRolesChanges = get(hasRolesChangesAtom)
  const hasRevenueDistributionChanges = get(hasRevenueDistributionChangesAtom)
  const hasDtfRevenueChanges = get(hasDtfRevenueChangesAtom)
  const hasAuctionLengthChange = get(hasAuctionLengthChangeAtom)
  const hasWeightControlChange = get(hasWeightControlChangeAtom)
  const hasBidsEnabledChange = get(hasBidsEnabledChangeAtom)
  const hasGovernanceChanges = get(hasGovernanceChangesAtom)
  const isFormValid = get(isFormValidAtom)

  const hasChanges =
    removedBasketTokens.length > 0 ||
    hasTokenNameChange ||
    hasMandateChange ||
    hasRolesChanges ||
    hasRevenueDistributionChanges ||
    hasDtfRevenueChanges ||
    hasAuctionLengthChange ||
    hasWeightControlChange ||
    hasBidsEnabledChange ||
    hasGovernanceChanges

  return hasChanges
})

export const isProposalConfirmedAtom = atom(false)

export const proposalDescriptionAtom = atom<string | undefined>(undefined)

// Calculated quorum percentage atom
export const currentQuorumPercentageAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  if (!dtf?.ownerGovernance) return 0

  const { quorumNumerator, quorumDenominator } = dtf.ownerGovernance
  return (Number(quorumNumerator) / Number(quorumDenominator)) * 100
})

// Role constants from the DTF contract
const GUARDIAN_ROLE =
  '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783' as const
const BRAND_MANAGER_ROLE =
  '0x2d8e650da9bd8c373ab2450d770f2ed39549bfc28d3630025cecc51511bcd374' as const
const AUCTION_LAUNCHER_ROLE =
  '0x13ff1b2625181b311f257c723b5e6d366eb318b212d9dd694c48fcf227659df5' as const

export const dtfSettingsProposalDataAtom = atom<ProposalData | undefined>(
  (get) => {
    const isConfirmed = get(isProposalConfirmedAtom)
    const indexDTF = get(indexDTFAtom)
    const version = get(indexDTFVersionAtom)
    const removedBasketTokens = get(removedBasketTokensAtom)
    const tokenNameChange = get(tokenNameChangeAtom)
    const mandateChange = get(mandateChangeAtom)
    const rolesChanges = get(rolesChangesAtom)
    const revenueDistributionChanges = get(revenueDistributionChangesAtom)
    const dtfRevenueChanges = get(dtfRevenueChangesAtom)
    const auctionLengthChange = get(auctionLengthChangeAtom)
    const weightControlChange = get(weightControlChangeAtom)
    const bidsEnabledChange = get(bidsEnabledChangeAtom)
    const rebalanceControl = get(indexDTFRebalanceControlAtom)
    const governanceChanges = get(governanceChangesAtom)
    const feeRecipients = get(feeRecipientsAtom)

    if (!isConfirmed || !indexDTF) return undefined

    const calldatas: Hex[] = []
    const targets: Address[] = []

    // 1. Remove dust tokens
    if (removedBasketTokens.length > 0) {
      const isV2 = version === '2.0.0'
      for (const token of removedBasketTokens) {
        if (isV2) {
          calldatas.push(
            encodeFunctionData({
              abi: dtfIndexAbiV2,
              functionName: 'setDustAmount',
              args: [token.address, BIGINT_MAX],
            })
          )
          targets.push(indexDTF.id as Address)
        }
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbiV2,
            functionName: 'removeFromBasket',
            args: [token.address],
          })
        )
        targets.push(indexDTF.id as Address)
      }
    }

    // 2. Set token name (v5+)
    if (tokenNameChange !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbiV5,
          functionName: 'setName',
          args: [tokenNameChange],
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 3. Set mandate
    if (mandateChange !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setMandate',
          args: [mandateChange],
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 3. Handle role changes
    if (rolesChanges.guardians && indexDTF.ownerGovernance?.timelock?.id) {
      const currentGuardians =
        indexDTF.ownerGovernance?.timelock?.guardians || []
      const newGuardians = rolesChanges.guardians
      const timelockAddress = indexDTF.ownerGovernance.timelock.id as Address

      // Revoke removed guardians
      const removedGuardians = currentGuardians.filter(
        (addr) =>
          !newGuardians.some(
            (newAddr) => newAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const guardian of removedGuardians) {
        calldatas.push(
          encodeFunctionData({
            abi: timelockAbi,
            functionName: 'revokeRole',
            args: [GUARDIAN_ROLE, guardian],
          })
        )
        targets.push(timelockAddress)
      }

      // Grant new guardians
      const addedGuardians = newGuardians.filter(
        (addr) =>
          !currentGuardians.some(
            (currAddr) => currAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const guardian of addedGuardians) {
        calldatas.push(
          encodeFunctionData({
            abi: timelockAbi,
            functionName: 'grantRole',
            args: [GUARDIAN_ROLE, guardian],
          })
        )
        targets.push(timelockAddress)
      }
    } else if (rolesChanges.guardians) {
      // Fallback to DTF contract if timelock not available
      const currentGuardians =
        indexDTF.ownerGovernance?.timelock?.guardians || []
      const newGuardians = rolesChanges.guardians

      // Revoke removed guardians
      const removedGuardians = currentGuardians.filter(
        (addr) =>
          !newGuardians.some(
            (newAddr) => newAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const guardian of removedGuardians) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'revokeRole',
            args: [GUARDIAN_ROLE, guardian],
          })
        )
        targets.push(indexDTF.id as Address)
      }

      // Grant new guardians
      const addedGuardians = newGuardians.filter(
        (addr) =>
          !currentGuardians.some(
            (currAddr) => currAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const guardian of addedGuardians) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'grantRole',
            args: [GUARDIAN_ROLE, guardian],
          })
        )
        targets.push(indexDTF.id as Address)
      }
    }

    if (rolesChanges.brandManagers) {
      const currentBrandManagers = indexDTF.brandManagers || []
      const newBrandManagers = rolesChanges.brandManagers

      // Revoke removed brand managers
      const removedBrandManagers = currentBrandManagers.filter(
        (addr) =>
          !newBrandManagers.some(
            (newAddr) => newAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const brandManager of removedBrandManagers) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'revokeRole',
            args: [BRAND_MANAGER_ROLE, brandManager],
          })
        )
        targets.push(indexDTF.id as Address)
      }

      // Grant new brand managers
      const addedBrandManagers = newBrandManagers.filter(
        (addr) =>
          !currentBrandManagers.some(
            (currAddr) => currAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const brandManager of addedBrandManagers) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'grantRole',
            args: [BRAND_MANAGER_ROLE, brandManager],
          })
        )
        targets.push(indexDTF.id as Address)
      }
    }

    if (rolesChanges.auctionLaunchers) {
      const currentAuctionLaunchers = indexDTF.auctionLaunchers || []
      const newAuctionLaunchers = rolesChanges.auctionLaunchers

      // Revoke removed auction launchers
      const removedAuctionLaunchers = currentAuctionLaunchers.filter(
        (addr) =>
          !newAuctionLaunchers.some(
            (newAddr) => newAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const auctionLauncher of removedAuctionLaunchers) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'revokeRole',
            args: [AUCTION_LAUNCHER_ROLE, auctionLauncher],
          })
        )
        targets.push(indexDTF.id as Address)
      }

      // Grant new auction launchers
      const addedAuctionLaunchers = newAuctionLaunchers.filter(
        (addr) =>
          !currentAuctionLaunchers.some(
            (currAddr) => currAddr.toLowerCase() === addr.toLowerCase()
          )
      )
      for (const auctionLauncher of addedAuctionLaunchers) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'grantRole',
            args: [AUCTION_LAUNCHER_ROLE, auctionLauncher],
          })
        )
        targets.push(indexDTF.id as Address)
      }
    }

    // 4. Set mint fee
    if (dtfRevenueChanges.mintFee !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setMintFee',
          args: [parseEther((dtfRevenueChanges.mintFee / 100).toString())], // Convert percentage to 18 decimal precision
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 4b. Set TVL fee
    if (dtfRevenueChanges.tvlFee !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setTVLFee',
          args: [parseEther((dtfRevenueChanges.tvlFee / 100).toString())], // Convert percentage to decimal
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 5. Set auction length
    if (auctionLengthChange !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setAuctionLength',
          args: [BigInt(auctionLengthChange * 60)], // Convert minutes to seconds
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 5b. Set rebalance control (weight control)
    if (weightControlChange !== undefined && rebalanceControl) {
      // Keep the current priceControl value, only change weightControl
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbiV4,
          functionName: 'setRebalanceControl',
          args: [
            {
              weightControl: weightControlChange,
              priceControl: rebalanceControl.priceControl,
            },
          ],
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 5c. Set bids enabled (v5+)
    if (bidsEnabledChange !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbiV5,
          functionName: 'setBidsEnabled',
          args: [bidsEnabledChange],
        })
      )
      targets.push(indexDTF.id as Address)
    }

    // 6. Set fee recipients
    if (
      revenueDistributionChanges.governanceShare !== undefined ||
      revenueDistributionChanges.deployerShare !== undefined ||
      revenueDistributionChanges.additionalRecipients !== undefined
    ) {
      if (!feeRecipients) return undefined

      // Calculate new fee recipients array similar to deploy logic
      const newFeeRecipients: { recipient: Address; portion: bigint }[] = []

      // Calculate using the same logic as calculateRevenueDistribution
      const chainId = get(chainIdAtom)
      const platformFee = getPlatformFee(chainId)

      // Convert from actual percentage (including platform fee) to contract percentage (excluding platform fee)
      // User input: actual % of total revenue -> Contract needs: % of non-platform portion
      // Example BSC: User inputs 67% -> Contract needs 100% (67% is 100% of the 67% non-platform portion)
      const calculateShare = (sharePercentage: number) => {
        // Convert actual percentage to fraction of non-platform portion
        const actualFraction = sharePercentage / 100
        const nonPlatformFraction = (100 - platformFee) / 100
        const contractFraction = actualFraction / nonPlatformFraction
        return parseEther(contractFraction.toString())
      }

      // Get current values
      const governanceShare =
        revenueDistributionChanges.governanceShare ??
        feeRecipients.governanceShare
      const deployerShare =
        revenueDistributionChanges.deployerShare ?? feeRecipients.deployerShare
      const additionalRecipients =
        revenueDistributionChanges.additionalRecipients ??
        feeRecipients.externalRecipients

      // Build recipients array (excluding last one for now)
      const tempRecipients: { recipient: Address; portion: bigint }[] = []

      // Additional recipients
      if (additionalRecipients && additionalRecipients.length > 0) {
        for (const recipient of additionalRecipients) {
          if (recipient.share > 0 && recipient.address) {
            tempRecipients.push({
              recipient: recipient.address as Address,
              portion: calculateShare(recipient.share),
            })
          }
        }
      }

      // Deployer share
      if (deployerShare > 0) {
        tempRecipients.push({
          recipient: indexDTF.deployer as Address,
          portion: calculateShare(deployerShare),
        })
      }

      // Governance share
      if (governanceShare > 0 && indexDTF.stToken) {
        tempRecipients.push({
          recipient: indexDTF.stToken.id as Address,
          portion: calculateShare(governanceShare),
        })
      }

      // Calculate sum and adjust last recipient to avoid rounding errors
      if (tempRecipients.length > 0) {
        const currentSum = tempRecipients
          .slice(0, -1)
          .reduce((sum, item) => sum + item.portion, 0n)

        if (tempRecipients.length > 1) {
          tempRecipients[tempRecipients.length - 1].portion =
            parseEther('1') - currentSum
        }

        // Sort by address
        tempRecipients.sort((a, b) =>
          a.recipient.toLowerCase().localeCompare(b.recipient.toLowerCase())
        )

        newFeeRecipients.push(...tempRecipients)
      }

      // Only add the calldata if we have recipients
      if (newFeeRecipients.length > 0) {
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'setFeeRecipients',
            args: [newFeeRecipients],
          })
        )
        targets.push(indexDTF.id as Address)
      }
    }

    // 7. Handle governance parameter changes
    if (indexDTF.ownerGovernance && Object.keys(governanceChanges).length > 0) {
      const governanceAddress = indexDTF.ownerGovernance.id as Address
      const timelockAddress = indexDTF.ownerGovernance.timelock?.id as Address

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
        calldatas.push(
          encodeQuorum(
            governanceChanges.quorumPercent,
            indexDTF.ownerGovernance.quorumDenominator
          )
        )
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
export const dtfGovernanceChangesDisplayAtom = atom<GovernanceChangeDisplay[]>(
  (get) => {
    const governanceChanges = get(governanceChangesAtom)
    const dtf = get(indexDTFAtom)

    if (!dtf?.ownerGovernance) return []

    const governance = dtf.ownerGovernance
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
      const currentQuorum = get(currentQuorumPercentageAtom)
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
  }
)

// Backwards compatibility atom
export const dtfSettingsProposalCalldatasAtom = atom<Hex[] | undefined>(
  (get) => {
    const proposalData = get(dtfSettingsProposalDataAtom)
    return proposalData?.calldatas
  }
)

export const feeRecipientsAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)

  if (!indexDTF) return undefined

  const externalRecipients: { address: string; share: number }[] = []
  let deployerShare = 0
  let governanceShare = 0
  const chainId = get(chainIdAtom)
  const platformFee = getPlatformFee(chainId)
  const PERCENT_ADJUST = 100 / (100 - platformFee)

  for (const recipient of indexDTF.feeRecipients) {
    // Deployer share - adjust from contract percentage to actual percentage
    if (recipient.address.toLowerCase() === indexDTF.deployer.toLowerCase()) {
      deployerShare = Number(recipient.percentage) / PERCENT_ADJUST
    } else if (
      recipient.address.toLowerCase() === indexDTF.stToken?.id.toLowerCase()
    ) {
      governanceShare = Number(recipient.percentage) / PERCENT_ADJUST
    } else {
      externalRecipients.push({
        address: recipient.address,
        share: Number(recipient.percentage) / PERCENT_ADJUST,
      })
    }
  }

  return {
    deployerShare,
    governanceShare,
    externalRecipients,
  }
})
