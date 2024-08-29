import { Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import Button, { SmallButton } from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { useBlockMemo } from 'hooks/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { ArrowLeft, Download } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom, rTokenGovernanceAtom, walletAtom } from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { getCurrentTime } from 'utils'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'
import { isTimeunitGovernance } from 'views/governance/utils'
import { useContractRead } from 'wagmi'
import {
  ProposalDetail,
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
import useRToken from 'hooks/useRToken'

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

const ProposalSnapshot = ({
  proposal,
}: {
  proposal: ProposalDetail | null
}) => {
  const rToken = useRToken()
  const governance = useAtomValue(rTokenGovernanceAtom)

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
        <SmallButton variant="transparent" mr="auto" onClick={handleBack}>
          <Box variant="layout.verticalAlign">
            <ArrowLeft size={14} style={{ marginRight: 10 }} />
            <Trans>Back to governance</Trans>
          </Box>
        </SmallButton>
        <ProposalAlert />
        <ProposalSnapshot proposal={proposal} />
        {state === PROPOSAL_STATES.SUCCEEDED && <ProposalQueue />}
        {state === PROPOSAL_STATES.QUEUED && (
          <Box
            variant="layout.verticalAlign"
            sx={{
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
        columns={[1, 1, 1, '10fr 5fr']}
        gap={[0, 0, 0, 5]}
        px={[1, 5]}
        sx={{
          bg: 'reserveBackground',
          height: '100%',
          position: 'relative',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          overflowY: 'auto',
          py: '12px',
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
