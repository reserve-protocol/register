import { useERC20Balances } from '@/hooks/useERC20Balance'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address } from 'viem'
import { useFolioDetails } from '../../async-swaps/hooks/useFolioDetails'
import {
  folioDetailsAtom,
  mintSharesAtom,
  tokenPricesAtom,
  walletBalancesAtom,
} from '../atoms'

// Re-export so existing test imports keep working
export { calculateCollateralAllocation } from '../utils'

// ─── Updater hook: fetches balances + prices + folio details ──────────
// NOTE: Must be mounted for walletBalancesAtom/tokenPricesAtom/folioDetailsAtom to have data
export function useAllocationData() {
  const chainId = useAtomValue(chainIdAtom)
  const mintShares = useAtomValue(mintSharesAtom)
  const wallet = useAtomValue(walletAtom)
  const setWalletBalances = useSetAtom(walletBalancesAtom)
  const setTokenPrices = useSetAtom(tokenPricesAtom)
  const setFolioDetails = useSetAtom(folioDetailsAtom)

  const folioResult = useFolioDetails({
    shares: mintShares > 0n ? mintShares : undefined,
  })
  const folioData = folioResult.data
  const isFolioLoading = 'isLoading' in folioResult ? (folioResult as any).isLoading : false

  const { data: balanceData, isLoading: isBalanceLoading } = useERC20Balances(
    (folioData?.assets || []).map((address) => ({
      address,
      chainId,
    }))
  )

  // Sync folio details to atom
  useEffect(() => {
    if (folioData?.assets?.length) {
      setFolioDetails({
        assets: [...folioData.assets],
        mintValues: [...folioData.mintValues],
      })
    }
  }, [folioData, setFolioDetails])

  // Sync balances to atom
  useEffect(() => {
    if (!folioData?.assets || !balanceData) return
    const balances: Record<Address, bigint> = {}
    folioData.assets.forEach((asset, i) => {
      balances[asset.toLowerCase() as Address] =
        (balanceData as bigint[])?.[i] ?? 0n
    })
    setWalletBalances(balances)
  }, [folioData?.assets, balanceData, setWalletBalances])

  // Batch price fetch with 30s auto-refresh
  const assetAddresses = (folioData?.assets || []).map(String)
  const { data: priceData } = useQuery({
    queryKey: ['async-mint/prices', chainId, assetAddresses.join(',')],
    queryFn: async () => {
      const url = `${RESERVE_API}current/prices?chainId=${chainId}&tokens=${assetAddresses.join(',')}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Price fetch failed')
      const data = await res.json()
      if (data?.statusCode) throw new Error(data.message)
      return data as { address: Address; price?: number }[]
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 2,
    enabled: assetAddresses.length > 0 && !!chainId,
  })

  useEffect(() => {
    if (!priceData?.length) return
    const prices: Record<Address, number> = {}
    for (const p of priceData) {
      if (p.price !== undefined) prices[p.address.toLowerCase() as Address] = p.price
    }
    setTokenPrices(prices)
  }, [priceData, setTokenPrices])

  return {
    isLoading: isFolioLoading || isBalanceLoading,
    folioDetails: folioData,
  }
}
