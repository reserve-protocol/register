import { formatEther } from '@ethersproject/units'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { balancesAtom, rTokenAtom, selectedAccountAtom } from 'state/atoms'
import { getIssuable } from 'utils/rsv'
import { maxIssuableAtom } from 'views/issuance/atoms'

const MaxIssuableUpdater = () => {
  const rToken = useAtomValue(rTokenAtom)
  const tokenBalances = useAtomValue(balancesAtom)
  const setMaxIssuable = useUpdateAtom(maxIssuableAtom)
  const account = useAtomValue(selectedAccountAtom)
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
    if (rToken && rToken.isRSV) {
      setMaxIssuable(getIssuable(rToken, tokenBalances))
    }
  }, [JSON.stringify(tokenBalances)])

  useEffect(() => {
    if (rToken && !rToken.isRSV) {
      updateMaxIssuable()
    }
  }, [updateMaxIssuable])

  useEffect(() => {
    return () => setMaxIssuable(0)
  })

  return null
}

export default MaxIssuableUpdater
