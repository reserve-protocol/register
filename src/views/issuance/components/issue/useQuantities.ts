import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { useBasketHandlerContract } from 'hooks/useContract'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { ReserveToken } from 'types'
import { quote } from 'utils/rsv'
import { quantitiesAtom } from 'views/issuance/atoms'

export interface IQuantities {
  [x: string]: BigNumber
}

const useQuantities = (data: ReserveToken, amount: string): IQuantities => {
  const [quantities, setQuantities] = useAtom(quantitiesAtom)
  const basketHandler = useBasketHandlerContract(data.basketHandler)

  const fetchQuantities = useCallback(async () => {
    try {
      const issueAmount = parseEther(amount)

      if (data.isRSV) {
        setQuantities(quote(issueAmount))
      } else {
        const quoteResult = await basketHandler!.quote(issueAmount, 2)
        setQuantities(
          quoteResult.erc20s.reduce((prev, current, currentIndex) => {
            prev[getAddress(current)] = quoteResult.quantities[currentIndex]
            return prev
          }, {} as IQuantities)
        )
      }
    } catch (e) {
      // TODO: Handle error case
      console.error('failed fetching quantities', e)
    }
  }, [amount, data.id])

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
