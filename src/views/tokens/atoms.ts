import { atom } from 'jotai'
import { _atomWithDebounce } from 'utils/atoms/atomWithDebounce'
import { ChainId } from 'utils/chains'
import { LISTED_RTOKEN_ADDRESSES } from 'utils/constants'

export const defaultSort = {
  id: 'token__totalSupply',
  desc: true,
}
export const debouncedSearchInputAtom = _atomWithDebounce('')
export const chainFilterAtom = atom(0)
export const recordLimitAtom = atom(50)
export const sortByAtom = atom<{ id: string; desc: boolean } | null>(
  defaultSort
)

export const tokenFilterAtom = atom((get) => {
  const search = get(debouncedSearchInputAtom.debouncedValueAtom)
  const limit = get(recordLimitAtom)
  const chain = get(chainFilterAtom)
  const { id, desc } = get(sortByAtom) ?? defaultSort

  return {
    [ChainId.Mainnet]: {
      search,
      listed: LISTED_RTOKEN_ADDRESSES[ChainId.Mainnet].map((addr) =>
        addr.toLowerCase()
      ),
      limit,
      by: id,
      direction: desc ? 'desc' : 'asc',
    },
    [ChainId.Base]: {
      search,
      listed: LISTED_RTOKEN_ADDRESSES[ChainId.Base].map((addr) =>
        addr.toLowerCase()
      ),
      limit,
      by: id,
      direction: desc ? 'desc' : 'asc',
    },
    _chain: chain,
  }
})
