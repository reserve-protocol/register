import { formatEther } from '@ethersproject/units'
import { Facade } from 'abis/types'
import { useFacadeContract } from 'hooks/useContract'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { COINGECKO_API } from 'utils/constants'
import useRToken from './useRToken'

const priceAtom = atom(0)

/**
 * Fetch token price, in case of rTokens use the calculated price by the protocol otherwise coingecko
 *
 * @param tokenAddress
 * @param isRToken
 * @returns tokenPrice<numbeR>
 */
const useRTokenPrice = (): number => {
  const [price, setPrice] = useAtom(priceAtom)
  const contract = useFacadeContract()
  const rToken = useRToken()

  const getTokenPrice = useCallback(
    async (facadeContract: Facade, rTokenAddress: string) => {
      try {
        const { low, high } = await facadeContract.price(rTokenAddress)
        setPrice((+formatEther(low) + +formatEther(high)) / 2)
      } catch (e) {
        console.warn('Error getting token price', e)
      }
    },
    []
  )

  const getRSVPrice = useCallback(async (address: string) => {
    try {
      const result = await fetch(
        `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`
      ).then((res) => res.json())
      setPrice(result[address.toLowerCase()]?.usd ?? 0)
    } catch (e) {
      console.error('Error fetching RSV price', e)
    }
  }, [])

  // TODO: should price be fetched block by block?
  useEffect(() => {
    if (rToken?.address && contract && !rToken.isRSV) {
      getTokenPrice(contract, rToken.address)
    } else if (rToken?.isRSV) {
      getRSVPrice(rToken.address)
    }
  }, [rToken?.address, contract])

  return price
}

export default useRTokenPrice
