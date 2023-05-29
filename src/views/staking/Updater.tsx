import { Facade } from 'abis/types'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { chainIdAtom, rTokenAtom, walletAtom } from 'state/atoms'
import { pendingRSRAtom } from './atoms'

/**
 * Fetch pending issuances
 */
const PendingBalancesUpdater = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const setPendingRSR = useSetAtom(pendingRSRAtom)
  const facadeContract = useFacadeContract()
  const blockNumber = useBlockNumber()

  const fetchPending = useCallback(
    async (account: string, rToken: string, facade: Facade) => {
      try {
        const pendingRSR = await facade.pendingUnstakings(rToken, account)
        const pendingRSRSummary = pendingRSR.map((item) => ({
          availableAt: item.availableAt.toNumber(),
          index: item.index,
          amount: parseFloat(formatEther(item.amount)),
        }))
        setPendingRSR(pendingRSRSummary)
      } catch (e) {
        // TODO: handle error case
        console.log('error fetching pending', e)
      }
    },
    []
  )

  useEffect(() => {
    if (rToken?.main && facadeContract && blockNumber && account) {
      fetchPending(account, rToken.address, facadeContract)
    } else {
      setPendingRSR([])
    }
  }, [rToken?.address, facadeContract, account, blockNumber, chainId])

  return null
}

export default PendingBalancesUpdater
