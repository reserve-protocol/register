import type { ReactNode } from 'react'
import { Check, Minus, X, type LucideIcon } from 'lucide-react'
import { v1Typography } from '@/components/design-system-v1/typography'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ProposalVoteSnapshot } from './proposal-voting-progress-fixtures'
import {
  progressTones as tones,
  quorumTone,
  type ProgressTone,
} from '@/components/design-system-v1/progress-presentation'

export const VoteMark = ({
  icon: Icon,
  tone = 'neutral',
}: {
  icon: LucideIcon
  tone?: ProgressTone
}) => (
  <Icon
    aria-hidden="true"
    strokeWidth={1.5}
    className={cn('size-4 shrink-0', tones[tone].text)}
  />
)

const Reading = ({
  label,
  value,
  percent,
  tone,
  valueText,
  mark,
}: {
  label: string
  value: ReactNode
  percent: number | null
  tone: ProgressTone
  valueText?: string
  mark: LucideIcon
}) => (
  <div className="space-y-3">
    <div
      className={cn(
        'flex flex-col items-start gap-2 [@container(min-width:24rem)]:flex-row [@container(min-width:24rem)]:items-center [@container(min-width:24rem)]:justify-between [@container(min-width:24rem)]:gap-x-4',
        v1Typography.body
      )}
    >
      <span className="flex items-center gap-2">
        <VoteMark icon={mark} tone={tone} />
        {label}
      </span>
      <span className="flex flex-wrap items-baseline gap-x-2 tabular-nums [@container(min-width:24rem)]:ml-auto [@container(min-width:24rem)]:justify-end">
        {value}
      </span>
    </div>
    {percent === null ? (
      <div aria-hidden="true" className="h-1 bg-muted" />
    ) : (
      <Progress
        value={percent}
        role="meter"
        aria-label={label}
        getValueLabel={() => valueText ?? `${percent}%`}
        className="h-1 rounded-none bg-muted"
        indicatorClassName={cn(
          tones[tone].fill,
          'motion-reduce:transition-none'
        )}
      />
    )}
  </div>
)

export const ProposalThreshold = ({
  snapshot,
  final,
}: {
  snapshot: Exclude<ProposalVoteSnapshot, { kind: 'loading' }>
  final: boolean
}) => {
  const { percent, current, target, reached } = snapshot.threshold
  const challenge = snapshot.kind === 'optimistic'
  const tone: ProgressTone =
    percent === null
      ? 'neutral'
      : challenge
        ? percent === 0
          ? 'neutral'
          : 'danger'
        : quorumTone({ reached, final })
  return (
    <Reading
      label={challenge ? 'Challenge' : 'Quorum'}
      tone={tone}
      percent={percent}
      valueText={`${percent}% — ${current} of ${target}`}
      mark={
        percent === null
          ? Minus
          : reached
            ? challenge
              ? X
              : Check
            : final && !challenge
              ? X
              : Minus
      }
      value={
        <>
          {percent !== null && (
            <span className={cn('font-medium', tones[tone].text)}>
              {percent}%
            </span>
          )}
          {target === null ? (
            <>
              <span className="font-medium">{current}</span>
              <span className="text-supporting-foreground">
                Target unavailable
              </span>
            </>
          ) : (
            <span className="text-supporting-foreground">
              {current} of {target}
            </span>
          )}
        </>
      }
    />
  )
}

export const ProposalMajority = ({
  majority,
}: {
  majority: Extract<ProposalVoteSnapshot, { kind: 'standard' }>['majority']
}) => {
  const majorityTone = majority
    ? majority.outcome === 'tied'
      ? 'neutral'
      : majority.outcome === 'supported'
        ? 'success'
        : 'danger'
    : 'neutral'
  return (
    <Reading
      label="Majority support"
      tone={majorityTone}
      percent={majority?.forPercent ?? null}
      mark={
        majority
          ? majority.outcome === 'tied'
            ? Minus
            : majority.outcome === 'supported'
              ? Check
              : X
          : Minus
      }
      valueText={
        majority
          ? `${majority.outcome === 'tied' ? 'Tied — ' : ''}For: ${majority.forPercent}%`
          : undefined
      }
      value={
        majority ? (
          <>
            <span className={cn('font-medium', tones[majorityTone].text)}>
              {majority.outcome === 'tied'
                ? 'Tied'
                : majority.outcome === 'supported'
                  ? 'Yes'
                  : 'No'}
            </span>
            <span className="text-supporting-foreground">
              {majority.forPercent}% For
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            <span aria-hidden="true">—</span>
            <span className="sr-only">No directional votes</span>
          </span>
        )
      }
    />
  )
}
