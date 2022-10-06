import { BigNumber } from '@ethersproject/bignumber';
import { ERC20Interface } from 'abis';
import { Falsy } from 'types';
import { useContractCall } from './useCall';

const useTokenSupply = (address: string | Falsy): BigNumber => {
  const { value } =
    useContractCall(
      address &&
        {
          abi: ERC20Interface,
          address,
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
