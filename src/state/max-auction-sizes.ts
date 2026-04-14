import { atom } from 'jotai'

// Default max auction size per token in USD
export const DEFAULT_MAX_AUCTION_SIZE_USD = 1_000_000

// Map of token address (lowercase) -> max auction size in USD
export const maxAuctionSizesAtom = atom<Record<string, number>>({})

// Action atom to set max auction size for a specific token
export const setMaxAuctionSizeAtom = atom(
  null,
  (get, set, { tokenAddress, size }: { tokenAddress: string; size: number }) => {
    const current = get(maxAuctionSizesAtom)
    set(maxAuctionSizesAtom, {
      ...current,
      [tokenAddress.toLowerCase()]: size,
    })
  }
)

// Action atom to reset all max auction sizes
export const resetMaxAuctionSizesAtom = atom(null, (get, set) => {
  set(maxAuctionSizesAtom, {})
})
