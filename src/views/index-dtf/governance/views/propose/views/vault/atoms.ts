import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
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

export const vaultProposalCalldatasAtom = atom<Hex[] | undefined>((get) => {
  const isConfirmed = get(isProposalConfirmedAtom)
  const indexDTF = get(indexDTFAtom)
  const addedRewardTokens = get(addedRewardTokensAtom)
  const removedRewardTokens = get(removedRewardTokensAtom)

  if (!isConfirmed || !indexDTF) return undefined

  const calldatas: Hex[] = []

  for (const token of removedRewardTokens) {
    calldatas.push(
      encodeFunctionData({
        abi: dtfIndexStakingVaultAbi,
        functionName: 'removeRewardToken',
        args: [token.address],
      })
    )
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
  }

  return calldatas
})
