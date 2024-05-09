import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { poolsAtom } from 'state/pools/atoms'
import { NETWORKS, capitalize, supportedChainList } from 'utils/constants'

export const poolSearchFilterAtom = atom('')
export const poolChainsFilterAtom = atom(supportedChainList.map((chain) => chain.toString()))

export const poolFilterAtom = atomWithReset<{
  stables: boolean
  tokens: string[]
}>({
  stables: false,
  tokens: [],
})

export const filterOptionAtom = atom(0)

export const filteredPoolsAtom = atom((get) => {
  const pools = get(poolsAtom)
  const search = get(poolSearchFilterAtom).trim().toLowerCase()
  const filters = get(poolFilterAtom)
  const chains = get(poolChainsFilterAtom)

  return pools.filter((pool) => {
    if (!chains.length || !chains.includes(NETWORKS[pool.chain.toLowerCase()].toString())) {
      return false
    }

    if (filters.stables && !pool.stablecoin) {
      return false
    }

    if (filters.tokens.length) {
      const tokenSet = new Set(filters.tokens)

      if (!pool.underlyingTokens.find((token) => tokenSet.has(token.address))) {
        return false
      }
    }

    if (search) {
      return (
        pool.symbol.toLowerCase().includes(search) ||
        pool.project.includes(search)
      )
    }

    return true
  })
})
