import TokenSelectorDrawer, {
  TokenDrawerTrigger,
} from '@/components/token-selector-drawer'
import { Token } from '@/types'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Address } from 'viem'
import {
  IndexAssetShares,
  proposedIndexBasketAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
} from '../../atoms'

// TODO: Handle with address checksum vs lowercase format
const setNewBasketAtom = atom(null, (get, set, _tokens: Token[]) => {
  const proposedShareMap = get(proposedSharesAtom)
  const proposedUnitsMap = get(proposedUnitsAtom)
  const proposedIndexBasket = get(proposedIndexBasketAtom) || {}
  const newProposedIndexBasket: Record<string, IndexAssetShares> = {}
  const newProposedShares: Record<string, string> = {}
  const newProposedUnits: Record<string, string> = {}
  // Make sure addresses are lowercase
  const tokens = _tokens.map((token) => ({
    ...token,
    address: token.address.toLowerCase() as Address,
  }))

  // Create a map of tokens
  const tokenMap = tokens.reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {} as Record<string, Token>
  )

  // Get unit string array of token addresses + proposedIndexBasket keys
  const tokenAddresses = new Set([
    ...Object.keys(proposedIndexBasket),
    ...Object.keys(tokenMap),
  ])

  for (const tokenAddress of tokenAddresses) {
    const token =
      tokenMap[tokenAddress] || proposedIndexBasket[tokenAddress].token
    const currentShares =
      proposedIndexBasket[tokenAddress]?.currentShares ?? '0'
    const currentUnits = proposedIndexBasket[tokenAddress]?.currentUnits ?? '0'

    // Keep all assets on the basket, removed assets just adjust proposed shares
    newProposedIndexBasket[tokenAddress] = {
      token,
      currentShares,
      currentUnits,
    }

    // If asset was removed, set proposed shares to 0
    newProposedShares[tokenAddress] = tokenMap[tokenAddress]
      ? (proposedShareMap[tokenAddress] ?? '0')
      : '0'
    newProposedUnits[tokenAddress] = tokenMap[tokenAddress]
      ? (proposedUnitsMap[tokenAddress] ?? '0')
      : '0'
  }

  set(proposedIndexBasketAtom, newProposedIndexBasket)
  set(proposedSharesAtom, newProposedShares)
  set(proposedUnitsAtom, newProposedUnits)
})

const currentProposedBasketTokensAtom = atom((get) => {
  const proposedIndexBasket = get(proposedIndexBasketAtom)
  return Object.values(proposedIndexBasket || {}).map((asset) => asset.token)
})

const TokenSelector = () => {
  const setNewBasket = useSetAtom(setNewBasketAtom)
  const currentProposedBasketTokens = useAtomValue(
    currentProposedBasketTokensAtom
  )

  return (
    <TokenSelectorDrawer
      selectedTokens={currentProposedBasketTokens}
      onAdd={setNewBasket}
    >
      <TokenDrawerTrigger />
    </TokenSelectorDrawer>
  )
}

export default TokenSelector
