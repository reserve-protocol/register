import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import ToggleGroupWithCustom from '@/views/index-dtf/deploy/components/toggle-group-with-custom'
import { useAtomValue } from 'jotai'
import {
  CalendarRange,
  Clock,
  FileLock2,
  Landmark,
  Pause,
  ShieldCheck,
} from 'lucide-react'
import { daysToSeconds, humanizeTimeFromSeconds } from '../../../shared'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Configure the governance parameters for basket trading. These settings
    control how proposals for basket composition changes are created, voted on,
    and executed.
  </div>
)

const BasketSettingsProposalSection = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const governance = indexDTF?.tradingGovernance

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
        'The time between a basket proposal being submitted and when governors can cast their votes.',
      fieldName: 'basketVotingDelay',
      inputProps: { step: 0.1, min: 0 },
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
        'How long governors have to cast their votes on a basket proposal after the voting delay.',
      fieldName: 'basketVotingPeriod',
      inputProps: { step: 0.1, min: 0 },
    },
    {
      title: 'Proposal Threshold',
      icon: <FileLock2 size={14} strokeWidth={1.5} />,
      options: [0.01, 0.1, 1, 10],
      optionsFormatter: (option: number) => formatPercentage(option),
      customLabel: '%',
      customPlaceholder: 'Enter custom threshold',
      description:
        'The minimum percentage of governance power needed in order to initiate a basket proposal.',
      fieldName: 'basketVotingThreshold',
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
          <span className="font-bold">abstain</span> in order for the basket
          proposal to be eligible to pass (
          <span className="font-bold">yes</span> votes still must outnumber{' '}
          <span className="font-bold">no</span> votes in order to pass the
          proposal).
        </span>
      ),
      fieldName: 'basketVotingQuorum',
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
        'The time period between when a basket proposal is approved and when it can be executed.',
      fieldName: 'basketExecutionDelay',
      inputProps: { step: 0.1, min: 0 },
    },
  ]

  if (!governance) {
    return (
      <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground">
        This DTF does not have trading governance configured.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-[1.25rem]">
      <div className="flex items-center justify-between w-full p-6 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full p-2 border border-primary text-primary">
            <Landmark size={14} strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <div className="flex flex-col animate-fade-in">
        <div className="text-2xl font-bold text-primary ml-6 mb-2">
          Governance Parameters
        </div>
        <Description />
        <div className="flex flex-col gap-2 px-2 mb-2">
          {forms.map((form) => (
            <ToggleGroupWithCustom key={form.fieldName} {...form} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BasketSettingsProposalSection
