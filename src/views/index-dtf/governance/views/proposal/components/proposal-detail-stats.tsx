import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { CircleSlash, ThumbsDown, ThumbsUp, X } from 'lucide-react'

import dtfIndexGovernance from '@/abis/dtf-index-governance'
import { Separator } from '@/components/ui/separator'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Check } from 'lucide-react'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContracts } from 'wagmi'
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
  const chainId = useAtomValue(chainIdAtom)
  const { data } = useReadContracts({
    contracts: [
      {
        address: proposal?.governor ?? '0x1',
        abi: dtfIndexGovernance,
        functionName: 'quorum',
        args: [BigInt(proposal?.creationTime || '0')],
        chainId,
      },
      {
        address: proposal?.governor ?? '0x1',
        abi: dtfIndexGovernance,
        functionName: 'proposalVotes',
        args: [BigInt(proposal?.id || '0')],
        chainId,
      },
    ],
    allowFailure: false,
    query: { enabled: !!proposal },
  })

  const [quorum, votes] = data ?? [0n, [0n, 0n, 0n]]
  const [againstVotes, forVotes, abstainVotes] = useMemo(
    () => votes.map((v) => +formatEther(v)),
    [votes]
  )

  const [quorumWeight, currentQuorum, quorumNeeded, quorumReached] =
    useMemo(() => {
      const _quorumNeeded = Number(formatEther(quorum ?? 0n))

      if (!proposal) return [0, 0, 0, false]

      const _currentQuorum = +forVotes + +abstainVotes

      if (!_quorumNeeded)
        return [
          _currentQuorum > _quorumNeeded ? 1 : 0,
          _currentQuorum,
          _quorumNeeded,
          _currentQuorum > _quorumNeeded,
        ]

      const _quorumWeight = _currentQuorum / _quorumNeeded
      const _quorumReached = _quorumWeight > 1

      return [_quorumWeight, _currentQuorum, _quorumNeeded, _quorumReached]
    }, [proposal, quorum])

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
    quorumWeight,
    currentQuorum,
    quorumNeeded,
    quorumReached,
    majorityWeight,
    majoritySupport,
  }
}

const QuorumStat = ({
  quorumWeight,
  currentQuorum,
  quorumNeeded,
  quorumReached,
}: {
  quorumWeight: number
  currentQuorum: number
  quorumNeeded: number
  quorumReached: boolean
}) => {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <BooleanIcon value={quorumReached} />
          <span>Quorum</span>
        </div>
        <div className="flex items-center gap-2 text-base sm:text-lg">
          <span
            className={`font-bold ${quorumReached ? 'text-green-500' : 'text-orange-500'}`}
          >
            {formatPercentage(quorumWeight * 100)}
          </span>

          <span className="text-legend whitespace-nowrap">
            {formatCurrency(currentQuorum, 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}{' '}
            of{' '}
            {formatCurrency(quorumNeeded, 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        </div>
      </div>
      <div className=" relative h-1 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${quorumReached ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ width: `${Math.min(quorumWeight * 100, 100)}%` }}
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
          <span>Majority support</span>
        </div>
        <div className="flex items-center gap-2 text-base sm:text-lg">
          <span
            className={`font-bold ${majoritySupport ? 'text-green-500' : 'text-red-500'}`}
          >
            {majoritySupport ? 'Yes' : 'No'}
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
            <span className="min-w-[60px]">For</span>
            <span className="font-bold text-accent-inverted">
              {formatCurrency(+forVotes, 0, {
                notation: 'compact',
                compactDisplay: 'short',
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-grow p-4 justify-end text-right">
          <div className="flex flex-col">
            <span className="min-w-[60px]">Against</span>
            <span className="font-bold text-destructive">
              {formatCurrency(+againstVotes, 0, {
                notation: 'compact',
                compactDisplay: 'short',
              })}
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
          <span className="min-w-[60px]">Abstain</span>
        </div>
        <span className="font-bold text-gray-500">
          {formatCurrency(+abstainVotes, 0, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
      </div>
    </>
  )
}

const ProposalDetailStats = () => {
  const state = useAtomValue(proposalStateAtom) ?? ''
  const {
    quorumWeight,
    currentQuorum,
    quorumNeeded,
    quorumReached,
    majorityWeight,
    majoritySupport,
    againstVotes,
    forVotes,
    abstainVotes,
  } = useProposalDetailStats()

  return (
    <div className="bg-background rounded-3xl p-2">
      <h4 className="font-bold text-xl p-4">
        {[PROPOSAL_STATES.ACTIVE, PROPOSAL_STATES.PENDING].includes(state)
          ? 'Current'
          : 'Final'}{' '}
        votes
      </h4>
      <div className="flex flex-col bg-card rounded-3xl border">
        <QuorumStat
          quorumWeight={quorumWeight}
          currentQuorum={currentQuorum}
          quorumNeeded={quorumNeeded}
          quorumReached={quorumReached}
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
      </div>
    </div>
  )
}

export default ProposalDetailStats
