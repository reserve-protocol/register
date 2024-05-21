import { atom } from 'jotai'
import { _atomWithDebounce } from 'utils/atoms/atomWithDebounce'
import { supportedChainList } from 'utils/constants'

interface IFilters {
  chains: string[]
  tokens: string[] // empty => all
  type: string[]
}

export const defaultSort = {
  id: 'timestamp',
  desc: true,
}
export const sortByAtom = atom<{ id: string; desc: boolean } | null>(
  defaultSort
)

export const debouncedWalletInputAtom = _atomWithDebounce('')

export const ENTRY_TYPES = {
  TRANSFER: 'TRANSFER',
  ISSUE: 'ISSUE',
  REDEEM: 'REDEEM',
  CLAIM: 'CLAIM',
  STAKE: 'STAKE',
  UNSTAKE: 'UNSTAKE',
  UNSTAKE_CANCELLED: 'UNSTAKE_CANCELLED',
  WITHDRAW: 'WITHDRAW',
  BURN: 'BURN',
  MINT: 'MINT',
}

export const entryTypes = {
  MINT: `Mint`,
  REDEEM: `Redeem`,
  TRANSFER: `Transfer`,
  BURN: `Melt`,
  ISSUE: `Issue`,
  CLAIM: `Claim`,
  STAKE: `Stake`,
  UNSTAKE: `Unstake`,
  WITHDRAW: `Withdraw`,
  UNSTAKE_CANCELLED: `Unstake Cancelled`,
}

export const filtersAtom = atom<IFilters>({
  chains: supportedChainList.map((chain) => chain.toString()),
  tokens: [],
  type: Object.values(ENTRY_TYPES).filter(
    (type) => type !== ENTRY_TYPES.TRANSFER
  ),
})
