import { useSetAtom } from 'jotai'
import React, { useEffect } from 'react'
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
}

interface BasketSetupProviderProps {
  config?: BasketSetupConfig
  children: React.ReactNode
}

export const BasketSetupProvider = ({ config, children }: BasketSetupProviderProps) => {
  const setBasketItems = useSetAtom(basketItemsAtom)
  const setBasketMode = useSetAtom(basketModeAtom)
  const setBasketPriceMap = useSetAtom(basketPriceMapAtom)
  const setCurrentInputType = useSetAtom(currentInputTypeAtom)
  const setProposedShares = useSetAtom(proposedSharesAtom)
  const setProposedUnits = useSetAtom(proposedUnitsAtom)
  const resetBasket = useSetAtom(resetBasketAtomsAtom)

  useEffect(() => {
    if (config?.initialBasket) {
      setBasketItems(config.initialBasket)
      
      const shares: Record<string, string> = {}
      const units: Record<string, string> = {}
      
      Object.entries(config.initialBasket).forEach(([address, item]) => {
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
      if (config.mode === 'units') {
        setCurrentInputType('units')
      } else if (config.mode === 'shares') {
        setCurrentInputType('shares')
      }
    }
  }, [config])

  useEffect(() => {
    return () => {
      resetBasket()
    }
  }, [resetBasket])

  return <>{children}</>
}
