import { useAtom } from 'jotai'
import { basketAtom } from './atoms'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { useEffect } from 'react'

interface TokenPrice {
  address: Address
  price?: number
}

const BasketPriceUpdater = () => {
  const [basket, setBasket] = useAtom(basketAtom)

  // /current/prices?tokens=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452

  const baseURL =
    'http://reserve-api-base-alb-979856128.us-east-1.elb.amazonaws.com/current/prices?tokens='
  const url = baseURL + basket.map((token) => token.address).join(',')
  const { data: tokenPrices = [] } = useQuery({
    queryKey: ['price-tokens'],
    queryFn: async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch token prices')
        }
        const data = await response.json()
        return data as TokenPrice[]
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
        const price = tokenPrices.find(
          (p) => p.address === token.address
        )?.price
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
