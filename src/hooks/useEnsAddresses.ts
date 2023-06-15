import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { getValidWeb3Atom } from 'state/atoms'
import { getContract } from 'utils'
import { ENS_ADDRESS } from 'utils/addresses'

const ENS_ABI = [
  'function getNames(address[] addresses) view returns (string[] r)',
]

export const useEnsAddresses = (addresses: string[]) => {
  const { provider, chainId } = useAtomValue(getValidWeb3Atom)
  const [ensNames, setEnsNames] = useState<any>([])

  const ensReverseRecordRequest = useCallback(async () => {
    if (!chainId || !provider) {
      return []
    }

    const ensReverseRecords = getContract(
      ENS_ADDRESS[chainId],
      ENS_ABI,
      provider
    )

    const reverseRecords = await ensReverseRecords.getNames(addresses)

    return addresses.map((_address, index) => reverseRecords[index])
  }, [addresses, chainId, provider])

  useEffect(() => {
    const fetchEns = async () => {
      const ens = await ensReverseRecordRequest()
      setEnsNames(ens)
    }

    if (addresses?.length > 0) fetchEns()
  }, [addresses?.toString()])

  return ensNames
}
