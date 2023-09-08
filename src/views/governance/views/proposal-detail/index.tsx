import { Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import { SmallButton } from 'components/button'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { blockAtom, walletAtom } from 'state/atoms'
import { Box, Grid } from 'theme-ui'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { formatEther } from 'viem'
import { useContractRead } from 'wagmi'
import {
  accountVotesAtom,
  getProposalStateAtom,
  proposalDetailAtom,
} from './atom'
import ProposalAlert from './components/ProposalAlert'
import ProposalDetailContent from './components/ProposalDetailContent'
import ProposalDetailStats from './components/ProposalDetailStats'
import ProposalExecute from './components/ProposalExecute'
import ProposalQueue from './components/ProposalQueue'
import ProposalVote from './components/ProposalVote'
import ProposalVotes from './components/ProposalVotes'
import useProposalDetail from './useProposalDetail'

const GovernanceProposalDetail = () => {
  const { proposalId } = useParams()
  const rToken = useRToken()
  const account = useAtomValue(walletAtom)
  const { data: proposal } = useProposalDetail(proposalId ?? '')
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVoting = useSetAtom(accountVotesAtom)
  const blockNumber = useAtomValue(blockAtom)
  const navigate = useNavigate()
  const { state } = useAtomValue(getProposalStateAtom)
  const { data: votePower } = useContractRead({
    address: proposal?.governor,
    abi: Governance,
    functionName: 'getVotes',
    args:
      account && proposal?.startBlock && blockNumber
        ? [account, BigInt(Math.min(proposal.startBlock - 1, blockNumber - 1))]
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

  console.log('state?', state)

  const handleBack = () => {
    navigate(`${ROUTES.GOVERNANCE}?token=${rToken?.address}`)
  }

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

  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
        mt={6}
        mb={5}
        px={[1, 7]}
      >
        <SmallButton variant="transparent" onClick={handleBack}>
          <Box variant="layout.verticalAlign">
            <ArrowLeft size={14} style={{ marginRight: 10 }} />
            <Trans>Back to governance</Trans>
          </Box>
        </SmallButton>
        <ProposalAlert />
        {state === PROPOSAL_STATES.SUCCEEDED && <ProposalQueue />}
        {state === PROPOSAL_STATES.QUEUED && <ProposalExecute />}
      </Box>
      <Grid
        columns={[1, 1, 1, '2fr 1.5fr']}
        gap={[3, 5]}
        px={[1, 5]}
        sx={{
          height: '100%',
          position: 'relative',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          overflowY: 'auto',
        }}
      >
        <Box>
          <ProposalDetailContent />
        </Box>
        <Box>
          {(state === PROPOSAL_STATES.PENDING ||
            state === PROPOSAL_STATES.ACTIVE) && <ProposalVote />}
          <ProposalDetailStats />
          <ProposalVotes />
        </Box>
      </Grid>
    </Box>
  )
}

export default GovernanceProposalDetail
