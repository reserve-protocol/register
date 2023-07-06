import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { ENS_ADDRESS } from 'utils/addresses'
import { Address, useContractRead } from 'wagmi'

export const useEnsAddresses = (addresses: string[]) => {
  const chainId = useAtomValue(chainIdAtom)

  const { data } = useContractRead({
    abi: [
      {
        inputs: [
          { internalType: 'address[]', name: 'addresses', type: 'address[]' },
        ],
        name: 'getNames',
        outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: addresses.length ? (ENS_ADDRESS[chainId] as Address) : undefined,
    functionName: 'getNames',
    args: [addresses],
  })

  return useMemo(() => {
    return addresses.map(
      (_address, index) => (data as string[])[index]
    ) as string[]
  }, [data])
}
