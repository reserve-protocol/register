import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import { useBasketHandlerContract } from 'hooks/useContract'
import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { BigNumberMap, ReserveToken } from 'types'
import { quote } from 'utils/rsv'
import { quantitiesAtom } from 'views/issuance/atoms'

const useQuantities = (data: ReserveToken, amount: string): BigNumberMap => {
  const [quantities, setQuantities] = useAtom(quantitiesAtom)
  const basketHandler = useBasketHandlerContract(data.basketHandler)

  const fetchQuantities = useCallback(async () => {
    try {
      const issueAmount = parseEther(amount)

      if (data.isRSV) {
        setQuantities(quote(issueAmount))
      } else if (basketHandler) {
        const quoteResult = await basketHandler.quote(issueAmount, 2)
        setQuantities(
          quoteResult.erc20s.reduce((prev, current, currentIndex) => {
            prev[getAddress(current)] = quoteResult.quantities[currentIndex]
            return prev
          }, {} as BigNumberMap)
        )
      }
    } catch (e) {
      // TODO: Handle error case
      console.error('failed fetching quantities', e)
    }
  }, [amount, data.id, basketHandler])

  useEffect(() => {
    if (Number(amount) > 0) {
      fetchQuantities()
    } else {
      setQuantities({})
    }

    return () => {
      setQuantities({})
    }
  }, [amount, data.id])

  console.log('quantities', quantities)

  return quantities
}

export default useQuantities
