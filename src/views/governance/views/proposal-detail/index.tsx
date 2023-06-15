import { Trans } from '@lingui/macro'
import { GovernanceInterface } from 'abis'
import { SmallButton } from 'components/button'
import { formatEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getValidWeb3Atom,
  multicallAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import { Box, Grid } from 'theme-ui'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
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
  const { account } = useAtomValue(getValidWeb3Atom)
  const multicall = useAtomValue(multicallAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const { data: proposal, loading } = useProposalDetail(proposalId ?? '')
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVoting = useSetAtom(accountVotesAtom)
  const blockNumber = useBlockNumber()
  const navigate = useNavigate()
  const { state } = useAtomValue(getProposalStateAtom)

  const handleBack = () => {
    navigate(`${ROUTES.GOVERNANCE}?token=${rToken?.address}`)
  }

  useEffect(() => {
    if (proposal) {
      setProposalDetail(proposal)
    }
  }, [JSON.stringify(proposal)])

  useEffect(() => {
    return () => {
      setProposalDetail(null)
      setAccountVoting({ votePower: null, vote: null })
    }
  }, [])

  // TODO: Get governor from proposal
  const fetchAccountVotingPower = async () => {
    if (
      account &&
      multicall &&
      proposal &&
      !!blockNumber &&
      governance.governor
    ) {
      try {
        const accountVote = proposal.votes.find(
          (vote) => vote.voter.toLowerCase() === account.toLowerCase()
        )
        let votePower = '0'

        if (!accountVote) {
          const [result] = await multicall([
            {
              abi: GovernanceInterface,
              method: 'getVotes',
              address: governance.governor,
              args: [
                account,
                Math.min(proposal.startBlock - 1, blockNumber - 1),
              ],
            },
          ])

          votePower = result ? formatEther(result) : '0'
        } else {
          votePower = accountVote.weight
        }

        setAccountVoting({
          votePower,
          vote: accountVote ? accountVote.choice : null,
        })
      } catch (e) {
        console.error('Error fetching voting power', e)
      }
    }
  }

  useEffect(() => {
    fetchAccountVotingPower()
  }, [account, multicall, !!blockNumber && JSON.stringify(proposal)])

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
