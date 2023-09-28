import { atom } from 'jotai'

export const isBridgeWrappingAtom = atom(true)
export const bridgeTokenAtom = atom<string>('') // undefined === ETH
