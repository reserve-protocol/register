import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { BigNumber } from 'ethers'
import { formatEther, parseUnits } from 'ethers/lib/utils'
import { useFacadeContract, useZapperContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { rTokenAtom, selectedZapTokenAtom } from 'state/atoms'
import { error } from 'state/web3/lib/notifications'
import { BigNumberMap } from 'types'
import { zapQuantitiesAtom, zapQuoteAtom } from 'views/issuance/atoms'

/**
 * Listen for amountAtom value change and update needed collateral quantities for issuance
 */
const ZapQuoteUpdater = ({
  amount,
  hasAllowance,
}: {
  amount: string
  hasAllowance: boolean
}) => {
  const rToken = useAtomValue(rTokenAtom)
  const zapToken = useAtomValue(selectedZapTokenAtom)
  const debouncedValue = useDebounce(amount, 400)
  const zapContract = useZapperContract()
  const facadeContract = useFacadeContract()

  const setZapQuote = useSetAtom(zapQuoteAtom)
  const setZapQuantities = useSetAtom(zapQuantitiesAtom)

  const fetchIssueAmount = useCallback(
    async (value: string) => {
      try {
        if (
          zapContract &&
          facadeContract &&
          zapToken &&
          rToken &&
          hasAllowance &&
          Number(value) > 0
        ) {
          const zapAmount = parseUnits(value, zapToken.decimals)

          const quoteResult = await zapContract.callStatic.zapIn(
            zapToken.address,
            rToken.address,
            zapAmount
          )

          const quantitiesQuoteResult = await facadeContract.callStatic.issue(
            rToken.address,
            quoteResult
          )
          const quantitiesQuoteMap = quantitiesQuoteResult.tokens.reduce(
            (prev, current, currentIndex) => {
              prev[getAddress(current)] =
                quantitiesQuoteResult.deposits[currentIndex]
              return prev
            },
            {} as BigNumberMap
          )

          setZapQuote(formatEther(quoteResult))
          setZapQuantities(quantitiesQuoteMap)
        }
      } catch (e) {
        // TODO: Handle error case
        // TODO: this could also fail during default
        error(t`Network Error`, t`Error fetching issue quote`)
        console.error('failed fetching issue quote', e)
      }
    },
    [zapContract, zapToken, rToken?.address]
  )

  // Fetch quantities from smart contract (rTokens)
  useEffect(() => {
    if (!rToken?.isRSV) {
      fetchIssueAmount(amount)
    }
  }, [debouncedValue, fetchIssueAmount, amount, zapToken])

  useEffect(() => {
    return () => {
      setZapQuote('')
      setZapQuantities({} as BigNumberMap)
    }
  }, [])

  return null
}

export default ZapQuoteUpdater
