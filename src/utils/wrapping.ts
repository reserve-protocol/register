import { useMemo } from 'react'
import collateralPlugins from 'utils/plugins'
import { STAKE_AAVE_ADDRESS } from './addresses'
import { CHAIN_ID } from './chains'

export type FormState = {
  [x: string]: {
    value: string
    max: number
    isValid: boolean
  }
}

export const aavePlugins = collateralPlugins.filter(
  (p) => p.rewardToken === STAKE_AAVE_ADDRESS[CHAIN_ID]
)

export const isFormValid = (formState: FormState) => {
  const isValid = useMemo(() => {
    let isValid = false
    let hasInvalid = false

    for (const plugin of aavePlugins) {
      if (formState[plugin.address].value) {
        if (+formState[plugin.address].value > formState[plugin.address].max) {
          hasInvalid = true
        } else {
          isValid = true
        }
      }
    }

    return isValid && !hasInvalid
  }, [formState])

  return isValid
}
