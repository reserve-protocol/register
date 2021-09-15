import { useMemo } from 'react'
import { useBlockNumber, useContractCalls, useEthers } from '@usedapp/core'
import { BigNumber, BigNumberish, utils } from 'ethers'
import ERC20 from '../abis/ERC20.json'

const ERC20Interface = new utils.Interface(ERC20)

const useTokensHasAllowance = (
  tokens: string[],
  spender: string,
  amount: BigNumberish
) => {
  const { account } = useEthers()

  const calls = useMemo(() => {
    return tokens.map((address) => ({
      abi: ERC20Interface,
      address,
      method: 'allowance',
      args: [account, spender],
    }))
  }, [...tokens, account])

  const allowances = <any[]>useContractCalls(calls) ?? []

  return allowances.every((value) => {
    return value && value.length && <BigNumber>value[0].gte(amount)
  })
}

export default useTokensHasAllowance
