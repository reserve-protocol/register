import { getAddress } from '@ethersproject/address'
import { t } from '@lingui/macro'
import FacadeRead from 'abis/FacadeRead'
import useDebounce from 'hooks/useDebounce'
import { notifyError } from 'hooks/useNotification'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { chainIdAtom, rTokenAtom } from 'state/atoms'
import { BigNumberMap } from 'types'
import { safeParseEther } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { quote } from 'utils/rsv'
import { usePublicClient } from 'wagmi'

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
  const client = usePublicClient()
  const chainId = useAtomValue(chainIdAtom)

  const fetchQuantities = useCallback(
    async (value: string) => {
      try {
        onChange({})
        if (client && rToken && Number(value) > 0) {
          const issueAmount = safeParseEther(value)
          const {
            result: [tokens, deposits],
          } = await client.simulateContract({
            abi: FacadeRead,
            address: FACADE_ADDRESS[chainId],
            functionName: 'issue',
            args: [rToken.address, issueAmount],
          })
          onChange(
            tokens.reduce((prev, current, currentIndex) => {
              prev[getAddress(current)] = deposits[currentIndex]
              return prev
            }, {} as BigNumberMap)
          )
        }
      } catch (e) {
        // TODO: Handle error case
        // TODO: this could also fail during default
        notifyError(t`Network Error`, t`Error fetching required collateral`)
        console.error('failed fetching quantities', e)
      }
    },
    [client, rToken?.address, chainId]
  )

  // Fetch quantities from smart contract (rTokens)
  useEffect(() => {
    if (rToken?.main) {
      fetchQuantities(amount)
    }
  }, [debouncedValue, fetchQuantities])

  // Reset quantities on amount change or set if its valid number and RSV
  useEffect(() => {
    if (rToken && !rToken.main) {
      if (Number(amount) > 0) {
        onChange(quote(amount))
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
