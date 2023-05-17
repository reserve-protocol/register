import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { getAddress } from 'ethers/lib/utils'
import { useAtomValue } from 'jotai'
import { Box, BoxProps } from 'theme-ui'
import { ContractProposal, InterfaceMap, interfaceMapAtom } from '../atoms'
import ContractProposalDetail from '../views/proposal-detail/components/ContractProposalDetails'

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

  for (let i = 0; i < addresses.length; i++) {
    try {
      const address = getAddress(addresses[i])
      const contractDetail = interfaceMap[address]

      if (contractDetail) {
        const functionCall = contractDetail.interface.getFunction(
          calldatas[i].slice(0, Math.min(calldatas[i].length, 10))
        )
        const signature = `${functionCall.name}(${functionCall.inputs
          .map((input) => `${input.name}: ${input.type}`)
          .join(', ')})`
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
          parameters: functionCall.inputs.map(
            (input) => `${input.name} (${input.type})`
          ),
          callData: calldatas[i],
          data,
        })
      } else {
        unparsed.push(calldatas[i])
      }
    } catch (e) {
      console.error('Error parsing call data', e)
    }
  }

  return [contractProposals, unparsed]
}

const ProposalDetail = ({ addresses, calldatas, ...props }: Props) => {
  const interfaceMap = useAtomValue(interfaceMapAtom)
  const [parse] = parseCallDatas(addresses, calldatas, interfaceMap)

  return (
    <Box>
      {Object.keys(parse).map((address, index) => (
        <SectionWrapper key={address} navigationIndex={index}>
          <ContractProposalDetail data={parse[address]} mb={4} />
        </SectionWrapper>
      ))}
    </Box>
  )
}

export default ProposalDetail
