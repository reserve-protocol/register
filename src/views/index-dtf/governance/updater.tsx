import { indexDTFAtom } from '@/state/dtf/atoms'
import { useIndexDtfProposalList } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { governanceProposalsAtom, refetchTokenAtom } from './atoms'

const Updater = () => {
  const setGovernanceProposals = useSetAtom(governanceProposalsAtom)
  const refetchToken = useAtomValue(refetchTokenAtom)
  const previousRefetchToken = useRef(refetchToken)
  const dtf = useAtomValue(indexDTFAtom)

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
    setGovernanceProposals(proposalList?.proposals)
  }, [proposalList?.proposals, setGovernanceProposals])

  useEffect(() => {
    if (previousRefetchToken.current === refetchToken) return

    previousRefetchToken.current = refetchToken

    if (hasProposalParams) void refetchProposals()
  }, [hasProposalParams, refetchProposals, refetchToken])

  return null
}

export default Updater
