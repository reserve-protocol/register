import { useContractCall } from '@usedapp/core'
import { ERC20Interface } from 'abis'
import { BigNumber } from 'ethers'
import { Falsy } from 'types'

const useTokenSupply = (address: string | Falsy): BigNumber => {
  const [totalSupply] = <[BigNumber | Falsy]>useContractCall(
    address && {
      abi: ERC20Interface,
      address,
      method: 'totalSupply',
      args: [],
    }
  )

  return totalSupply || BigNumber.from('0')
}

export default useTokenSupply
