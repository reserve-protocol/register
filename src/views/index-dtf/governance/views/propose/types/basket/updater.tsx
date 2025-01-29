import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  isProposalConfirmedAtom,
  permissionlessLaunchingAtom,
  priceMapAtom,
  proposedIndexBasketAtom,
  stepAtom,
  tradeRangeOptionAtom,
  tradeVolatilityAtom,
} from './atoms'

const PRICES_BASE_URL = 'https://api.reserve.org/current/prices?tokens='

const tokensUrlAtom = atom((get) => {
  const proposedIndexBasket = get(proposedIndexBasketAtom)

  if (!proposedIndexBasket) return undefined

  return `${PRICES_BASE_URL}${Object.keys(proposedIndexBasket).join(',')}`
})

const BasketPriceUpdater = () => {
  const url = useAtomValue(tokensUrlAtom)
  const setPriceMap = useSetAtom(priceMapAtom)

  const { data: tokenPrices } = useQuery({
    queryKey: ['price-tokens', url],
    queryFn: async () => {
      if (!url) return undefined

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch token prices')
        }
        const data = (await response.json()) as {
          address: string
          price?: number
        }[]

        return data.reduce(
          (acc, token) => {
            acc[token.address] = token.price ?? 0
            return acc
          },
          {} as Record<string, number>
        )
      } catch (error) {
        console.error('Error fetching token prices:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!url,
  })

  useEffect(() => {
    if (tokenPrices) {
      console.log('tokenPrices', tokenPrices)
      setPriceMap(tokenPrices)
    }
  }, [tokenPrices])

  return null
}

const AtomStateUpdater = () => {
  const setStep = useSetAtom(stepAtom)
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setTradeVolatility = useSetAtom(tradeVolatilityAtom)
  const setTradeRangeOption = useSetAtom(tradeRangeOptionAtom)
  const setPermissionlessLaunching = useSetAtom(permissionlessLaunchingAtom)
  const tradeConfirmation = useSetAtom(isProposalConfirmedAtom)

  useEffect(() => {
    return () => {
      setStep('basket')
      // TODO: Currently using mock data!
      // setProposedBasket(undefined)
      setTradeVolatility([])
      setTradeRangeOption(undefined)
      setPermissionlessLaunching(undefined)
      tradeConfirmation(false)
    }
  }, [])

  return null
}

const Updater = () => {
  return (
    <>
      <AtomStateUpdater />
      <BasketPriceUpdater />
    </>
  )
}

export default Updater
