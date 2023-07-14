import { CollateralPlugin } from 'types'
import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { aavePluginsAtom } from 'state/rtoken/atoms/pluginAtoms'

export type FormState = {
  [x: string]: {
    value: string
    max: string
    isValid: boolean
  }
}

export const isFormValid = (
  formState: FormState,
  pluginSet = [] as CollateralPlugin[]
) => {
  const aavePlugins = useAtomValue(aavePluginsAtom)

  return useMemo(() => {
    let isValid = false
    let hasInvalid = false

    for (const plugin of pluginSet || aavePlugins) {
      if (formState[plugin.address].value) {
        if (+formState[plugin.address].value > +formState[plugin.address].max) {
          hasInvalid = true
        } else {
          isValid = true
        }
      }
    }

    return isValid && !hasInvalid
  }, [formState, pluginSet, aavePlugins])
}
