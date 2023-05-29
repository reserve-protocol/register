import { Facade } from 'abis/types'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  balancesAtom,
  chainIdAtom,
  isRTokenDisabledAtom,
  rTokenAtom,
  walletAtom,
} from 'state/atoms'
import { BI_ZERO } from 'utils/constants'
import { getIssuable } from 'utils/rsv'
import { maxIssuableAtom } from 'views/issuance/atoms'

/**
 * View: Mint -> Issue
 * Fex maximum issuable amount for rToken
 */
const MaxIssuableUpdater = () => {
  const rToken = useAtomValue(rTokenAtom)
  const tokenBalances = useAtomValue(balancesAtom)
  const setMaxIssuable = useSetAtom(maxIssuableAtom)
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const facadeContract = useFacadeContract()
  const isTokenDisabled = useAtomValue(isRTokenDisabledAtom)

  const updateMaxIssuable = useCallback(
    async (account: string, rTokenAddress: string, facade: Facade) => {
      try {
        const maxIssuable = await facade.callStatic.maxIssuable(
          rTokenAddress,
          account
        )
        setMaxIssuable(maxIssuable ? maxIssuable : BI_ZERO)
      } catch (e) {
        setMaxIssuable(BI_ZERO)
        console.error('Error fetching MAX_ISSUABLE', e)
      }
    },
    []
  )

  // RSV Max issuable
  useEffect(() => {
    if (rToken && !rToken.main) {
      setMaxIssuable(getIssuable(tokenBalances))
    }
  }, [tokenBalances, rToken?.address, chainId])

  useEffect(() => {
    if (rToken?.main && account && facadeContract && !isTokenDisabled) {
      updateMaxIssuable(account, rToken.address, facadeContract)
    } else if (rToken?.main) {
      setMaxIssuable(BI_ZERO)
    }
  }, [
    rToken?.address,
    account,
    facadeContract,
    isRTokenDisabledAtom,
    tokenBalances,
  ])

  return null
}

export default MaxIssuableUpdater
