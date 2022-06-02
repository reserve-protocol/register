import { isAddress } from '../../utils'
import useENSAddress from './useENSAddress'
import useENSName from './useENSName'

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export default function useENS(nameOrAddress?: string | null): {
  loading: boolean
  address: string | null
  name: string | null
} {
  const validated = isAddress(nameOrAddress ?? '')
  const reverseLookup = useENSName(validated || undefined)
  const lookup = useENSAddress(nameOrAddress)
  let name = null

  if (reverseLookup.ENSName) {
    name = reverseLookup.ENSName
  } else if (!validated && lookup.address) {
    name = nameOrAddress || null
  }

  return {
    loading: reverseLookup.loading || lookup.loading,
    address: validated || lookup.address,
    name,
  }
}
