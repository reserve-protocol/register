import { cn } from '@/lib/utils'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Check, Clock, Loader2, Slash, X } from 'lucide-react'
import { ReactNode } from 'react'
import { parseDurationShort } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { isOptimisticReadyToExecute } from '@/views/index-dtf/governance/utils/proposal-flow'
import { proposalDetailAtom } from '../atom'

const FINAL_STATES: Record<
  string,
  {
    label: MessageDescriptor
    color: string
    bgColor: string
    icon: ReactNode
  }
> = {
  [PROPOSAL_STATES.EXECUTED]: {
    label: msg`Executed`,
    color: 'text-primary',
    bgColor: 'rgba(9, 85, 172, 0.10)',
    icon: <Check size={20} />,
  },
  [PROPOSAL_STATES.DEFEATED]: {
    label: msg`Defeated`,
    color: 'text-destructive',
    bgColor: 'rgba(208, 90, 103, 0.10)',
    icon: <X size={20} />,
  },
  [PROPOSAL_STATES.EXPIRED]: {
    label: msg`Expired`,
    color: 'text-legend',
    bgColor: 'rgba(0, 0, 0, 0.10)',
    icon: <Slash size={20} />,
  },
  [PROPOSAL_STATES.CANCELED]: {
    label: msg`Canceled`,
    color: 'text-destructive',
    bgColor: 'rgba(208, 90, 103, 0.10)',
    icon: <X size={20} />,
  },
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: {
    label: msg`Quorum not reached`,
    color: 'text-warning',
    bgColor: 'rgba(255, 152, 0, 0.10)',
    icon: <X size={20} />,
  },
  [PROPOSAL_STATES.SUCCEEDED]: {
    label: msg`Succeeded`,
    color: 'text-success',
    bgColor: 'rgba(0, 255, 152, 0.10)',
    icon: <Check size={20} />,
  },
}

const DEADLINE_STATES: Record<
  string,
  { text: MessageDescriptor; color: string }
> = {
  [PROPOSAL_STATES.ACTIVE]: {
    text: msg`Voting period ends in`,
    color: 'text-primary',
  },
  [PROPOSAL_STATES.PENDING]: {
    text: msg`Voting begins in`,
    color: 'text-primary',
  },
  [PROPOSAL_STATES.QUEUED]: {
    text: msg`Execution delay ends in`,
    color: 'text-warning',
  },
}

const FinalState = ({
  label,
  className,
  bgColor,
  icon,
}: {
  label: string
  className?: string
  bgColor: string
  icon: ReactNode
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 h-full',
        className
      )}
    >
      <div
        className="flex items-center justify-center rounded-full p-2"
        style={{ background: bgColor }}
      >
        {icon}
      </div>
      <span className="text-lg font-bold">{label}</span>
    </div>
  )
}

const ProposalAlert = () => {
  const { t } = useLingui()
  const proposal = useAtomValue(proposalDetailAtom)
  const state = proposal?.votingState

  if (!state) return null

  if (isOptimisticReadyToExecute(proposal)) {
    return (
      <FinalState
        label={t`Ready to execute`}
        className="text-primary"
        bgColor="rgba(9, 85, 172, 0.10)"
        icon={<Check size={20} />}
      />
    )
  }

  if (state.state === PROPOSAL_STATES.SUCCEEDED) {
    return (
      <FinalState
        label={t`Pending queue`}
        className="text-success"
        bgColor="rgba(0, 255, 152, 0.10)"
        icon={<Clock size={20} />}
      />
    )
  }

  if (Object.keys(FINAL_STATES).includes(state.state)) {
    return (
      <FinalState
        label={t(FINAL_STATES[state.state].label)}
        className={FINAL_STATES[state.state].color}
        bgColor={FINAL_STATES[state.state].bgColor}
        icon={FINAL_STATES[state.state].icon}
      />
    )
  }

  const deadline = parseDurationShort(Math.max(state.deadline || 0, 0), {
    units: ['d', 'h', 'm'],
    round: true,
  })

  if (!Object.keys(DEADLINE_STATES).includes(state.state)) {
    return null
  }

  if (
    state.state === PROPOSAL_STATES.QUEUED &&
    (!state.deadline || state.deadline <= 0)
  ) {
    return (
      <FinalState
        label={t`Passed`}
        className="text-primary"
        bgColor="rgba(9, 85, 172, 0.10)"
        icon={<Check size={20} />}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full py-4',
        DEADLINE_STATES[state.state].color
      )}
    >
      <Loader2 size={18} className="animate-spin" />
      <p className="text-sm mt-1">{t(DEADLINE_STATES[state.state].text)}</p>
      <p className="font-bold">{deadline}</p>
    </div>
  )
}

export default ProposalAlert
