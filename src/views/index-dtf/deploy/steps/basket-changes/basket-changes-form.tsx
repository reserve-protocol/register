import { humanizeTimeFromHours } from '@/utils'
import {
  Asterisk,
  CalendarRange,
  FileLock2,
  MousePointerBan,
  Pause,
  ShieldCheck,
} from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import { Trans, useLingui } from '@lingui/react/macro'

type Translate = ReturnType<typeof useLingui>['t']

export const buildVotingPresets = (t: Translate) => ({
  VOTING_DELAY: {
    title: t`Voting Delay`,
    icon: <Pause size={14} strokeWidth={1.5} />,
    options: [1, 12, 24, 48],
    optionsFormatter: (option: number) => humanizeTimeFromHours(option),
    customLabel: t`hours`,
    customPlaceholder: t`Enter custom length`,
  },
  VOTING_PERIOD: {
    title: t`Voting Period`,
    icon: <CalendarRange size={14} strokeWidth={1.5} />,
    options: [1, 24, 48, 72],
    optionsFormatter: (option: number) => humanizeTimeFromHours(option),
    customLabel: t`hours`,
    customPlaceholder: t`Enter custom length`,
  },
  VOTING_THRESHOLD: {
    title: t`Proposal Threshold`,
    icon: <FileLock2 size={14} strokeWidth={1.5} />,
    options: [0.01, 0.1, 1, 10],
    optionsFormatter: (option: number) => `${option.toString()}%`,
    customLabel: '%',
    customPlaceholder: t`Enter custom`,
    description: t`The minimum percentage of governance power needed in order to initiate a proposal.`,
  },
  VOTING_QUORUM: {
    title: t`Voting Quorum`,
    icon: <ShieldCheck size={14} strokeWidth={1.5} />,
    options: [10, 15, 20, 25],
    optionsFormatter: (option: number) => `${option.toString()}%`,
    customLabel: '%',
    customPlaceholder: t`Enter custom`,
    description: (
      <span>
        <Trans>
          The minimum percentage of votes that must be cast as{' '}
          <span className="font-bold">yes</span> or{' '}
          <span className="font-bold">abstain</span> in order for the proposal
          to be eligible to pass (<span className="font-bold">yes</span> votes
          still must outnumber <span className="font-bold">no</span> votes in
          order to pass the proposal).
        </Trans>
      </span>
    ),
  },
  VOTING_EXECUTION_DELAY: {
    title: t`Execution Delay`,
    icon: <MousePointerBan size={14} strokeWidth={1.5} />,
    options: [0.25, 24, 36, 48],
    optionsFormatter: (option: number) => humanizeTimeFromHours(option),
    customLabel: t`hours`,
    customPlaceholder: t`Enter custom length`,
  },
})

const BasketChangesForm = () => {
  const { t } = useLingui()
  const presets = buildVotingPresets(t)

  const FORM = [
    {
      ...presets.VOTING_DELAY,
      description: t`The time between a basket change proposal being submitted and when governors can cast their votes.`,
      fieldName: 'basketVotingDelay',
    },
    {
      ...presets.VOTING_PERIOD,
      description: t`How long governors have to cast their votes on a basket change after the voting delay.`,
      fieldName: 'basketVotingPeriod',
    },
    {
      ...presets.VOTING_THRESHOLD,
      fieldName: 'basketVotingThreshold',
    },
    {
      ...presets.VOTING_QUORUM,
      fieldName: 'basketVotingQuorum',
    },
    {
      ...presets.VOTING_EXECUTION_DELAY,
      description: t`The time period between when a basket change proposal is considered successful and when the auction can be formally approved.`,
      fieldName: 'basketExecutionDelay',
    },
  ]

  return (
    <div className="px-2 mb-2">
      <div className="flex flex-col gap-2">
        {FORM.map((form) => (
          <ToggleGroupWithCustom key={`${form.fieldName}`} {...form} />
        ))}
      </div>
    </div>
  )
}

export default BasketChangesForm
