import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useBlockMemo } from 'hooks/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Circle } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import {
  chainIdAtom,
  rTokenGovernanceAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { Badge, Box, Text } from 'theme-ui'
import { StringMap } from 'types'
import { formatPercentage, getProposalTitle, parseDuration } from 'utils'
import { PROPOSAL_STATES, formatConstant } from 'utils/constants'
import { getProposalState } from '../views/proposal-detail/atom'
import type { ProposalVotingState as IProposalVotingState } from '../views/proposal-detail/atom'

const query = gql`
  query getProposals($id: String!) {
    proposals(
      where: { governance: $id }
      orderBy: creationTime
      orderDirection: desc
    ) {
      id
      description
      creationTime
      state
      governance
      forWeightedVotes
      abstainWeightedVotes
      againstWeightedVotes
      executionETA
      quorumVotes
      startBlock
      endBlock
      governanceFramework {
        name
      }
    }
  }
`

const BADGE_VARIANT: StringMap = {
  [PROPOSAL_STATES.DEFEATED]: 'danger',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'danger',
  [PROPOSAL_STATES.ACTIVE]: 'info',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'danger',
}

const useProposals = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const response = useQuery(rToken ? query : null, {
    id: (rToken ?? '').toLowerCase(),
  })

  return useMemo(() => {
    const { data, error } = response

    return {
      data: data?.proposals ?? [],
      error: !!error,
      loading: !data?.proposals && !error,
    }
  }, [JSON.stringify(response)])
}

export const ProposalVotingState = ({
  data,
}: {
  data: IProposalVotingState
}) => (
  <>
    {(data.state === PROPOSAL_STATES.ACTIVE ||
      data.state === PROPOSAL_STATES.QUEUED) &&
      data.deadline &&
      data.deadline > 0 && (
        <Box variant="layout.verticalAlign" sx={{ fontSize: 1 }}>
          <Text variant="legend">
            {data.state === PROPOSAL_STATES.ACTIVE
              ? 'Voting ends in:'
              : 'Execution available in:'}
          </Text>
          <Text variant="strong" ml="1">
            {parseDuration(data.deadline, {
              units: ['d', 'h'],
              round: true,
            })}
          </Text>
        </Box>
      )}
    {data.state === PROPOSAL_STATES.PENDING && data.deadline ? (
      <Box variant="layout.verticalAlign" mt={2} sx={{ fontSize: 1 }}>
        Voting starts in:{' '}
        <Text variant="strong" ml="1">
          {parseDuration(data.deadline, {
            units: ['d', 'h'],
            round: true,
          })}
        </Text>
      </Box>
    ) : (
      <Box variant="layout.verticalAlign" mt={2} sx={{ gap: 2, fontSize: 1 }}>
        <div>
          <Text variant="legend">
            <Trans>Quorum?:</Trans>{' '}
          </Text>
          <Text
            style={{ fontWeight: 500 }}
            color={data.quorum ? 'success' : 'warning'}
          >
            {data.quorum ? 'Yes' : 'No'}
          </Text>
        </div>
        <Circle size={4} />
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="legend">Votes:</Text>
          <Text color="primary" variant="strong">
            {formatPercentage(data.for)}
          </Text>
          /
          <Text color="danger" variant="strong">
            {formatPercentage(data.against)}
          </Text>
          /<Text variant="legend">{formatPercentage(data.abstain)}</Text>
        </Box>
      </Box>
    )}
  </>
)

// {dayjs.unix(+proposal.creationTime).format('YYYY-M-D')}

const ProposalItem = ({ proposal }: { proposal: StringMap }) => {
  const navigate = useNavigate()
  const blockNumber = useBlockMemo()
  const chain = useAtomValue(chainIdAtom)
  const proposalState = useMemo(
    () => getProposalState(proposal, blockNumber || 0, chain),
    [proposal, blockNumber, chain]
  )

  return (
    <Box
      p={3}
      key={proposal.id}
      sx={{
        backgroundColor: 'backgroundNested',
        borderBottom: '1px solid',
        borderColor: 'border',
        cursor: 'pointer',
        ':hover': {
          borderColor: 'backgroundNested',
          backgroundColor: 'border',
        },
      }}
      variant="layout.verticalAlign"
      onClick={() => navigate(`proposal/${proposal.id}`)}
    >
      <Box mr={3}>
        <Text variant="strong">{getProposalTitle(proposal.description)}</Text>
        <ProposalVotingState data={proposalState} />
      </Box>
      <Badge
        ml="auto"
        sx={{ flexShrink: 0 }}
        variant={BADGE_VARIANT[proposalState.state] || 'muted'}
      >
        {formatConstant(proposalState.state)}
      </Badge>
    </Box>
  )
}

const ProposalList = () => {
  const navigate = useNavigate()
  const { data } = useProposals()
  const governance = useAtomValue(rTokenGovernanceAtom)

  const disabled = useMemo(
    () => governance.name === 'Custom',
    [governance.name]
  )

  return (
    <Box
      variant="layout.card"
      p={2}
      sx={{
        backgroundColor: 'contentBackground',
        border: '3px solid',
        borderColor: 'borderFocused',
      }}
    >
      <Box px={3} py={3} variant="layout.verticalAlign">
        <Text variant="sectionTitle">
          <Trans>Recent proposals</Trans>
        </Text>
        <SmallButton
          ml="auto"
          onClick={() => navigate('proposal')}
          disabled={disabled}
        >
          <Trans>Create proposal</Trans>
        </SmallButton>
      </Box>
      <Box
        mt={2}
        sx={{
          maxHeight: 540,
          overflow: 'scroll',
          borderRadius: '6px',
          '::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {!data.length && (
          <Box py={4} mt={4} sx={{ textAlign: 'center' }}>
            <EmptyBoxIcon />
            <Text
              mt={4}
              variant="legend"
              sx={{
                display: 'block',
              }}
            >
              <Trans>No proposals created...</Trans>
            </Text>
          </Box>
        )}
        {data.map((proposal: StringMap) => (
          <ProposalItem key={proposal.id} proposal={proposal} />
        ))}
      </Box>
    </Box>
  )
}

export default ProposalList
