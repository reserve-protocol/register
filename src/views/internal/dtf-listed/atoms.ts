import { atom } from 'jotai'
import { Address } from 'viem'

export type ListedDTFGovernance = {
  id: Address
  name: string
  symbol: string
  chainId: number
  icon?: string
  marketCap: number
  tradingGovernance?: Address
  tradingTimelock?: Address
  ownerGovernance?: Address
  ownerTimelock?: Address
}

export const listedDTFsAtom = atom<ListedDTFGovernance[]>([])
export const isLoadingAtom = atom<boolean>(true)
