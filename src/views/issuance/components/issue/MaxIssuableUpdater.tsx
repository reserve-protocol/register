import { formatEther } from '@ethersproject/units'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { balancesAtom, rTokenAtom, walletAtom } from 'state/atoms'
import { getIssuable } from 'utils/rsv'
import { maxIssuableAtom } from 'views/issuance/atoms'

/**
 * View: Mint -> Issue
 * Fex maximun issuable amount for rToken
 */
const MaxIssuableUpdater = () => {
  const rToken = useAtomValue(rTokenAtom)
  const tokenBalances = useAtomValue(balancesAtom)
  const setMaxIssuable = useUpdateAtom(maxIssuableAtom)
  const account = useAtomValue(walletAtom)
  const facadeContract = useFacadeContract()

  const updateMaxIssuable = useCallback(async () => {
    try {
      if (account && rToken && facadeContract) {
        const maxIssuable = await facadeContract.callStatic.maxIssuable(
          rToken.address,
          account
        )
        setMaxIssuable(maxIssuable ? Number(formatEther(maxIssuable)) : 0)
      } else {
        setMaxIssuable(0)
      }
    } catch (e) {
      setMaxIssuable(0)
      console.error('error with max issuable', e)
    }
  }, [account, rToken?.address, facadeContract])

  // RSV Max issuable
  useEffect(() => {
    console.log('called')

    if (rToken && rToken.isRSV) {
      setMaxIssuable(getIssuable(rToken, tokenBalances))
    }
  }, [tokenBalances])

  useEffect(() => {
    if (rToken && !rToken.isRSV) {
      updateMaxIssuable()
    }
  }, [updateMaxIssuable, tokenBalances])

  return null
}

export default MaxIssuableUpdater
