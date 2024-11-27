import ERC20 from 'abis/ERC20'
import { useAtomValue } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { Address } from 'viem'
import { useWatchReadContracts } from './useWatchReadContract'

export interface RequiredAllowance {
  token: Address
  spender: Address
  amount: bigint
}

const useHasAllowance = (
  allowances: RequiredAllowance[] | undefined
): [boolean, Address[]] => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data }: { data: bigint[] | undefined } = useWatchReadContracts(
    allowances && account
      ? {
          contracts: allowances.map((allowance) => ({
            abi: ERC20,
            functionName: 'allowance',
            address: allowance.token,
            args: [account, allowance.spender],
            chainId,
          })),
          allowFailure: false,
        }
      : undefined
  )

  if (!allowances) {
    return [true, []]
  }

  if (!data) {
    return [false, []]
  }

  return data.reduce(
    (acc, current, index) => {
      if (allowances[index].amount > current) {
        acc[0] = false
        acc[1].push(allowances[index].token)
      }

      return acc
    },
    [true, []] as [boolean, Address[]]
  )
}

export default useHasAllowance
