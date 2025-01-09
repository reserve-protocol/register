import { humanizeMinutes } from '@/utils'
import { Asterisk } from 'lucide-react'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'

const VOTING_DELAY = {
  title: 'Voting Delay',
  description:
    'How to distribute the revenue from this fee is defines in the revenue distribution section.',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 60, 240, 1440, 10080],
  optionsFormatter: (option: number) => humanizeMinutes(option),
  customLabel: 'minutes',
  customPlaceholder: 'Enter custom length',
}

const VOTING_PERIOD = {
  title: 'Voting Period',
  description:
    'How to distribute the revenue from this fee is defines in the revenue distribution section.',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 60, 240, 1440, 10080],
  optionsFormatter: (option: number) => humanizeMinutes(option),
  customLabel: 'minutes',
  customPlaceholder: 'Enter custom length',
}

const VOTING_QUORUM = {
  title: 'Voting Quorum',
  description:
    'How to distribute the revenue from this fee is defines in the revenue distribution section.',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 30, 40, 60, 80],
  optionsFormatter: (option: number) => `${option.toString()}%`,
  customLabel: '%',
  customPlaceholder: 'Enter custom',
}

const VOTING_EXECUTION_DELAY = {
  title: 'Execution Delay',
  description:
    'How to distribute the revenue from this fee is defines in the revenue distribution section.',
  icon: <Asterisk size={32} strokeWidth={1.5} />,
  options: [20, 60, 240, 1440, 10080],
  optionsFormatter: (option: number) => humanizeMinutes(option),
  customLabel: 'minutes',
  customPlaceholder: 'Enter custom length',
}

const VOTING_FORM = [
  {
    title: 'Basket Changes',
    forms: [
      {
        ...VOTING_DELAY,
        fieldName: 'basketVotingDelay',
        customFieldName: 'customBasketVotingDelay',
      },
      {
        ...VOTING_PERIOD,
        fieldName: 'basketVotingPeriod',
        customFieldName: 'customBasketVotingPeriod',
      },
      {
        ...VOTING_QUORUM,
        fieldName: 'basketVotingQuorum',
        customFieldName: 'customBasketVotingQuorum',
      },
      {
        ...VOTING_EXECUTION_DELAY,
        fieldName: 'basketExecutionDelay',
        customFieldName: 'customBasketExecutionDelay',
      },
    ],
  },
  {
    title: 'Governance Changes',
    forms: [
      {
        ...VOTING_DELAY,
        fieldName: 'governanceVotingDelay',
        customFieldName: 'customGovernanceVotingDelay',
      },
      {
        ...VOTING_PERIOD,
        fieldName: 'governanceVotingPeriod',
        customFieldName: 'customGovernanceVotingPeriod',
      },
      {
        ...VOTING_QUORUM,
        fieldName: 'governanceVotingQuorum',
        customFieldName: 'customGovernanceVotingQuorum',
      },
      {
        ...VOTING_EXECUTION_DELAY,
        fieldName: 'governanceExecutionDelay',
        customFieldName: 'customGovernanceExecutionDelay',
      },
    ],
  },
]

const VotingForm = () => {
  return (
    <div className="px-2 mb-2">
      {VOTING_FORM.map(({ title, forms }) => (
        <div className="flex flex-col gap-2 [&:last-child]:mt-6" key={title}>
          <div className="text-xl text-primary font-bold mx-4 mb-2">
            {title}
          </div>
          {forms.map((form) => (
            <ToggleGroupWithCustom
              key={`${title}${form.fieldName}`}
              {...form}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default VotingForm
