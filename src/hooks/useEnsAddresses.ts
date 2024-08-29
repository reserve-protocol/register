import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { ENS_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
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
    address: addresses.length
      ? (ENS_ADDRESS[ChainId.Mainnet] as Address)
      : undefined,
    functionName: 'getNames',
    args: [addresses],
    chainId: ChainId.Mainnet,
  })

  return useMemo(() => {
    if (data) {
      return addresses.map(
        (_address, index) => (data as string[])[index]
      ) as string[]
    }

    return []
  }, [data])
}
