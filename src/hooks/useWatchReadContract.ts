import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'
import {
  useBlockNumber,
  useReadContract,
  useReadContracts,
  type UseReadContractsParameters,
  type UseReadContractParameters,
  type UseReadContractsReturnType,
  type Config,
  type ResolvedRegister,
} from 'wagmi'
import { ReadContractsData } from 'wagmi/query'

const REFRESH_BLOCKS = {
  [ChainId.Mainnet]: 1n,
  [ChainId.Base]: 5n,
  [ChainId.Arbitrum]: 5n,
}

export const useShouldRefresh = (chain?: number) => {
  const rTokenChain = useAtomValue(chainIdAtom)
  const chainId = chain || rTokenChain
  const { data: blockNumber } = useBlockNumber({ watch: true, chainId })

  return Boolean(
    blockNumber && blockNumber % (REFRESH_BLOCKS[chainId] || 5n) === 0n
  )
}

export const useWatchReadContract = (call: UseReadContractParameters) => {
  const result = useReadContract(call)
  const shouldRefresh = useShouldRefresh(call.chainId)
  const { refetch } = result

  useEffect(() => {
    if (shouldRefresh) {
      console.log('refetch!')
      refetch()
    }
  }, [shouldRefresh])

  return result
}

export function useWatchReadContracts<
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  config extends Config = ResolvedRegister['config'],
  selectData = ReadContractsData<contracts, allowFailure>,
>(
  parameters: UseReadContractsParameters<
    contracts,
    allowFailure,
    config,
    selectData
  > = {}
): UseReadContractsReturnType<contracts, allowFailure, selectData> {
  const result = useReadContracts(parameters)
  const shouldRefresh = useShouldRefresh(
    (parameters.contracts?.[0] as { chainId?: number } | undefined)?.chainId
  )
  const { refetch } = result

  useEffect(() => {
    if (shouldRefresh) {
      console.log('refetch!')
      refetch()
    }
  }, [shouldRefresh])

  return result
}
