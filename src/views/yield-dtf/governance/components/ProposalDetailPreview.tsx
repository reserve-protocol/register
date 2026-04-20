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

const parseCallDatas = (
  addresses: string[],
  calldatas: string[],
  interfaceMap: InterfaceMap
): [ContractProposal[], string[]] => {
  const contractProposals: ContractProposal[] = []
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

        const result = getAbiItem({
          abi: contractDetail.interface,
          name: functionCall.functionName,
        })

        const call = {
          signature: functionCall.functionName,
          parameters:
            result && 'inputs' in result
              ? result.inputs.map((input) => `${input.name}: ${input.type}`)
              : [],
          callData: calldatas[i],
          data: functionCall.args ?? [],
        }

        // Group consecutive calls to the same address
        const lastEntry = contractProposals[contractProposals.length - 1]
        if (lastEntry && lastEntry.address === address) {
          lastEntry.calls.push(call)
        } else {
          contractProposals.push({
            address,
            label: contractDetail.label,
            calls: [call],
          })
        }
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
  const [groups] = parseCallDatas(addresses, calldatas, interfaceMap)

  return (
    <div className='bg-secondary p-1 rounded-4xl'>
      {!groups.length && (
        <Card className="p-4 mb-4 text-center">
          <Spinner size={18} />
          <span className="block">Loading execution details...</span>
        </Card>
      )}
      <div className="flex flex-col gap-4">
        {groups.map((group, index) => (
          <SectionWrapper key={`${group.address}-${index}`} navigationIndex={index}>
            <ContractProposalDetail
              data={group}
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
