import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { useFacadeContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { rTokenAtom } from 'state/atoms'
import { error } from 'state/web3/lib/notifications'
import { BigNumberMap } from 'types'
import { quote } from 'utils/rsv'

/**
 * Listen for amountAtom value change and update needed collateral quantities for issuance
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
  const facadeContract = useFacadeContract()

  const fetchQuantities = useCallback(
    async (value: string) => {
      try {
        onChange({})
        if (facadeContract && rToken && Number(value) > 0) {
          const issueAmount = parseEther(value)
          const quoteResult = await facadeContract.callStatic.issue(
            rToken.address,
            issueAmount
          )
          onChange(
            quoteResult.tokens.reduce((prev, current, currentIndex) => {
              prev[getAddress(current)] = quoteResult.deposits[currentIndex]
              return prev
            }, {} as BigNumberMap)
          )
        }
      } catch (e) {
        // TODO: Handle error case
        // TODO: this could also fail during default
        error(t`Network Error`, t`Error fetching required collateral`)
        console.error('failed fetching quantities', e)
      }
    },
    [facadeContract, rToken?.address]
  )

  // Fetch quantities from smart contract (rTokens)
  useEffect(() => {
    if (!rToken?.isRSV) {
      fetchQuantities(amount)
    }
  }, [debouncedValue, fetchQuantities])

  // Reset quantities on amount change or set if its valid number and RSV
  useEffect(() => {
    if (rToken?.isRSV) {
      if (Number(amount) > 0) {
        onChange(quote(parseEther(amount)))
      } else {
        onChange({})
      }
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
