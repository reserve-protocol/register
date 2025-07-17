import { DecodedCalldata } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Abi, Address, decodeFunctionData, getAbiItem, Hex } from 'viem'
import { dtfContractAliasAtom } from '../views/index-dtf/governance/components/proposal-preview/atoms'
import useGetAbi from '../views/index-dtf/governance/components/proposal-preview/use-get-abi'

export const getDecodedCalldata = (
  abi: Abi,
  calldata: Hex
): DecodedCalldata => {
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
    const dataByContract: [string, DecodedCalldata[]][] = []
    const unknownContracts: [string, Hex[]][] = []

    if (!abis || !targets || !calldatas)
      return { dataByContract, unknownContracts }

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const calldata = calldatas[i]
      const abi = abis[target.toLowerCase() as Address]

      try {
        if (!abi) {
          throw new Error('No ABI found')
        }

        const targetLower = target.toLowerCase()
        const decodedCalldata = getDecodedCalldata(abi, calldata)

        const lastEntry = dataByContract[dataByContract.length - 1]
        if (lastEntry && lastEntry[0] === targetLower) {
          lastEntry[1].push(decodedCalldata)
        } else {
          dataByContract.push([targetLower, [decodedCalldata]])
        }
      } catch (e) {
        console.error('ERROR', e)

        const targetLower = target.toLowerCase()
        const lastUnknownEntry = unknownContracts[unknownContracts.length - 1]
        if (lastUnknownEntry && lastUnknownEntry[0] === targetLower) {
          lastUnknownEntry[1].push(calldata)
        } else {
          unknownContracts.push([targetLower, [calldata]])
        }
      }
    }

    return { dataByContract, unknownContracts }
  }, [abis, dtfContractAlias, targets, calldatas])
}

export default useDecodedCalldatas
