import { formatEther } from '@ethersproject/units'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { COINGECKO_API } from 'utils/constants'
import { useRTokenContract } from './useContract'

const priceAtom = atom(0)

/**
 * Fetch token price, in case of rTokens use the calculated price by the protocol otherwise coingecko
 *
 * @param tokenAddress
 * @param isRToken
 * @returns tokenPrice<numbeR>
 */
const useRTokenPrice = (tokenAddress: string, isRToken = false): number => {
  const [price, setPrice] = useAtom(priceAtom)
  const contract = useRTokenContract(tokenAddress)

  const getTokenPrice = useCallback(async () => {
    try {
      let newPrice = 0
      // TODO:
      // if (isRToken && contract) {
      //   const result = await contract?.price()
      //   newPrice = +formatEther(result)
      // } else {
      //   const result = await fetch(
      //     `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`
      //   ).then((res) => res.json())
      //   newPrice = result[tokenAddress.toLowerCase()]?.usd ?? 0
      // }

      setPrice(newPrice)
    } catch (e) {
      console.error('Error getting token price', e)
    }
  }, [contract])

  // TODO: should price be fetched block by block?
  useEffect(() => {
    getTokenPrice()
  }, [contract])

  return price
}

export default useRTokenPrice
