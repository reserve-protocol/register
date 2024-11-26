import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Card, Spinner, Text } from 'theme-ui'
import { Hex, decodeFunctionData, getAbiItem, getAddress } from 'viem'
import { ContractProposal, InterfaceMap, interfaceMapAtom } from '../atoms'
import ContractProposalDetail from '../views/proposal-detail/components/ContractProposalDetails'

interface Props extends BoxProps {
  addresses: string[]
  calldatas: string[]
  snapshotBlock?: number
  borderColor?: string
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
        const functionCall = decodeFunctionData({
          abi: contractDetail.interface,
          data: calldatas[i] as Hex,
        })

        if (!contractProposals[address]) {
          contractProposals[address] = {
            address,
            label: contractDetail.label,
            calls: [],
          }
        }

        const result = getAbiItem({
          abi: contractDetail.interface,
          name: functionCall.functionName,
        })

        contractProposals[address].calls.push({
          signature: functionCall.functionName,
          parameters:
            result && 'inputs' in result
              ? result.inputs.map((input) => `${input.name}: ${input.type}`)
              : [],
          callData: calldatas[i],
          data: functionCall.args ?? [],
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

const ProposalDetail = ({
  addresses,
  calldatas,
  snapshotBlock,
  ...props
}: Props) => {
  const interfaceMap = useAtomValue(interfaceMapAtom)
  const [parse] = parseCallDatas(addresses, calldatas, interfaceMap)
  const calls = Object.keys(parse)

  return (
    <Box>
      {!calls.length && (
        <Card p={4} mb={4} sx={{ textAlign: 'center' }}>
          <Spinner size={18} />
          <Text sx={{ display: 'block' }}>Loading execution details...</Text>
        </Card>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {calls.map((address, index) => (
          <SectionWrapper key={address} navigationIndex={index}>
            <ContractProposalDetail
              data={parse[address]}
              snapshotBlock={snapshotBlock}
              {...props}
            />
          </SectionWrapper>
        ))}
      </Box>
    </Box>
  )
}

export default ProposalDetail
