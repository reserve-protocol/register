import { ChainId } from '@/utils/chains'
import { NETWORKS, ROUTES } from '@/utils/constants'

// TEMPORARY until the backend serves DTF categories — then delete this file.
export type DTFCategory = 'stocks'

// Route alias + address per chain, so both URL forms match.
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

export const isStocksOverviewPathname = (pathname: string): boolean => {
  const [, chain, section, tokenId, subpage] = pathname.split('/')

  return (
    section === 'index-dtf' &&
    subpage?.toLowerCase() === ROUTES.OVERVIEW &&
    isStocksDTF(NETWORKS[chain ?? ''], tokenId)
  )
}
