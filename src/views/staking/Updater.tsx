import FacadeRead from 'abis/FacadeRead'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, rTokenAtom, walletAtom } from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { useContractRead } from 'wagmi'
import { formatEther } from 'viem'
import { pendingRSRAtom } from './atoms'

/**
 * Fetch pending issuances
 */
// TODO: Move this to an loadable atom
const PendingBalancesUpdater = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const setPendingRSR = useSetAtom(pendingRSRAtom)

  const { data } = useContractRead(
    rToken && account
      ? {
          abi: FacadeRead,
          address: FACADE_ADDRESS[chainId],
          functionName: 'pendingUnstakings',
          args: [rToken?.address, account],
          chainId,
        }
      : undefined
  )

  useEffect(() => {
    if (data) {
      const pendingRSRSummary = data.map((item) => ({
        availableAt: Number(item.availableAt),
        index: item.index,
        amount: parseFloat(formatEther(item.amount)),
      }))
      setPendingRSR(pendingRSRSummary)
    } else {
      setPendingRSR([])
    }
  }, [data])

  return null
}

export default PendingBalancesUpdater
