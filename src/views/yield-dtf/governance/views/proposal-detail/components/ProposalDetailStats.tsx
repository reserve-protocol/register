import Governance from 'abis/Governance'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Check, Slash, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { formatEther } from 'viem'
import { getProposalStateAtom, proposalDetailAtom } from '../atom'
import { colors } from 'theme'
import { formatCurrency, formatPercentage } from 'utils'
import { rTokenAtom } from 'state/atoms'
import { isTimeunitGovernance } from '@/views/yield-dtf/governance/utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { useReadContracts } from 'wagmi'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const BooleanIcon = ({
  value,
  colorSuccess = colors.success,
  colorFailure = 'orange',
}: {
  value: boolean
  colorSuccess?: string
  colorFailure?: string
}) => {
  return (
    <div className="flex items-center rounded bg-muted p-0.5">
      {value ? (
        <Check size={18} color={colorSuccess} />
      ) : (
        <X size={18} color={colorFailure} />
      )}
    </div>
  )
}

const ProposalDetailStats = () => {
  const rToken = useAtomValue(rTokenAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  const { state } = useAtomValue(getProposalStateAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')

  const { data } = useReadContracts({
    contracts: [
      {
        address: proposal?.governor ?? '0x1',
        abi: Governance,
        functionName: 'quorum',
        args: [
          isTimeunit
            ? BigInt(proposal?.creationTime || '0')
            : BigInt(proposal?.startBlock || '0'),
        ],
        chainId: rToken?.chainId,
      },
      {
        address: proposal?.governor ?? '0x1',
        abi: Governance,
        functionName: 'proposalVotes',
        args: [BigInt(proposal?.id || '0')],
        chainId: rToken?.chainId,
      },
    ],
    allowFailure: false,
    query: { enabled: !!proposal },
  })

  const [quorum, votes] = data ?? [0n, [0n, 0n, 0n]]

  const [againstVotes, forVotes, abstainVotes] = useMemo(
    () => votes.map((v) => formatEther(v)),
    [votes]
  )

  const [quorumWeight, currentQuorum, quorumNeeded, quorumReached] =
    useMemo(() => {
      const _quorumNeeded = Number(formatEther(quorum ?? 0n))

      if (!proposal || !_quorumNeeded) return [0, 0, 0, false]

      const _currentQuorum = +forVotes + +abstainVotes
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

  return (
    <div className="rounded-lg bg-secondary p-2">
      <span className="block p-4 text-xl font-bold leading-5">
        {[PROPOSAL_STATES.ACTIVE, PROPOSAL_STATES.PENDING].includes(state)
          ? 'Current'
          : 'Final'}{' '}
        votes
      </span>
      <div className="overflow-hidden rounded-md border border-border shadow-[0px_10px_38px_6px_rgba(0,0,0,0.05)] [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-border">
        <div className="flex flex-col gap-4 bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <BooleanIcon value={quorumReached} />
              <span>Quorum</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span
                className={cn(
                  'font-bold',
                  quorumReached ? 'text-success' : 'text-orange-500'
                )}
              >
                {formatPercentage(quorumWeight * 100)}
              </span>

              <span className="whitespace-nowrap text-secondary-foreground">
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
          <Progress
            value={Math.min(quorumWeight * 100, 100)}
            className="mt-2 h-1 bg-gray-300"
            indicatorClassName={quorumReached ? 'bg-success' : 'bg-orange-500'}
          />
        </div>
        <div className="flex flex-col gap-4 bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <BooleanIcon
                value={majoritySupport}
                colorSuccess={colors.accentInverted}
                colorFailure="red"
              />
              <span>Majority support</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span
                className={cn(
                  'font-bold',
                  majoritySupport ? 'text-primary' : 'text-red-500'
                )}
              >
                {majoritySupport ? 'Yes' : 'No'}
              </span>
              <span className="text-secondary-foreground">
                {formatPercentage(
                  (majoritySupport || !majorityWeight
                    ? majorityWeight
                    : 1 - majorityWeight) * 100
                )}
              </span>
            </div>
          </div>
          <Progress
            value={
              (majoritySupport || !majorityWeight
                ? majorityWeight
                : 1 - majorityWeight) * 100
            }
            className={cn(
              'mt-2 h-1',
              !majorityWeight
                ? 'bg-gray-300'
                : majoritySupport
                  ? 'bg-red-500'
                  : 'bg-primary'
            )}
            indicatorClassName={
              majoritySupport ? 'bg-primary' : 'bg-red-500'
            }
          />
        </div>
        <div className="flex items-center bg-card">
          <div className="flex flex-1 items-center gap-3 border-r border-border p-4">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
              <ThumbsUp size={18} color={colors.accentInverted} />
            </div>
            <div className="flex flex-col">
              <span className="min-w-[60px]">For</span>
              <span className="font-bold text-primary">
                {formatCurrency(+forVotes, 0, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 p-4 text-right">
            <div className="flex flex-col">
              <span className="min-w-[60px]">Against</span>
              <span className="font-bold text-red-500">
                {formatCurrency(+againstVotes, 0, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
              <ThumbsDown size={18} color="red" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
              <Slash size={18} />
            </div>
            <span className="min-w-[60px]">Abstain</span>
          </div>
          <span className="font-bold text-secondary-foreground">
            {formatCurrency(+abstainVotes, 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProposalDetailStats
