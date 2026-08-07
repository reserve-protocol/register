import { ChainId } from '@/utils/chains'
import { NETWORKS, ROUTES } from '@/utils/constants'

// TEMPORARY: DTF categories are hardcoded until the backend serves category
// metadata (expected alongside the catalog/brand data). Once that lands,
// delete this file and read the category from the DTF record instead.
export type DTFCategory = 'stocks'

// DTFs composed of on-chain (tokenized) stocks. Keyed by chainId; values hold
// both the route alias (lowercased symbol) and the DTF address so category
// checks match either URL form
// (/bsc/index-dtf/buildout and /bsc/index-dtf/0xd7ce...).
const STOCKS_DTFS: Record<number, Set<string>> = {
  [ChainId.BSC]: new Set([
    'buildout',
    '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d',
  ]),
}

export const isStocksDTF = (
  chainId: number | undefined,
  tokenId: string | undefined
): boolean => {
  if (!chainId || !tokenId) return false

  return STOCKS_DTFS[chainId]?.has(tokenId.trim().toLowerCase()) ?? false
}

// For consumers outside the route tree (e.g. the global chat mount in
// Layout) that only have a pathname: /:chain/index-dtf/:tokenId/overview.
export const isStocksOverviewPathname = (pathname: string): boolean => {
  const [, chain, section, tokenId, subpage] = pathname.split('/')

  return (
    section === 'index-dtf' &&
    subpage?.toLowerCase() === ROUTES.OVERVIEW &&
    isStocksDTF(NETWORKS[chain ?? ''], tokenId)
  )
}
