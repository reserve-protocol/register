import { useContractRead } from 'wagmi'
import { BigNumber } from '@ethersproject/bignumber'
import { ERC20Interface } from 'abis'
import { Address } from 'types'
import { Falsy } from 'types'
import ERC20 from 'abis/ERC20'

const useTokenSupply = (address: string | Falsy): BigNumber => {
  const { data } = useContractRead({
    address: address as Address,
    abi: ERC20,
    functionName: 'totalSupply',
  })

  // return data || BigNumber.from('0')
  // TODO: remove
  return BigNumber.from('0')
}

export default useTokenSupply
