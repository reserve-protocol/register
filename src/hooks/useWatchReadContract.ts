import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { blockAtom, chainIdAtom } from 'state/atoms'
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

// Returns the latest observed block number — used as a changing dependency to
// trigger watch-style refetches.
//
// WHY: AtomUpdater already polls the current chain's block into blockAtom, so
// same-chain consumers reuse it instead of spinning up a second eth_blockNumber
// poll loop. Cross-chain consumers (e.g. the multi-chain yield token list) still
// get a dedicated watcher so they refresh on their own chain's cadence.
export const useRefreshSignal = (chain?: number) => {
  const currentChain = useAtomValue(chainIdAtom)
  const chainId = chain || currentChain
  const currentBlock = useAtomValue(blockAtom)
  const isCrossChain = chainId !== currentChain

  const { data: crossChainBlock } = useBlockNumber({
    chainId,
    watch: isCrossChain,
    query: { enabled: isCrossChain },
  })

  const signal = isCrossChain ? crossChainBlock : currentBlock
  return signal === undefined ? undefined : Number(signal)
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
  const refreshSignal = useRefreshSignal(parameters?.chainId)
  const { refetch } = result

  useEffect(() => {
    if (refreshSignal) {
      refetch()
    }
  }, [refreshSignal])

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
  const refreshSignal = useRefreshSignal(
    (parameters.contracts?.[0] as { chainId?: number } | undefined)?.chainId
  )
  const { refetch } = result

  useEffect(() => {
    if (refreshSignal) {
      refetch()
    }
  }, [refreshSignal])

  return result
}
