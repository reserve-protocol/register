import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import { useBasketHandlerContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { rTokenAtom } from 'state/atoms'
import { BigNumberMap } from 'types'
import { quote } from 'utils/rsv'
import { quantitiesAtom } from 'views/issuance/atoms'

const QuantitiesUpdater = ({ amount }: { amount: string }) => {
  const rToken = useAtomValue(rTokenAtom)
  const setQuantities = useUpdateAtom(quantitiesAtom)
  const basketHandler = useBasketHandlerContract(rToken?.basketHandler ?? '')

  const fetchQuantities = useCallback(async () => {
    try {
      const issueAmount = parseEther(amount)

      if (rToken!.isRSV) {
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
  }, [amount, rToken?.id, basketHandler])

  useEffect(() => {
    if (Number(amount) > 0) {
      fetchQuantities()
    } else {
      setQuantities({})
    }
  }, [amount, rToken?.id])

  useEffect(() => {
    return () => {
      setQuantities({})
    }
  }, [])

  return null
}

export default QuantitiesUpdater
