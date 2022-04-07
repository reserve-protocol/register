import { BigNumber } from '@ethersproject/bignumber'
import { Falsy } from 'types'
import { useCall } from './useCall'
import { useTokenContract } from './useContract'

const useTokenSupply = (address: string | Falsy): BigNumber => {
  const contract = useTokenContract(address || '')
  const { value, error } =
    useCall(
      address &&
        contract && {
          contract,
          method: 'totalSupply',
          args: [],
        }
    ) ?? {}

  if (value && value[0]) {
    return value[0]
  }

  return BigNumber.from('0')
}

export default useTokenSupply
