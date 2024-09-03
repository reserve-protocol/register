import Button from 'components/button'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { Download } from 'react-feather'
import { useParams } from 'react-router-dom'
import { rTokenGovernanceAtom } from 'state/atoms'
import { Text } from 'theme-ui'
import useProposalDetail from './useProposalDetail'

const JSONToFile = (obj: any, filename: string) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const ProposalSnapshot = () => {
  const rToken = useRToken()
  const governance = useAtomValue(rTokenGovernanceAtom)
  const { proposalId } = useParams()
  const { data: proposal } = useProposalDetail(proposalId ?? '')

  const handleSnapshot = () => {
    if (proposal && governance.timelock && rToken) {
      const snapshot = {
        proposalId: proposal.id,
        governor: proposal.governor,
        calldatas: proposal.calldatas,
        values: proposal.calldatas.map(() => ({
          type: 'BigNumber',
          hex: '0x00',
        })),
        targets: proposal.targets,
        description: proposal.description,
        rtoken: rToken.address,
        timelock: governance.timelock,
      }

      JSONToFile(snapshot, `${rToken?.symbol}-${proposal.id}`)
    }
  }

  return (
    <Button
      small
      variant="bordered"
      onClick={handleSnapshot}
      disabled={!proposal}
      mr={3}
    >
      <Download size={14} />
      <Text ml={2}>Download snapshot</Text>
    </Button>
  )
}

export default ProposalSnapshot
