import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { atom } from 'jotai'
import { encodeFunctionData, Hex } from 'viem'

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
      Number(shares[token.address]) <= 0.1
  )
})

export const isProposalValidAtom = atom((get) => {
  const removedBasketTokens = get(removedBasketTokensAtom)
  return removedBasketTokens.length > 0
})

export const isProposalConfirmedAtom = atom(false)

export const proposalDescriptionAtom = atom<string | undefined>(undefined)

export const dtfSettingsProposalCalldatasAtom = atom<Hex[] | undefined>(
  (get) => {
    const isConfirmed = get(isProposalConfirmedAtom)
    const indexDTF = get(indexDTFAtom)
    const removedBasketTokens = get(removedBasketTokensAtom)

    if (!isConfirmed || !indexDTF || !removedBasketTokens.length)
      return undefined

    const calldatas: Hex[] = []

    for (const token of removedBasketTokens) {
      calldatas.push(
        encodeFunctionData({
          abi: dtfIndexAbiV2,
          functionName: 'removeFromBasket',
          args: [token.address],
        })
      )
    }

    return calldatas
  }
)
