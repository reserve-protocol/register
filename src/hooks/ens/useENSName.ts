import { namehash } from '@ethersproject/hash'
import { useContractCall, useDebounce, useEthers } from '@usedapp/core'
import { getAddress } from 'constants/addresses'
import { utils } from 'ethers'
import { useMemo } from 'react'
import ENSResolverAbi from '../../abis/ens-public-resolver.json'
import ENSRegistrarAbi from '../../abis/ens-registrar.json'
import { isAddress, isZero } from '../../utils'

const ENSRegistrarInterface = new utils.Interface(ENSRegistrarAbi)
const ENSResolverInterface = new utils.Interface(ENSResolverAbi)

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
const useENSName = (
  address?: string | undefined | null
): {
  ENSName: string | null
  loading: boolean
} => {
  const { chainId } = useEthers()
  const debouncedAddress = useDebounce(address, 200)
  const ensNodeArgument = useMemo(() => {
    if (!debouncedAddress || !isAddress(debouncedAddress)) return [undefined]
    try {
      return debouncedAddress
        ? [namehash(`${debouncedAddress.toLowerCase().substr(2)}.addr.reverse`)]
        : [undefined]
    } catch (error) {
      return [undefined]
    }
  }, [debouncedAddress])

  const [resolverAddress] = useContractCall({
    abi: ENSRegistrarInterface,
    address: getAddress(chainId, 'ENS'),
    method: 'resolver',
    args: ensNodeArgument,
  }) ?? [undefined]

  const [name] = useContractCall(
    !!resolverAddress &&
      !isZero(resolverAddress) && {
        abi: ENSResolverInterface,
        address: resolverAddress,
        method: 'name',
        args: ensNodeArgument,
      }
  ) ?? [undefined]

  const changed = debouncedAddress !== address
  return {
    ENSName: changed ? null : name ?? null,
    loading: changed,
  }
}

export default useENSName
