import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatPercentage, formatTokenAmount } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Check, CircleSlash, Clock, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { useMemo } from 'react'
import { proposalDetailAtom, proposalStateAtom } from '../atom'

const BooleanIcon = ({
  value,
  colorSuccess = 'green-500',
  colorFailure = 'orange-500',
}: {
  value: boolean
  colorSuccess?: string
  colorFailure?: string
}) => {
  return (
    <div
      className={cn(
        'flex items-center p-0.5 bg-muted rounded',
        value ? `text-${colorSuccess}` : `text-${colorFailure}`
      )}
    >
      {value ? (
        <Check size={18} strokeWidth={1.5} />
      ) : (
        <X size={18} strokeWidth={1.5} />
      )}
    </div>
  )
}

// TODO: Abstract atoms from these components!
const useProposalDetailStats = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const againstVotes = Number(proposal?.againstWeightedVotes.formatted ?? 0)
  const forVotes = Number(proposal?.forWeightedVotes.formatted ?? 0)
  const abstainVotes = Number(proposal?.abstainWeightedVotes.formatted ?? 0)
  const threshold = proposal?.votingState.threshold
  const quorumWeight = (threshold?.progress ?? 0) / 100
  const currentQuorum = Number(threshold?.currentVotes.formatted ?? 0)
  const quorumNeeded = Number(threshold?.targetVotes?.formatted ?? 0)
  const quorumReached = threshold?.reached ?? false
  const hasQuorumTarget = threshold?.hasTarget ?? false
  // The quorum target is read at the vote snapshot, which a pending proposal does not have yet.
  const awaitingSnapshot =
    !hasQuorumTarget &&
    proposal?.votingState.state === PROPOSAL_STATES.PENDING

  const [majorityWeight, majoritySupport] = useMemo(() => {
    const totalVotes = +forVotes + +againstVotes

    if (!totalVotes) return [0, false]

    const _majorityWeight = +forVotes / totalVotes
    const _majoritySupport = _majorityWeight > 0.5

    return [_majorityWeight, _majoritySupport]
  }, [forVotes, againstVotes])

  return {
    againstVotes,
    forVotes,
    abstainVotes,
    isOptimistic: proposal?.isOptimistic,
    quorumWeight,
    currentQuorum,
    quorumNeeded,
    quorumReached,
    hasQuorumTarget,
    awaitingSnapshot,
    majorityWeight,
    majoritySupport,
  }
}

