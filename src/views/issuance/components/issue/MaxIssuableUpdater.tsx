import FacadeRead from 'abis/FacadeRead'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  balancesAtom,
  chainIdAtom,
  rTokenAtom,
  rTokenStateAtom,
  walletAtom,
} from 'state/atoms'
import { FACADE_ADDRESS, USDC_ADDRESS } from 'utils/addresses'
import { maxIssuableAtom } from 'views/issuance/atoms'
import { Address, usePublicClient } from 'wagmi'

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
  const client = usePublicClient()
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)

  const updateMaxIssuable = useCallback(
    async (account: Address, rTokenAddress: Address) => {
      try {
        const { result: maxIssuable } = await client.simulateContract({
          abi: FacadeRead,
          address: FACADE_ADDRESS[chainId],
          functionName: 'maxIssuable',
          args: [rTokenAddress, account],
        })
        setMaxIssuable(maxIssuable)
      } catch (e) {
        setMaxIssuable(0n)
        console.error('Error fetching MAX_ISSUABLE', e)
      }
    },
    [client, chainId]
  )

  // RSV Max issuable
  useEffect(() => {
    if (rToken && !rToken.main) {
      setMaxIssuable(tokenBalances[USDC_ADDRESS[chainId]].value ?? 0n)
    }
  }, [tokenBalances, rToken?.address, chainId])

  useEffect(() => {
    if (rToken?.main && account && client && !issuancePaused && !frozen) {
      updateMaxIssuable(account, rToken.address)
    } else if (rToken?.main) {
      setMaxIssuable(0n)
    }
  }, [
    rToken?.address,
    account,
    updateMaxIssuable,
    issuancePaused,
    frozen,
    tokenBalances,
  ])

  return null
}

export default MaxIssuableUpdater
