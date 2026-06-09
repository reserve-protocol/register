import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  CalendarRange,
  Clock,
  FileLock2,
  Pause,
  ShieldCheck,
} from 'lucide-react'
import { daysToSeconds, humanizeTimeFromSeconds } from '../../../../shared'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    <Trans>
      Configure the governance parameters that control how proposals are
      created, voted on, and executed. These settings apply to all governance
      actions except basket changes, which have their own separate parameters.
    </Trans>
  </div>
)

const ProposeGovernanceSettings = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const governance = indexDTF?.ownerGovernance

  const forms = [
    {
      title: t`Voting Delay`,
      icon: <Pause size={14} strokeWidth={1.5} />,
      options: [0.5, 1, 1.5, 2],
      optionsFormatter: (option: number) =>
        humanizeTimeFromSeconds(daysToSeconds(option)),
      customLabel: t`days`,
      customPlaceholder: t`Enter custom delay`,
      description: t`The time between a proposal being submitted and when governors can cast their votes.`,
      fieldName: 'governanceVotingDelay',
      inputProps: { step: 0.1, min: 0 },
      decimalPlaces: 4,
    },
    {
      title: t`Voting Period`,
      icon: <CalendarRange size={14} strokeWidth={1.5} />,
      options: [1, 2, 3, 4],
      optionsFormatter: (option: number) =>
        humanizeTimeFromSeconds(daysToSeconds(option)),
      customLabel: t`days`,
      customPlaceholder: t`Enter custom period`,
      description: t`How long governors have to cast their votes on a proposal after the voting delay.`,
      fieldName: 'governanceVotingPeriod',
      inputProps: { step: 0.1, min: 0 },
      decimalPlaces: 4,
    },
    {
      title: t`Proposal Threshold`,
      icon: <FileLock2 size={14} strokeWidth={1.5} />,
      options: [0.01, 0.1, 1, 10],
      optionsFormatter: (option: number) => formatPercentage(option),
      customLabel: '%',
      customPlaceholder: t`Enter custom threshold`,
      description: t`The minimum percentage of governance power needed in order to initiate a proposal.`,
      fieldName: 'governanceVotingThreshold',
      inputProps: { step: 0.01, min: 0, max: 100 },
    },
    {
      title: t`Voting Quorum`,
      icon: <ShieldCheck size={14} strokeWidth={1.5} />,
      options: [10, 15, 20, 25],
      optionsFormatter: (option: number) => formatPercentage(option),
      customLabel: '%',
      customPlaceholder: t`Enter custom quorum`,
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
      fieldName: 'governanceVotingQuorum',
      inputProps: { step: 1, min: 0, max: 100 },
    },
    {
      title: t`Execution Delay`,
      icon: <Clock size={14} strokeWidth={1.5} />,
      options: [0.5, 1, 1.5, 2],
      optionsFormatter: (option: number) =>
        humanizeTimeFromSeconds(daysToSeconds(option)),
      customLabel: t`days`,
      customPlaceholder: t`Enter custom delay`,
      description: t`The time period between when a proposal is approved and when it can be executed.`,
      fieldName: 'governanceExecutionDelay',
      inputProps: { step: 0.1, min: 0 },
      decimalPlaces: 4,
    },
  ]

  if (!governance) {
    return (
      <div className="px-6 py-8 text-center text-muted-foreground">
        <Trans>This DTF does not have owner governance configured.</Trans>
      </div>
    )
  }

  return (
    <div className="">
      <Description />
      <div className="flex flex-col gap-2 px-2 mb-2">
        {forms.map((form) => (
          <ToggleGroupWithCustom key={form.fieldName} {...form} />
        ))}
      </div>
    </div>
  )
}

export default ProposeGovernanceSettings
