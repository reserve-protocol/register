import { namehash } from '@ethersproject/hash'
import { useMemo } from 'react'
import { utils } from 'ethers'
import { ENS_ADDRESS } from '../../constants/addresses'
import { isZero } from '../../utils'
import ENSRegistrarAbi from '../../abis/ens-registrar.json'
import ENSResolverAbi from '../../abis/ens-public-resolver.json'

const ENSRegistrarInterface = new utils.Interface(ENSRegistrarAbi)
const ENSResolverInterface = new utils.Interface(ENSResolverAbi)

/**
 * Does a lookup for an ENS name to find its address.
 */
const useENSAddress = (
  ensName?: string | null
): {
  loading: boolean
  address: string | null
} => {
  return { loading: false, address: null }
  // const debouncedName = useDebounce(ensName, 200)
  // const ensNodeArgument = useMemo(() => {
  //   if (!debouncedName) return [undefined]
  //   try {
  //     return debouncedName ? [namehash(debouncedName)] : [undefined]
  //   } catch (error) {
  //     return [undefined]
  //   }
  // }, [debouncedName])
  // const [resolverAddress] = useContractCall({
  //   abi: ENSRegistrarInterface,
  //   address: ENS_ADDRESS[CHAIN_ID],
  //   method: 'resolver',
  //   args: ensNodeArgument,
  // }) ?? [undefined]
  // const [addr] = useContractCall(
  //   !!resolverAddress &&
  //     !isZero(resolverAddress) && {
  //       abi: ENSResolverInterface,
  //       address: resolverAddress,
  //       method: 'addr',
  //       args: ensNodeArgument,
  //     }
  // ) ?? [undefined]
  // const changed = debouncedName !== ensName
  // return {
  //   address: changed ? null : addr ?? null,
  //   loading: changed,
  // }
}

export default useENSAddress
