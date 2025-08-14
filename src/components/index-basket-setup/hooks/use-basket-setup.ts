import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import {
  activeProposedValuesAtom,
  allocationPercentagesAtom,
  basketItemsAtom,
  basketModeAtom,
  basketPriceMapAtom,
  basketValidationAtom,
  calculatedSharesFromUnitsAtom,
  currentInputTypeAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
  remainingAllocationAtom,
  resetBasketAtomsAtom,
  updateBasketFromTokensAtom,
} from '../atoms'
import { Token } from '@/types'

export const useBasketSetup = () => {
  const basketItems = useAtomValue(basketItemsAtom)
  const basketMode = useAtomValue(basketModeAtom)
  const priceMap = useAtomValue(basketPriceMapAtom)
  const [currentInputType, setCurrentInputType] = useAtom(currentInputTypeAtom)
  const [proposedShares, setProposedShares] = useAtom(proposedSharesAtom)
  const [proposedUnits, setProposedUnits] = useAtom(proposedUnitsAtom)
  const [activeProposedValues, setActiveProposedValues] = useAtom(activeProposedValuesAtom)
  const calculatedShares = useAtomValue(calculatedSharesFromUnitsAtom)
  const allocations = useAtomValue(allocationPercentagesAtom)
  const remainingAllocation = useAtomValue(remainingAllocationAtom)
  const validation = useAtomValue(basketValidationAtom)
  const updateBasketFromTokens = useSetAtom(updateBasketFromTokensAtom)
  const resetBasket = useSetAtom(resetBasketAtomsAtom)

  const updateProposedValue = useCallback((address: string, value: string) => {
    if (currentInputType === 'shares') {
      setProposedShares(prev => ({ ...prev, [address]: value }))
    } else {
      setProposedUnits(prev => ({ ...prev, [address]: value }))
    }
  }, [currentInputType, setProposedShares, setProposedUnits])

  const removeToken = useCallback((address: string) => {
    const tokens = Object.values(basketItems)
      .map(item => item.token)
      .filter(token => token.address.toLowerCase() !== address.toLowerCase())
    updateBasketFromTokens(tokens)
  }, [basketItems, updateBasketFromTokens])

  const addTokens = useCallback((tokens: Token[]) => {
    const existingTokens = Object.values(basketItems).map(item => item.token)
    const allTokens = [...existingTokens, ...tokens]
    
    const uniqueTokens = allTokens.filter((token, index, self) =>
      index === self.findIndex(t => t.address.toLowerCase() === token.address.toLowerCase())
    )
    
    updateBasketFromTokens(uniqueTokens)
  }, [basketItems, updateBasketFromTokens])

  return {
    // State
    basketItems,
    basketMode,
    priceMap,
    currentInputType,
    proposedShares,
    proposedUnits,
    activeProposedValues,
    calculatedShares,
    allocations,
    remainingAllocation,
    validation,
    
    // Actions
    setCurrentInputType,
    updateProposedValue,
    setActiveProposedValues,
    removeToken,
    addTokens,
    resetBasket,
  }
}