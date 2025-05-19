import { DecodedCalldata } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, decodeFunctionData, getAbiItem, Hex } from 'viem'
import { dtfAbiMapppingAtom, dtfContractAliasAtom } from './atoms'

const useDecodedCalldatas = (
  targets: Address[] | undefined,
  calldatas: Hex[] | undefined
) => {
  const dtfAbiMapping = useAtomValue(dtfAbiMapppingAtom)
  const dtfContractAlias = useAtomValue(dtfContractAliasAtom)

  return useMemo(() => {
    if (!dtfAbiMapping || !targets || !calldatas) return [undefined, undefined]

    // TODO: In theory, call order is important, but most likely proposals will be contract independent
    const dataByContract: Record<string, DecodedCalldata[]> = {}
    const unknownContracts: Record<string, Hex[]> = {}

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const calldata = calldatas[i]
      const abi = dtfAbiMapping[target.toLowerCase()]

      try {
        if (!abi) {
          throw new Error('No ABI found')
        }

        const { functionName, args } = decodeFunctionData({
          abi,
          data: calldata,
        })

        const result = getAbiItem({
          abi,
          name: functionName as string,
        })

        dataByContract[target.toLowerCase()] = [
          ...(dataByContract[target.toLowerCase()] || []),
          {
            signature: functionName,
            parameters:
              result && 'inputs' in result
                ? result.inputs.map((input) => `${input.name}: ${input.type}`)
                : [],
            callData: calldata,
            data: (args ?? []) as unknown as unknown[] as string[],
          },
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
  }, [dtfAbiMapping, dtfContractAlias, targets, calldatas])
}

export default useDecodedCalldatas
