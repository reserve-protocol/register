import { Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import Button, { SmallButton } from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { useBlockMemo } from 'hooks/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { getCurrentTime } from 'utils'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'
import { isTimeunitGovernance } from 'views/governance/utils'
import { useContractRead } from 'wagmi'
import {
  accountVotesAtom,
  getProposalStateAtom,
  proposalDetailAtom,
} from './atom'
import ProposalAlert from './components/ProposalAlert'
import ProposalCancel from './components/ProposalCancel'
import ProposalDetailContent from './components/ProposalDetailContent'
import ProposalDetailStats from './components/ProposalDetailStats'
import ProposalExecute from './components/ProposalExecute'
import ProposalQueue from './components/ProposalQueue'
import ProposalVote from './components/ProposalVote'
import ProposalVotes from './components/ProposalVotes'
import useProposalDetail from './useProposalDetail'

const GovernanceProposalDetail = () => {
  const { proposalId } = useParams()
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const { data: proposal } = useProposalDetail(proposalId ?? '')
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVoting = useSetAtom(accountVotesAtom)
  const blockNumber = useBlockMemo()
  const navigate = useNavigate()
  const { state } = useAtomValue(getProposalStateAtom)
  const { data: votePower } = useContractRead({
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

  const handleBack = () => {
    navigate(`../${ROUTES.GOVERNANCE}`)
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
    <Box variant="layout.wrapper">
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
        {state === PROPOSAL_STATES.QUEUED && (
          <Box
            variant="layout.verticalAlign"
            sx={{
              ml: 'auto',
              gap: 3,
              ':not(:has(> *))': { ml: 0 },
            }}
          >
            <ProposalCancel />
            <ProposalExecute />
          </Box>
        )}
        {!!proposal?.executionTxnHash && (
          <Button
            small
            variant="muted"
            sx={{ display: 'flex', alignItems: 'center' }}
            onClick={() =>
              window.open(
                getExplorerLink(
                  proposal.executionTxnHash,
                  chainId,
                  ExplorerDataType.TRANSACTION
                ),
                '_blank'
              )
            }
          >
            <ExternalArrowIcon />
            <Text ml={2}>View execute tx</Text>
          </Button>
        )}
      </Box>
      <Grid
        columns={[1, 1, 1, '2fr 1.5fr']}
        gap={[0, 0, 0, 5]}
        px={[1, 5]}
        sx={{
          height: '100%',
          position: 'relative',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          overflowY: 'auto',
        }}
      >
        <ProposalDetailContent />
        <Box>
          {(state === PROPOSAL_STATES.PENDING ||
            state === PROPOSAL_STATES.ACTIVE) && <ProposalVote mb="4" />}
          <ProposalDetailStats />
          <ProposalVotes />
        </Box>
      </Grid>
    </Box>
  )
}

export default GovernanceProposalDetail
