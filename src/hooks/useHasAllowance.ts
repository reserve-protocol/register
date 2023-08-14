import ERC20 from 'abis/ERC20'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import { Address } from 'viem'
import { useContractReads } from 'wagmi'

export interface RequiredAllowance {
  token: Address
  spender: Address
  amount: bigint
}

const useHasAllowance = (allowances: RequiredAllowance[] | undefined) => {
  const account = useAtomValue(walletAtom)

  const { data }: { data: bigint[] | undefined } = useContractReads(
    allowances && account
      ? {
          contracts: allowances.map((allowance) => ({
            abi: ERC20,
            functionName: 'allowance',
            address: allowance.token,
            args: [account, allowance.spender],
          })),
          watch: true,
          allowFailure: false,
        }
      : undefined
  )

  if (!allowances) {
    return true
  }

  if (!data) {
    return false
  }

  return data.every((value, index) => value > allowances[index].amount)
}

export default useHasAllowance
