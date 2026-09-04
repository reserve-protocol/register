import { ChainId } from '@/utils/chains'

// TEMPORARY until the backend serves DTF categories — then delete this file.
export type DTFCategory = 'stocks'

// Equity-backed DTFs: route alias + address per chain, so both URL forms match.
// Drives the stocks-only copy (backed badge, stock FAQ chips).
const STOCKS_DTFS: Record<number, Set<string>> = {
  [ChainId.BSC]: new Set([
    'buildout',
    '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d',
    'power',
    '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51',
    'photon',
    '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb',
    'neocloud',
    '0xf571fe3f0d74521bc7310b111faea931c748f27b',
  ]),
}

export const isStocksDTF = (
  chainId: number | undefined,
  tokenId: string | undefined
): boolean => {
  if (!chainId || !tokenId) return false

  return STOCKS_DTFS[chainId]?.has(tokenId.trim().toLowerCase()) ?? false
}
