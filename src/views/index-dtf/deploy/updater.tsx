import { useAtom, useAtomValue } from 'jotai'
import { basketAtom } from './atoms'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { useEffect } from 'react'
import { RESERVE_API } from '@/utils/constants'
import { chainIdAtom } from '@/state/atoms'

interface TokenPrice {
  address: Address
  price?: number
}

type IPSResponse =
  | {
      status: 'success'
      result: TokenPrice
    }
  | { status: 'error' }

const PRICES_BASE_URL = `${RESERVE_API}current/prices?tokens=`
const PS_BASE_URL = `${RESERVE_API}api/prices`

const BasketPriceUpdater = () => {
  const chainId = useAtomValue(chainIdAtom)
  const [basket, setBasket] = useAtom(basketAtom)

  const url =
    PRICES_BASE_URL +
    basket.map((token) => token.address).join(',') +
    `&chainId=${chainId}`

  const { data: tokenPrices = [] } = useQuery({
    queryKey: ['price-tokens', url, chainId],
    queryFn: async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch token prices')
        }
        let data = (await response.json()) as TokenPrice[]
        data = await Promise.all(
          data.map(async (tp) => {
            if (tp.price) {
              return tp
            }
            const response = await fetch(
              `${PS_BASE_URL}/${chainId}/${tp.address}`
            )
            if (!response.ok) {
              return tp
            }
            const data = (await response.json()) as IPSResponse
            if (data.status === 'error') {
              return tp
            }
            tp.price = data.result.price
            return tp
          })
        )

        return data
      } catch (error) {
        console.error('Error fetching token prices:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!basket.length,
  })

  useEffect(() => {
    if (tokenPrices.length) {
      const newBasket = basket.map((token) => {
        const price = tokenPrices.find((p) => p.address === token.address)
          ?.price
        return { ...token, price }
      })
      setBasket(newBasket)
    }
  }, [tokenPrices])

  return null
}

const Updater = () => {
  return (
    <>
      <BasketPriceUpdater />
    </>
  )
}

export default Updater
