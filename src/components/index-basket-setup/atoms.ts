import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { Token } from '@/types'
import { atom } from 'jotai'
import { formatUnits, parseUnits } from 'viem'

export type BasketInputMode = 'shares' | 'units' | 'both'

export interface BasketItem {
  token: Token
  currentValue: string
  currentShares?: string
  currentUnits?: string
  proposedValue?: string
}

export const basketItemsAtom = atom<Record<string, BasketItem>>({})
export const basketPriceMapAtom = atom<Record<string, number>>({})
export const basketModeAtom = atom<BasketInputMode>('both')
export const currentInputTypeAtom = atom<'shares' | 'units'>('shares')

export const showTokenSelectorAtom = atom(false)
export const csvImportErrorAtom = atom<string | null>(null)

export const proposedSharesAtom = atom<Record<string, string>>({})
export const proposedUnitsAtom = atom<Record<string, string>>({})

export const activeProposedValuesAtom = atom(
  (get) => {
    const inputType = get(currentInputTypeAtom)
    return inputType === 'shares' ? get(proposedSharesAtom) : get(proposedUnitsAtom)
  },
  (get, set, values: Record<string, string>) => {
    const inputType = get(currentInputTypeAtom)
    if (inputType === 'shares') {
      set(proposedSharesAtom, values)
    } else {
      set(proposedUnitsAtom, values)
    }
  }
)

export const calculatedSharesFromUnitsAtom = atom((get) => {
  const proposedUnits = get(proposedUnitsAtom)
  const basketItems = get(basketItemsAtom)
  const priceMap = get(basketPriceMapAtom)

  if (!Object.keys(proposedUnits).length || !Object.keys(basketItems).length) {
    return {}
  }

  try {
    const addresses = Object.keys(basketItems)
    const bals: bigint[] = []
    const decimals: bigint[] = []
    const prices: number[] = []

    for (const address of addresses) {
      const item = basketItems[address]
      const units = proposedUnits[address] || item.currentValue || '0'
      const d = item.token.decimals || 18
      
      try {
        bals.push(parseUnits(units, d))
      } catch {
        bals.push(0n)
      }
      decimals.push(BigInt(d))
      prices.push(priceMap[address.toLowerCase()] || 0)
    }

    const shares = getCurrentBasket(bals, decimals, prices)
    
    return addresses.reduce((acc, address, index) => {
      acc[address] = formatUnits(shares[index], 16)
      return acc
    }, {} as Record<string, string>)
  } catch (e) {
    console.error('Error calculating shares from units:', e)
    return {}
  }
})

export const allocationPercentagesAtom = atom((get) => {
  const inputType = get(currentInputTypeAtom)
  const proposedShares = get(proposedSharesAtom)
  const calculatedShares = get(calculatedSharesFromUnitsAtom)
  
  if (inputType === 'shares') {
    return proposedShares
  } else {
    return calculatedShares
  }
})

export const totalAllocationAtom = atom((get) => {
  const allocations = get(allocationPercentagesAtom)
  return Object.values(allocations).reduce((sum, value) => {
    const num = parseFloat(value) || 0
    return sum + num
  }, 0)
})

export const remainingAllocationAtom = atom((get) => {
  const total = get(totalAllocationAtom)
  return 100 - total
})

export const isValidAllocationAtom = atom((get) => {
  const remaining = get(remainingAllocationAtom)
  return Math.abs(remaining) <= 0.001
})

export const hasValidPricesAtom = atom((get) => {
  const basketItems = get(basketItemsAtom)
  const priceMap = get(basketPriceMapAtom)
  
  return Object.values(basketItems).every(item => {
    const price = priceMap[item.token.address.toLowerCase()]
    return price !== undefined && price > 0
  })
})

export const basketValidationAtom = atom((get) => {
  const isValidAllocation = get(isValidAllocationAtom)
  const hasValidPrices = get(hasValidPricesAtom)
  const basketItems = get(basketItemsAtom)
  const hasItems = Object.keys(basketItems).length > 0
  const mode = get(basketModeAtom)
  const currentInputType = get(currentInputTypeAtom)
  const shouldValidateAllocation = mode === 'shares' || (mode === 'both' && currentInputType === 'shares')
  
  return {
    isValid: hasItems && (!shouldValidateAllocation || isValidAllocation) && hasValidPrices,
    hasItems,
    isValidAllocation,
    hasValidPrices
  }
})

export const resetBasketAtomsAtom = atom(null, (get, set) => {
  set(basketItemsAtom, {})
  set(proposedSharesAtom, {})
  set(proposedUnitsAtom, {})
  set(basketPriceMapAtom, {})
  set(currentInputTypeAtom, 'shares')
  set(showTokenSelectorAtom, false)
  set(csvImportErrorAtom, null)
})

export const updateBasketFromTokensAtom = atom(
  null,
  (get, set, tokens: Token[]) => {
    const currentBasket = get(basketItemsAtom)
    const proposedShares = get(proposedSharesAtom)
    const proposedUnits = get(proposedUnitsAtom)
    
    const newBasket: Record<string, BasketItem> = {}
    
    tokens.forEach(token => {
      const address = token.address.toLowerCase()
      const existing = currentBasket[address]
      
      newBasket[address] = {
        token,
        currentValue: existing?.currentValue || '0',
        proposedValue: existing?.proposedValue
      }
    })
    
    set(basketItemsAtom, newBasket)
    
    const tokenAddresses = new Set(tokens.map(t => t.address.toLowerCase()))
    
    const cleanedShares = Object.entries(proposedShares).reduce((acc, [addr, value]) => {
      if (tokenAddresses.has(addr)) acc[addr] = value
      return acc
    }, {} as Record<string, string>)
    
    const cleanedUnits = Object.entries(proposedUnits).reduce((acc, [addr, value]) => {
      if (tokenAddresses.has(addr)) acc[addr] = value
      return acc
    }, {} as Record<string, string>)
    
    set(proposedSharesAtom, cleanedShares)
    set(proposedUnitsAtom, cleanedUnits)
  }
)
