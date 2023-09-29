import { atom } from 'jotai'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'

export const isBridgeWrappingAtom = atom(true)
export const bridgeTokenAtom = atom('0') // 0 => index for eth

export const bridgeAmountAtom = atom('')
export const bridgeAmountDebouncedAtom = atomWithDebounce(
  atom((get) => get(bridgeAmountAtom)),
  500
).debouncedValueAtom

export const isValidBridgeAmountAtom = atom(false)
