import { Trans, useLingui } from '@lingui/react/macro'
import AddressHovercard, {
  AddressHovercardGroup,
} from '@/components/governance/address-hovercard'
import { Button } from '@/components/ui/button'
import EnsName from '@/components/utils/ens-name'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { gql } from 'graphql-request'
import useQuery from 'hooks/use-query'
import { useBlockMemo } from 'hooks/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  chainIdAtom,
  rTokenGovernanceAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { StringMap } from 'types'
import { formatPercentage, getProposalTitle, parseDuration } from 'utils'
import { PROPOSAL_STATES, formatConstant } from 'utils/constants'
import { getProposalState } from '../views/proposal-detail/atom'
import type { ProposalVotingState as IProposalVotingState } from '../views/proposal-detail/atom'
import { cn } from '@/lib/utils'

const query = gql`
  query getProposals($id: String!) {
    proposals(
      where: { governance: $id }
      orderBy: creationTime
      orderDirection: desc
    ) {
      id
      description
      proposer {
        address
      }
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

const BADGE_COLORS: Record<string, string> = {
  [PROPOSAL_STATES.DEFEATED]: 'bg-destructive/10 text-destructive',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'bg-destructive/10 text-destructive',
  [PROPOSAL_STATES.ACTIVE]: 'bg-primary/10 text-primary',
  [PROPOSAL_STATES.EXECUTED]: 'bg-success/10 text-success',
  [PROPOSAL_STATES.CANCELED]: 'bg-destructive/10 text-destructive',
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
}) => {
  const { t } = useLingui()
  return (
  <>
    {(data.state === PROPOSAL_STATES.ACTIVE ||
      data.state === PROPOSAL_STATES.QUEUED) &&
      data.deadline &&
      data.deadline > 0 && (
        <div className="flex items-center text-xs">
          <span className="text-legend">
            {data.state === PROPOSAL_STATES.ACTIVE
              ? t`Voting ends in:`
              : t`Execution available in:`}
          </span>
          <span className="font-semibold ml-1">
            {parseDuration(data.deadline, {
              units: ['d', 'h'],
              round: true,
            })}
          </span>
        </div>
      )}
    {data.state === PROPOSAL_STATES.PENDING && data.deadline ? (
      <div className="flex items-center mt-2 text-xs">
        <Trans>Voting starts in:</Trans>{' '}
        <span className="font-semibold ml-1">
          {parseDuration(data.deadline, {
            units: ['d', 'h'],
            round: true,
          })}
        </span>
      </div>
    ) : (
      <div className="flex items-center mt-2 gap-2 text-xs">
        <div>
          <span className="text-legend">
            <Trans>Quorum?:</Trans>{' '}
          </span>
          <span
            className={cn('font-medium', data.quorum ? 'text-success' : 'text-warning')}
          >
            {data.quorum ? t`Yes` : t`No`}
          </span>
        </div>
        <Circle size={4} />
        <div className="flex items-center gap-1">
          <span className="text-legend">
            <Trans>Votes:</Trans>
          </span>
          <span className="text-primary font-semibold">
            {formatPercentage(data.for)}
          </span>
          /
          <span className="text-destructive font-semibold">
            {formatPercentage(data.against)}
          </span>
          /<span className="text-legend">{formatPercentage(data.abstain)}</span>
        </div>
      </div>
    )}
  </>
  )
}

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
    <div
      className="p-4 bg-background border-b border-border cursor-pointer hover:border-muted hover:bg-border flex items-center"
      onClick={() => navigate(`proposal/${proposal.id}`)}
    >
      <div className="mr-4 flex min-w-0 flex-col">
        <span className="font-semibold">{getProposalTitle(proposal.description)}</span>
        <ProposalVotingState data={proposalState} />
        {proposal.proposer?.address && (
          <div className="mt-1 flex min-w-0 items-center gap-1 text-sm text-legend">
            <Trans>by</Trans>
            <AddressHovercard
              address={proposal.proposer.address}
              surface="proposal_list"
              eventAt={+proposal.creationTime}
              dtfType="yield"
              className="text-foreground"
            >
              <EnsName address={proposal.proposer.address} className="truncate" />
            </AddressHovercard>
          </div>
        )}
      </div>
      <span
        className={cn(
          'ml-auto shrink-0 px-2 py-1 rounded-full text-xs font-medium',
          BADGE_COLORS[proposalState.state] || 'bg-muted text-muted-foreground'
        )}
      > 
        {formatConstant(proposalState.state)}
      </span>
    </div>
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
    <div className="rounded-3xl p-2 bg-card border-[3px] border-secondary">
      <div className="px-4 py-3 flex items-center">
        <span className="text-lg font-bold">
          <Trans>Recent proposals</Trans>
        </span>
        <Button
          size="sm"
          onClick={() => navigate('proposal')}
          disabled={disabled}
          className="ml-auto"
        >
          <Trans>Create proposal</Trans>
        </Button>
      </div>
      <div className="mt-2 max-h-[540px] overflow-auto rounded-2xl scrollbar-hide">
        {!data.length && (
          <div className="py-4 mt-4 text-center">
            <EmptyBoxIcon />
            <span className="mt-4 text-legend block">
              <Trans>No proposals created...</Trans>
            </span>
          </div>
        )}
        <AddressHovercardGroup
          addresses={data.flatMap(
            (proposal: StringMap) => proposal.proposer?.address ?? []
          )}
        >
          {data.map((proposal: StringMap) => (
            <ProposalItem key={proposal.id} proposal={proposal} />
          ))}
        </AddressHovercardGroup>
      </div>
    </div>
  )
}

export default ProposalList
