import { PartialProposal } from '@/lib/governance'
import {
  useCurrentIndexDtf,
  useIndexDtfDelegates,
  useIndexDtfProposalList,
  type IndexDtfDelegate,
  type IndexDtfProposalSummary,
} from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import { indexGovernanceOverviewAtom, refetchTokenAtom } from './atoms'

const mapProposal = (proposal: IndexDtfProposalSummary): PartialProposal => {
  return {
    id: proposal.id,
    timelockId: '',
    description: proposal.description,
    creationTime: proposal.creationTime,
    creationBlock: proposal.creationBlock,
    state: proposal.state,
    forWeightedVotes: proposal.forWeightedVotes,
    abstainWeightedVotes: proposal.abstainWeightedVotes,
    againstWeightedVotes: proposal.againstWeightedVotes,
    quorumVotes: proposal.quorumVotes,
    voteStart: proposal.voteStart,
    voteEnd: proposal.voteEnd,
    executionETA: proposal.executionETA,
    executionTime: proposal.executionTime?.toString(),
    executionBlock: proposal.executionBlock?.toString(),
    isOptimistic: proposal.isOptimistic,
    wasChallenged: proposal.wasChallenged,
    challengedProposalId: proposal.challengedProposalId,
    voteToken: proposal.voteToken,
    votingState: proposal.votingState,
    proposer: {
      address: proposal.proposer as Address,
    },
  }
}

const mapDelegate = (delegate: IndexDtfDelegate) => {
  return {
    address: delegate.address,
    delegatedVotes: Number(delegate.delegatedVotes.formatted),
    numberVotes: delegate.numberVotes,
  }
}

// TODO: This updater assumes that DTF share same stToken between owner and trading
// TODO: Maybe move this updater to the top of the context? and reset on token change
const Updater = () => {
  const setGovernanceOverview = useSetAtom(indexGovernanceOverviewAtom)
  const refetchToken = useAtomValue(refetchTokenAtom)
  const previousRefetchToken = useRef(refetchToken)
  const { data: dtf, refetch: refetchDtf } = useCurrentIndexDtf({
    refetchInterval: 1000 * 60 * 10,
  })

  const proposalParams =
    dtf?.ownerGovernance?.id && dtf?.stToken?.id
      ? { dtf, limit: 100 }
      : undefined
  const delegateParams = dtf?.stToken?.id
    ? { chainId: dtf.chainId, stToken: dtf.stToken.id, limit: 10 }
    : undefined

  const { data: proposalList, refetch: refetchProposals } =
    useIndexDtfProposalList(proposalParams, {
      refetchInterval: 1000 * 60,
    })
  const { data: delegates, refetch: refetchDelegates } = useIndexDtfDelegates(
    delegateParams,
    {
      refetchInterval: 1000 * 60 * 10,
    }
  )

  useEffect(() => {
    if (previousRefetchToken.current === refetchToken) return

    previousRefetchToken.current = refetchToken

    void refetchDtf()
    if (proposalParams) void refetchProposals()
    if (delegateParams) void refetchDelegates()
  }, [
    delegateParams,
    proposalParams,
    refetchDelegates,
    refetchDtf,
    refetchProposals,
    refetchToken,
  ])

  useEffect(() => {
    if (proposalList && delegates && dtf?.voteLockVault) {
      setGovernanceOverview({
        proposals: proposalList.proposals.map(mapProposal),
        proposalCount: proposalList.proposalCount,
        delegates: delegates.map(mapDelegate),
        delegatesCount: dtf.voteLockVault.delegation.totalDelegates,
        voteSupply: Number(
          dtf.voteLockVault.token.snapshot.totalSupply.formatted
        ),
      })
    } else {
      setGovernanceOverview(undefined)
    }
  }, [delegates, dtf?.voteLockVault, proposalList, setGovernanceOverview])

  return null
}

export default Updater
