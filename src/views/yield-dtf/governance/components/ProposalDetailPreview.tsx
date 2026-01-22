import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { Card } from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'
import { useAtomValue } from 'jotai'
import { Hex, decodeFunctionData, getAbiItem, getAddress } from 'viem'
import { ContractProposal, InterfaceMap, interfaceMapAtom } from '../atoms'
import ContractProposalDetail from '../views/proposal-detail/components/ContractProposalDetails'

interface Props {
  addresses: string[]
  calldatas: string[]
  snapshotBlock?: number
  borderColor?: string
  className?: string
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
  className,
  ...props
}: Props) => {
  const interfaceMap = useAtomValue(interfaceMapAtom)
  const [parse] = parseCallDatas(addresses, calldatas, interfaceMap)
  const calls = Object.keys(parse)

  return (
    <div className={className}>
      {!calls.length && (
        <Card className="p-4 mb-4 text-center">
          <Spinner size={18} />
          <span className="block">Loading execution details...</span>
        </Card>
      )}
      <div className="flex flex-col gap-4">
        {calls.map((address, index) => (
          <SectionWrapper key={address} navigationIndex={index}>
            <ContractProposalDetail
              data={parse[address]}
              snapshotBlock={snapshotBlock}
              {...props}
            />
          </SectionWrapper>
        ))}
      </div>
    </div>
  )
}

export default ProposalDetail
