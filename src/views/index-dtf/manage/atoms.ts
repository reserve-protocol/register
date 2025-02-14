import { atom } from 'jotai'
import { Address, Hex } from 'viem'

export const signatureAtom = atom<Record<
  string,
  {
    signature: Hex
    nonce: string
    chainId: number
    address: Address
  }
> | null>(null)
