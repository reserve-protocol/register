import { Address } from 'viem'
import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

type IndexDTFPrice = {
  price: number
  basket: {
    address: Address
    amount: number
    decimals: number
    price: number
  }[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

export type UseIndexDTFCurrentPriceParams = {
  address?: Address
}

const useIndexDTFCurrentPrice = ({ address }: UseIndexDTFCurrentPriceParams) => {
  return useQuery({
    queryKey: ['dtf-current-price', address],
    queryFn: async (): Promise<IndexDTFPrice> => {
      const sp = new URLSearchParams()
      sp.set('chainId', ChainId.Base.toString())
      sp.set('address', address?.toLowerCase() ?? '')

      const response = await fetch(`${RESERVE_API}current/dtf?${sp.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dtf price history')
      }

      return (await response.json()) as IndexDTFPrice
    },
    enabled: Boolean(address),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFCurrentPrice
