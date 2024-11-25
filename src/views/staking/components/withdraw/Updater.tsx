import FacadeRead from 'abis/FacadeRead'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import {
  chainIdAtom,
  rTokenAtom,
  stRsrBalanceAtom,
  walletAtom,
} from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { formatEther } from 'viem'
import { pendingRSRAtom } from '../../atoms'
import { useReadContract } from 'wagmi'
import { getStorageAt } from 'wagmi/actions'
import { wagmiConfig } from 'state/chain'

/**
 * Fetch pending issuances
 */
// TODO: Move this to an loadable atom
const PendingBalancesUpdater = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const balance = useAtomValue(stRsrBalanceAtom)

  const setPendingRSR = useSetAtom(pendingRSRAtom)
  const [draftEra, setDraftEra] = useState(0)

  const { data, refetch, isFetched } = useReadContract(
    rToken && account
      ? {
          abi: FacadeRead,
          address: FACADE_ADDRESS[chainId],
          functionName: 'pendingUnstakings',
          args: [rToken?.address, BigInt(draftEra), account],
          chainId,
        }
      : undefined
  )

  useEffect(() => {
    if (isFetched) {
      refetch()
    }
  }, [isFetched, balance])

  const fetchDraftEra = useCallback(async () => {
    if (!rToken) {
      return
    }

    try {
      const draftEra: string =
        (await getStorageAt(wagmiConfig, {
          address: rToken.stToken?.address!,
          chainId,
          slot: '0x0000000000000000000000000000000000000000000000000000000000000109',
        })) || '0'

      setDraftEra(+draftEra || 0)
    } catch (e) {
      console.error('error pulling storage slot', e)
    }
  }, [setDraftEra, chainId, rToken])

  useEffect(() => {
    fetchDraftEra()
  }, [rToken])

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
