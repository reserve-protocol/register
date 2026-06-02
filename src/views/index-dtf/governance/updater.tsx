import { indexDTFAtom } from '@/state/dtf/atoms'
import { chainIdAtom, timestampAtom } from '@/state/atoms'
import { useIndexDtfProposalList } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import {
  governanceProposalsAtom,
  proposalCountAtom,
  recentProposalsAtom,
  refetchTokenAtom,
} from './atoms'
import { mergeRecentProposals } from './utils/recent-proposals'

const Updater = () => {
  const setGovernanceProposals = useSetAtom(governanceProposalsAtom)
  const setProposalCount = useSetAtom(proposalCountAtom)
  const refetchToken = useAtomValue(refetchTokenAtom)
  const previousRefetchToken = useRef(refetchToken)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const timestamp = useAtomValue(timestampAtom)
  const recentProposals = useAtomValue(recentProposalsAtom)

  const proposalParams =
    dtf?.ownerGovernance?.id && dtf?.stToken?.id
      ? { dtf, limit: 100 }
      : undefined
  const hasProposalParams = !!proposalParams

  const { data: proposalList, refetch: refetchProposals } =
    useIndexDtfProposalList(proposalParams, {
      refetchInterval: 1000 * 60, // 1m
    })

  useEffect(() => {
    const merged = mergeRecentProposals({
      subgraphProposals: proposalList?.proposals,
      proposalCount: proposalList?.proposalCount,
      recentProposals,
      chainId,
      dtf: dtf?.id,
    })

    setGovernanceProposals(merged.proposals)
    setProposalCount(merged.proposalCount)
  }, [
    chainId,
    dtf?.id,
    proposalList?.proposalCount,
    proposalList?.proposals,
    recentProposals,
    setGovernanceProposals,
    setProposalCount,
    timestamp,
  ])

  useEffect(() => {
    if (previousRefetchToken.current === refetchToken) return

    previousRefetchToken.current = refetchToken

    if (hasProposalParams) void refetchProposals()
  }, [hasProposalParams, refetchProposals, refetchToken])

  return null
}

export default Updater
