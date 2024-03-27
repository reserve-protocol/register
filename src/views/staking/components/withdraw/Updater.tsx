import FacadeRead from 'abis/FacadeRead'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { chainIdAtom, rTokenAtom, walletAtom } from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { formatEther } from 'viem'
import { useContractRead } from 'wagmi'
import { pendingRSRAtom } from '../../atoms'
import { publicClient } from 'state/chain'

/**
 * Fetch pending issuances
 */
// TODO: Move this to an loadable atom
const PendingBalancesUpdater = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)

  const setPendingRSR = useSetAtom(pendingRSRAtom)
  const [draftEra, setDraftEra] = useState(0)

  const { data } = useContractRead(
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
    const fetchDraftEra = async () => {
      if (!rToken || !account) {
        return
      }

      try {
        const client = publicClient({ chainId })
        const draftEra: string =
          (await client.getStorageAt({
            address: rToken.stToken?.address!,
            slot: '0x0000000000000000000000000000000000000000000000000000000000000109',
          })) || '0'

        setDraftEra(+draftEra || 0)
      } catch (e) {
        console.error('error pulling storage slot', e)
      }
    }

    fetchDraftEra()
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
  }, [data, account, rToken, draftEra])

  return null
}

export default PendingBalancesUpdater
