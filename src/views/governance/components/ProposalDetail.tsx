import { useAtomValue } from 'jotai'
import { Box, BoxProps } from 'theme-ui'
import { ContractProposal, InterfaceMap, interfaceMapAtom } from '../atoms'

interface Props extends BoxProps {
  addresses: string[]
  calldatas: string[]
}

type ContractProposalMap = {
  [x: string]: ContractProposal
}

const parseCallDatas = (
  addresses: string[],
  calldatas: string[],
  interfaceMap: InterfaceMap
): [ContractProposalMap, string[]] => {
  const contractProposals: ContractProposalMap = {}
  const unparsed: string[] = []

  try {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const contractDetail = interfaceMap[address]

      if (contractDetail) {
        const functionCall = contractDetail.interface.getFunction(
          calldatas[i].slice(0, 10)
        )
        const signature = `${functionCall.name}${functionCall.inputs
          .map((input) => `${input.name}: ${input.type}`)
          .join(', ')}`
        const data = contractDetail.interface.decodeFunctionData(
          functionCall.name,
          calldatas[i]
        )

        if (!contractProposals[address]) {
          contractProposals[address] = {
            address,
            label: contractDetail.label,
            calls: [],
          }
        }
        contractProposals[address].calls.push({
          signature,
          callData: calldatas[i],
          data,
        })
      } else {
        unparsed.push(calldatas[i])
      }
    }
  } catch (e) {
    console.error('Error parsing call datas')
  }

  return [contractProposals, unparsed]
}

// const DetailComponentMap = {
//   [contractDetails.main.label]:
// }

const ProposalDetail = ({ addresses, calldatas, ...props }: Props) => {
  const interfaceMap = useAtomValue(interfaceMapAtom)
  const parse = parseCallDatas(addresses, calldatas, interfaceMap)

  return <Box>proposal detail</Box>
}

export default ProposalDetail