const QuorumStat = ({
  isOptimistic,
  quorumWeight,
  currentQuorum,
  quorumNeeded,
  quorumReached,
  hasQuorumTarget,
  awaitingSnapshot,
}: {
  isOptimistic?: boolean
  quorumWeight: number
  currentQuorum: number
  quorumNeeded: number
  quorumReached: boolean
  hasQuorumTarget: boolean
  awaitingSnapshot: boolean
}) => {
  const isGood = hasQuorumTarget && (isOptimistic ? !quorumReached : quorumReached)

  return (
    <div
      className="flex flex-col gap-3 p-4"
      data-testid="proposal-quorum"
      data-state={awaitingSnapshot ? 'pending' : isGood ? 'reached' : 'missing'}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {awaitingSnapshot ? (
            <div className="flex items-center p-0.5 bg-muted rounded text-legend">
              <Clock size={18} strokeWidth={1.5} />
            </div>
          ) : (
            <BooleanIcon
              value={isGood}
              colorSuccess="green-500"
              colorFailure="red-500"
            />
          )}
          <span>
            {isOptimistic ? <Trans>Challenge</Trans> : <Trans>Quorum</Trans>}
          </span>
        </div>
        <div className="flex items-center gap-2 text-base sm:text-lg">
          <span
            className={cn(
              'font-bold',
              awaitingSnapshot
                ? 'text-legend'
                : isGood
                  ? 'text-green-500'
                  : 'text-red-500'
            )}
          >
            {formatPercentage(Math.min(quorumWeight * 100, 100))}
          </span>

          <span className="text-legend whitespace-nowrap">
            {formatTokenAmount(currentQuorum)} <Trans>of</Trans>{' '}
            {/* WHY: keyed spans so browser translation can't break the target swap */}
            {hasQuorumTarget ? (
              <span key="target" data-testid="proposal-quorum-target">
                {formatTokenAmount(quorumNeeded)}
              </span>
            ) : awaitingSnapshot ? (
              <span key="pending" data-testid="proposal-quorum-target">
                —
              </span>
            ) : (
              <span key="unavailable">
                <Trans>Unavailable</Trans>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className=" relative h-1 bg-gray-200 rounded-full">
        <div
          className={cn(
            'h-full rounded-full',
            isGood ? 'bg-green-500' : 'bg-red-500'
          )}
          style={{
            width: `${Math.min(quorumWeight * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  )
}

const MajoritySupportStat = ({
  majorityWeight,
  majoritySupport,
}: {
  majorityWeight: number
  majoritySupport: boolean
}) => {
  const percentage = formatPercentage(
    Math.min(
      (majoritySupport || !majorityWeight
        ? majorityWeight
        : 1 - majorityWeight) * 100,
      100
    )
  )

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <BooleanIcon
            value={majoritySupport}
            colorSuccess="text-accent-inverted"
            colorFailure="text-red-500"
          />
          <span>
            <Trans>Majority support</Trans>
          </span>
        </div>
        <div className="flex items-center gap-2 text-base sm:text-lg">
          <span
            className={`font-bold ${majoritySupport ? 'text-green-500' : 'text-red-500'}`}
          >
            {majoritySupport ? <Trans>Yes</Trans> : <Trans>No</Trans>}
          </span>
          {percentage !== '100%' && (
            <span className="text-legend">{percentage}</span>
          )}
        </div>
      </div>
      <div className="w-full h-1 rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${
            majoritySupport ? 'bg-accent-inverted' : 'bg-red-500'
          } ${!majorityWeight ? 'bg-gray-200' : ''}`}
          style={{
            width: `${Math.min(
              (majoritySupport || !majorityWeight
                ? majorityWeight
                : 1 - majorityWeight) * 100,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  )
}

const ChallengeStat = ({
  quorumWeight,
  currentQuorum,
  quorumNeeded,
  hasQuorumTarget,
  awaitingSnapshot,
}: {
  quorumWeight: number
  currentQuorum: number
  quorumNeeded: number
  hasQuorumTarget: boolean
  awaitingSnapshot: boolean
}) => {
  const challengeProgress = Math.min(quorumWeight * 100, 100)

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 bg-muted rounded text-muted-foreground">
            <Check size={18} strokeWidth={1.5} />
          </div>
          <span className="text-lg">
            <Trans>Challenge</Trans>
          </span>
        </div>
        <span className="text-base text-legend sm:text-lg">
          {formatTokenAmount(currentQuorum)} <Trans>of</Trans>{' '}
          {hasQuorumTarget ? (
            <span key="target">
              {`${formatTokenAmount(quorumNeeded)} (${formatPercentage(challengeProgress)})`}
            </span>
          ) : awaitingSnapshot ? (
            <span key="pending">—</span>
          ) : (
            <span key="unavailable">
              <Trans>Unavailable</Trans>
            </span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-destructive"
          style={{ width: `${challengeProgress}%` }}
        />
      </div>
    </div>
  )
}

const VoteDistributionStat = ({
  forVotes,
  againstVotes,
  abstainVotes,
}: {
  forVotes: number
  againstVotes: number
  abstainVotes: number
}) => {
  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center gap-3 flex-grow p-4 border-r">
          <div className="flex items-center justify-center w-7 h-7 bg-muted rounded">
            <ThumbsUp size={18} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="min-w-[60px]">
              <Trans>For</Trans>
            </span>
            <span
              data-testid="proposal-for-votes"
              className="font-bold text-accent-inverted"
            >
              {formatTokenAmount(+forVotes)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-grow p-4 justify-end text-right">
          <div className="flex flex-col">
            <span className="min-w-[60px]">
              <Trans>Against</Trans>
            </span>
            <span className="font-bold text-destructive">
              {formatTokenAmount(+againstVotes)}
            </span>
          </div>
          <div className="flex items-center justify-center w-7 h-7 text-destructive bg-muted rounded">
            <ThumbsDown size={18} />
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 bg-muted rounded">
            <CircleSlash size={18} />
          </div>
          <span className="min-w-[60px]">
            <Trans>Abstain</Trans>
          </span>
        </div>
        <span className="font-bold text-gray-500">
          {formatTokenAmount(+abstainVotes)}
        </span>
      </div>
    </>
  )
}

const ProposalDetailStatsSkeleton = () => (
  <div
    data-testid="proposal-stats-skeleton"
    className="bg-background rounded-3xl p-2"
  >
    <Skeleton className="h-7 w-32 m-4" />
    <div className="flex flex-col bg-card rounded-3xl border">
      {[0, 1, 2].map((i) => (
        <div key={i}>
          {!!i && <Separator />}
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-7" />
            <Skeleton className="h-1" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const ProposalDetailStats = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const state = useAtomValue(proposalStateAtom) ?? ''
  const {
    quorumWeight,
    currentQuorum,
    quorumNeeded,
    quorumReached,
    hasQuorumTarget,
    isOptimistic,
    awaitingSnapshot,
    majorityWeight,
    majoritySupport,
    againstVotes,
    forVotes,
    abstainVotes,
  } = useProposalDetailStats()
  const isVotingLive = [PROPOSAL_STATES.ACTIVE, PROPOSAL_STATES.PENDING].includes(
    state
  )

  if (!proposal) return <ProposalDetailStatsSkeleton />

  return (
    <div className="bg-background rounded-3xl p-2">
      <h4 className="font-bold text-xl p-4">
        {isVotingLive ? (
          <Trans>Current votes</Trans>
        ) : (
          <Trans>Final votes</Trans>
        )}
      </h4>
      <div className="flex flex-col bg-card rounded-3xl border">
        {isOptimistic ? (
          <ChallengeStat
            quorumWeight={quorumWeight}
            currentQuorum={currentQuorum}
            quorumNeeded={quorumNeeded}
            hasQuorumTarget={hasQuorumTarget}
            awaitingSnapshot={awaitingSnapshot}
          />
        ) : (
          <>
            <QuorumStat
              isOptimistic={isOptimistic}
              quorumWeight={quorumWeight}
              currentQuorum={currentQuorum}
              quorumNeeded={quorumNeeded}
              quorumReached={quorumReached}
              hasQuorumTarget={hasQuorumTarget}
              awaitingSnapshot={awaitingSnapshot}
            />
            <Separator />
            <MajoritySupportStat
              majorityWeight={majorityWeight}
              majoritySupport={majoritySupport}
            />
            <Separator />
            <VoteDistributionStat
              forVotes={forVotes}
              againstVotes={againstVotes}
              abstainVotes={abstainVotes}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ProposalDetailStats
