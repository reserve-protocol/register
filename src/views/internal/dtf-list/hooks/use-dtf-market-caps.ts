import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { InternalDTF } from './use-internal-dtf-list'

type MarketCapData = {
  [key: string]: number // key is `${chainId}-${address.toLowerCase()}`
}

const fetchDTFPrice = async (address: string, chainId: number) => {
  try {
    const response = await fetch(
      `${RESERVE_API}current/dtf?address=${address}&chainId=${chainId}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch DTF price')
    }
    
    const data = await response.json()
    return data.price || 0
  } catch (error) {
    console.error(`Failed to fetch price for DTF ${address}:`, error)
    return 0
  }
}

const calculateMarketCaps = async (dtfs: InternalDTF[]) => {
  const marketCaps: MarketCapData = {}
  
  // Fetch prices for all DTFs in parallel
  const pricePromises = dtfs.map(async (dtf) => {
    const price = await fetchDTFPrice(dtf.id, dtf.chainId)
    
    if (price > 0 && dtf.token.totalSupply) {
      // Calculate market cap: supply * price
      const supply = Number(formatEther(BigInt(dtf.token.totalSupply)))
      const marketCap = supply * price
      
      const key = `${dtf.chainId}-${dtf.id.toLowerCase()}`
      marketCaps[key] = marketCap
    }
  })
  
  await Promise.all(pricePromises)
  
  return marketCaps
}

export const useDTFMarketCaps = (dtfs: InternalDTF[]) => {
  return useQuery({
    queryKey: ['dtf-market-caps', dtfs.map(d => `${d.chainId}-${d.id}`).join(',')],
    queryFn: async () => {
      if (dtfs.length === 0) return {}
      
      return await calculateMarketCaps(dtfs)
    },
    enabled: dtfs.length > 0,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  })
}