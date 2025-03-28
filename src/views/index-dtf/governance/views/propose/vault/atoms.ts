import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { isAddress } from '@/utils'
import { atom } from 'jotai'
import { encodeFunctionData, Hex } from 'viem'

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

  if (
    (addedRewardTokens.length && isAddedRewardsTokenValid) ||
    removedRewardTokens.length
  ) {
    return true
  }

  return false
})

export const isProposalConfirmedAtom = atom(false)
export const proposedRewardTokensAtom = atom<Token[] | undefined>(undefined)
export const newRewardTokenAtom = atom<{ id: string; address: string }[]>([])
export const tokenValidationStatusAtom = atom<Record<string, boolean>>({})
export const proposalDescriptionAtom = atom<string | undefined>(undefined)

export const vaultProposalCalldatasAtom = atom<Hex[] | undefined>((get) => {
  const isConfirmed = get(isProposalConfirmedAtom)
  const indexDTF = get(indexDTFAtom)
  const proposedRewardTokens = get(proposedRewardTokensAtom)

  if (!isConfirmed || !indexDTF || !proposedRewardTokens) return undefined

  const calldatas: Hex[] = []

  const removedRewardTokens =
    indexDTF.stToken?.rewardTokens.filter(
      (token) => !proposedRewardTokens.some((t) => t.address === token.address)
    ) || []
  const newRewardTokens = get(newRewardTokenAtom)

  for (const token of removedRewardTokens) {
    calldatas.push(
      encodeFunctionData({
        abi: dtfIndexStakingVaultAbi,
        functionName: 'removeRewardToken',
        args: [token.address],
      })
    )
  }

  for (const token of newRewardTokens) {
    calldatas.push(
      encodeFunctionData({
        abi: dtfIndexStakingVaultAbi,
        functionName: 'addRewardToken',
        args: [token.address as `0x${string}`],
      })
    )
  }

  return calldatas
})

// Extracted helper derivation for improved readability
const isTokenAddressValidAndVerified = (
  tokenAddress: string,
  validationStatus: Record<string, boolean>
): boolean => {
  // Must have valid address format
  if (!isAddress(tokenAddress)) return false

  // If valid format, check on-chain validation result
  const addressLower = tokenAddress.toLowerCase()
  return validationStatus[addressLower] === true
}

// export const isProposalValidAtom = atom((get) => {
//   const indexDTF = get(indexDTFAtom)
//   const newRewardTokens = get(newRewardTokenAtom)
//   const proposedRewardTokens = get(proposedRewardTokensAtom)
//   const tokenValidationStatus = get(tokenValidationStatusAtom)

//   if (!indexDTF || !proposedRewardTokens) return false

//   // Check if all new tokens are valid ERC20 tokens
//   const allNewTokensValid =
//     !newRewardTokens.length ||
//     newRewardTokens.every((token) =>
//       isTokenAddressValidAndVerified(token.address, tokenValidationStatus)
//     )

//   // Check if there's at least one valid new token added
//   const hasNewValidTokenAdded = newRewardTokens.some((token) =>
//     isTokenAddressValidAndVerified(token.address, tokenValidationStatus)
//   )

//   // Check if any token was removed from the original list
//   const originalRewardTokens = indexDTF.stToken?.rewardTokens || []
//   const hasTokenRemoved = originalRewardTokens.some(
//     (originalToken) =>
//       !proposedRewardTokens.some(
//         (proposedToken) =>
//           proposedToken.address.toLowerCase() ===
//           originalToken.address.toLowerCase()
//       )
//   )

//   // Proposal is valid if:
//   // 1. All new tokens are valid ERC20 contracts AND
//   // 2. There is either a valid new token added OR a token was removed
//   return allNewTokensValid && (hasNewValidTokenAdded || hasTokenRemoved)
// })
