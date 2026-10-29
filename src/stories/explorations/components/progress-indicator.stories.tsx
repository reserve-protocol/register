import type { Meta, StoryObj } from '@storybook/react-vite'

import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/design-system-v1/loading'
import { cn } from '@/lib/utils'
import { PlaygroundDocs } from '../../shared/playground-docs'
import { centeredStoryDecorator } from '../../shared/story-surface'
import { ProposalVotingProgress } from './proposal-voting-progress'
import { progressTones, quorumTone } from './progress-indicator-presentation'
import {
  proposalVoteSnapshots,
  type ProposalVoteScenario,
} from './proposal-voting-progress-fixtures'

type ProgressExampleProps = {
  value: number
  kind: 'proposal' | 'threshold' | 'measured' | 'waiting'
  scenario: ProposalVoteScenario
  phase: 'current' | 'final'
  completed: number
  closed: boolean
}

const ProgressExample = ({
  value,
  kind,
  completed,
  closed,
  scenario,
  phase,
}: ProgressExampleProps) => {
  if (kind === 'proposal')
    return <ProposalVotingProgress scenario={scenario} phase={phase} />
  const threshold = kind === 'threshold'
  const label = threshold ? 'Quorum' : 'Orders filled'
  const percent = threshold ? value : (completed / 4) * 100
  const tone = threshold
    ? quorumTone({ reached: value >= 100, final: closed })
    : 'information'

  return (
    <div className="mx-auto w-full max-w-xl bg-card p-5 sm:p-6">
      {kind === 'waiting' ? (
        <div className={cn('flex items-center gap-2', v1Typography.body)}>
          <Spinner label="Loading balances" />
          <span aria-hidden="true">Loading balances</span>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'mb-3 flex items-baseline justify-between gap-4',
              v1Typography.body
            )}
          >
            <span className={v1SemanticRoles.text.supporting}>{label}</span>
            <span
              className={cn(
                'font-medium tabular-nums',
                threshold
                  ? progressTones[tone].text
                  : v1SemanticRoles.text.primary
              )}
            >
              {threshold ? `${percent}%` : `${completed}/4`}
            </span>
          </div>
          <Progress
            value={percent}
            role={threshold ? 'meter' : 'progressbar'}
            aria-label={label}
            getValueLabel={() => (threshold ? `${percent}%` : `${completed}/4`)}
            className="h-1 rounded-none bg-muted"
            indicatorClassName={cn(
              progressTones[tone].fill,
              'motion-reduce:transition-none'
            )}
          />
          {threshold && closed && value < 100 && (
            <p
              className={cn(
                'mt-3 text-muted-foreground',
                v1Typography.supporting
              )}
            >
              Quorum not reached
            </p>
          )}
        </>
      )}
    </div>
  )
}

const meta = {
  title: 'Explorations/Component proposals/Progress indicator',
  id: 'explorations-components-progress-indicator',
  component: ProgressExample,
  tags: ['autodocs'],
  args: {
    value: 64,
    kind: 'proposal',
    scenario: 'unanimous',
    phase: 'current',
    completed: 2,
    closed: false,
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      if: { arg: 'kind', eq: 'threshold' },
    },
    kind: {
      control: 'select',
      options: ['proposal', 'threshold', 'measured', 'waiting'],
    },
    scenario: {
      control: {
        type: 'select',
        labels: {
          unanimous: 'Unanimous support, above quorum',
          'no-votes': 'No votes',
          'early-voting': 'Early voting, 1% quorum',
          partial: 'Partial quorum',
          'quorum-reached': 'Quorum reached',
          'near-quorum': 'Just below quorum, 99%',
          'narrow-majority': 'Narrow majority, 51% For',
          opposed: 'Opposition leads',
          'unanimous-opposition': 'All directional votes Against',
          tie: 'Tied vote',
          'abstain-only': 'Abstain only',
          'target-unavailable': 'Quorum target unavailable',
          'optimistic-challenge': 'Optimistic: challenge below threshold',
          'optimistic-no-challenges': 'Optimistic: no challenges',
          'optimistic-threshold-reached':
            'Optimistic: challenge threshold reached',
          'optimistic-target-unavailable':
            'Optimistic: challenge target unavailable',
          loading: 'Loading',
        },
      },
      options: Object.keys(proposalVoteSnapshots),
      if: { arg: 'kind', eq: 'proposal' },
      description:
        'Static vote snapshots. These are display fixtures, not live proposal calculations.',
    },
    phase: {
      control: {
        type: 'inline-radio',
        labels: { current: 'Current votes', final: 'Final votes' },
      },
      options: ['current', 'final'],
      if: { arg: 'kind', eq: 'proposal' },
      description:
        'Changes the voting phase without replacing the selected tallies. This is not an overall proposal outcome.',
    },
    completed: {
      control: { type: 'range', min: 0, max: 4, step: 1 },
      if: { arg: 'kind', eq: 'measured' },
    },
    closed: { control: 'boolean', if: { arg: 'kind', eq: 'threshold' } },
  },
  decorators: [centeredStoryDecorator],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '**Proposal for review.** The default example follows the Index DTF proposal-details card: quorum, majority support, For/Against and Abstain. Choose a scenario and switch Current votes/Final votes independently. Quorum fill caps at 100% while actual totals remain visible. Majority fill and its visible percentage always show For votes among directional votes. Tied votes have an explicit neutral Tied reading; a tie does not meet majority support. No directional votes shows a dash, unavailable targets retain the current amount with explicit Target unavailable wording and no fabricated percentage, and loading uses the canonical Skeleton. Optimistic proposals use a separate challenge-only card: zero challenges is neutral and positive challenge progress is adverse. These are preformatted display fixtures, not SDK calculations or overall proposal outcomes.\n\nDecision criteria and vote totals form two white groups with a single beige seam, and the Current/Final votes heading sits inside the first group on its content inset; For, Against and Abstain share one row when the card is wide enough and two equal columns otherwise, with no vertical divider.\n\nThe kind control also exposes the generic threshold meter, measured progress and waiting Spinner. Quorum is threshold attainment, not elapsed time. Final unmet thresholds retain their actual reading. Known work uses an explicit count; unknown duration uses Loading balances without a percentage. Zapper quote loading and transaction steps retain their dedicated compositions. The governance proposal-list lifecycle keeps its specialized ProposalStatusBar unchanged. No production consumer is migrated by these examples.\n\nRails use a 4px square recipe on the shared Progress (`h-1 rounded-none bg-muted motion-reduce:transition-none`); its production default stays unchanged until an adoption pass. Value text uses feedback foregrounds so it clears 4.5:1; fills keep the approved tones. The waiting Spinner example stays exploratory: unresolved content loads with Skeleton.',
      },
    },
  },
} satisfies Meta<typeof ProgressExample>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { tags: ['!dev'] }
export const PartialQuorum: Story = {
  name: 'Partial quorum',
  args: { scenario: 'partial' },
}
export const Opposed: Story = { args: { scenario: 'opposed', phase: 'final' } }
export const OptimisticChallenge: Story = {
  name: 'Optimistic challenge',
  args: { scenario: 'optimistic-challenge' },
}
export const Threshold: Story = { args: { kind: 'threshold' } }
export const MeasuredCompletion: Story = {
  name: 'Measured completion',
  args: { kind: 'measured' },
}
export const Waiting: Story = { args: { kind: 'waiting' } }
export const UnmetThreshold: Story = {
  name: 'Unmet threshold',
  args: { kind: 'threshold', closed: true, value: 37 },
}
