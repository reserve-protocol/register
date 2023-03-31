import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { getContract } from 'utils'
import { ENS_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

const ENS_ABI = [
  'function getNames(address[] addresses) view returns (string[] r)',
]

export const useEnsAddresses = (addresses: string[]) => {
  const { provider } = useWeb3React()
  const [ensNames, setEnsNames] = useState<any>([])

  const ensReverseRecordRequest = useCallback(async () => {
    const ensReverseRecords = getContract(
      ENS_ADDRESS[CHAIN_ID],
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
