import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { fetchRebalanceLiquidity } from '@/utils/rebalance-liquidity'
import { rebalanceTokenMapAtom } from '../atoms'
import { OndoLimit } from '../utils/get-max-safe-percent'

export type OndoLimits = Record<string, OndoLimit & { symbol: string }>

const EMPTY: OndoLimits = {}

// Each rebalance token's Ondo session cap + tradeability, keyed only on the token
// set so it stays stable as the rebalance percent moves (capacityUsd/tradingOpen
// don't depend on trade size). POSTing price 0 makes non-Ondo tokens short-circuit
// server-side (no Zapper sim) — we only read the Ondo blocks.
const useOndoLimits = (): OndoLimits => {
  const chainId = useAtomValue(chainIdAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)

  const addresses = useMemo(() => Object.keys(tokenMap).sort(), [tokenMap])

  const { data } = useQuery<OndoLimits>({
    queryKey: ['ondo-limits', chainId, addresses],
    queryFn: async () => {
      const trades = addresses.map((address) => ({
        address,
        side: 'sell' as const,
        amountUsd: 0,
        price: 0,
        decimals: tokenMap[address]?.decimals ?? 18,
      }))
      const res = await fetchRebalanceLiquidity(chainId, 0, trades)
      const limits: OndoLimits = {}
      for (const asset of res.assets) {
        if (asset.ondo) {
          limits[asset.address.toLowerCase()] = {
            symbol: asset.ondo.symbol,
            capacityUsd: asset.ondo.capacityUsd,
            tradingOpen: asset.ondo.tradingOpen,
          }
        }
      }
      return limits
    },
    enabled: !!chainId && addresses.length > 0,
    staleTime: 60_000,
  })

  return data ?? EMPTY
}

export default useOndoLimits
