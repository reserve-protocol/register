import { atom } from 'jotai'
import { Address } from 'viem'

export type ListedYieldDTF = {
  id: Address
  name: string
  symbol: string
  chainId: number
  logo?: string
}

export const listedYieldDTFsAtom = atom<ListedYieldDTF[]>([])
export const isLoadingAtom = atom<boolean>(false)
