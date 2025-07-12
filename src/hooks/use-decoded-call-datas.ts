import { DecodedCalldata } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Abi, Address, decodeFunctionData, getAbiItem, Hex } from 'viem'
import { dtfContractAliasAtom } from '../views/index-dtf/governance/components/proposal-preview/atoms'
import useGetAbi from '../views/index-dtf/governance/components/proposal-preview/use-get-abi'

export const getDecodedCalldata = (abi: Abi, calldata: Hex) => {
  const { functionName, args } = decodeFunctionData({
    abi,
    data: calldata,
  })

  const result = getAbiItem({
    abi,
    name: functionName as string,
  })

  return {
    signature: functionName,
    parameters:
      result && 'inputs' in result
        ? result.inputs.map((input) => `${input.name}: ${input.type}`)
        : [],
    callData: calldata,
    data: (args ?? []) as unknown as unknown[] as string[],
  }
}

const useDecodedCalldatas = (
  targets: Address[] | undefined,
  calldatas: Hex[] | undefined
) => {
  const dtfContractAlias = useAtomValue(dtfContractAliasAtom)
  const abis = useGetAbi(targets)

  return useMemo(() => {
    if (!abis || !targets || !calldatas) return [undefined, undefined]

    // TODO: In theory, call order is important, but most likely proposals will be contract independent
    const dataByContract: Record<string, DecodedCalldata[]> = {}
    const unknownContracts: Record<string, Hex[]> = {}

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const calldata = calldatas[i]
      const abi = abis[target.toLowerCase() as Address]

      try {
        if (!abi) {
          throw new Error('No ABI found')
        }

        dataByContract[target.toLowerCase()] = [
          ...(dataByContract[target.toLowerCase()] || []),
          getDecodedCalldata(abi, calldata),
        ]
      } catch (e) {
        console.error('ERROR', e)
        unknownContracts[target.toLowerCase()] = [
          ...(unknownContracts[target.toLowerCase()] || []),
          calldata,
        ]
      }
    }

    return [dataByContract, unknownContracts]
  }, [abis, dtfContractAlias, targets, calldatas])
}

export default useDecodedCalldatas
