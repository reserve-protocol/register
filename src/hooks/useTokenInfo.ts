import { useContractCall, useTokenBalance } from '@usedapp/core'
import { Falsy } from '@usedapp/core/dist/esm/src/model/types'
import { BigNumber, BigNumberish, utils } from 'ethers'
import ERC20Abi from '../abis/ERC20.json'

const ERC20Interface = new utils.Interface(ERC20Abi)

export interface ITokenInfo {
  address: string
  symbol: string
  name: string
  balance: BigNumber | undefined
}

const useTokenInfo = (
  tokenAddress: string | Falsy,
  address: string | Falsy
): [ITokenInfo, boolean] => {
  const balance = useTokenBalance(tokenAddress, address)

  const [symbol] = useContractCall(
    tokenAddress && {
      abi: ERC20Interface,
      address: tokenAddress,
      method: 'symbol',
      args: [],
    }
  ) ?? ['']

  const [name] = useContractCall(
    tokenAddress && {
      abi: ERC20Interface,
      address: tokenAddress,
      method: 'name',
      args: [],
    }
  ) ?? ['']

  return [
    {
      address: tokenAddress || '',
      symbol,
      name,
      balance,
    },
    !symbol || !name,
  ]
}

export default useTokenInfo
