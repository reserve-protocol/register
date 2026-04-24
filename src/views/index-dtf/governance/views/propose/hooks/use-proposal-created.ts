import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import {
  parseEventLogs,
  type TransactionReceipt,
  type Address,
  type Hex,
} from 'viem'
import { toast } from 'sonner'
import dtfIndexGovernance from '@/abis/dtf-index-governance'
import { getProposalState, type ProposalDetail } from '@/lib/governance'
import { proposalDetailAtom } from '../../proposal/atom'
import { ROUTES } from '@/utils/constants'

export interface SubmitProposalData {
  targets: Address[]
  calldatas: Hex[]
  description: string
  govAddress: Address
  proposer: Address
}

interface UseProposalCreatedParams {
  receipt: TransactionReceipt | undefined
  dataRef: React.RefObject<SubmitProposalData | null>
}

const useProposalCreated = ({ receipt, dataRef }: UseProposalCreatedParams) => {
  const navigate = useNavigate()
  const setProposalDetail = useSetAtom(proposalDetailAtom)

  useEffect(() => {
    if (!receipt || receipt.status !== 'success') return

    const data = dataRef.current
    if (!data) return

    const events = parseEventLogs({
      abi: dtfIndexGovernance,
      logs: receipt.logs,
      eventName: 'ProposalCreated',
    })

    const event = events[0]
    if (!event) {
      toast.success('Proposal created')
      navigate(`../${ROUTES.GOVERNANCE}`)
      return
    }

    const { proposalId, voteStart, voteEnd } = event.args
    const id = proposalId.toString()

    const optimistic: ProposalDetail = {
      id,
      timelockId: '0x' + proposalId.toString(16).padStart(64, '0'),
      description: data.description,
      creationTime: Math.floor(Date.now() / 1000),
      creationBlock: Number(receipt.blockNumber),
      state: 'PENDING',
      voteStart: Number(voteStart),
      voteEnd: Number(voteEnd),
      forWeightedVotes: 0,
      againstWeightedVotes: 0,
      abstainWeightedVotes: 0,
      quorumVotes: 0,
      calldatas: data.calldatas,
      targets: data.targets,
      proposer: { address: data.proposer },
      votes: [],
      governor: data.govAddress,
      forDelegateVotes: '0',
      abstainDelegateVotes: '0',
      againstDelegateVotes: '0',
      votingState: {
        state: 'PENDING',
        deadline: null,
        quorum: false,
        for: 0,
        against: 0,
        abstain: 0,
      },
    }

    optimistic.votingState = getProposalState(optimistic)
    optimistic.state = optimistic.votingState.state

    setProposalDetail(optimistic)

    toast.success('Proposal created', {
      description: 'Redirecting to proposal page...',
    })

    navigate(`../${ROUTES.GOVERNANCE_PROPOSAL}/${id}`)
  }, [receipt])
}

export default useProposalCreated
