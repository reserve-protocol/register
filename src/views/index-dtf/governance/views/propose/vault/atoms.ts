import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { isAddress } from '@/utils'
import { atom } from 'jotai'
import { encodeFunctionData, Hex } from 'viem'

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

export const isProposalValidAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const newRewardTokens = get(newRewardTokenAtom)
  const proposedRewardTokens = get(proposedRewardTokensAtom)
  const tokenValidationStatus = get(tokenValidationStatusAtom)

  if (!indexDTF || !proposedRewardTokens) return false

  // Check if all new tokens are valid ERC20 tokens
  const allNewTokensValid =
    !newRewardTokens.length ||
    newRewardTokens.every((token) =>
      isTokenAddressValidAndVerified(token.address, tokenValidationStatus)
    )

  // Check if there's at least one valid new token added
  const hasNewValidTokenAdded = newRewardTokens.some((token) =>
    isTokenAddressValidAndVerified(token.address, tokenValidationStatus)
  )

  // Check if any token was removed from the original list
  const originalRewardTokens = indexDTF.stToken?.rewardTokens || []
  const hasTokenRemoved = originalRewardTokens.some(
    (originalToken) =>
      !proposedRewardTokens.some(
        (proposedToken) =>
          proposedToken.address.toLowerCase() ===
          originalToken.address.toLowerCase()
      )
  )

  // Proposal is valid if:
  // 1. All new tokens are valid ERC20 contracts AND
  // 2. There is either a valid new token added OR a token was removed
  return allNewTokensValid && (hasNewValidTokenAdded || hasTokenRemoved)
})
