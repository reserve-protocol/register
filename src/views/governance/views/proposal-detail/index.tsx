import { Trans } from '@lingui/macro'
import MDEditor from '@uiw/react-md-editor'
import { useWeb3React } from '@web3-react/core'
import { GovernanceInterface } from 'abis'
import { SmallButton } from 'components/button'
import GoTo from 'components/button/GoTo'
import dayjs from 'dayjs'
import { BigNumber } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { rTokenGovernanceAtom } from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { Box, Card, Divider, Grid, Image, Text } from 'theme-ui'
import { parseDuration, shortenAddress } from 'utils'
import { CHAIN_ID } from 'utils/chains'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import ProposalDetail from 'views/governance/components/ProposalDetailPreview'
import {
  accountVotesAtom,
  getProposalStateAtom,
  proposalDetailAtom,
} from './atom'
import ProposalAction from './components/ProposalAction'
import ProposalDetailStats from './components/ProposalDetailStats'
import ProposalVotes from './components/ProposalVotes'
import useProposalDetail from './useProposalDetail'

const ProposalAlert = () => {
  const state = useAtomValue(getProposalStateAtom)

  if (!state.deadline) {
    return null
  }

  const deadline = parseDuration(state.deadline, {
    units: ['d', 'h', 'm'],
    round: true,
  })

  return (
    <Box
      ml="auto"
      py={2}
      px={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        background: 'infoBG',
        borderRadius: '30px',
        color: 'info',
        fontSize: 0,
      }}
    >
      <Image src="/svgs/asterisk.svg" />
      <Text ml={2} mr="1" sx={{ fontWeight: 500 }}>
        {state.state === PROPOSAL_STATES.ACTIVE && (
          <Trans>Voting ends in:</Trans>
        )}
        {state.state === PROPOSAL_STATES.PENDING && (
          <Trans>Voting starts in:</Trans>
        )}
        {state.state === PROPOSAL_STATES.QUEUED && (
          <Trans>Execution delay ends in:</Trans>
        )}
      </Text>
      {deadline}
    </Box>
  )
}

const GovernanceProposalDetail = () => {
  const { proposalId } = useParams()
  const rToken = useRToken()
  const { account, provider, chainId } = useWeb3React()
  const governance = useAtomValue(rTokenGovernanceAtom)
  const { data: proposal, loading } = useProposalDetail(proposalId ?? '')
  const setProposalDetail = useSetAtom(proposalDetailAtom)
  const setAccountVoting = useSetAtom(accountVotesAtom)
  const blockNumber = useBlockNumber()
  const navigate = useNavigate()

  let title = 'Loading...'
  let description = ''

  if (proposal?.description) {
    const [heading, ...content] = proposal.description.split(/\r?\n/)
    title = heading.replaceAll('#', '').trim()
    description = content.join('\n')
  }

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
      provider &&
      proposal &&
      !!blockNumber &&
      governance.governor &&
      chainId === CHAIN_ID
    ) {
      try {
        const accountVote = proposal.votes.find(
          (vote) => vote.voter.toLowerCase() === account.toLowerCase()
        )
        let votePower = '0'

        if (!accountVote) {
          const [result] = await promiseMulticall(
            [
              {
                abi: GovernanceInterface,
                method: 'getVotes',
                address: governance.governor,
                args: [
                  account,
                  Math.min(proposal.startBlock - 1, blockNumber - 1),
                ],
              },
            ],
            provider
          )

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
  }, [account, provider, chainId, !!blockNumber && JSON.stringify(proposal)])

  return (
    <Grid
      columns={[1, 1, 1, '2fr 1.5fr']}
      gap={[3, 5]}
      padding={[1, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        overflowY: 'auto',
      }}
    >
      <Box>
        <Box variant="layout.verticalAlign" mb={4}>
          <SmallButton variant="muted" onClick={handleBack}>
            <Box variant="layout.verticalAlign">
              <ArrowLeft size={14} style={{ marginRight: 10 }} />
              <Trans>Back</Trans>
            </Box>
          </SmallButton>
          <ProposalAlert />
        </Box>

        <Card p={4} mb={4}>
          <Text variant="title" mb={2}>
            {title}
          </Text>
          <Box variant="layout.verticalAlign" sx={{ fontSize: 1 }}>
            <Text variant="legend" mr={1}>
              <Trans>Proposed by</Trans>:
            </Text>
            <Text>
              {proposal?.proposer
                ? shortenAddress(proposal.proposer)
                : 'Loading...'}
            </Text>
            {!!proposal?.proposer && (
              <GoTo
                ml={1}
                href={getExplorerLink(
                  proposal.proposer,
                  ExplorerDataType.ADDRESS
                )}
              />
            )}

            <Text variant="legend" ml={3} mr={1}>
              <Trans>Proposed on</Trans>:
            </Text>
            <Text>
              {proposal?.creationTime
                ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
                : 'Loading...'}
            </Text>
          </Box>
          <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          <MDEditor.Markdown
            source={description}
            style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }}
          />
        </Card>
        {!!proposal && (
          <ProposalDetail
            addresses={proposal.targets}
            calldatas={proposal.calldatas}
          />
        )}
      </Box>
      <Box>
        <ProposalAction />
        <ProposalDetailStats />
        <ProposalVotes />
      </Box>
    </Grid>
  )
}

export default GovernanceProposalDetail
