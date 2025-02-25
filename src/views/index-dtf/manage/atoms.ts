import { atom } from 'jotai'
import { Hex } from 'viem'

export const signatureAtom = atom<Record<
  string,
  {
    signature: Hex
    message: string
  }
> | null>(null)
