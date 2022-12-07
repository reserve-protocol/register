import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useFacadeContract, useZapperContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { rTokenAtom } from 'state/atoms'
import { error } from 'state/web3/lib/notifications'
import { BigNumberMap, Token } from 'types'
import { quote } from 'utils/rsv'

/**
 * Listen for amountAtom value change and update needed collateral quantities for issuance
 */
const ZapQuoteUpdater = ({
  zapToken,
  amount,
  onChange,
}: {
  zapToken: Token | undefined
  amount: string
  onChange(issueQuote: string): void
}) => {
  const rToken = useAtomValue(rTokenAtom)
  const debouncedValue = useDebounce(amount, 400)
  const zapContract = useZapperContract()

  const fetchIssueAmount = useCallback(
    async (value: string) => {
      try {
        onChange('')
        if (zapContract && zapToken && rToken && Number(value) > 0) {
          const zapAmount = parseEther(value)
          console.log('trying zap callstatic with args', {
            zapToken: zapToken.address,
            rToken: rToken.address,
            zapAmount,
          })
          const quoteResult = await zapContract.callStatic.zapIn(
            zapToken.address,
            rToken.address,
            zapAmount
          )
          onChange(formatEther(quoteResult))
        }
      } catch (e) {
        // TODO: Handle error case
        // TODO: this could also fail during default
        error(t`Network Error`, t`Error fetching issue quote`)
        console.error('failed fetching issue quote', e)
      }
    },
    [zapContract, rToken?.address]
  )

  // Fetch quantities from smart contract (rTokens)
  useEffect(() => {
    if (!rToken?.isRSV) {
      fetchIssueAmount(amount)
    }
  }, [debouncedValue, fetchIssueAmount, amount, zapToken])

  useEffect(() => {
    return () => {
      onChange('')
    }
  }, [])

  return null
}

export default ZapQuoteUpdater
