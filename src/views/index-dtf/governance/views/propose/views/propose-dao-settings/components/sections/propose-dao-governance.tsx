import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { useAtomValue } from 'jotai'
import {
  Pause,
  CalendarRange,
  FileLock2,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { daysToSeconds, humanizeTimeFromSeconds } from '../../../../shared'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Configure the governance parameters that control how proposals are created,
    voted on, and executed for the DAO. These settings apply to all DAO
    governance actions including revenue token management.
  </div>
)

const ProposeDaoGovernance = () => {
  const { setValue, watch } = useFormContext()
  const indexDTF = useAtomValue(indexDTFAtom)
  const governance = indexDTF?.stToken?.governance

  const forms = [
    {
      title: 'Voting Delay',
      icon: <Pause size={14} strokeWidth={1.5} />,
      options: [0.5, 1, 1.5, 2],
      optionsFormatter: (option: number) =>
        humanizeTimeFromSeconds(daysToSeconds(option)),
      customLabel: 'days',
      customPlaceholder: 'Enter custom delay',
      description:
        'The time between a proposal being submitted and when governors can cast their votes.',
      fieldName: 'daoVotingDelay',
      inputProps: { step: 0.1, min: 0 },
      decimalPlaces: 4,
    },
    {
      title: 'Voting Period',
      icon: <CalendarRange size={14} strokeWidth={1.5} />,
      options: [1, 2, 3, 4],
      optionsFormatter: (option: number) =>
        humanizeTimeFromSeconds(daysToSeconds(option)),
      customLabel: 'days',
      customPlaceholder: 'Enter custom period',
      description:
        'How long governors have to cast their votes on a proposal after the voting delay.',
      fieldName: 'daoVotingPeriod',
      inputProps: { step: 0.1, min: 0 },
      decimalPlaces: 4,
    },
    {
      title: 'Proposal Threshold',
      icon: <FileLock2 size={14} strokeWidth={1.5} />,
      options: [0.01, 0.1, 1, 10],
      optionsFormatter: (option: number) => formatPercentage(option),
      customLabel: '%',
      customPlaceholder: 'Enter custom threshold',
      description:
        'The minimum percentage of governance power needed in order to initiate a proposal.',
      fieldName: 'daoVotingThreshold',
      inputProps: { step: 0.01, min: 0, max: 100 },
    },
    {
      title: 'Voting Quorum',
      icon: <ShieldCheck size={14} strokeWidth={1.5} />,
      options: [10, 15, 20, 25],
      optionsFormatter: (option: number) => formatPercentage(option),
      customLabel: '%',
      customPlaceholder: 'Enter custom quorum',
      description: (
        <span>
          The minimum percentage of votes that must be cast as{' '}
          <span className="font-bold">yes</span> or{' '}
          <span className="font-bold">abstain</span> in order for the proposal
          to be eligible to pass (<span className="font-bold">yes</span> votes
          still must outnumber <span className="font-bold">no</span> votes in
          order to pass the proposal).
        </span>
      ),
      fieldName: 'daoVotingQuorum',
      inputProps: { step: 1, min: 0, max: 100 },
    },
    {
      title: 'Execution Delay',
      icon: <Clock size={14} strokeWidth={1.5} />,
      options: [0.5, 1, 1.5, 2],
      optionsFormatter: (option: number) =>
        humanizeTimeFromSeconds(daysToSeconds(option)),
      customLabel: 'days',
      customPlaceholder: 'Enter custom delay',
      description:
        'The time period between when a proposal is approved and when it can be executed.',
      fieldName: 'daoExecutionDelay',
      inputProps: { step: 0.1, min: 0 },
      decimalPlaces: 4,
    },
  ]

  if (!governance) {
    return (
      <div className="px-6 py-8 text-center text-muted-foreground">
        This DTF does not have DAO governance configured.
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

export default ProposeDaoGovernance
