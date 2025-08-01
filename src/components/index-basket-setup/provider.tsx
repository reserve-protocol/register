import { Provider, useSetAtom } from 'jotai'
import React, { createContext, useContext, useEffect } from 'react'
import {
  BasketInputMode,
  BasketItem,
  basketItemsAtom,
  basketModeAtom,
  basketPriceMapAtom,
  currentInputTypeAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
  resetBasketAtomsAtom,
} from './atoms'

export interface BasketSetupConfig {
  mode?: BasketInputMode
  initialBasket?: Record<string, BasketItem>
  priceMap?: Record<string, number>
  onBasketChange?: (basket: Record<string, BasketItem>) => void
}

interface BasketSetupContextValue {
  config: BasketSetupConfig
}

const BasketSetupContext = createContext<BasketSetupContextValue | null>(null)

export const useBasketSetupContext = () => {
  const context = useContext(BasketSetupContext)
  if (!context) {
    throw new Error('useBasketSetupContext must be used within BasketSetupProvider')
  }
  return context
}

interface BasketSetupProviderProps {
  config?: BasketSetupConfig
  children: React.ReactNode
}

const InnerProvider = ({ config, children }: BasketSetupProviderProps) => {
  const setBasketItems = useSetAtom(basketItemsAtom)
  const setBasketMode = useSetAtom(basketModeAtom)
  const setBasketPriceMap = useSetAtom(basketPriceMapAtom)
  const setCurrentInputType = useSetAtom(currentInputTypeAtom)
  const setProposedShares = useSetAtom(proposedSharesAtom)
  const setProposedUnits = useSetAtom(proposedUnitsAtom)
  const resetBasket = useSetAtom(resetBasketAtomsAtom)

  // Initialize from config
  useEffect(() => {
    if (config?.initialBasket) {
      setBasketItems(config.initialBasket)
      
      // Initialize proposed values from initial basket
      const shares: Record<string, string> = {}
      const units: Record<string, string> = {}
      
      Object.entries(config.initialBasket).forEach(([address, item]) => {
        // Assume currentValue is in the format we're currently using
        if (config.mode === 'shares' || config.mode === 'both') {
          shares[address] = item.currentValue
        }
        if (config.mode === 'units' || config.mode === 'both') {
          units[address] = item.currentValue
        }
      })
      
      if (Object.keys(shares).length > 0) setProposedShares(shares)
      if (Object.keys(units).length > 0) setProposedUnits(units)
    }

    if (config?.priceMap) {
      setBasketPriceMap(config.priceMap)
    }

    if (config?.mode) {
      setBasketMode(config.mode)
      // Set initial input type based on mode
      if (config.mode === 'units') {
        setCurrentInputType('units')
      } else if (config.mode === 'shares') {
        setCurrentInputType('shares')
      }
    }
  }, [config])

  // Reset on unmount
  useEffect(() => {
    return () => {
      resetBasket()
    }
  }, [resetBasket])

  const contextValue: BasketSetupContextValue = {
    config: config || {}
  }

  return (
    <BasketSetupContext.Provider value={contextValue}>
      {children}
    </BasketSetupContext.Provider>
  )
}

export const BasketSetupProvider = ({ config, children }: BasketSetupProviderProps) => {
  return (
    <Provider>
      <InnerProvider config={config}>
        {children}
      </InnerProvider>
    </Provider>
  )
}