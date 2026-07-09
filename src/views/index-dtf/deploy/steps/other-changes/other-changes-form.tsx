import { humanizeTimeFromDays } from '@/utils'
import ToggleGroupWithCustom from '../../components/toggle-group-with-custom'
import { buildVotingPresets } from '../basket-changes/basket-changes-form'
import { useLingui } from '@lingui/react/macro'

const OtherChangesForm = () => {
  const { t } = useLingui()
  const presets = buildVotingPresets(t)

  const FORMS = [
    {
      ...presets.VOTING_DELAY,
      options: [0.5, 1, 1.5, 2],
      optionsFormatter: (option: number) => humanizeTimeFromDays(option),
      customLabel: t`days`,
      description: t`The time between a proposal being submitted and when governors can cast their votes.`,
      fieldName: 'governanceVotingDelay',
    },
    {
      ...presets.VOTING_PERIOD,
      options: [1, 2, 3, 4],
      optionsFormatter: (option: number) => humanizeTimeFromDays(option),
      customLabel: t`days`,
      description: t`How long governors have to cast their votes on a proposal after the voting delay.`,
      fieldName: 'governanceVotingPeriod',
    },
    {
      ...presets.VOTING_THRESHOLD,
      fieldName: 'governanceVotingThreshold',
    },
    {
      ...presets.VOTING_QUORUM,
      fieldName: 'governanceVotingQuorum',
    },
    {
      ...presets.VOTING_EXECUTION_DELAY,
      options: [0.5, 1, 1.5, 2],
      optionsFormatter: (option: number) => humanizeTimeFromDays(option),
      customLabel: t`days`,
      description: t`The time period between when a proposal is approved and when it can be executed.`,
      fieldName: 'governanceExecutionDelay',
    },
  ]

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
