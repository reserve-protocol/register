import { atom } from 'jotai'
import { AsyncSwapOrderResponse } from './types'

export const asyncSwapResponseAtom = atom<AsyncSwapOrderResponse | undefined>(
  undefined
)
export const asyncSwapOrderIdAtom = atom<string | undefined>(undefined)
