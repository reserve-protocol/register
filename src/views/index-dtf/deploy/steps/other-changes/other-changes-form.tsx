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
    description:
      'The time between a proposal being submitted and when governors can cast their votes.',
    fieldName: 'governanceVotingDelay',
    customFieldName: 'customGovernanceVotingDelay',
  },
  {
    ...VOTING_PERIOD,
    description:
      'How long governors have to cast their votes on a proposal after the voting delay.',
    fieldName: 'governanceVotingPeriod',
    customFieldName: 'customGovernanceVotingPeriod',
  },
  {
    ...VOTING_THRESHOLD,
    title: 'Proposal Threshold',
    description:
      'The minimum percentage of votes that must be held in order to create a proposal.',
    fieldName: 'governanceVotingThreshold',
    customFieldName: 'customGovernanceVotingThreshold',
  },
  {
    ...VOTING_QUORUM,
    description:
      'The minimum percentage of eligible votes that must be cast for the vote to be valid.',
    fieldName: 'governanceVotingQuorum',
    customFieldName: 'customGovernanceVotingQuorum',
  },
  {
    ...VOTING_EXECUTION_DELAY,
    description:
      'The time period between when a proposal is approved and when it can be executed.',
    fieldName: 'governanceExecutionDelay',
    customFieldName: 'customGovernanceExecutionDelay',
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
