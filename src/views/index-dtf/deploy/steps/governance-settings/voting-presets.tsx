import { humanizeTimeFromHours } from '@/utils'
import {
  CalendarRange,
  FileLock2,
  MousePointerBan,
  Pause,
  ShieldCheck,
} from 'lucide-react'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

// The `t` macro only compiles inside the hook's own scope; a passed-in `t` needs message descriptors.
type Translate = ReturnType<typeof useLingui>['t']

export const buildVotingPresets = (t: Translate) => ({
  VOTING_DELAY: {
    title: t(msg`Voting Delay`),
    icon: <Pause size={14} strokeWidth={1.5} />,
    options: [1, 12, 24, 48],
    optionsFormatter: (option: number) => humanizeTimeFromHours(option),
    customLabel: t(msg`hours`),
    customPlaceholder: t(msg`Enter custom length`),
  },
  VOTING_PERIOD: {
    title: t(msg`Voting Period`),
    icon: <CalendarRange size={14} strokeWidth={1.5} />,
    options: [1, 24, 48, 72],
    optionsFormatter: (option: number) => humanizeTimeFromHours(option),
    customLabel: t(msg`hours`),
    customPlaceholder: t(msg`Enter custom length`),
  },
  VOTING_THRESHOLD: {
    title: t(msg`Proposal Threshold`),
    icon: <FileLock2 size={14} strokeWidth={1.5} />,
    options: [0.01, 0.1, 1, 10],
    optionsFormatter: (option: number) => `${option.toString()}%`,
    customLabel: '%',
    customPlaceholder: t(msg`Enter custom`),
    description: t(msg`The minimum percentage of governance power needed in order to initiate a proposal.`),
  },
  VOTING_QUORUM: {
    title: t(msg`Voting Quorum`),
    icon: <ShieldCheck size={14} strokeWidth={1.5} />,
    options: [10, 15, 20, 25],
    optionsFormatter: (option: number) => `${option.toString()}%`,
    customLabel: '%',
    customPlaceholder: t(msg`Enter custom`),
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
    title: t(msg`Execution Delay`),
    icon: <MousePointerBan size={14} strokeWidth={1.5} />,
    options: [0.25, 24, 36, 48],
    optionsFormatter: (option: number) => humanizeTimeFromHours(option),
    customLabel: t(msg`hours`),
    customPlaceholder: t(msg`Enter custom length`),
  },
})
