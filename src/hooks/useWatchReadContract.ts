import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'
import { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import {
  useBlockNumber,
  useReadContract,
  useReadContracts,
  type UseReadContractsParameters,
  type UseReadContractParameters,
  type UseReadContractReturnType,
  type UseReadContractsReturnType,
  type Config,
  type ResolvedRegister,
} from 'wagmi'
import { type ReadContractData, type ReadContractsData } from 'wagmi/query'

const REFRESH_BLOCKS = {
  [ChainId.Mainnet]: 1n,
  [ChainId.Base]: 3n,
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

export function useWatchReadContract<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
  args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  config extends Config = ResolvedRegister['config'],
  selectData = ReadContractData<abi, functionName, args>,
>(
  parameters: UseReadContractParameters<
    abi,
    functionName,
    args,
    config,
    selectData
  > = {} as any
): UseReadContractReturnType<abi, functionName, args, selectData> {
  const result = useReadContract(
    parameters as UseReadContractParameters
  ) as UseReadContractReturnType<abi, functionName, args, selectData>
  const shouldRefresh = useShouldRefresh(parameters?.chainId)
  const { refetch } = result

  useEffect(() => {
    if (shouldRefresh) {
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
      refetch()
    }
  }, [shouldRefresh])

  return result
}
