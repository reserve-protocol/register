import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

export type SnapshotBasket = {
  price: number
  basket: {
    address: Address
    symbol: string
    decimals: number
    price: number
    weight: string
  }[]
}

const getSnapshotBasket = async (
  indexDTF: string,
  chainId: number,
  block?: number
): Promise<SnapshotBasket> => {
  const route = !!block ? 'snapshot' : 'current'
  const response = await fetch(
    `${RESERVE_API}${route}/dtf?address=${indexDTF}&chainId=${chainId}&blockNumber=${block}`
  )
  return response.json()
}

const useSnapshotBasket = (
  indexDTF?: string,
  chainId?: number,
  block?: number
) => {
  return useQuery({
    queryKey: ['snapshot-basket', indexDTF, chainId, block],
    queryFn: () =>
      indexDTF && chainId
        ? getSnapshotBasket(indexDTF, chainId, block)
        : undefined,
    enabled: !!indexDTF && !!chainId,
  })
}

export default useSnapshotBasket
