import { ChainId } from '@/utils/chains'

// Uniswap v4 singleton PoolManager — custodies every v4 pool's funds, so any
// pool swap of the DTF token surfaces as an ERC20 transfer from (buy) or to
// (sell) this address in the dtf-index subgraph.
export const UNISWAP_V4_POOL_MANAGER: Record<number, string> = {
  [ChainId.BSC]: '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df',
}

// AI DTFs with a Uniswap v4 DTF/USDT pool (fee 3000, tickSpacing 60, hook
// 0x38358b924CB329dC428650F91309dfbDdf974080). Deliberately independent from
// the zapper's locked-settings list — unrelated concerns that may diverge.
const UNI_V4_POOL_DTFS: { address: string; chainId: number }[] = [
  // PHOTON
  { address: '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb', chainId: ChainId.BSC },
  // BUILDOUT
  { address: '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d', chainId: ChainId.BSC },
  // ROBOTS
  { address: '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247', chainId: ChainId.BSC },
  // POWER
  { address: '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51', chainId: ChainId.BSC },
  // NEOCLOUD
  { address: '0xf571fe3f0d74521bc7310b111faea931c748f27b', chainId: ChainId.BSC },
]

export const hasUniV4PoolSwaps = (address?: string, chainId?: number) => {
  if (!address || !chainId) return false

  const lower = address.toLowerCase()
  return UNI_V4_POOL_DTFS.some(
    (dtf) => dtf.address === lower && dtf.chainId === chainId
  )
}
