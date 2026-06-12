import { dtfQueryKeys } from '@reserve-protocol/react-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { useIndexDtfIdentity } from '@reserve-protocol/react-sdk'
import { proposalDetailAtom } from '../atom'

const useRefreshProposal = () => {
  const queryClient = useQueryClient()
  const { address, chainId } = useIndexDtfIdentity()
  const proposal = useAtomValue(proposalDetailAtom)

  return useCallback(() => {
    if (!proposal) return

    void queryClient.invalidateQueries({
      queryKey: dtfQueryKeys.index.governance.proposal({
        address,
        chainId,
        proposalId: proposal.id,
      }),
    })

    void queryClient.invalidateQueries({
      queryKey: dtfQueryKeys.index.governance.proposalVotingSnapshot({
        chainId,
        proposalId: proposal.id,
      }),
    })

    void queryClient.invalidateQueries({
      queryKey: [...dtfQueryKeys.index.governance.all(), 'proposal-voter-state'],
    })

    void queryClient.invalidateQueries({
      queryKey: [...dtfQueryKeys.index.governance.all(), 'proposal-list'],
    })
  }, [address, chainId, proposal, queryClient])
}

export default useRefreshProposal
