import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import { useBasketHandlerContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { rTokenAtom } from 'state/atoms'
import { error } from 'state/web3/lib/notifications'
import { BigNumberMap } from 'types'
import { quote } from 'utils/rsv'

/**
 *
 */
const QuantitiesUpdater = ({
  amount,
  onChange,
}: {
  amount: string
  onChange(quantities: BigNumberMap): void
}) => {
  const rToken = useAtomValue(rTokenAtom)
  const debouncedValue = useDebounce(amount, 400)
  const basketHandler = useBasketHandlerContract(rToken?.basketHandler ?? '')

  const fetchQuantities = useCallback(
    async (value: string) => {
      try {
        if (basketHandler && Number(value) > 0) {
          const issueAmount = parseEther(value)

          const quoteResult = await basketHandler.quote(issueAmount, 2)
          onChange(
            quoteResult.erc20s.reduce((prev, current, currentIndex) => {
              prev[getAddress(current)] = quoteResult.quantities[currentIndex]
              return prev
            }, {} as BigNumberMap)
          )
        }
      } catch (e) {
        // TODO: Handle error case
        error('Network Error', 'Error fetching required collateral')
        console.error('failed fetching quantities', e)
      }
    },
    [basketHandler]
  )

  // Fetch quantities from smart contract (rTokens)
  useEffect(() => {
    fetchQuantities(debouncedValue)
  }, [debouncedValue, basketHandler])

  // Reset quantities on amount change or set if its valid number and RSV
  useEffect(() => {
    if (rToken?.isRSV && Number(amount) > 0) {
      onChange(quote(parseEther(amount)))
    } else {
      onChange({})
    }
  }, [amount])

  useEffect(() => {
    return () => {
      onChange({})
    }
  }, [])

  return null
}

export default QuantitiesUpdater
