import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { getContract } from 'utils'

const ENS_REVERSE_LOOKUP = '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C'
const ENS_ABI = [
  'function getNames(address[] addresses) view returns (string[] r)',
]

export const useEnsAddresses = (addresses: string[]) => {
  const { provider } = useWeb3React()
  const [ensNames, setEnsNames] = useState<any>()

  const ensReverseRecordRequest = useCallback(async () => {
    const ensReverseRecords = getContract(
      ENS_REVERSE_LOOKUP,
      ENS_ABI,
      provider as Web3Provider
    )

    const reverseRecords = await ensReverseRecords.getNames(addresses)

    return addresses.map((_address, index) => reverseRecords[index])
  }, [addresses])

  useEffect(() => {
    const fetchEns = async () => {
      const ens = await ensReverseRecordRequest()
      setEnsNames(ens)
    }

    if (addresses?.length > 0) fetchEns()
  }, [addresses && addresses.length])

  return ensNames
}
