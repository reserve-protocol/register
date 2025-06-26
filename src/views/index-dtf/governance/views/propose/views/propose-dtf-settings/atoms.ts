import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { BIGINT_MAX, FIXED_PLATFORM_FEE } from '@/utils/constants'
import { atom } from 'jotai'
import { Address, encodeFunctionData, Hex, keccak256, toBytes } from 'viem'

// UI
export const selectedSectionAtom = atom<string[]>([])

// Change detection atoms
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

// Has changes atoms for easy checking
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
  const hasMandateChange = get(hasMandateChangeAtom)
  const hasRolesChanges = get(hasRolesChangesAtom)
  const hasRevenueDistributionChanges = get(hasRevenueDistributionChangesAtom)
  const hasDtfRevenueChanges = get(hasDtfRevenueChangesAtom)
  const hasAuctionLengthChange = get(hasAuctionLengthChangeAtom)
  const isFormValid = get(isFormValidAtom)

  const hasChanges =
    removedBasketTokens.length > 0 ||
    hasMandateChange ||
    hasRolesChanges ||
    hasRevenueDistributionChanges ||
    hasDtfRevenueChanges ||
    hasAuctionLengthChange

  return hasChanges && isFormValid
})

export const isProposalConfirmedAtom = atom(false)

export const proposalDescriptionAtom = atom<string | undefined>(undefined)

// Role constants from the DTF contract
const GUARDIAN_ROLE =
  '0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f' as const
const BRAND_MANAGER_ROLE =
  '0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883' as const
const AUCTION_LAUNCHER_ROLE =
  '0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4' as const

export const dtfSettingsProposalCalldatasAtom = atom<Hex[] | undefined>(
  (get) => {
    const isConfirmed = get(isProposalConfirmedAtom)
    const indexDTF = get(indexDTFAtom)
    const version = get(indexDTFVersionAtom)
    const removedBasketTokens = get(removedBasketTokensAtom)
    const mandateChange = get(mandateChangeAtom)
    const rolesChanges = get(rolesChangesAtom)
    const revenueDistributionChanges = get(revenueDistributionChangesAtom)
    const dtfRevenueChanges = get(dtfRevenueChangesAtom)
    const auctionLengthChange = get(auctionLengthChangeAtom)
    const feeRecipients = get(feeRecipientsAtom)

    if (!isConfirmed || !indexDTF) return undefined

    const calldatas: Hex[] = []

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
        }
        calldatas.push(
          encodeFunctionData({
            abi: dtfIndexAbiV2,
            functionName: 'removeFromBasket',
            args: [token.address],
          })
        )
      }
    }

    // 2. Set mandate
    if (mandateChange !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setMandate',
          args: [mandateChange],
        })
      )
    }

    // 3. Handle role changes
    if (rolesChanges.guardians) {
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
      }
    }

    // 4. Set mint fee
    if (dtfRevenueChanges.mintFee !== undefined) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setMintFee',
          args: [BigInt(Math.floor(dtfRevenueChanges.mintFee * 100))], // Convert percentage to basis points
        })
      )
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
    }

    // 6. Set fee recipients
    if (
      revenueDistributionChanges.governanceShare !== undefined ||
      revenueDistributionChanges.deployerShare !== undefined ||
      revenueDistributionChanges.additionalRecipients !== undefined
    ) {
      if (!feeRecipients) return undefined

      // Calculate new fee recipients array
      const newFeeRecipients: { recipient: Address; portion: bigint }[] = []
      const platformAddress = '0x0000000000000000000000000000000000000000' // Platform address

      // Platform fee is always fixed
      newFeeRecipients.push({
        recipient: platformAddress,
        portion: BigInt(FIXED_PLATFORM_FEE * 100), // 20% = 2000 basis points
      })

      // Governance share
      const governanceShare =
        revenueDistributionChanges.governanceShare ??
        feeRecipients.governanceShare
      if (governanceShare > 0 && indexDTF.stToken) {
        newFeeRecipients.push({
          recipient: indexDTF.stToken.id as Address,
          portion: BigInt(Math.floor(governanceShare * 100)),
        })
      }

      // Deployer share
      const deployerShare =
        revenueDistributionChanges.deployerShare ?? feeRecipients.deployerShare
      if (deployerShare > 0) {
        newFeeRecipients.push({
          recipient: indexDTF.deployer as Address,
          portion: BigInt(Math.floor(deployerShare * 100)),
        })
      }

      // Additional recipients
      const additionalRecipients =
        revenueDistributionChanges.additionalRecipients ??
        feeRecipients.externalRecipients
      if (additionalRecipients && additionalRecipients.length > 0) {
        for (const recipient of additionalRecipients) {
          newFeeRecipients.push({
            recipient: recipient.address as Address,
            portion: BigInt(Math.floor(recipient.share * 100)),
          })
        }
      }

      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbi,
          functionName: 'setFeeRecipients',
          args: [newFeeRecipients],
        })
      )
    }

    return calldatas.length > 0 ? calldatas : undefined
  }
)

export const feeRecipientsAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)

  if (!indexDTF) return undefined

  const externalRecipients: { address: string; share: number }[] = []
  let deployerShare = 0
  let governanceShare = 0
  const PERCENT_ADJUST = 100 / FIXED_PLATFORM_FEE

  for (const recipient of indexDTF.feeRecipients) {
    // Deployer share
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
