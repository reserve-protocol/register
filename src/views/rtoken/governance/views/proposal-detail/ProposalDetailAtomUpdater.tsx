import Governance from 'abis/Governance'
import { useBlockMemo } from 'hooks/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { getCurrentTime } from 'utils'
import { formatEther } from 'viem'
import { isTimeunitGovernance } from '@/views/rtoken/governance/utils'
import { accountVotesAtom, proposalDetailAtom } from './atom'
import useProposalDetail from './useProposalDetail'
import { useReadContract } from 'wagmi'

const ProposalDetailAtomUpdater = () => {
  const { proposalId } = useParams()
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const { data: proposal } = useProposalDetail(proposalId ?? '')
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVoting = useSetAtom(accountVotesAtom)
  const blockNumber = useBlockMemo()

  const { data: votePower } = useReadContract({
    address: proposal?.governor,
    abi: Governance,
    functionName: 'getVotes',
    chainId,
    args:
      account && proposal?.startBlock && blockNumber
        ? [
            account,
            BigInt(
              Math.min(
                proposal.startBlock - 1,
                isTimeunitGovernance(proposal.version)
                  ? getCurrentTime()
                  : blockNumber - 1
              )
            ),
          ]
        : undefined,
  })
  const accountVote = useMemo(() => {
    if (!proposal || !account) {
      return null
    }

    const accountVote = proposal.votes.find(
      (vote) => vote.voter.toLowerCase() === account.toLowerCase()
    )

    return accountVote?.choice ?? null
  }, [proposal, account])

  useEffect(() => {
    if (proposal) {
      setProposalDetail(proposal)
    }
  }, [JSON.stringify(proposal)])

  useEffect(() => {
    setAccountVoting({
      votePower: votePower ? formatEther(votePower) : null,
      vote: accountVote,
    })
  }, [votePower, accountVote])

  useEffect(() => {
    return () => {
      setProposalDetail(null)
      setAccountVoting({ votePower: null, vote: null })
    }
  }, [])

  return null
}

export default ProposalDetailAtomUpdater
