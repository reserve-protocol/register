import { humanizeTimeFromDays } from '@/utils'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import {
  VOTING_DELAY,
  VOTING_EXECUTION_DELAY,
  VOTING_PERIOD,
  VOTING_QUORUM,
  VOTING_THRESHOLD,
} from '../basket-changes/basket-changes-form'

const FORMS = [
  {
    ...VOTING_DELAY,
    options: [0.5, 1, 1.5, 2],
    optionsFormatter: (option: number) => humanizeTimeFromDays(option),
    customLabel: 'days',
    description:
      'The time between a proposal being submitted and when governors can cast their votes.',
    fieldName: 'governanceVotingDelay',
  },
  {
    ...VOTING_PERIOD,
    options: [1, 2, 3, 4],
    optionsFormatter: (option: number) => humanizeTimeFromDays(option),
    customLabel: 'days',
    description:
      'How long governors have to cast their votes on a proposal after the voting delay.',
    fieldName: 'governanceVotingPeriod',
  },
  {
    ...VOTING_THRESHOLD,
    fieldName: 'governanceVotingThreshold',
  },
  {
    ...VOTING_QUORUM,
    fieldName: 'governanceVotingQuorum',
  },
  {
    ...VOTING_EXECUTION_DELAY,
    options: [0.5, 1, 1.5, 2],
    optionsFormatter: (option: number) => humanizeTimeFromDays(option),
    customLabel: 'days',
    description:
      'The time period between when a proposal is approved and when it can be executed.',
    fieldName: 'governanceExecutionDelay',
  },
]

const OtherChangesForm = () => {
  return (
    <div className="px-2 mb-2">
      <div className="flex flex-col gap-2">
        {FORMS.map((form) => (
          <ToggleGroupWithCustom key={`${form.fieldName}`} {...form} />
        ))}
      </div>
    </div>
  )
}

export default OtherChangesForm
