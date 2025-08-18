import { useReadContracts } from 'wagmi'
import { erc20Abi, Address } from 'viem'
import { InternalDTF } from './use-internal-dtf-list'
import { useAtomValue } from 'jotai'
import { walletAtom } from '@/state/atoms'

export const useDTFBalances = (dtfs: InternalDTF[]) => {
  const wallet = useAtomValue(walletAtom)
  
  // Create contract calls for all DTFs
  const contracts = dtfs.map(dtf => ({
    address: dtf.id as Address,
    abi: erc20Abi,
    functionName: 'balanceOf' as const,
    args: [wallet as Address],
    chainId: dtf.chainId,
  }))
  
  const { data, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: !!wallet && dtfs.length > 0,
    }
  })
  
  // Create a map of DTF address to balance
  const balances: Record<string, bigint> = {}
  
  if (data) {
    dtfs.forEach((dtf, index) => {
      const result = data[index]
      if (result.status === 'success' && result.result) {
        const key = `${dtf.chainId}-${dtf.id.toLowerCase()}`
        balances[key] = result.result as bigint
      }
    })
  }
  
  return { balances, isLoading }
}