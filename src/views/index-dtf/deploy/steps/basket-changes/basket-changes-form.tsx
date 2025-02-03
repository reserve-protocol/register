import { humanizeMinutes } from '@/utils'
import { Asterisk } from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'

export const VOTING_DELAY = {
  title: 'Voting Delay',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 60, 240, 1440, 10080],
  optionsFormatter: (option: number) => humanizeMinutes(option),
  customLabel: 'minutes',
  customPlaceholder: 'Enter custom length',
}

export const VOTING_PERIOD = {
  title: 'Voting Period',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 60, 240, 1440, 10080],
  optionsFormatter: (option: number) => humanizeMinutes(option),
  customLabel: 'minutes',
  customPlaceholder: 'Enter custom length',
}

export const VOTING_THRESHOLD = {
  title: 'Proposal Threshold',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [0.01, 0.05, 0.1, 0.25, 0.5],
  optionsFormatter: (option: number) => `${option.toString()}%`,
  customLabel: '%',
  customPlaceholder: 'Enter custom',
  description:
    'The minimum percentage of governance power needed in order to initiate a proposal.',
}

export const VOTING_QUORUM = {
  title: 'Voting Quorum',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 30, 40, 60, 80],
  optionsFormatter: (option: number) => `${option.toString()}%`,
  customLabel: '%',
  customPlaceholder: 'Enter custom',
  description: (
    <span>
      The minimum percentage of votes that must be cast as{' '}
      <span className="font-bold">yes</span> or{' '}
      <span className="font-bold">abstain</span> in order for the proposal to be
      eligible to pass (<span className="font-bold">yes</span> votes still must
      outnumber <span className="font-bold">no</span> votes in order to pass the
      proposal).
    </span>
  ),
}

export const VOTING_EXECUTION_DELAY = {
  title: 'Execution Delay',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 60, 240, 1440, 10080],
  optionsFormatter: (option: number) => humanizeMinutes(option),
  customLabel: 'minutes',
  customPlaceholder: 'Enter custom length',
}

const FORM = [
  {
    ...VOTING_DELAY,
    description:
      'The time between a basket change proposal being submitted and when governors can cast their votes.',
    fieldName: 'basketVotingDelay',
  },
  {
    ...VOTING_PERIOD,
    description:
      'How long governors have to cast their votes on a basket change after the voting delay.',
    fieldName: 'basketVotingPeriod',
  },
  {
    ...VOTING_THRESHOLD,
    fieldName: 'basketVotingThreshold',
  },
  {
    ...VOTING_QUORUM,
    fieldName: 'basketVotingQuorum',
  },
  {
    ...VOTING_EXECUTION_DELAY,
    description:
      'The time period between when a basket change proposal is considered successful and when the auction can be formally approved.',
    fieldName: 'basketExecutionDelay',
  },
]

const VotingForm = () => {
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

export default VotingForm
