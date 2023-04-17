import { useMemo } from 'react'
import { aavePlugins } from 'utils/plugins'

export type FormState = {
  [x: string]: {
    value: string
    max: number
    isValid: boolean
  }
}

export const isFormValid = (formState: FormState, pluginSet = aavePlugins) => {
  const isValid = useMemo(() => {
    let isValid = false
    let hasInvalid = false

    for (const plugin of pluginSet) {
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
