import { chainIdAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Address } from 'viem'

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

const useIndexDTFCurrentPrice = ({
  address,
}: UseIndexDTFCurrentPriceParams) => {
  const chainId = useAtomValue(chainIdAtom)
  return useQuery({
    queryKey: ['dtf-current-price', address, chainId],
    queryFn: async (): Promise<IndexDTFPrice> => {
      const sp = new URLSearchParams()
      sp.set('chainId', chainId.toString())
      sp.set('address', address?.toLowerCase() ?? '')

      const response = await fetch(
        `${RESERVE_API}current/dtf?${sp.toString()}&chainId=${chainId}`
      )

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
